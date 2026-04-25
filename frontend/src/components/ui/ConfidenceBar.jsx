export default function ConfidenceBar({ value }) {
  const color = value > 0.8 ? '#22c55e' : value > 0.5 ? '#eab308' : '#ef4444';
  
  return (
    <div style={{ width: '100%', height: '4px', backgroundColor: '#1e293b', borderRadius: '2px', overflow: 'hidden' }}>
      <div style={{ 
        width: `${value * 100}%`, 
        height: '100%', 
        backgroundColor: color,
        transition: 'width 0.3s ease'
      }} />
    </div>
  );
}
