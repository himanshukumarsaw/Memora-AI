import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../services/apiClient';
import { FolderOpen, TrendingUp, Bell, Share2, HardDrive, Upload, MessageSquare, Clock, AlertTriangle, ChevronRight, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CATEGORY_MAP = { identity: { label: 'Identity', color: '#7C6FF7' }, education: { label: 'Education', color: '#4299E1' }, professional: { label: 'Professional', color: '#48BB78' }, medical: { label: 'Medical', color: '#FC8181' }, financial: { label: 'Financial', color: '#F6C90E' }, property: { label: 'Property', color: '#38B2AC' }, vehicle: { label: 'Vehicle', color: '#ED8936' }, legal: { label: 'Legal', color: '#667EEA' }, other: { label: 'Other', color: '#718096' } };

const StatCard = ({ icon: Icon, label, value, sub, color, onClick }) => (
  <motion.div whileHover={{ y: -3, boxShadow: `0 12px 40px ${color}20` }} onClick={onClick} className="card" style={{ padding: 20, cursor: onClick ? 'pointer' : 'default' }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>{label}</p>
        <p style={{ fontSize: 32, fontWeight: 700, color }}>{value}</p>
        {sub && <p style={{ fontSize: 12, color: 'var(--text-disabled)', marginTop: 4 }}>{sub}</p>}
      </div>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={22} color={color} />
      </div>
    </div>
  </motion.div>
);

const UploadModal = ({ isOpen, onClose, onUploaded }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef();

  const handleUpload = async () => {
    if (!file) return toast.error('Select a file first');
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('title', title || file.name.replace(/\.[^/.]+$/, ''));
      await api.post('/documents/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('File uploaded! AI is processing it...');
      onUploaded();
      onClose();
      setFile(null); setTitle('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally { setLoading(false); }
  };

  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()}
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 480 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Upload Document</h2>
          <div
            onDragOver={e => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) { setFile(f); setTitle(f.name.replace(/\.[^/.]+$/, '')); } }}
            onClick={() => inputRef.current?.click()}
            style={{ border: `2px dashed ${drag ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 12, padding: '40px 24px', textAlign: 'center', cursor: 'pointer', background: drag ? 'rgba(124,111,247,0.05)' : 'var(--surface-elevated)', marginBottom: 20, transition: 'all 0.2s ease' }}>
            <Upload size={36} color="var(--primary)" style={{ marginBottom: 12 }} />
            <p style={{ fontWeight: 600, marginBottom: 6 }}>{file ? file.name : 'Drop file here or click to browse'}</p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>PDF, JPG, PNG, WEBP • Max 20MB</p>
            <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" style={{ display: 'none' }} onChange={e => { const f = e.target.files[0]; if (f) { setFile(f); setTitle(f.name.replace(/\.[^/.]+$/, '')); } }} />
          </div>
          {file && (
            <input className="input-field" placeholder="Document title" style={{ marginBottom: 20 }} value={title} onChange={e => setTitle(e.target.value)} />
          )}
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
            <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleUpload} disabled={loading || !file}>
              {loading ? <div className="spinner" style={{ borderTopColor: 'white' }} /> : 'Upload & Process'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);

  const loadStats = async () => {
    try {
      const res = await api.get('/documents/dashboard/stats');
      setStats(res.data);
    } catch (err) { toast.error('Failed to load dashboard'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadStats(); }, []);

  const storagePercent = user ? Math.round((user.storageUsed / user.storageLimit) * 100) : 0;

  return (
    <div style={{ padding: '32px', minHeight: '100vh' }}>
      <UploadModal isOpen={uploadOpen} onClose={() => setUploadOpen(false)} onUploaded={loadStats} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>Here's your vault overview for today</p>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} className="btn-primary" onClick={() => setUploadOpen(true)}>
          <Upload size={16} /> Upload Document
        </motion.button>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 16 }} />)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
          <StatCard icon={FolderOpen} label="Total Documents" value={stats?.stats?.totalDocuments || 0} sub="in your vault" color="#7C6FF7" onClick={() => navigate('/vault')} />
          <StatCard icon={AlertTriangle} label="Expiring Soon" value={stats?.stats?.expiringSoon || 0} sub="next 30 days" color="#F5A623" onClick={() => navigate('/reminders')} />
          <StatCard icon={Bell} label="Expired" value={stats?.stats?.expired || 0} sub="needs attention" color="#F56565" onClick={() => navigate('/reminders')} />
          <StatCard icon={HardDrive} label="Storage Used" value={`${(stats?.stats?.storageUsed / 1024 / 1024 || 0).toFixed(1)} MB`} sub={`of 1 GB (${storagePercent}%)`} color="#3ECF8E" />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Recent Documents */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>Recent Documents</h2>
            <button className="btn-ghost" style={{ fontSize: 13 }} onClick={() => navigate('/vault')}>View all <ChevronRight size={14} /></button>
          </div>
          {loading ? [...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 56, borderRadius: 10, marginBottom: 10 }} />) :
            stats?.recentDocuments?.length > 0 ? stats.recentDocuments.map(doc => (
              <motion.div key={doc._id} whileHover={{ x: 4 }} onClick={() => navigate(`/document/${doc._id}`)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', borderRadius: 10, cursor: 'pointer', marginBottom: 8, background: 'var(--surface-elevated)' }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: `${CATEGORY_MAP[doc.category]?.color || '#718096'}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                  {doc.fileType?.includes('pdf') ? '📄' : '🖼️'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.title}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{doc.documentType || doc.category} · {new Date(doc.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`badge badge-${doc.status}`} style={{ fontSize: 10 }}>{doc.status}</span>
              </motion.div>
            )) : (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <FolderOpen size={36} style={{ opacity: 0.3, margin: '0 auto 12px' }} />
                <p style={{ fontSize: 14 }}>No documents yet</p>
                <button className="btn-primary" style={{ marginTop: 16, fontSize: 13 }} onClick={() => setUploadOpen(true)}><Upload size={14} /> Upload First</button>
              </div>
            )
          }
        </div>

        {/* Upcoming Reminders */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>Upcoming Reminders</h2>
            <button className="btn-ghost" style={{ fontSize: 13 }} onClick={() => navigate('/reminders')}>View all <ChevronRight size={14} /></button>
          </div>
          {loading ? [...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 56, borderRadius: 10, marginBottom: 10 }} />) :
            stats?.upcomingReminders?.length > 0 ? stats.upcomingReminders.map(rem => {
              const daysLeft = Math.ceil((new Date(rem.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
              const urgent = daysLeft <= 7;
              return (
                <motion.div key={rem._id} whileHover={{ x: 4 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', borderRadius: 10, marginBottom: 8, background: 'var(--surface-elevated)', borderLeft: `3px solid ${urgent ? '#F56565' : '#F5A623'}` }}>
                  <Bell size={16} color={urgent ? '#F56565' : '#F5A623'} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: 13 }}>{rem.title}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(rem.dueDate).toLocaleDateString()} · {daysLeft > 0 ? `${daysLeft} days` : 'Today'}</p>
                  </div>
                  {urgent && <span className="badge badge-expired" style={{ fontSize: 10 }}>Urgent</span>}
                </motion.div>
              );
            }) : (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <Bell size={36} style={{ opacity: 0.3, margin: '0 auto 12px' }} />
                <p style={{ fontSize: 14 }}>No upcoming reminders</p>
              </div>
            )
          }
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Quick Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
          {[
            { icon: Upload, label: 'Upload Document', action: () => setUploadOpen(true), color: '#7C6FF7' },
            { icon: MessageSquare, label: 'AI Chat', action: () => navigate('/chat'), color: '#4299E1' },
            { icon: FolderOpen, label: 'Browse Vault', action: () => navigate('/vault'), color: '#48BB78' },
            { icon: Bell, label: 'Reminders', action: () => navigate('/reminders'), color: '#F5A623' },
            { icon: Brain, label: 'My Profile', action: () => navigate('/profile'), color: '#3ECF8E' },
            { icon: Share2, label: 'Shared Files', action: () => navigate('/vault'), color: '#FC8181' },
          ].map(({ icon: Icon, label, action, color }) => (
            <motion.button key={label} whileHover={{ y: -3, boxShadow: `0 8px 24px ${color}20` }} whileTap={{ scale: 0.97 }} onClick={action}
              style={{ background: 'var(--surface)', border: `1px solid var(--border)`, borderRadius: 12, padding: '16px 12px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s ease' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                <Icon size={20} color={color} />
              </div>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{label}</p>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
