import { ArrowUpRight, ArrowDownRight, User } from 'lucide-react';

export default function LiveFeed({ events }) {
  return (
    <div className="card" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          LIVE ACCESS FEED <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ff3b8f', display: 'inline-block' }} />
          <span style={{ fontSize: '10px', color: '#ff3b8f', fontWeight: 'bold' }}>LIVE</span>
        </h3>
        <div style={{ fontSize: '12px', color: '#94a3b8' }}>
          Showing latest {events.length} events
        </div>
      </div>
      
      <div style={{ overflowY: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Name</th>
              <th>User ID</th>
              <th>Direction</th>
              <th>Method</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  Waiting for incoming events...
                </td>
              </tr>
            ) : (
              events.map((e, i) => (
                <tr key={i}>
                  <td style={{ color: '#94a3b8' }}>{new Date(e.timestamp || Date.now()).toLocaleTimeString()}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={16} color="#94a3b8" />
                      </div>
                      <span>{e.name || e.user_id || 'Unknown'}</span>
                    </div>
                  </td>
                  <td style={{ color: '#94a3b8' }}>{e.user_id || 'G20230000'}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: e.direction === 'IN' ? '#22c55e' : '#ff3b8f' }}>
                      {e.direction === 'IN' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      {e.direction || 'IN'}
                    </div>
                  </td>
                  <td>{e.method || 'Face'}</td>
                  <td>
                    <span className={`status-badge ${e.decision === 'ALLOW' ? 'allowed' : 'denied'}`}>
                      {e.decision || 'ALLOWED'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
