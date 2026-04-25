import { useState, useEffect } from 'react';
import ReviewCard from '../components/ui/ReviewCard';
import { ShieldAlert } from 'lucide-react';

export default function ReviewQueue({ onSearchUser }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  const fetchQueue = async () => {
    try {
      const res = await fetch('http://localhost:8000/review/queue');
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error("Failed to fetch review queue", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (trace_id, action, user_id) => {
    if (action === 'search') {
      onSearchUser(user_id);
      return;
    }
    
    try {
      await fetch('http://localhost:8000/review/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trace_id, action })
      });
      fetchQueue();
    } catch (err) {
      console.error("Failed to process review action", err);
    }
  };

  const simulateEvent = async () => {
    await fetch('http://localhost:8000/simulate/review', { method: 'POST' });
    fetchQueue();
  };


  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      const currentItem = items[activeIndex];
      if (!currentItem) return;

      if (key === 'c') handleAction(currentItem.trace_id, 'confirm');
      if (key === 'r') handleAction(currentItem.trace_id, 'reject');
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
