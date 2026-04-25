import { LayoutDashboard, Users, UserCheck, UserX, Fingerprint } from 'lucide-react';
import { useEvents } from '../context/EventContext';

export default function Dashboard() {
  const { events } = useEvents();

  // --- Calculate KPIs ---
  const stats = {
    total: events.length,
    granted: events.filter(e => e.decision === 'ALLOW').length,
    denied: events.filter(e => e.decision === 'DENY').length,
    overrides: events.filter(e => e.method === 'MANUAL').length,
  };

  const kpis = [
    { name: 'Total Access', value: stats.total.toLocaleString(), icon: Users, color: '#3b82f6' },
    { name: 'Granted', value: stats.granted.toLocaleString(), icon: UserCheck, color: '#22c55e' },
    { name: 'Denied', value: stats.denied.toLocaleString(), icon: UserX, color: '#ef4444' },
    { name: 'Manual Overrides', value: stats.overrides.toLocaleString(), icon: Fingerprint, color: '#eab308' },
  ];

  // --- Calculate Hourly Chart Data ---
  const hourlyData = new Array(12).fill(0); // 08:00 to 20:00
  events.forEach(event => {
    const hour = new Date(event.timestamp).getHours();
    if (hour >= 8 && hour < 20) {
      hourlyData[hour - 8]++;
    }
  });
  const maxEvents = Math.max(...hourlyData, 1);

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <LayoutDashboard color="#ff3b8f" /> SYSTEM DASHBOARD
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>Daily performance metrics</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
        {kpis.map((kpi, i) => (
          <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '12px', 
              backgroundColor: `${kpi.color}10`, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: kpi.color
            }}>
              <kpi.icon size={24} />
            </div>
            <div>
              <p style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase' }}>{kpi.name}</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '20px' }}>Peak Access Hours</h3>
        <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
          {hourlyData.map((count, i) => (
            <div key={i} style={{ 
              flex: 1, 
              height: `${(count / maxEvents) * 100}%`, 
              backgroundColor: '#1e293b', 
              borderRadius: '4px 4px 0 0',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }} 
            onMouseOver={(e) => e.target.style.backgroundColor = '#ff3b8f'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#1e293b'}
            title={`${8 + i}:00 - ${count} events`}
            />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', color: '#64748b', fontSize: '10px' }}>
          <span>08:00</span>
          <span>12:00</span>
          <span>16:00</span>
          <span>20:00</span>
        </div>
      </div>
    </div>
  );
}
