import os
import asyncio
from sqlalchemy.orm import Session
from app.adapters.cosec import COSECAdapter
from app.database import get_db
from app.schemas import Method

# Configuration loaded from Environment Variables
COSEC_CONFIG = {
    "base_url": os.getenv("COSEC_BASE_URL", "http://192.168.1.100"),
    "username": os.getenv("COSEC_USERNAME", "admin"),
    "password": os.getenv("COSEC_PASSWORD", "password123"),
    "poll_interval": float(os.getenv("COSEC_POLL_INTERVAL", "2.0"))
}

# Mapping: COSEC_USER_ID -> INTERNAL_USER_ID
USER_MAPPING = {
    "12": "S001",
    "15": "S002",
    "101": "S100"
}

class CosecWorker:
    def __init__(self, process_request_fn, broadcast_fn):
        self.adapter = COSECAdapter(
            COSEC_CONFIG["base_url"],
            COSEC_CONFIG["username"],
            COSEC_CONFIG["password"]
        )
        self.process_request = process_request_fn
        self.broadcast = broadcast_fn
        self.last_index = 0
        self.running = False
        self._task = None

    async def start(self):
        self.running = True
        self._task = asyncio.create_task(self._loop())
        print("[COSEC_WORKER] Background polling started.")

    async def stop(self):
        self.running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        print("[COSEC_WORKER] Background polling stopped.")

    async def _loop(self):
        while self.running:
            await self._loop_once()
            await asyncio.sleep(COSEC_CONFIG["poll_interval"])

    async def _loop_once(self):
        """Single iteration of the polling loop."""
        try:
            events = await self.adapter.fetch_events(self.last_index)
            
            if events:
                # Sort by index to process in order
                events.sort(key=lambda x: x["index"])
                
                for raw_event in events:
                    # Skip if already processed
                    if raw_event["index"] <= self.last_index:
                        continue
                    
                    # Map User ID
                    internal_id = USER_MAPPING.get(raw_event["device_user_id"])
                    if not internal_id:
                        print(f"[COSEC_WORKER] Unknown User ID: {raw_event['device_user_id']}")
                        continue

                    # Process via core logic
                    with next(get_db()) as db:
                        event = self.process_request(
                            db, 
                            internal_id, 
                            raw_event["method"], 
                            f"cosec_device_{raw_event['index']}",
                            bypass_cache=True
                        )
                        
                        if event:
                            await self.broadcast(event)
                    
                    # Update progress
                    self.last_index = raw_event["index"]

        except Exception as e:
            print(f"[COSEC_WORKER_ERROR] {e}")
