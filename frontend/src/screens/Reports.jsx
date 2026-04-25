import { BarChart3, Download, PieChart, TrendingUp, Calendar, FileText } from 'lucide-react';
import { API_ENDPOINTS } from '../api/config';

export default function Reports() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.REPORTS_STATS);
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch report stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleExport = () => {
    window.open(API_ENDPOINTS.REPORTS_EXPORT, '_blank');
  };

  if (loading) return <div style={{ padding: '20px', color: '#64748b' }}>Generating analytics...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <BarChart3 color="#ff3b8f" /> ANALYTICS & REPORTS
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>Detailed access patterns and data exports</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={{ backgroundColor: '#1e293b', color: 'white', border: '1px solid #334155', padding: '10px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
            <Calendar size={18} /> LAST 24 HOURS
          </button>
          <button 
            onClick={handleExport}
            style={{ backgroundColor: '#ff3b8f', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', cursor: 'pointer' }}
          >
            <Download size={18} /> EXPORT CSV
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* Access Distribution */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <PieChart size={20} color="#ff3b8f" />
            <h3 style={{ fontSize: '16px' }}>DECISION SPLIT</h3>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', height: '150px' }}>
             <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#22c55e' }}>{stats.decision_split.allowed}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>GRANTED</div>
             </div>
             <div style={{ width: '2px', height: '40px', backgroundColor: '#1e293b' }} />
             <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>{stats.decision_split.denied}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>DENIED</div>
             </div>
          </div>
        </div>

        {/* Method Distribution */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <TrendingUp size={20} color="#ff3b8f" />
            <h3 style={{ fontSize: '16px' }}>AUTHENTICATION METHODS</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {[
              { label: 'RFID SCAN', value: stats.method_split.rfid, color: '#3b82f6' },
              { label: 'FACE RECOGNITION', value: stats.method_split.face, color: '#a855f7' },
              { label: 'MANUAL OVERRIDE', value: stats.method_split.manual, color: '#eab308' },
            ].map((m, i) => {
              const total = stats.method_split.rfid + stats.method_split.face + stats.method_split.manual || 1;
              const percent = (m.value / total) * 100;
              return (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                    <span style={{ color: '#94a3b8' }}>{m.label}</span>
                    <span style={{ fontWeight: 'bold' }}>{m.value}</span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: '#0a0c14', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${percent}%`, height: '100%', backgroundColor: m.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Hourly Pattern */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <TrendingUp size={20} color="#ff3b8f" />
          <h3 style={{ fontSize: '16px' }}>HOURLY ACCESS DENSITY</h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', height: '200px', gap: '4px', paddingBottom: '20px' }}>
          {stats.hourly_distribution.map((val, i) => {
            const max = Math.max(...stats.hourly_distribution) || 1;
            const height = (val / max) * 100;
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '100%', height: `${height}%`, backgroundColor: '#ff3b8f20', borderTop: '2px solid #ff3b8f', borderRadius: '2px 2px 0 0' }} />
                <span style={{ fontSize: '9px', color: '#475569' }}>{i}h</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
