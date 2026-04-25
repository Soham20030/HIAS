# Canonical event schema for all HIAS controller events
from datetime import datetime
import uuid
from enum import Enum
from pydantic import BaseModel, Field


class Direction(str, Enum):
    IN = "IN"
    OUT = "OUT"


class Method(str, Enum):
    RFID = "RFID"
    FACE = "FACE"
    MANUAL = "MANUAL"


class Decision(str, Enum):
    ALLOW = "ALLOW"
    DENY = "DENY"
    REVIEW = "REVIEW"


class ReviewAction(BaseModel):
    trace_id: str
    action: str  # "confirm" or "reject"



class Reason(str, Enum):
    VALID = "VALID"
    UNKNOWN = "UNKNOWN"
    TIME_BLOCK = "TIME_BLOCK"


# --- Inbound Payloads ---

class AccessInput(BaseModel):
    user_id: str
    method: Method
    device_id: str


# --- Canonical Event ---

class ControllerEvent(BaseModel):
    trace_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    direction: Direction
    method: Method
    decision: Decision
    reason: Reason
    device_id: str
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())

