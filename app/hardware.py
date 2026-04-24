# Hardware Abstraction Layer — Mock relay interface
# Later: Suraj + Usman will wire actual GPIO relay here

from app.logger import log_relay


def open_gate(trace_id: str, student_id: str) -> None:
    """
    MOCK: Trigger gate relay to open.

    In production this will send a GPIO signal to the relay board.
    For Phase 1, this logs the trigger event for traceability.
    """
    print(f"[RELAY_TRIGGERED] trace_id={trace_id} | student_id={student_id}")
    log_relay(trace_id, student_id)


def close_gate(trace_id: str, student_id: str) -> None:
    """
    MOCK: Trigger gate relay to close.
    Placeholder for future hardware control.
    """
    print(f"[RELAY_CLOSED] trace_id={trace_id} | student_id={student_id}")
