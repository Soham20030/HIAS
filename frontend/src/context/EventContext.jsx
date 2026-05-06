import { createContext, useContext, useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../api/config';

const EventContext = createContext();

export function EventProvider({ children }) {
  const [events, setEvents] = useState([]);
  const [reviewItems, setReviewItems] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Initial Fetch from Python Backend
    const fetchEvents = async () => {
      try {
        const res = await fetch(`${API_ENDPOINTS.EVENTS}?limit=50`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setEvents(data.reverse()); // Newest first
        }
      } catch (err) {
        console.warn("Initial fetch failed", err);
      }
    };
    
    const fetchQueue = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.REVIEW_QUEUE);
        const data = await res.json();
        if (Array.isArray(data)) {
          setReviewItems(data);
        }
      } catch (err) {
        console.warn("Initial review queue fetch failed", err);
      }
    };

    fetchEvents();
    fetchQueue();

    // SSE Connection to Python Backend
    const evtSource = new EventSource(API_ENDPOINTS.STREAM);
    
    evtSource.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        setEvents((prev) => [data, ...prev.slice(0, 49)]);
        
        // Phase 5: Queue Control Logic - Handle queue via SSE
        if (data.decision === 'REVIEW') {
          setReviewItems((prev) => {
            if (!prev.find(item => item.trace_id === data.trace_id)) {
              return [...prev, data];
            }
            return prev;
          });
        } else {
          // If a decision was ALLOW/DENY, it means the queue item was processed
          // Remove it from the review queue
          setReviewItems((prev) => prev.filter(item => item.trace_id !== data.trace_id));
        }
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
      const res = await fetch(API_ENDPOINTS.MANUAL_OVERRIDE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const text = await res.text();
      return text ? JSON.parse(text) : {};
    } catch (err) {
      console.error("Override failed", err);
      throw err;
    }
  };

  const triggerSimulation = async () => {
    const users = [
      { user_id: "S001", method: "FACE" },
      { user_id: "S999", method: "RFID" }
    ];
    const user = users[Math.floor(Math.random() * users.length)];
    try {
      await fetch(API_ENDPOINTS.ACCESS_EVENT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...user, device_id: "booth_1_in" })
      });
    } catch (err) {
      console.error("Simulation failed", err);
    }
  };

  return (
    <EventContext.Provider value={{ events, reviewItems, connected, triggerOverride, triggerSimulation }}>
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
