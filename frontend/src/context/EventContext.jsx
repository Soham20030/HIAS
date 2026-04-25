import { createContext, useContext, useState, useEffect } from 'react';

const EventContext = createContext();

export function EventProvider({ children }) {
  const [events, setEvents] = useState([]);
  const [connected, setConnected] = useState(false);
  const piIp = "localhost"; 

  useEffect(() => {
    // Initial Fetch from Python Backend
    const fetchEvents = async () => {
      try {
        const res = await fetch(`http://${piIp}:8000/events?limit=50`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setEvents(data.reverse()); // Newest first
        }
      } catch (err) {
        console.warn("Initial fetch failed, using mock data", err);
        setEvents([
          { timestamp: new Date().toISOString(), name: "Riya Sharma", user_id: "S001", direction: "IN", method: "FACE", decision: "ALLOW", reason: "VALID" },
          { timestamp: new Date().toISOString(), name: "Ananya Singh", user_id: "S002", direction: "IN", method: "RFID", decision: "DENY", reason: "TIME_BLOCK" },
        ]);
      }
    };
    fetchEvents();

    // SSE Connection to Python Backend
    const evtSource = new EventSource(`http://${piIp}:8000/events/stream`);
    
    evtSource.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        setEvents((prev) => [data, ...prev.slice(0, 49)]);
      } catch (err) {
        console.error("Failed to parse SSE data", err);
      }
    };

    evtSource.onopen = () => setConnected(true);
    evtSource.onerror = () => setConnected(false);

    return () => evtSource.close();
  }, []);

  const triggerOverride = async (reason) => {
    try {
      const res = await fetch(`http://${piIp}:8000/manual/override`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      return await res.json();
    } catch (err) {
      console.error("Override failed", err);
    }
  };

  const triggerSimulation = async () => {
    const users = [
      { user_id: "S001", method: "FACE" },
      { user_id: "S999", method: "RFID" }
    ];
    const user = users[Math.floor(Math.random() * users.length)];
    try {
      await fetch(`http://${piIp}:8000/access/event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...user, device_id: "booth_1_in" })
      });
    } catch (err) {
      console.error("Simulation failed", err);
    }
  };

  return (
    <EventContext.Provider value={{ events, connected, triggerOverride, triggerSimulation }}>
      {children}
    </EventContext.Provider>
  );
}

export function useEvents() {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
}
