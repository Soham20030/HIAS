# HIAS Controller Core

The execution brain of the HIAS system. This service controls real-world gate access with deterministic, offline-first logic.

## 🚀 Setup Instructions

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the Service**:
   ```bash
   uvicorn app.main:app --reload
   ```

3. **Run Simulation**:
   In a separate terminal:
   ```bash
   python scripts/simulate.py
   ```

## 🛠️ API Documentation

- `GET /health`: Service health check.
- `POST /rfid/read`: Ingest RFID scanner data.
- `POST /face/event`: Ingest facial recognition events.
- `POST /manual/override`: Trigger manual gate control.

## 🧠 Decision Engine
The controller uses a deterministic rule engine:
- **Valid ID Check**: Student ID must exist in the local registry (`app/engine.py`).
- **Time Window**: Access is only granted during configured hours (07:00 - 19:00).
- **Traceability**: Every event generates a unique `trace_id` propagated to logs.

## 📁 Repository Structure
- `app/`: Core FastAPI service and logic.
  - `main.py`: API entry point and flow orchestration.
  - `schemas.py`: Canonical event schemas (Locked).
  - `engine.py`: Deterministic rule engine.
  - `hardware.py`: Relay abstraction (Mock).
  - `logger.py`: JSONL audit logging.
- `scripts/`: Utility scripts for simulation and testing.
- `logs/`: Local storage for event and relay audit trails.
- `review_packets/`: Mandatory execution proof for phase completion.
