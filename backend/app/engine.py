# Deterministic Decision Engine — NO probabilistic/AI logic allowed
import time
from app.schemas import Decision, Reason

# --- Mock valid user registry ---
# In production this would be loaded from a local DB
import json
import os

# --- Persistence ---
USERS_FILE = "data/users.json"

def load_users():
    default_users = {
        "S001": "Soham Kotkar",
        "S002": "Vijay Dhawan",
        "S003": "Chandragupta Maurya",
        "S004": "Usman Sheikh",
        "S005": "Manya Sharma",
        "S100": "Admin Test",
    }
    if os.path.exists(USERS_FILE):
        with open(USERS_FILE, "r") as f:
            return json.load(f)
    return default_users

def save_users(users):
    with open(USERS_FILE, "w") as f:
        json.dump(users, f, indent=4)

VALID_USERS = load_users()
if not os.path.exists(USERS_FILE):
    save_users(VALID_USERS)


# --- Mock time rules (24h format) ---
# Access only allowed between 07:00 and 19:00
ACCESS_WINDOW_START = 7   # 7:00 AM
ACCESS_WINDOW_END = 21    # 9:00 PM (Extended for testing)


def is_within_time_window(start_str: str = "07:00", end_str: str = "21:00") -> bool:
    """Check if current time falls within the allowed access window (HH:MM format)."""
    current_time = time.strftime("%H:%M")
    return start_str <= current_time <= end_str


def evaluate(user_id: str, settings: dict = None) -> tuple[Decision, Reason, str]:
    """
    Deterministic access decision with dynamic settings support.
    """
    if settings is None:
        settings = {"emergency_mode": False, "access_window_start": "07:00", "access_window_end": "21:00"}

    name = VALID_USERS.get(user_id, "Unknown User")

    # Rule 0: Emergency Bypass
    if settings.get("emergency_mode", False):
        return Decision.ALLOW, Reason.VALID, f"[EMERGENCY] {name}"

    # Rule 1: User Identity
    if user_id not in VALID_USERS:
        return Decision.DENY, Reason.UNKNOWN, name

    # Rule 2: Time Window
    if not is_within_time_window(settings.get("access_window_start"), settings.get("access_window_end")):
        return Decision.DENY, Reason.TIME_BLOCK, name

    return Decision.ALLOW, Reason.VALID, name


