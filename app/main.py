from fastapi import FastAPI, HTTPException
from app.schemas import (
    RFIDPayload, FacePayload, ManualOverridePayload,
    ControllerEvent, Decision, Reason, Source
)
from app.engine import evaluate
from app.hardware import open_gate
from app.logger import log_event

app = FastAPI(title="HIAS Controller Core", version="0.1.0")

@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring."""
    return {"status": "healthy", "service": "hias-controller"}

def process_access_request(source: str, student_id: str, event_type: str) -> ControllerEvent:
    """Core logic for processing access requests from any source."""
    # 1. Decision Engine (Deterministic)
    decision, reason = evaluate(student_id)

    # 2. Build Canonical Event (Trace ID generated automatically by schema)
    event = ControllerEvent(
        source=source,
        student_id=student_id,
        event=event_type,
        decision=decision,
        reason=reason
    )

    # 3. Trigger Hardware if ALLOWed
    if decision == Decision.ALLOW:
        open_gate(event.trace_id, event.student_id)

    # 4. Log for Audit (Vijay's Logs/Trace module)
    log_event(event.model_dump())

    return event

@app.post("/rfid/read", response_model=ControllerEvent)
async def rfid_read(payload: RFIDPayload):
    """Ingest RFID scan event."""
    return process_access_request(payload.source, payload.student_id, payload.event)

@app.post("/face/event", response_model=ControllerEvent)
async def face_event(payload: FacePayload):
    """Ingest facial recognition event."""
    return process_access_request(payload.source, payload.student_id, payload.event)

@app.post("/manual/override", response_model=ControllerEvent)
async def manual_override(payload: ManualOverridePayload):
    """Handle manual gate override by operator."""
    return process_access_request(payload.source, payload.student_id, payload.event)
