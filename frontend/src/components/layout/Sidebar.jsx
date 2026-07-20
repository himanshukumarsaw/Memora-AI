import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, FolderOpen, MessageSquare, Bell,
  User, LogOut, Brain, ChevronRight, Shield
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/vault', icon: FolderOpen, label: 'Document Vault' },
  { to: '/chat', icon: MessageSquare, label: 'AI Chat' },
  { to: '/reminders', icon: Bell, label: 'Reminders' },
  { to: '/profile', icon: User, label: 'Profile' },
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
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #7C6FF7, #5A4FCF)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Brain size={20} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>Memora AI</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Digital Memory</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} style={{ textDecoration: 'none' }}>
            {({ isActive }) => (
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px', borderRadius: 10,
                  background: isActive ? 'rgba(124,111,247,0.15)' : 'transparent',
                  border: isActive ? '1px solid rgba(124,111,247,0.3)' : '1px solid transparent',
                  color: isActive ? 'var(--primary-hover)' : 'var(--text-muted)',
                  cursor: 'pointer', transition: 'all 0.15s ease',
                }}
              >
                <Icon size={18} />
                <span style={{ fontSize: 14, fontWeight: isActive ? 600 : 400 }}>{label}</span>
                {isActive && <ChevronRight size={14} style={{ marginLeft: 'auto' }} />}
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Vault security badge */}
      <div style={{ padding: '12px 16px', margin: '0 12px 12px', background: 'rgba(62,207,142,0.08)', border: '1px solid rgba(62,207,142,0.2)', borderRadius: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Shield size={14} color="var(--success)" />
          <span style={{ fontSize: 12, color: 'var(--success)', fontWeight: 500 }}>Vault Secured</span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
          {user?.storageUsed ? `${(user.storageUsed / 1024 / 1024).toFixed(1)} MB used` : '0 MB used'}
        </div>
      </div>

      {/* User section */}
      <div style={{ padding: '12px', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: 'var(--surface-elevated)' }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg, #7C6FF7, #3ECF8E)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700, color: 'white', flexShrink: 0,
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
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
