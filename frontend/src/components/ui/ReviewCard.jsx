import { Check, X, Search, Clock, Fingerprint } from 'lucide-react';
import StatusBadge from './StatusBadge';
import ConfidenceBar from './ConfidenceBar';

export default function ReviewCard({ data, onConfirm, onReject, onSearch, active }) {
  return (
    <div className={`card ${active ? 'active-card' : ''}`} style={{
      display: 'grid',
      gridTemplateColumns: '120px 1fr 180px',
      gap: '20px',
      alignItems: 'center',
      border: active ? '2px solid #ff3b8f' : '1px solid #1e293b',
      transition: 'all 0.2s ease',
      marginBottom: '12px',
      opacity: active ? 1 : 0.7
    }}>
      {/* Image (Left) */}
      <div style={{ width: '120px', height: '120px', backgroundColor: '#0a0c14', borderRadius: '6px', overflow: 'hidden' }}>
        {data.image ? (
          <img src={data.image} alt="Subject" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e293b' }}>
            <Fingerprint size={48} />
          </div>
        )}
      </div>

      {/* Details (Center) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h3 style={{ fontSize: '18px' }}>{data.student_id || 'UNKNOWN_ID'}</h3>
          <StatusBadge type="REVIEW" />
        </div>
        
        <div style={{ display: 'flex', gap: '20px', color: '#94a3b8', fontSize: '13px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={14} />
            {new Date(data.timestamp).toLocaleTimeString()}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Fingerprint size={14} />
            ID: {data.trace_id?.substring(0, 8)}...
          </div>
        </div>

        <div style={{ marginTop: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>
            <span>Confidence Level</span>
            <span>{(data.confidence * 100).toFixed(1)}%</span>
          </div>
          <ConfidenceBar value={data.confidence} />
        </div>
      </div>

      {/* Actions (Right) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button 
          onClick={onConfirm} 
          className="btn-primary" 
          style={{ backgroundColor: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '8px' }}
        >
          <Check size={16} /> CONFIRM <span style={{ fontSize: '10px', opacity: 0.7 }}>(C)</span>
        </button>
        <button 
          onClick={onSearch} 
          style={{ backgroundColor: '#1e293b', color: 'white', border: 'none', borderRadius: '6px', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <Search size={16} /> SEARCH <span style={{ fontSize: '10px', opacity: 0.7 }}>(S)</span>
        </button>
        <button 
          onClick={onReject} 
          style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <X size={16} /> REJECT <span style={{ fontSize: '10px', opacity: 0.7 }}>(R)</span>
        </button>
      </div>
    </div>
  );
}
