import { useState, useEffect } from 'react';
import { Activity, Server, Database, Globe, Cpu, Clock, AlertTriangle } from 'lucide-react';
import { API_ENDPOINTS } from '../api/config';

export default function SystemStatus() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.SYSTEM_DEVICES);
        const data = await res.json();
        setServices(data);
      } catch (err) {
        console.error("Failed to fetch devices", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDevices();
    const interval = setInterval(fetchDevices, 5000);
    return () => clearInterval(interval);
  }, []);

  const getIcon = (name) => {
    if (name.includes('Controller')) return Globe;
    if (name.includes('Layer')) return Database;
    if (name.includes('Face')) return Cpu;
    if (name.includes('RFID')) return Activity;
    return Server;
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Activity color="#ff3b8f" /> SYSTEM OBSERVABILITY
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>Service health and failure monitoring</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {loading ? (
          <p style={{ color: '#64748b' }}>Monitoring service connections...</p>
        ) : (
          services.map((s, i) => {
            const ServiceIcon = getIcon(s.name);
            const isHealthy = s.status === 'Healthy';
            const isWarning = s.status === 'Warning' || s.status === 'Simulated';
            const isOffline = s.status === 'Offline';

            return (
              <div key={i} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
                {(isWarning || isOffline) && (
                  <div style={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    width: '4px', 
                    height: '100%', 
                    backgroundColor: isOffline ? '#ef4444' : '#eab308' 
                  }} />
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#1e293b' }}>
                      <ServiceIcon size={20} color="#94a3b8" />
                    </div>
                    <h3 style={{ fontSize: '15px' }}>{s.name}</h3>
                  </div>
                  <div style={{ 
                    fontSize: '10px', 
                    fontWeight: 'bold', 
                    padding: '4px 8px', 
                    borderRadius: '4px',
                    backgroundColor: isHealthy ? 'rgba(34, 197, 94, 0.1)' : isOffline ? 'rgba(239, 68, 68, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                    color: isHealthy ? '#22c55e' : isOffline ? '#ef4444' : '#eab308',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {(isWarning || isOffline) && <AlertTriangle size={10} />}
                    {s.status.toUpperCase()}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ padding: '10px', borderRadius: '6px', backgroundColor: '#0a0c14' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '10px', marginBottom: '4px' }}>
                      <Clock size={10} /> UPTIME
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: '600' }}>{s.uptime}</div>
                  </div>
                  <div style={{ padding: '10px', borderRadius: '6px', backgroundColor: '#0a0c14' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '10px', marginBottom: '4px' }}>
                      <Activity size={10} /> LATENCY
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: s.latency.includes('ms') && parseInt(s.latency) > 100 ? '#eab308' : 'white' }}>
                      {s.latency}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
