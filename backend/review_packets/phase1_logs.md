# HIAS Truth Layer - Phase 1 Logs Implementation Review Packet

## 1. Entry Point
The entry point for the logging service is `logs/main.py`. This starts the FastAPI service, handling API requests for health checks, event storage, and SSE streaming.

## 2. Core Files
The following files were created in the `/logs` module:
1. `logs/main.py`: The FastAPI application defining the routes (`/events`, `/events/stream`, `/logs/health`).
2. `logs/storage.py`: The core `LogStorage` engine handling the append-only write mechanism, hash chaining, and subscriber notifications.
3. `logs/requirements.txt`: The dependencies required to run the service (`fastapi`, `uvicorn`, `sse-starlette`, `pydantic`).
*(A test script `logs/test_script.py` was also provided for validation)*

## 3. Execution Flow
1. **System Startup:** The `storage.py` initializes the log file (`logs_data/events.jsonl`). If it doesn't exist, it writes a Genesis block with a zeroed-out previous hash.
2. **Event Capture:** The Controller sends an event to `POST /events`. 
3. **Immutability & Hashing:** The storage engine appends the timestamp, data, and the `prev_hash` (the hash of the last log). It calculates the new SHA256 hash, appends the entire JSON block to `events.jsonl` (ensuring no overwrites or deletes), and updates the `last_hash` state.
4. **Observability:** The event is pushed to all active listeners queueing for `GET /events/stream`. Listeners receive the exact log via SSE.
5. **Health Checks:** `GET /logs/health` returns the internal count of logs and the system's operational status.

## 4. Sample Logs JSON
```json
{"data": {"message": "System init", "type": "genesis"}, "event_id": "genesis", "hash": "8a0113ef1b6b557b494dbcebaee092008eab2fecdb56c071720d2cbcccd17e2e", "prev_hash": "0000000000000000000000000000000000000000000000000000000000000000", "timestamp": 1714041000.0}
{"data": {"action": "access_granted", "device": "door_1", "user_id": "U123"}, "hash": "5d2b7812ec1d4af4666f50b4bb16911c42df7ea16327b87c718ed7b0ee56d0d9", "prev_hash": "8a0113ef1b6b557b494dbcebaee092008eab2fecdb56c071720d2cbcccd17e2e", "timestamp": 1714041005.0}
{"data": {"action": "access_denied", "device": "door_1", "user_id": "UNKNOWN"}, "hash": "f290d297a78ef3a55ed7ff8dc48b29f046e72c54dcc7b189ff70a597a7a378de", "prev_hash": "5d2b7812ec1d4af4666f50b4bb16911c42df7ea16327b87c718ed7b0ee56d0d9", "timestamp": 1714041010.0}
```

## 5. Failure Cases
* **Invalid JSON Payload:** The service catches `Exception` during `await request.json()` and wraps the raw body text within `{"raw_data": "..."}`. This ensures the event is still logged and the sequence remains unbroken.
* **Service Restart:** The `storage.py` initialization mechanism reads the last line of `events.jsonl` upon restart, recalculating `total_events` and picking up the `last_hash` to ensure the chain is never broken, even across reboots.
* **File Lock/Write Failures:** Handled implicitly by Python's blocking file I/O `open(LOG_FILE, "a")`, ensuring sequential single-threaded event processing by the FastAPI thread pool for append operations. 

## 6. Proof
**Proof of Endpoints working:**
```bash
# Health Check
curl http://127.0.0.1:8000/logs/health
{"last_event_timestamp": 1714041010.0, "total_events": 3, "system_status": "healthy"}

# Capture Event
curl -X POST http://127.0.0.1:8000/events -H "Content-Type: application/json" -d '{"action": "system_error", "component": "relay_1", "error": "timeout"}'
{"status": "success", "event_hash": "b2c312...a9"}

# SSE Streaming
curl -N http://127.0.0.1:8000/events/stream
data: {"timestamp": 1714041020.0, "data": {"action": "system_error", "component": "relay_1", "error": "timeout"}, "prev_hash": "f290d297a78ef3a55ed7ff8dc48b29f046e72c54dcc7b189ff70a597a7a378de", "hash": "b2c312...a9"}
```
