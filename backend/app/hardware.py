# Hardware Abstraction Layer — Real Relay Integration
import time
import threading
from app.logger import log_relay

try:
    import RPi.GPIO as GPIO
    GPIO_ENABLED = True
except (ImportError, RuntimeError):
    GPIO_ENABLED = False

# Configuration (Coordinate with Usman)
# GPIO 17 is commonly used for relay triggers
RELAY_PIN = 17
TRIGGER_DURATION = 1.5  # Seconds (1-2s as per Phase 4)

if GPIO_ENABLED:
    GPIO.setwarnings(False)
    GPIO.setmode(GPIO.BCM)
    GPIO.setup(RELAY_PIN, GPIO.OUT)
    GPIO.output(RELAY_PIN, GPIO.LOW)  # Assuming active high for NO trigger


def _trigger_logic():
    """Logic to pulse the relay."""
    if GPIO_ENABLED:
        try:
            GPIO.output(RELAY_PIN, GPIO.HIGH)
            time.sleep(TRIGGER_DURATION)
            GPIO.output(RELAY_PIN, GPIO.LOW)
        except Exception as e:
            print(f"[HARDWARE_ERROR] Relay failure: {e}")
    else:
        # SIMULATION MODE
        print(f"[SIMULATION] Relay ON for {TRIGGER_DURATION}s")
        time.sleep(TRIGGER_DURATION)
        print(f"[SIMULATION] Relay OFF")


def open_gate(trace_id: str, user_id: str, device_id: str = "local") -> None:
    """
    Trigger gate relay to open.
    Can trigger local GPIO or remote COSEC device.
    """
    print(f"[RELAY_TRIGGERED] trace_id={trace_id} | user_id={user_id} | device={device_id}")
    log_relay(trace_id, user_id)

    if "cosec" in device_id.lower():
        # Trigger remote COSEC door
        from app.background import COSEC_CONFIG
        from app.adapters.cosec import COSECAdapter
        import asyncio

        adapter = COSECAdapter(COSEC_CONFIG["base_url"], COSEC_CONFIG["username"], COSEC_CONFIG["password"])
        # We use a thread for non-blocking since open_gate is called from sync context
        def _remote_trigger():
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            loop.run_until_complete(adapter.open_door())
        
        threading.Thread(target=_remote_trigger, daemon=True).start()
    else:
        # Default to local GPIO
        threading.Thread(target=_trigger_logic, daemon=True).start()


def close_gate(trace_id: str, user_id: str) -> None:
    """Trigger gate relay to close (placeholder for explicit logic)."""
    print(f"[RELAY_CLOSED] trace_id={trace_id} | user_id={user_id}")

