# Deterministic Decision Engine — NO probabilistic/AI logic allowed
import time
from sqlalchemy.orm import Session
from .models import User
from .schemas import Decision, Reason

DEFAULT_USERS = {
    "S001": "Soham Kotkar",
    "S002": "Vijay Dhawan",
    "S003": "Chandragupta Maurya",
    "S004": "Usman Sheikh",
    "S005": "Manya Sharma",
    "S100": "Admin Test",
}

def seed_db(db: Session):
    """Seed the database with initial users if it's empty."""
    if db.query(User).count() == 0:
        for user_id, name in DEFAULT_USERS.items():
            db_user = User(user_id=user_id, name=name, role="Admin" if user_id == "S100" else "Resident")
            db.add(db_user)
        db.commit()

def is_within_time_window(start_str: str = "07:00", end_str: str = "21:00") -> bool:
    """Check if current time falls within the allowed access window (HH:MM format)."""
    current_time = time.strftime("%H:%M")
    return start_str <= current_time <= end_str

def evaluate(db: Session, user_id: str, settings: dict = None) -> tuple[Decision, Reason, str]:
    """
    Deterministic access decision with dynamic settings support.
    """
    if settings is None:
        settings = {"emergency_mode": False, "access_window_start": "07:00", "access_window_end": "21:00"}

    db_user = db.query(User).filter(User.user_id == user_id).first()
    name = db_user.name if db_user else "Unknown User"

    # Rule 0: Emergency Bypass
    if settings.get("emergency_mode", False):
        return Decision.ALLOW, Reason.VALID, f"[EMERGENCY] {name}"

    # Rule 1: User Identity
    if not db_user:
        return Decision.DENY, Reason.UNKNOWN, name

    # Rule 2: Time Window
    if not is_within_time_window(settings.get("access_window_start"), settings.get("access_window_end")):
        return Decision.DENY, Reason.TIME_BLOCK, name

    return Decision.ALLOW, Reason.VALID, name
