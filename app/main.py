import asyncio
import json
from collections import deque
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import StreamingResponse
from app.schemas import (
    AccessInput, ControllerEvent, Decision, Reason, Direction, Method
)
from app.engine import evaluate
from app.hardware import open_gate
from app.logger import log_event

app = FastAPI(title="HIAS Controller Core", version="0.2.0")

# --- In-Memory Storage ---
EVENT_HISTORY = deque(maxlen=100)
SSE_CLIENTS: List[asyncio.Queue] = []
DUPLICATE_CACHE = {}  # (user_id, device_id) -> timestamp
DUPLICATE_THRESHOLD = 5.0  # Ignore same scan within 5 seconds


async def broadcast_event(event: ControllerEvent):
    """Push event to all connected SSE clients."""
    data = event.model_dump_json()
    for queue in SSE_CLIENTS:
        await queue.put(data)


def process_access_request(user_id: str, method: Method, device_id: str) -> Optional[ControllerEvent]:
    """Core logic for processing access requests from any source."""
    # 1. Duplicate Prevention
    now = asyncio.get_event_loop().time()
    dup_key = (user_id, device_id)
    if dup_key in DUPLICATE_CACHE:
        if now - DUPLICATE_CACHE[dup_key] < DUPLICATE_THRESHOLD:
            print(f"[IGNORING_DUPLICATE] user_id={user_id} | device_id={device_id}")
            return None
    DUPLICATE_CACHE[dup_key] = now

    # 2. Enrichment & Decision
    decision, reason, name = evaluate(user_id)

    # 3. Infer Direction from device_id
    direction = Direction.IN if "in" in device_id.lower() else Direction.OUT

    # 4. Build Canonical Event
    event = ControllerEvent(
        user_id=user_id,
        name=name,
        direction=direction,
        method=method,
        decision=decision,
        reason=reason,
        device_id=device_id
    )

    # 5. Trigger Hardware if ALLOWed
    if decision == Decision.ALLOW:
        open_gate(event.trace_id, event.user_id)

    # 6. Log & Store for history
    log_event(event.model_dump())
    EVENT_HISTORY.append(event)

    return event


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "hias-controller"}


@app.post("/access/event", response_model=ControllerEvent)
async def access_event(payload: AccessInput):
    """Ingest device input (RFID/FACE)."""
    event = process_access_request(payload.user_id, payload.method, payload.device_id)
    if not event:
        raise HTTPException(status_code=429, detail="Duplicate scan ignored")
    await broadcast_event(event)
    return event


@app.get("/events")
async def get_events(limit: int = 10):
    """Returns last N events for dashboard initial load."""
    return list(EVENT_HISTORY)[-limit:]


@app.get("/events/stream")
async def event_stream(request: Request):
    """SSE stream for real-time dashboard updates."""
    queue = asyncio.Queue()
    SSE_CLIENTS.append(queue)

    async def event_generator():
        try:
            while True:
                if await request.is_disconnected():
                    break
                data = await queue.get()
                yield f"data: {data}\n\n"
        except asyncio.CancelledError:
            pass
        finally:
            SSE_CLIENTS.remove(queue)

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@app.post("/manual/override", response_model=ControllerEvent)
async def manual_override():
    """Manually trigger relay and log event."""
    event = process_access_request("S100", Method.MANUAL, "manual_console_01")
    await broadcast_event(event)
    return event

