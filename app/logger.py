# Event logger — trace_id-aware audit trail
# Vijay Dhawan (Logs/Trace module) consumes these outputs

import json
import os
from datetime import datetime

LOG_FILE = "logs/events.jsonl"


def _ensure_log_dir():
    os.makedirs("logs", exist_ok=True)


def log_event(event: dict) -> None:
    """
    Persist a canonical controller event to the event log.
    Format: JSONL (one JSON object per line) for easy streaming.
    """
    _ensure_log_dir()
    with open(LOG_FILE, "a") as f:
        f.write(json.dumps(event) + "\n")
    print(f"[EVENT_LOG] trace_id={event.get('trace_id')} | "
          f"decision={event.get('decision')} | "
          f"student_id={event.get('student_id')}")


def log_relay(trace_id: str, student_id: str) -> None:
    """
    Log a relay trigger event separately for hardware audit trail.
    """
    _ensure_log_dir()
    relay_entry = {
        "type": "RELAY_TRIGGER",
        "trace_id": trace_id,
        "student_id": student_id,
        "timestamp": int(datetime.utcnow().timestamp()),
    }
    relay_log = "logs/relay.jsonl"
    with open(relay_log, "a") as f:
        f.write(json.dumps(relay_entry) + "\n")
