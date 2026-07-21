import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { User, Shield, Bell, Moon, Database, Key, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { user } = useAuth();
  const [theme, setTheme] = useState('dark');
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);

  const handleSave = () => {
    toast.success('Settings saved successfully!');
  };

  return (
    <div style={{ padding: 32, minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800 }}>Account & System Settings</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Manage preferences, security, notifications, and vault limits</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, maxWidth: 900 }}>
        {/* Profile Info */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <User size={20} color="var(--primary)" />
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Profile Account</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Full Name</label>
              <input className="input-field" defaultValue={user?.name || ''} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Email Address</label>
              <input className="input-field" defaultValue={user?.email || ''} readOnly style={{ opacity: 0.7 }} />
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Shield size={20} color="var(--success)" />
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Security & Privacy</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600 }}>Two-Factor Authentication (2FA)</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Require OTP on new device logins</p>
              </div>
              <input type="checkbox" checked={twoFactor} onChange={e => setTwoFactor(e.target.checked)} />
            </label>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => toast.success('Password reset link sent to email')}><Key size={14} /> Change Password</button>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Bell size={20} color="var(--warning)" />
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Notifications & Alerts</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600 }}>In-App Notifications</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Show document status & reminder alerts</p>
              </div>
              <input type="checkbox" checked={notifications} onChange={e => setNotifications(e.target.checked)} />
            </label>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600 }}>Email Alerts</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Receive email prior to document expiration</p>
              </div>
              <input type="checkbox" checked={emailAlerts} onChange={e => setEmailAlerts(e.target.checked)} />
            </label>
          </div>
        </div>

        {/* Storage */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Database size={20} color="var(--secondary)" />
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Vault Storage</h3>
          </div>
          <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
            {((user?.storageUsed || 0) / 1024 / 1024).toFixed(2)} MB of {((user?.storageLimit || 1073741824) / 1024 / 1024 / 1024).toFixed(0)} GB used
          </p>
          <div className="progress-bar" style={{ marginBottom: 16 }}>
            <div className="progress-bar-fill" style={{ width: `${Math.min(100, Math.max(2, ((user?.storageUsed || 0) / (user?.storageLimit || 1073741824)) * 100))}%` }} />
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Free Plan · 1GB Vault Limit</p>
        </div>
      </div>

      <div style={{ marginTop: 32 }}>
        <button className="btn btn-primary" onClick={handleSave}>Save Settings</button>
      </div>
    </div>
  );
};

export default Settings;
