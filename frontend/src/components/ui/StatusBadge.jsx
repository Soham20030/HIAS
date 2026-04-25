export default function StatusBadge({ type }) {
  const styles = {
    AUTO: { bg: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', text: 'AUTO' },
    REVIEW: { bg: 'rgba(234, 179, 8, 0.1)', color: '#eab308', text: 'REVIEW' },
    REJECT: { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', text: 'REJECT' },
    ALLOW: { bg: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', text: 'ALLOW' },
    DENY: { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', text: 'DENY' },
  };

  const current = styles[type] || styles.REVIEW;

  return (
    <span style={{
      backgroundColor: current.bg,
      color: current.color,
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '11px',
      fontWeight: '600',
      textTransform: 'uppercase',
      display: 'inline-flex',
      alignItems: 'center',
    }}>
      {current.text}
    </span>
  );
}
