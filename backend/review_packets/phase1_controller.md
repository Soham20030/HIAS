# HIAS Controller Phase 1 Review Packet

**Status**: Phase 1 Complete
**Service**: FastAPI Controller Core
**Developer**: Soham

---

## 1. Entry Point
The main entry point for the service is `app/main.py`.

## 2. Core Files
- **`app/schemas.py`**: Contains the canonical event schema (locked).
- **`app/engine.py`**: Deterministic decision engine (no AI).
- **`app/hardware.py`**: Hardware abstraction (Mock Relay).

## 3. Live Execution Flow
The following flow was simulated:
`RFID Scanner -> Controller -> Decision Engine -> Mock Relay -> Event Log`

### Simulation Log Summary:
1. **Valid RFID (S001)**: ALLOWED, Relay Triggered.
2. **Invalid RFID (S999)**: DENIED, Reason: UNKNOWN.
3. **Face Event (S100)**: ALLOWED, Relay Triggered.
4. **Manual Override**: ALLOWED, Audit Log updated.

## 4. Real JSON Output (Sample)
```json
{
  "trace_id": "49b04cfe-bc56-4415-a0d1-71623047e743",
  "source": "rfid_1",
  "student_id": "S001",
  "event": "ENTRY",
  "decision": "ALLOW",
  "reason": "VALID",
  "timestamp": 1777025820
}
```

## 5. Failure Case (Example)
**Input**: Unknown Student ID `S999`
**Output**:
```json
{
  "trace_id": "042bf62b-e6ea-443e-8dd0-c6584f348de4",
  "source": "rfid_1",
  "student_id": "S999",
  "event": "ENTRY",
  "decision": "DENY",
  "reason": "UNKNOWN",
  "timestamp": 1777025820
}
```

## 6. Proof of Execution (Log Snapshot)
`logs/events.jsonl` contains the full audit trail for Vijay's module.
`logs/relay.jsonl` contains the hardware trigger timestamps.

---
**Build verified as deterministic and offline-ready.**
