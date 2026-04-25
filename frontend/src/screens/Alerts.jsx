import { useState, useEffect } from 'react';
import { Bell, ShieldAlert, Cpu, Settings, Clock, Trash2 } from 'lucide-react';
import { API_ENDPOINTS } from '../api/config';

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.ALERTS);
        const data = await res.json();
        setAlerts(data);
      } catch (err) {
        console.error("Failed to fetch alerts", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to clear all alerts and logs?")) return;
    try {
      await fetch(`${API_ENDPOINTS.ALERTS}/clear`, { method: 'POST' });
      setAlerts([]);
    } catch (err) {
      console.error("Failed to clear alerts", err);
    }
  };

  const getSeverityColor = (sev) => {
    if (sev === 'High') return '#ef4444';
    if (sev === 'Medium') return '#eab308';
    return '#3b82f6';
  };

  const getIcon = (type) => {
    if (type === 'Security') return ShieldAlert;
    if (type === 'Hardware') return Cpu;
    return Bell;
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Bell color="#ff3b8f" /> SYSTEM ALERTS
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>Real-time security and hardware notifications</p>
        </div>
        <button 
          onClick={handleClearAll}
          style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Trash2 size={16} /> CLEAR ALL
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {loading ? (
          <p style={{ color: '#64748b' }}>Fetching alerts...</p>
        ) : alerts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px', backgroundColor: '#121826', borderRadius: '12px', border: '1px solid #1e293b' }}>
            <Bell size={48} color="#1e293b" style={{ marginBottom: '16px' }} />
            <h3 style={{ color: '#64748b' }}>NO ACTIVE ALERTS</h3>
            <p style={{ color: '#475569', fontSize: '14px' }}>Your system is secure and running smoothly.</p>
          </div>
        ) : (
          alerts.map((alert, i) => {
            const Icon = getIcon(alert.type);
            const color = getSeverityColor(alert.severity);
            
            return (
              <div key={alert.id} className="card" style={{ display: 'flex', gap: '20px', alignItems: 'center', position: 'relative', padding: '16px 24px' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', backgroundColor: color }} />
                
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '10px', 
                  backgroundColor: `${color}15`, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <Icon size={20} color={color} />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 'bold', color: color, letterSpacing: '1px' }}>{alert.type.toUpperCase()}</span>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} /> {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: '500' }}>{alert.message}</div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ 
                    fontSize: '10px', 
                    fontWeight: 'bold', 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    backgroundColor: `${color}15`, 
                    color: color 
                  }}>
                    {alert.severity.toUpperCase()} PRIORITY
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
