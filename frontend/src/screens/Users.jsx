import { useState, useEffect } from 'react';
import { Users as UsersIcon, Search, UserPlus, MoreVertical, Shield, User } from 'lucide-react';
import { API_ENDPOINTS } from '../api/config';

export default function Users({ initialSearch = '' }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({ user_id: '', name: '' });
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  const fetchUsers = async (query = '') => {
    setLoading(true);
    try {
      const url = query ? `${API_ENDPOINTS.USERS_SEARCH}?q=${query}` : API_ENDPOINTS.USERS;
      const res = await fetch(url);
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(initialSearch);
    setSearchQuery(initialSearch);
  }, [initialSearch]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(API_ENDPOINTS.USERS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      if (res.ok) {
        setShowModal(false);
        setNewUser({ user_id: '', name: '' });
        fetchUsers();
      } else {
        const err = await res.json();
        alert(err.detail);
      }
    } catch (err) {
      alert("Failed to enroll user");
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: '400px', padding: '30px' }}>
            <h2 style={{ marginBottom: '20px' }}>Enroll New User</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>USER ID (e.g. S006)</label>
                <input 
                  type="text" 
                  required
                  value={newUser.user_id}
                  onChange={e => setNewUser({...newUser, user_id: e.target.value})}
                  style={{ width: '100%', backgroundColor: '#0a0c14', border: '1px solid #1e293b', padding: '12px', borderRadius: '6px', color: 'white' }}
                />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>FULL NAME</label>
                <input 
                  type="text" 
                  required
                  value={newUser.name}
                  onChange={e => setNewUser({...newUser, name: e.target.value})}
                  style={{ width: '100%', backgroundColor: '#0a0c14', border: '1px solid #1e293b', padding: '12px', borderRadius: '6px', color: 'white' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, backgroundColor: '#1e293b', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer' }}>CANCEL</button>
                <button type="submit" style={{ flex: 1, backgroundColor: '#ff3b8f', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>ENROLL</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <UsersIcon color="#ff3b8f" /> USER REGISTRY
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>Manage authorized hostel residents</p>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input 
              type="text" 
              placeholder="Search by name or ID..." 
              value={searchQuery}
              onChange={(e) => {
                const q = e.target.value;
                setSearchQuery(q);
                fetchUsers(q);
              }}
              style={{ width: '100%', backgroundColor: '#0a0c14', border: '1px solid #1e293b', padding: '10px 10px 10px 40px', borderRadius: '8px', color: 'white', fontSize: '14px' }}
            />
          </div>
          <button 
            onClick={() => setShowModal(true)}
            style={{ 
              backgroundColor: '#ff3b8f', 
              color: 'white', 
              border: 'none', 
              padding: '10px 20px', 
              borderRadius: '8px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            <UserPlus size={18} /> ADD USER
          </button>
        </div>
      </div>



      <div className="card" style={{ padding: '0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1e293b' }}>
              <th style={{ padding: '16px', textAlign: 'left', color: '#64748b', fontSize: '12px' }}>USER</th>
              <th style={{ padding: '16px', textAlign: 'left', color: '#64748b', fontSize: '12px' }}>USER ID</th>
              <th style={{ padding: '16px', textAlign: 'left', color: '#64748b', fontSize: '12px' }}>ROLE</th>
              <th style={{ padding: '16px', textAlign: 'left', color: '#64748b', fontSize: '12px' }}>STATUS</th>
              <th style={{ padding: '16px', textAlign: 'right', color: '#64748b', fontSize: '12px' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading registry...</td></tr>
            ) : (
              users.map((user, i) => (
                <tr key={i} style={{ borderBottom: i < users.length - 1 ? '1px solid #1e293b' : 'none' }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        width: '36px', 
                        height: '36px', 
                        borderRadius: '50%', 
                        backgroundColor: user.role === 'Admin' ? 'rgba(214, 51, 132, 0.1)' : '#1e293b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {user.role === 'Admin' ? <Shield size={18} color="#ff3b8f" /> : <User size={18} color="#94a3b8" />}
                      </div>
                      <span style={{ fontWeight: '500' }}>{user.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px', color: '#94a3b8', fontFamily: 'monospace' }}>{user.user_id}</td>
                  <td style={{ padding: '16px' }}>
                      <span style={{ 
                        fontSize: '11px', 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        backgroundColor: user.role === 'Admin' ? 'rgba(214, 51, 132, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                        color: user.role === 'Admin' ? '#ff3b8f' : '#3b82f6',
                        fontWeight: '600'
                      }}>
                        {(user.role || 'Resident').toUpperCase()}
                      </span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
                      <span style={{ fontSize: '13px' }}>Active</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <button style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                      <MoreVertical size={18} />
                    </button>
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
