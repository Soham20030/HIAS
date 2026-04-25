import json
import hashlib
import os
import time
import asyncio
from typing import Dict, Any

LOG_FILE = "logs_data/events.jsonl"

class LogStorage:
    def __init__(self):
        os.makedirs("logs_data", exist_ok=True)
        self.listeners = []
        self._init_storage()

    def _init_storage(self):
        if not os.path.exists(LOG_FILE):
            genesis = {
                "event_id": "genesis",
                "timestamp": time.time(),
                "data": {"message": "System init", "type": "genesis"},
                "prev_hash": "0" * 64,
            }
            genesis_json = json.dumps(genesis, sort_keys=True)
            genesis_hash = hashlib.sha256(f"{'0'*64}{genesis_json}".encode('utf-8')).hexdigest()
            genesis["hash"] = genesis_hash
            with open(LOG_FILE, "w", encoding="utf-8") as f:
                f.write(json.dumps(genesis) + "\n")
            self.last_hash = genesis_hash
            self.total_events = 1
            self.last_event_timestamp = genesis["timestamp"]
        else:
            self.total_events = 0
            with open(LOG_FILE, "r", encoding="utf-8") as f:
                for line in f:
                    if line.strip():
                        last_log = json.loads(line)
                        self.last_hash = last_log["hash"]
                        self.last_event_timestamp = last_log["timestamp"]
                        self.total_events += 1

    def append_event(self, event_data: Dict[str, Any]):
        timestamp = time.time()
        # Event data is stored in the log
        event = {
            "timestamp": timestamp,
            "data": event_data,
            "prev_hash": self.last_hash
        }
        event_json = json.dumps(event, sort_keys=True)
        current_hash = hashlib.sha256(f"{self.last_hash}{event_json}".encode('utf-8')).hexdigest()
        event["hash"] = current_hash
        
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(json.dumps(event) + "\n")
        
        self.last_hash = current_hash
        self.total_events += 1
        self.last_event_timestamp = timestamp

        self._notify_listeners(event)
        
        return event

    def get_health(self):
        return {
            "last_event_timestamp": self.last_event_timestamp,
            "total_events": self.total_events,
            "system_status": "healthy"
        }

    async def subscribe(self):
        queue = asyncio.Queue()
        self.listeners.append(queue)
        try:
            while True:
                event = await queue.get()
                yield event
        finally:
            if queue in self.listeners:
                self.listeners.remove(queue)

    def _notify_listeners(self, event):
        for queue in self.listeners:
            queue.put_nowait(event)

storage = LogStorage()
