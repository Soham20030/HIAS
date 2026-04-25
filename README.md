# HIAS Controller Core

The execution brain of the HIAS system. This service controls real-world gate access with deterministic, offline-first logic.

## 🚀 Setup Instructions

1. **Install Dependencies**:
   ```bash
   pip install -r backend/requirements.txt
   ```

2. **Run the Service**:
   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```

3. **Run Simulation**:
   In a separate terminal:
   ```bash
   python backend/scripts/simulate.py
   ```

## 🛠️ API Documentation

- `GET /health`: Service health check.
- `POST /access/event`: Ingest device input (RFID/FACE).
  - Payload: `{"user_id": "S001", "method": "RFID", "device_id": "gate_in"}`
- `POST /manual/override`: Trigger manual gate control.
- `GET /events`: Fetch recent event history.
- `GET /events/stream`: Real-time SSE stream for dashboards.

## 🧠 Decision Engine
The controller uses a deterministic rule engine:
- **Valid ID Check**: Student ID must exist in the local registry (`backend/app/engine.py`).
- **Time Window**: Access is only granted during configured hours (07:00 - 19:00).
- **Traceability**: Every event generates a unique `trace_id` propagated to logs.

## 📁 Repository Structure
- `backend/`: Parent folder for all backend services.
  - `app/`: Core FastAPI service and logic.
  - `scripts/`: Utility scripts for simulation and testing.
  - `logs/`: Local storage for event and relay audit trails.
  - `review_packets/`: Mandatory execution proof for phase completion.
- `frontend/`: The web dashboard for the HIAS system.
  - `src/`: React/Vite source code.
  - `public/`: Static assets.
  - `server/`: Backend/Proxy for frontend.
