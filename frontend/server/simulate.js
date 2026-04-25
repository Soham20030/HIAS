const axios = require('axios');

const USERS = [
    { user_id: "G20230045", name: "Riya Sharma", method: "FACE" },
    { user_id: "G20230091", name: "Ananya Singh", method: "RFID" },
    { user_id: "G20230102", name: "Sneha Patel", method: "FACE" },
    { user_id: "B20230555", name: "Stranger X", method: "RFID" }, // Should be DENIED
    { user_id: "G20230211", name: "Priya Das", method: "FACE" }
];

async function simulate() {
    console.log("Starting HIAS Input Simulation...");
    
    for (const user of USERS) {
        try {
            const event = {
                ...user,
                direction: Math.random() > 0.5 ? "IN" : "OUT",
                device_id: "booth_1_in"
            };
            
            console.log(`Sending input: ${user.name} (${user.user_id}) via ${user.method}`);
            const res = await axios.post('http://localhost:3000/access/event', event);
            console.log(`Response: ${res.data.decision} - ${res.data.reason}`);
            
            // Wait between events
            await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (err) {
            console.error("Simulation error:", err.message);
        }
    }
}

// Add axios to server dependencies
const { execSync } = require('child_process');
try {
    require.resolve('axios');
} catch (e) {
    console.log("Installing axios for simulation...");
    execSync('npm install axios', { cwd: __dirname });
}

simulate();
