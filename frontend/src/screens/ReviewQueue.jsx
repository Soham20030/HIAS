import { useState, useEffect } from 'react';
import ReviewCard from '../components/ui/ReviewCard';
import { ShieldAlert, AlertTriangle } from 'lucide-react';
import { API_ENDPOINTS } from '../api/config';
import { useEvents } from '../context/EventContext';

export default function ReviewQueue({ onSearchUser }) {
  const { reviewItems: items } = useEvents();
  const [processingIds, setProcessingIds] = useState(new Set());
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // When items change, ensure activeIndex is valid
  useEffect(() => {
    if (activeIndex >= items.length && items.length > 0) {
      setActiveIndex(items.length - 1);
    } else if (items.length === 0) {
      setActiveIndex(0);
    }
  }, [items, activeIndex]);

  const handleAction = async (trace_id, action, user_id) => {
    if (action === 'search') {
      onSearchUser(user_id);
      return;
    }
    
    if (processingIds.has(trace_id)) return; // Prevent duplicate clicks

    setProcessingIds(prev => new Set(prev).add(trace_id));
    setError(null);
    
    try {
      const res = await fetch(API_ENDPOINTS.REVIEW_ACTION, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trace_id, action })
      });
      if (!res.ok) {
        throw new Error('API request failed');
      }
      // Success!
      // The event will be removed from `items` automatically via SSE
    } catch (err) {
      console.error("Failed to process review action", err);
      setError(`Failed to process action for event ${trace_id.substring(0,8)}. Please retry.`);
    } finally {
      // Remove from processing lock
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(trace_id);
        return next;
      });
    }
  };

  const simulateEvent = async () => {
    await fetch(API_ENDPOINTS.SIMULATE_REVIEW, { method: 'POST' });
  };


  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      const currentItem = items[activeIndex];
      if (!currentItem) return;

      if (key === 'c' && !processingIds.has(currentItem.trace_id)) handleAction(currentItem.trace_id, 'confirm');
      if (key === 'r' && !processingIds.has(currentItem.trace_id)) handleAction(currentItem.trace_id, 'reject');
      if (key === 's') handleAction(currentItem.trace_id, 'search', currentItem.user_id);
      if (key === 'arrowdown') setActiveIndex(prev => Math.min(items.length - 1, prev + 1));
      if (key === 'arrowup') setActiveIndex(prev => Math.max(0, prev - 1));
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items, activeIndex]);

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ShieldAlert color="#ff3b8f" /> REVIEW QUEUE
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>Human-in-the-loop verification required</p>
        </div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <button 
            onClick={simulateEvent}
            style={{ backgroundColor: '#1e293b', border: 'none', color: '#64748b', padding: '8px 16px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}
          >
            [DEV] PUSH TO QUEUE
          </button>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '32px', fontWeight: 'bold' }}>{items.length}</span>
            <p style={{ color: '#94a3b8', fontSize: '12px' }}>PENDING</p>
          </div>
        </div>
      </div>


      {error && (
        <div style={{ backgroundColor: '#7f1d1d', color: '#fca5a5', padding: '12px 16px', borderRadius: '6px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <AlertTriangle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px', color: '#64748b' }}>
            <ShieldAlert size={48} style={{ marginBottom: '20px', opacity: 0.2 }} />
            <h3>QUEUE CLEAR</h3>
            <p>All items have been processed.</p>
          </div>
        ) : (
          items.map((item, index) => (
            <ReviewCard 
              key={item.trace_id} 
              data={item} 
              active={index === activeIndex}
              loading={processingIds.has(item.trace_id)}
              onConfirm={() => handleAction(item.trace_id, 'confirm')}
              onReject={() => handleAction(item.trace_id, 'reject')}
              onSearch={() => handleAction(item.trace_id, 'search', item.user_id)}
            />
          ))
        )}
      </div>

      {/* Shortcuts Legend */}
      <div style={{ 
        position: 'fixed', 
        bottom: '20px', 
        left: '50%', 
        transform: 'translateX(-50%)',
        backgroundColor: '#111420',
        padding: '10px 20px',
        borderRadius: '30px',
        border: '1px solid #1e293b',
        display: 'flex',
        gap: '20px',
        fontSize: '12px',
        color: '#94a3b8'
      }}>
        <div><span style={{ color: 'white', fontWeight: 'bold' }}>C</span> Confirm</div>
        <div><span style={{ color: 'white', fontWeight: 'bold' }}>R</span> Reject</div>
        <div><span style={{ color: 'white', fontWeight: 'bold' }}>S</span> Search</div>
        <div><span style={{ color: 'white', fontWeight: 'bold' }}>↑↓</span> Navigate</div>
      </div>
    </div>
  );
}
