# REVIEW PACKET — PHASE 2 — CONTROLLER EXECUTION

## Overview
Phase 2 transitions the HIAS Controller from simulation to real-world execution. The system now enforces a canonical schema, provides real-time event streaming via SSE, and integrates with physical relay hardware (or simulations).

## 1. Schema Correction
The system now uses the strict canonical format:
- `trace_id`: UUID4
- `user_id`: String (replaces student_id)
- `name`: Enriched from local registry
- `direction`: Inferred (IN/OUT)
- `method`: RFID/FACE/MANUAL
- `timestamp`: ISO8601

## 2. API Endpoints
- `POST /access/event`: Main ingestion point.
- `GET /events`: Historical log retrieval.
- `GET /events/stream`: SSE stream (<500ms latency).
- `POST /manual/override`: Manual relay trigger.

## 3. Hardware Integration
- **Relay Wrapper**: Implemented in `app/hardware.py`.
- **GPIO**: Ready for Raspberry Pi (BCM Pin 17).
- **Simulation**: Graceful fallback to logs/console when GPIO is unavailable.
- **Asynchronous**: Relay triggers are non-blocking (threaded).

## 4. Failure Handling
- **Duplicate Prevention**: 5-second window for identical (user, device) scans.
- **Unknown Users**: Automatically denied with `Reason.UNKNOWN`.
- **Relay Failures**: Logged to console without crashing the service.

## 5. Postman Deliverables
A Postman Collection has been generated for easy testing:
- **File**: `HIAS_Controller_Phase2.postman_collection.json`
- **Variable**: `{{base_url}}` defaults to `http://localhost:3000`
- **Includes**: Health checks, Ingestion (RFID/FACE), History, and Manual Override.

## 6. Verification Commands
Run the server:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 3000
```

Test Ingestion:
```bash
curl -X POST http://localhost:3000/access/event -H "Content-Type: application/json" -d "{\"user_id\": \"S001\", \"method\": \"RFID\", \"device_id\": \"booth_1_in\"}"
```

Listen to Stream:
```bash
curl http://localhost:3000/events/stream
```

---
**Verdict**: Ready for Real Hardware Integration.
**Lead**: Soham Kotkar
