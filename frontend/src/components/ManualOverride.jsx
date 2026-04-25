import { useState } from "react";
import { Lock, ShieldAlert } from 'lucide-react';

export default function ManualOverride() {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const trigger = async () => {
    if (!reason) {
      alert("Please provide a reason for override");
      return;
    }
    setLoading(true);
    try {
      await fetch("http://<PI-IP>:3000/manual/override", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ reason })
      });
      setReason("");
      alert("Gate Override Triggered");
    } catch (err) {
      console.error(err);
      alert("Failed to trigger override");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3 style={{ marginBottom: '8px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <ShieldAlert size={18} color="#ff3b8f" /> MANUAL OVERRIDE
      </h3>
      <p style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '16px' }}>
        Use only in emergency or authorized situations.
      </p>
      
      <div style={{ marginBottom: '12px' }}>
        <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Reason (Required)</label>
        <input
          placeholder="Enter reason..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>
      
      <button 
        className="btn-primary" 
        onClick={trigger}
        disabled={loading}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
      >
        <Lock size={16} />
        {loading ? 'OPENING...' : 'OPEN GATE'}
      </button>
    </div>
  );
}
