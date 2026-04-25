# Deterministic Decision Engine — NO probabilistic/AI logic allowed
import time
from app.schemas import Decision, Reason

# --- Mock valid user registry ---
# In production this would be loaded from a local DB
VALID_USERS = {
    "S001": "Soham Kotkar",
    "S002": "Vijay Dhawan",
    "S003": "Chandragupta Maurya",
    "S004": "Usman Sheikh",
    "S005": "Manya Sharma",
    "S100": "Admin Test",
}

# --- Mock time rules (24h format) ---
# Access only allowed between 07:00 and 19:00
ACCESS_WINDOW_START = 7   # 7:00 AM
ACCESS_WINDOW_END = 21    # 9:00 PM (Extended for testing)


def is_within_time_window() -> bool:
    """Check if current time falls within the allowed access window."""
    current_hour = int(time.strftime("%H"))
    return ACCESS_WINDOW_START <= current_hour < ACCESS_WINDOW_END


def evaluate(user_id: str) -> tuple[Decision, Reason, str]:
    """
    Deterministic access decision.

    Rules (evaluated in order):
      1. If user_id NOT in registry → DENY / UNKNOWN
      2. If outside time window → DENY / TIME_BLOCK
      3. Otherwise → ALLOW / VALID

    Returns:
        (Decision, Reason, Name) tuple
    """
    name = VALID_USERS.get(user_id, "Unknown User")

    if user_id not in VALID_USERS:
        return Decision.DENY, Reason.UNKNOWN, name

    if not is_within_time_window():
        return Decision.DENY, Reason.TIME_BLOCK, name

    return Decision.ALLOW, Reason.VALID, name

