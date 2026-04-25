import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, ShieldAlert, Clock, Save, RefreshCcw, Bell } from 'lucide-react';
import { API_ENDPOINTS } from '../api/config';

export default function Settings() {
  const [settings, setSettings] = useState({
    emergency_mode: false,
    access_window_start: '07:00',
    access_window_end: '21:00',
    require_admin_approval: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.SETTINGS);
        const data = await res.json();
        setSettings(data);
      } catch (err) {
        console.error("Failed to fetch settings", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(API_ENDPOINTS.SETTINGS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      alert("Settings saved successfully!");
    } catch (err) {
      console.error("Failed to save settings", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '20px', color: '#64748b' }}>Loading configurations...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <SettingsIcon color="#ff3b8f" /> SYSTEM SETTINGS
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>Configure access rules and system behavior</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          style={{ backgroundColor: '#ff3b8f', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', cursor: 'pointer', opacity: saving ? 0.7 : 1 }}
        >
          {saving ? <RefreshCcw size={18} className="spin" /> : <Save size={18} />}
          SAVE CHANGES
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Emergency Mode */}
        <div className="card" style={{ border: settings.emergency_mode ? '1px solid #ef4444' : '1px solid #1e293b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                <ShieldAlert size={24} color="#ef4444" />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', marginBottom: '4px' }}>Emergency Bypass Mode</h3>
                <p style={{ color: '#64748b', fontSize: '13px' }}>Force all gates to remain open and bypass authorization.</p>
              </div>
            </div>
            <div 
              onClick={() => setSettings({...settings, emergency_mode: !settings.emergency_mode})}
              style={{ width: '50px', height: '26px', backgroundColor: settings.emergency_mode ? '#ef4444' : '#1e293b', borderRadius: '13px', position: 'relative', cursor: 'pointer', transition: '0.3s' }}
            >
              <div style={{ width: '20px', height: '20px', backgroundColor: 'white', borderRadius: '50%', position: 'absolute', top: '3px', left: settings.emergency_mode ? '27px' : '3px', transition: '0.3s' }} />
            </div>
          </div>
        </div>

        {/* Access Windows */}
        <div className="card">
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
              <Clock size={24} color="#3b82f6" />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', marginBottom: '4px' }}>General Access Window</h3>
              <p style={{ color: '#64748b', fontSize: '13px' }}>Set the time range during which residents can scan in/out.</p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>START TIME</label>
              <input 
                type="time" 
                value={settings.access_window_start}
                onChange={(e) => setSettings({...settings, access_window_start: e.target.value})}
                style={{ width: '100%', backgroundColor: '#0a0c14', border: '1px solid #1e293b', borderRadius: '6px', padding: '12px', color: 'white' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>END TIME</label>
              <input 
                type="time" 
                value={settings.access_window_end}
                onChange={(e) => setSettings({...settings, access_window_end: e.target.value})}
                style={{ width: '100%', backgroundColor: '#0a0c14', border: '1px solid #1e293b', borderRadius: '6px', padding: '12px', color: 'white' }}
              />
            </div>
          </div>
        </div>

        {/* System Behavior */}
        <div className="card">
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: 'rgba(168, 85, 247, 0.1)' }}>
              <Bell size={24} color="#a855f7" />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', marginBottom: '4px' }}>System Preferences</h3>
              <p style={{ color: '#64748b', fontSize: '13px' }}>Adjust operational behavior of the controller core.</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px' }}>Require Admin Review for low-confidence matches</span>
              <input 
                type="checkbox" 
                checked={settings.require_admin_approval}
                onChange={(e) => setSettings({...settings, require_admin_approval: e.target.checked})}
                style={{ width: '20px', height: '20px', accentColor: '#ff3b8f' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
