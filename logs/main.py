from fastapi import FastAPI, Request
from sse_starlette.sse import EventSourceResponse
from storage import storage
import json

app = FastAPI(title="HIAS Truth Layer - Logging Service")

@app.post("/events")
async def capture_event(request: Request):
    """Capture any event without filtering."""
    try:
        event_data = await request.json()
    except Exception:
        event_data = {"raw_data": (await request.body()).decode("utf-8")}
        
    stored_event = storage.append_event(event_data)
    return {"status": "success", "event_hash": stored_event["hash"]}

@app.get("/events/stream")
async def stream_events():
    """SSE endpoint for real-time observability."""
    async def event_generator():
        async for event in storage.subscribe():
            yield {
                "event": "message",
                "data": json.dumps(event)
            }
    
    return EventSourceResponse(event_generator())

@app.get("/logs/health")
async def health_check():
    """Returns health and status of the logging service."""
    return storage.get_health()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
