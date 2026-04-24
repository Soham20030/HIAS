import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000"

def test_endpoint(endpoint, payload):
    print(f"\n--- Testing {endpoint} ---")
    try:
        response = requests.post(f"{BASE_URL}{endpoint}", json=payload)
        if response.status_code == 200:
            print("SUCCESS")
            print(json.dumps(response.json(), indent=2))
        else:
            print(f"FAILED: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"ERROR: {str(e)}")

def simulate():
    # 1. Health Check
    print("--- Health Check ---")
    try:
        resp = requests.get(f"{BASE_URL}/health")
        print(resp.json())
    except:
        print("Service is not running. Please start it with 'uvicorn app.main:app --reload'")
        return

    # 2. Valid RFID Entry (S001)
    test_endpoint("/rfid/read", {
        "source": "rfid_1",
        "student_id": "S001",
        "event": "ENTRY"
    })

    # 3. Invalid RFID Entry (Unknown ID)
    test_endpoint("/rfid/read", {
        "source": "rfid_1",
        "student_id": "S999",
        "event": "ENTRY"
    })

    # 4. Valid Face Event
    test_endpoint("/face/event", {
        "source": "face_1",
        "student_id": "S100",
        "event": "ENTRY"
    })

    # 5. Manual Override
    test_endpoint("/manual/override", {
        "source": "manual",
        "student_id": "S002",
        "event": "EXIT",
        "operator_id": "OP_01"
    })

if __name__ == "__main__":
    simulate()
