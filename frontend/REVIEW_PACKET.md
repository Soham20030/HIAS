# HIAS UX Architecture & Interaction Packet

## ENTRY POINT
The application initializes at the **Dashboard** (`/dashboard`), providing a high-level KPI overview of system throughput and access trends.

## CORE FLOW: Review Queue (`/review-queue`)
Designed for **< 3 second decision loops**.
- **UX Goal**: Minimize cognitive load by centering all decision-making details.
- **Keyboard Shortcuts**:
  - `C`: Confirm (Green/AUTO)
  - `R`: Reject (Red/REJECT)
  - `S`: Manual Search
  - `↑/↓`: Navigate Queue
- **Visual Priority**:
  1. Student Face/ID
  2. AI Confidence Bar
  3. Action Buttons

## LIVE FLOW: Monitor (`/live`)
Real-time event stream with state-aware cards.
- **Auto-scroll**: Can be toggled for investigation.
- **Color Coding**: Instant visual recognition of ALLOW (Green) vs DENY (Red) events.

## WHAT WAS BUILT
1. **Multi-screen Routing**: Clean separation of concerns via React Router.
2. **Keyboard Interaction Layer**: Global listener for rapid queue processing.
3. **Reusable Component System**: 
   - `ReviewCard`: Optimized for speed, now handles lock/loading states.
   - `StatusBadge`: Contract-aligned visual rules.
   - `ConfidenceBar`: Instant risk assessment.
4. **Observability Screen**: `/system` view for real-time service health tracking.

## INTEGRATION LAYER
1. **SSE Event Stream**: Connected `/live` and `/review-queue` to real-time Python backend stream (`/events/stream`), eliminating polling.
2. **Action -> Controller Wiring**: Connected `/review/action` and `/manual/override`. Actions actively trigger physical relay logs.
3. **Action Locking**: Implemented UI freezing (`loading` states) during in-flight operations to prevent duplicate actions. Queue events wait for valid backend updates.
4. **Trace Synchronization**: Added `trace_id` to UI elements (Live Monitor, Review Cards) for precise debugging and tracking.

## FAILURE CASES
- **Connection Lost**: Sidebar shows "CONNECTION LOST" status.
- **Empty Queue**: Zero-state illustration with "QUEUE CLEAR" message.
- **API Failure / Offline**: Action lock fails gracefully and displays error banners.

## PROOF OF EXECUTION
- [x] Keyboard-first UX implemented.
- [x] < 3s decision loop capability.
- [x] Visual rules (AUTO/REVIEW/REJECT) enforced.
- [x] Multi-screen navigation architecture live.
- [x] Real-time SSE integration completed without polling.
- [x] Controller connected (Allow/Deny/Override endpoints active).
- [x] Trace ID mapped for log consistency.
