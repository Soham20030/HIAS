const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// --- Health Check ---
app.get('/', (req, res) => {
    res.json({ status: "HIAS_CONTROLLER_ONLINE", version: "1.0.0" });
});

// --- Observability (Vijay) ---
const LOG_FILE = path.join(__dirname, 'logs', 'access.jsonl');
let lastHash = "0".repeat(64); // Initial hash

function logEvent(event) {
    const hash = crypto.createHash('sha256')
        .update(lastHash + JSON.stringify(event))
        .digest('hex');
    
    const entry = { ...event, hash };
    fs.appendFileSync(LOG_FILE, JSON.stringify(entry) + '\n');
    lastHash = hash;
    return entry;
}

// --- Controller State (Soham) ---
let clients = [];
const events = [];
let emergencyMode = false;

// --- Decision Engine (Soham) ---
function processDecision(input) {
    // Deterministic Rule Engine
    // In a real system, this would query a local SQLite/DB
    // For now, we use deterministic logic based on ID patterns
    
    let decision = "DENY";
    let reason = "UNKNOWN";

    if (emergencyMode) {
        return { decision: "ALLOW", reason: "EMERGENCY_BYPASS" };
    }

    // Mock rule: IDs starting with 'G' are allowed (Girls Hostel)
    if (input.user_id && input.user_id.startsWith('G')) {
        decision = "ALLOW";
        reason = "VALID";
    } else {
        reason = "INVALID_ID";
    }

    return { decision, reason };
}

// --- Endpoints ---

// 1. Identity Input (RFID / Face)
app.post('/access/event', (req, res) => {
    const { user_id, name, direction, method, device_id } = req.body;

    if (!user_id || !direction || !method) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const { decision, reason } = processDecision({ user_id });

    const event = {
        trace_id: uuidv4(),
        user_id,
        name: name || "Unknown User",
        direction,
        method,
        decision,
        reason,
        device_id: device_id || "booth_1_in",
        timestamp: new Date().toISOString()
    };

    // Log the event (Observability)
    const loggedEvent = logEvent(event);
    
    // Update local state
    events.unshift(loggedEvent);
    if (events.length > 100) events.pop();

    // Trigger physical hardware (Simulation/Usman)
    if (decision === "ALLOW") {
        console.log(`[HARDWARE] Triggering Relay for ${user_id}`);
        // Here you would talk to GPIO or Serial
    }

    // Broadcast to Dashboard (Chandragupta)
    broadcast(loggedEvent);

    res.json(loggedEvent);
});

// 2. Fetch Events
app.get('/events', (req, res) => {
    res.json(events);
});

// 3. SSE Stream
app.get('/events/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const clientId = Date.now();
    const newClient = { id: clientId, res };
    clients.push(newClient);

    req.on('close', () => {
        clients = clients.filter(c => c.id !== clientId);
    });
});

function broadcast(data) {
    clients.forEach(c => c.res.write(`data: ${JSON.stringify(data)}\n\n`));
}

// 4. Manual Override
app.post('/override', (req, res) => {
    const { action, reason } = req.body;
    
    if (action === 'OPEN_GATE') {
        const event = {
            trace_id: uuidv4(),
            user_id: "ADMIN_OVERRIDE",
            name: "Administrator",
            direction: "IN",
            method: "MANUAL",
            decision: "ALLOW",
            reason: reason || "Manual Override",
            device_id: "console_override",
            timestamp: new Date().toISOString()
        };
        const loggedEvent = logEvent(event);
        events.unshift(loggedEvent);
        broadcast(loggedEvent);
        console.log(`[HARDWARE] Manual Override Triggered: ${reason}`);
        res.json({ status: "SUCCESS", event: loggedEvent });
    } else {
        res.status(400).json({ error: "Invalid override action" });
    }
});

// 5. Emergency Protocol
app.post('/emergency', (req, res) => {
    const { status } = req.body;
    emergencyMode = status === 'ACTIVE';
    
    const event = {
        trace_id: uuidv4(),
        user_id: "SYSTEM",
        name: "Emergency Protocol",
        direction: "NONE",
        method: "SYSTEM",
        decision: emergencyMode ? "ALLOW" : "RESTORE",
        reason: emergencyMode ? "FIRE_EMERGENCY" : "NORMAL_OPERATIONS",
        device_id: "emergency_panel",
        timestamp: new Date().toISOString()
    };
    
    logEvent(event);
    broadcast(event);
    
    console.log(`[SYSTEM] Emergency Mode: ${emergencyMode ? 'ON - ALL LOCKS RELEASED' : 'OFF'}`);
    res.json({ status: "SUCCESS", emergencyMode });
});

app.listen(PORT, () => {
    console.log(`HIAS Controller running on http://localhost:${PORT}`);
});
