# HIAS — Operational Guide & Task Completion Report

## 📡 Project Overview
**HIAS (Hostel Intelligence & Access System)** is an on-premise, offline-first access control system designed for deterministic hardware integration and real-time observability.

---

## ✅ Completed Tasks (EOD Status)

### 1. Controller Layer (Soham's Role)
- [x] **Deterministic Decision Engine**: Implemented a logic-based engine that processes RFID/Face inputs without AI dependency.
- [x] **Access Endpoints**: Built `/access/event` (input), `/events` (history), and `/override` (manual control).
- [x] **Emergency Bypass**: Integrated a high-priority emergency protocol that releases all locks and bypasses normal decision logic.

### 2. Observability & Logging (Vijay's Role)
- [x] **Hashed Log Chain**: Every event is logged in `server/logs/access.jsonl` with SHA-256 hash chaining to ensure tamper-evidence and traceability.
- [x] **SSE Real-time Stream**: Established a Server-Sent Events stream for <500ms latency between hardware events and the dashboard.

### 3. Frontend & UI (Chandragupta's Role)
- [x] **Multi-Screen Navigation**: Fixed sidebar routing to switch between Dashboard, Live Monitor, System Status, and Review Queue.
- [x] **Manual Override UI**: Connected the "OPEN GATE" interface to the controller with mandatory reason tracking.
- [x] **Real-time Feed**: Implemented an auto-updating access log table that reflects exact backend truth.

### 4. Input & Simulation (Dhruv's Role)
- [x] **Hardware Simulation**: Created `server/simulate.js` to generate structured RFID/Face events for system validation.
- [x] **UI Trigger**: Added a developer simulation button directly on the dashboard for rapid testing.

---

## 🚀 How to Run the Project

### Prerequisites
- Node.js installed (v18+)
- Git

### Step 1: Initialize the Controller (Backend)
```bash
cd server
npm install
node index.js
```
*The controller will start at `http://localhost:3000`.*

### Step 2: Initialize the Console (Frontend)
```bash
# Open a new terminal in the root directory
npm install
npm run dev
```
*The dashboard will be available at `http://localhost:5173`.*

### Step 3: Run Simulation (Testing)
```bash
# To simulate a batch of access events
cd server
node simulate.js
```

---

## 🛡️ Core System Rules
1. **Controller Authority**: No device can trigger a gate directly; all must pass through the Controller.
2. **Deterministic**: No AI guessing in the critical path.
3. **Traceable**: Every action (including overrides) is logged with a unique `trace_id` and hash.
4. **Offline-First**: Zero dependency on external cloud services.

---
**Status**: 🟢 OPERATIONAL
**Last Update**: 20 May 2025
**Repository**: [HAIS-](https://github.com/blackholeinfiverse83-bit/HAIS-.git)
