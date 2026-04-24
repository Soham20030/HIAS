# Canonical event schema for all HIAS controller events
import time
import uuid
from enum import Enum
from pydantic import BaseModel, Field
from typing import Optional


class EventType(str, Enum):
    ENTRY = "ENTRY"
    EXIT = "EXIT"


class Decision(str, Enum):
    ALLOW = "ALLOW"
    DENY = "DENY"


class Reason(str, Enum):
    VALID = "VALID"
    UNKNOWN = "UNKNOWN"
    TIME_BLOCK = "TIME_BLOCK"


class Source(str, Enum):
    RFID_1 = "rfid_1"
    FACE_1 = "face_1"
    MANUAL = "manual"


# --- Inbound Payloads (what devices send) ---

class RFIDPayload(BaseModel):
    source: str = "rfid_1"
    student_id: str
    event: EventType


class FacePayload(BaseModel):
    source: str = "face_1"
    student_id: str
    event: EventType


class ManualOverridePayload(BaseModel):
    source: str = "manual"
    student_id: str
    event: EventType
    operator_id: str


# --- Canonical Event (controller output) ---

class ControllerEvent(BaseModel):
    trace_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    source: str
    student_id: str
    event: EventType
    decision: Decision
    reason: Reason
    timestamp: int = Field(default_factory=lambda: int(time.time()))
