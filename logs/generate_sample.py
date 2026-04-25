import sys
import os
sys.path.append(os.path.dirname(__file__))
from storage import storage
import json

storage.append_event({"action": "access_granted", "device": "door_1", "user_id": "U123"})
storage.append_event({"action": "access_denied", "device": "door_1", "user_id": "UNKNOWN"})
storage.append_event({"action": "system_error", "component": "relay_1", "error": "timeout"})

print(storage.get_health())

with open("logs_data/events.jsonl", "r") as f:
    print(f.read())
