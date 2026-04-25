import { useState, useEffect } from 'react';
import { Activity, ArrowUpRight, ArrowDownRight, User, Eye, EyeOff } from 'lucide-react';
import StatusBadge from '../components/ui/StatusBadge';
import { useEvents } from '../context/EventContext';

export default function LiveMonitor() {
  const { events } = useEvents();
  const [autoScroll, setAutoScroll] = useState(true);

  return (
    <div style={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Activity color="#ff3b8f" /> LIVE MONITOR
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>Real-time access tracking</p>
        </div>
        <button 
          onClick={() => setAutoScroll(!autoScroll)}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            backgroundColor: autoScroll ? 'rgba(34, 197, 94, 0.1)' : '#1e293b',
            color: autoScroll ? '#22c55e' : '#94a3b8',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '600'
          }}
        >
          {autoScroll ? <Eye size={16} /> : <EyeOff size={16} />}
          {autoScroll ? 'AUTO-SCROLL ON' : 'AUTO-SCROLL OFF'}
        </button>
      </div>

      <div className="card" style={{ flex: 1, overflowY: 'auto', padding: '0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ position: 'sticky', top: 0, backgroundColor: '#111420', zIndex: 1 }}>
            <tr>
              <th style={{ padding: '16px' }}>Time</th>
              <th>Subject</th>
              <th>Direction</th>
              <th>Method</th>
              <th>Decision</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #1e293b' }}>
                <td style={{ padding: '16px', color: '#94a3b8', fontSize: '13px' }}>{new Date(e.timestamp).toLocaleTimeString()}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <User size={16} color="#94a3b8" />
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '500' }}>{e.name}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{e.user_id}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: e.direction === 'IN' ? '#22c55e' : '#ff3b8f' }}>
                    {e.direction === 'IN' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{e.direction}</span>
                  </div>
                </td>
                <td style={{ fontSize: '13px', color: '#94a3b8' }}>{e.method}</td>
                <td><StatusBadge type={e.decision} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
