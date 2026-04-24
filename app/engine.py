# Deterministic Decision Engine — NO probabilistic/AI logic allowed
import time
from app.schemas import Decision, Reason

# --- Mock valid student registry ---
# In production this would be loaded from a local DB
VALID_STUDENTS = {
    "S001", "S002", "S003", "S004", "S005",
    "S100", "S101", "S102", "S103",
}

# --- Mock time rules (24h format) ---
# Access only allowed between 07:00 and 19:00
ACCESS_WINDOW_START = 7   # 7:00 AM
ACCESS_WINDOW_END = 19    # 7:00 PM


def is_within_time_window() -> bool:
    """Check if current time falls within the allowed access window."""
    current_hour = int(time.strftime("%H"))
    return ACCESS_WINDOW_START <= current_hour < ACCESS_WINDOW_END


def evaluate(student_id: str) -> tuple[Decision, Reason]:
    """
    Deterministic access decision.

    Rules (evaluated in order):
      1. If student_id NOT in registry → DENY / UNKNOWN
      2. If outside time window → DENY / TIME_BLOCK
      3. Otherwise → ALLOW / VALID

    Returns:
        (Decision, Reason) tuple
    """
    if student_id not in VALID_STUDENTS:
        return Decision.DENY, Reason.UNKNOWN

    if not is_within_time_window():
        return Decision.DENY, Reason.TIME_BLOCK

    return Decision.ALLOW, Reason.VALID
