import subprocess
import time
import urllib.request
import urllib.error
import json
import os

print("Starting server...")
process = subprocess.Popen(["python", "main.py"], cwd=r"c:\Users\Admin\Desktop\hias6\logs")
time.sleep(3) # Wait for server to start

try:
    print("\n--- Health Check ---")
    try:
        req = urllib.request.Request("http://127.0.0.1:8000/logs/health")
        with urllib.request.urlopen(req) as response:
            print(json.loads(response.read().decode()))
    except Exception as e:
        print(f"Health check failed: {e}")

    print("\n--- Sending Access Granted Event ---")
    event1 = json.dumps({"action": "access_granted", "device": "door_1", "user_id": "U123"}).encode("utf-8")
    req = urllib.request.Request("http://127.0.0.1:8000/events", data=event1, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as response:
        print(json.loads(response.read().decode()))

    print("\n--- Sending Access Denied Event ---")
    event2 = json.dumps({"action": "access_denied", "device": "door_1", "user_id": "UNKNOWN"}).encode("utf-8")
    req = urllib.request.Request("http://127.0.0.1:8000/events", data=event2, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as response:
        print(json.loads(response.read().decode()))

    print("\n--- Sending System Error Event ---")
    event3 = json.dumps({"action": "system_error", "component": "relay_1", "error": "timeout"}).encode("utf-8")
    req = urllib.request.Request("http://127.0.0.1:8000/events", data=event3, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as response:
        print(json.loads(response.read().decode()))

    print("\n--- Health Check Again ---")
    req = urllib.request.Request("http://127.0.0.1:8000/logs/health")
    with urllib.request.urlopen(req) as response:
        print(json.loads(response.read().decode()))

    print("\n--- File Content (logs_data/events.jsonl) ---")
    with open(r"c:\Users\Admin\Desktop\hias6\logs\logs_data\events.jsonl", "r") as f:
        print(f.read())
finally:
    print("Stopping server...")
    process.terminate()
    process.wait()
