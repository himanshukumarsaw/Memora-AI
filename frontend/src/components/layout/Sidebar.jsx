import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, FolderOpen, MessageSquare, Bell,
  User, LogOut, Brain, ChevronRight, Shield, FileCheck,
  Sparkles, Share2, Settings as SettingsIcon, ShieldAlert, HeartPulse, Clock, Network, Target
} from 'lucide-react';

const mainNavItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/vault', icon: FolderOpen, label: 'Document Vault' },
  { to: '/chat', icon: MessageSquare, label: 'AI Chat' },
  { to: '/reminders', icon: Bell, label: 'Reminders' },
  { to: '/profile', icon: User, label: 'Universal Profile' },
];

const featureNavItems = [
  { to: '/opportunities', icon: Target, label: 'Opportunity Engine' },
  { to: '/graph', icon: Network, label: 'Life OS Knowledge Graph' },
  { to: '/timeline', icon: Clock, label: 'Digital Life Timeline' },
  { to: '/emergency', icon: HeartPulse, label: 'Emergency Medical QR' },
  { to: '/resume', icon: Sparkles, label: 'Resume AI' },
  { to: '/autofill', icon: FileCheck, label: 'Form Autofill' },
  { to: '/sharing', icon: Share2, label: 'Secure Sharing' },
  { to: '/settings', icon: SettingsIcon, label: 'Settings' },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <motion.aside
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{
        width: 260,
        minWidth: 260,
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'relative',
        zIndex: 10,
      }}
    >
      {/* Logo */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(37,99,235,0.4)',
          }}>
            <Brain size={20} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--text)', letterSpacing: '-0.3px' }}>Memora AI</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Digital Memory</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="scroll-area" style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-disabled)', letterSpacing: '0.5px', textTransform: 'uppercase', padding: '4px 10px 8px' }}>
          Main Menu
        </div>
        {mainNavItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} style={{ textDecoration: 'none' }}>
            {({ isActive }) => (
              <motion.div
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '9px 12px', borderRadius: 10,
                  background: isActive ? 'var(--primary-dim)' : 'transparent',
                  border: isActive ? '1px solid rgba(37,99,235,0.3)' : '1px solid transparent',
                  color: isActive ? 'var(--primary-hover)' : 'var(--text-muted)',
                  cursor: 'pointer', transition: 'all 0.15s ease',
                }}
              >
                <Icon size={17} />
                <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 400 }}>{label}</span>
                {isActive && <ChevronRight size={13} style={{ marginLeft: 'auto' }} />}
              </motion.div>
            )}
          </NavLink>
        ))}

        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-disabled)', letterSpacing: '0.5px', textTransform: 'uppercase', padding: '16px 10px 8px' }}>
          AI Tools & Features
        </div>
        {featureNavItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} style={{ textDecoration: 'none' }}>
            {({ isActive }) => (
              <motion.div
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '9px 12px', borderRadius: 10,
                  background: isActive ? 'var(--primary-dim)' : 'transparent',
                  border: isActive ? '1px solid rgba(37,99,235,0.3)' : '1px solid transparent',
                  color: isActive ? 'var(--primary-hover)' : 'var(--text-muted)',
                  cursor: 'pointer', transition: 'all 0.15s ease',
                }}
              >
                <Icon size={17} />
                <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 400 }}>{label}</span>
                {isActive && <ChevronRight size={13} style={{ marginLeft: 'auto' }} />}
              </motion.div>
            )}
          </NavLink>
        ))}

        {user?.role === 'admin' && (
          <>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--danger)', letterSpacing: '0.5px', textTransform: 'uppercase', padding: '16px 10px 8px' }}>
              Administration
            </div>
            <NavLink to="/admin" style={{ textDecoration: 'none' }}>
              {({ isActive }) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 12px', borderRadius: 10, background: isActive ? 'var(--danger-dim)' : 'transparent', border: isActive ? '1px solid rgba(239,68,68,0.3)' : '1px solid transparent', color: isActive ? 'var(--danger)' : 'var(--text-muted)', cursor: 'pointer' }}>
                  <ShieldAlert size={17} />
                  <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 400 }}>Admin Portal</span>
                </div>
              )}
            </NavLink>
          </>
        )}
      </nav>

      {/* Vault security badge */}
      <div style={{ padding: '10px 14px', margin: '0 12px 10px', background: 'var(--success-dim)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Shield size={13} color="var(--success)" />
          <span style={{ fontSize: 11, color: 'var(--success)', fontWeight: 600 }}>Vault Encrypted</span>
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
          {user?.storageUsed ? `${(user.storageUsed / 1024 / 1024).toFixed(1)} MB used` : '0 MB used'}
        </div>
      </div>

      {/* User section */}
      <div style={{ padding: '12px', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 10, background: 'var(--surface-elevated)' }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg, #2563EB, #06B6D4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: 'white', flexShrink: 0,
          }}>
            {user?.name?.[0]?.toUpperCase() || 'M'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name || 'User'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email || ''}
            </div>
          </div>
          <button onClick={handleLogout} className="btn-ghost" style={{ padding: '6px', minWidth: 32 }} title="Logout">
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
