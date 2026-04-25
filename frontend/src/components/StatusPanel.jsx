import { CheckCircle2, XCircle, Wifi, Database, Activity, ShieldCheck } from 'lucide-react';

export default function StatusPanel({ connected }) {
  const statuses = [
    { name: 'Controller', status: connected ? 'Online' : 'Offline', icon: Activity },
    { name: 'Face Devices', status: '4 / 4 Online', icon: ShieldCheck },
    { name: 'RFID Readers', status: '2 / 2 Online', icon: Database },
    { name: 'Relay / Door Locks', status: 'All OK', icon: CheckCircle2 },
    { name: 'Network', status: 'Online', icon: Wifi },
  ];

  return (
    <div className="card">
      <h3 style={{ marginBottom: '16px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Activity size={18} color="#ff3b8f" /> SYSTEM STATUS
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {statuses.map((s, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8' }}>
              <s.icon size={16} />
              <span>{s.name}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: s.status === 'Offline' ? '#ef4444' : '#fff' }}>{s.status}</span>
              <div className={`status-indicator ${s.status === 'Offline' ? 'offline' : 'online'}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
