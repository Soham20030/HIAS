const axios = require('axios');

async function testEmergency() {
    console.log("ACTIVATING EMERGENCY MODE...");
    await axios.post('http://localhost:3000/emergency', { status: 'ACTIVE' });
    
    console.log("Testing access for unauthorized ID (should ALLOW now)...");
    const res = await axios.post('http://localhost:3000/access/event', {
        user_id: "B20239999",
        name: "Emergency Exit Person",
        direction: "OUT",
        method: "MANUAL"
    });
    
    console.log(`Response: ${res.data.decision} - ${res.data.reason}`);
    
    console.log("RESTORING NORMAL OPERATIONS...");
    await axios.post('http://localhost:3000/emergency', { status: 'INACTIVE' });
}

testEmergency();
