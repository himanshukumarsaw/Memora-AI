import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Users, FileText, Activity, HardDrive, ShieldCheck, Search } from 'lucide-react';
import { adminService } from '../services/featureServices';

const AdminDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    Promise.all([
      adminService.getDashboard(),
      adminService.getUsers(),
    ])
      .then(([dashRes, userRes]) => {
        setDashboard(dashRes.data.data);
        setUsers(userRes.data.data);
      })
      .catch((err) => toast.error(err.response?.data?.message || 'Admin access required'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ padding: 32 }}><div className="spinner-lg" style={{ margin: '40px auto' }} /></div>;
  }

  return (
    <div style={{ padding: 32, minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--danger-dim)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 99, padding: '4px 12px', fontSize: 12, color: 'var(--danger)', fontWeight: 600, marginBottom: 8 }}>
          <ShieldCheck size={13} /> Admin Portal
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800 }}>System Control Panel</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>System metrics, user accounts, document audit, and platform analytics</p>
      </div>

      {/* Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 32 }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Users size={28} color="var(--primary)" />
            <div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total Users</p>
              <h3 style={{ fontSize: 22, fontWeight: 800 }}>{dashboard?.totalUsers || 0}</h3>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <FileText size={28} color="var(--secondary)" />
            <div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total Documents</p>
              <h3 style={{ fontSize: 22, fontWeight: 800 }}>{dashboard?.totalDocuments || 0}</h3>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Activity size={28} color="var(--success)" />
            <div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Active Accounts</p>
              <h3 style={{ fontSize: 22, fontWeight: 800 }}>{dashboard?.activeUsers || 0}</h3>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <HardDrive size={28} color="var(--warning)" />
            <div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Storage Consumed</p>
              <h3 style={{ fontSize: 22, fontWeight: 800 }}>{((dashboard?.totalStorageBytes || 0) / 1024 / 1024).toFixed(1)} MB</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>Registered Users</h3>
          <div style={{ position: 'relative', width: 260 }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-disabled)' }} />
            <input className="input-search" placeholder="Search user by name/email" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 34 }} />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 16px' }}>User</th>
                <th style={{ padding: '12px 16px' }}>Email</th>
                <th style={{ padding: '12px 16px' }}>Plan</th>
                <th style={{ padding: '12px 16px' }}>Joined</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.filter(u => !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())).map(u => (
                <tr key={u._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 600 }}>{u.name}</td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>{u.email}</td>
                  <td style={{ padding: '14px 16px' }}><span className="badge badge-primary">{u.plan || 'free'}</span></td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '14px 16px' }}><span className="badge badge-success">Active</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
