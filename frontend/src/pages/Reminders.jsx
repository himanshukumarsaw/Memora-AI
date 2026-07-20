import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/apiClient';
import { Bell, Plus, Check, Trash2, Clock, AlertTriangle, Calendar, FileText, X } from 'lucide-react';

const PRIORITY_CONFIG = { low: { color: '#3ECF8E', label: 'Low' }, medium: { color: '#F5A623', label: 'Medium' }, high: { color: '#FC8181', label: 'High' }, critical: { color: '#F56565', label: 'Critical' } };
const TYPE_CONFIG = { expiry: '📅', renewal: '🔄', deadline: '⏰', payment: '💰', custom: '🔔' };

const Reminders = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', dueDate: '', reminderType: 'custom', priority: 'medium' });
  const [creating, setCreating] = useState(false);

  const load = async () => {
    try { const res = await api.get('/reminders'); setReminders(res.data.reminders); }
    catch { toast.error('Failed to load reminders'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    if (!form.title || !form.dueDate) return toast.error('Title and due date required');
    setCreating(true);
    try {
      await api.post('/reminders', form);
      toast.success('Reminder created!');
      setShowCreate(false);
      setForm({ title: '', description: '', dueDate: '', reminderType: 'custom', priority: 'medium' });
      load();
    } catch { toast.error('Failed to create reminder'); }
    finally { setCreating(false); }
  };

  const update = async (id, status) => {
    try { await api.put(`/reminders/${id}`, { status }); load(); toast.success(`Marked as ${status}`); }
    catch { toast.error('Update failed'); }
  };

  const remove = async (id) => {
    try { await api.delete(`/reminders/${id}`); setReminders(r => r.filter(x => x._id !== id)); toast.success('Deleted'); }
    catch { toast.error('Delete failed'); }
  };

  const pending = reminders.filter(r => r.status === 'pending');
  const completed = reminders.filter(r => r.status === 'completed');

  const getDaysLeft = (date) => Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <div style={{ padding: '32px', minHeight: '100vh' }}>
      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCreate(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 460 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700 }}>New Reminder</h2>
                <button className="btn-ghost" style={{ padding: 8 }} onClick={() => setShowCreate(false)}><X size={18} /></button>
              </div>
              <form onSubmit={create} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div><label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>Title *</label>
                  <input className="input-field" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g., Passport renewal" /></div>
                <div><label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>Description</label>
                  <input className="input-field" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional notes..." /></div>
                <div><label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>Due Date *</label>
                  <input type="datetime-local" className="input-field" required value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div><label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>Type</label>
                    <select className="input-field" value={form.reminderType} onChange={e => setForm(f => ({ ...f, reminderType: e.target.value }))}>
                      {['expiry', 'renewal', 'deadline', 'payment', 'custom'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select></div>
                  <div><label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>Priority</label>
                    <select className="input-field" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                      {['low', 'medium', 'high', 'critical'].map(p => <option key={p} value={p}>{p}</option>)}
                    </select></div>
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowCreate(false)}>Cancel</button>
                  <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={creating}>
                    {creating ? <div className="spinner" style={{ borderTopColor: 'white' }} /> : 'Create Reminder'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div><h1 style={{ fontSize: 28, fontWeight: 800 }}>Reminders</h1><p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>{pending.length} pending, {completed.length} completed</p></div>
        <button className="btn-primary" onClick={() => setShowCreate(true)}><Plus size={16} /> New Reminder</button>
      </div>

      {loading ? [...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 14, marginBottom: 12 }} />) : (
        <>
          {/* Pending */}
          {pending.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--text-muted)' }}>PENDING ({pending.length})</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {pending.map((rem, i) => {
                  const days = getDaysLeft(rem.dueDate);
                  const pc = PRIORITY_CONFIG[rem.priority] || PRIORITY_CONFIG.medium;
                  return (
                    <motion.div key={rem._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      style={{ background: 'var(--surface)', border: `1px solid var(--border)`, borderLeft: `4px solid ${pc.color}`, borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ fontSize: 24, flexShrink: 0 }}>{TYPE_CONFIG[rem.reminderType] || '🔔'}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{rem.title}</p>
                        {rem.description && <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>{rem.description}</p>}
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                            <Calendar size={12} /> {new Date(rem.dueDate).toLocaleDateString()}
                          </span>
                          <span style={{ fontSize: 12, fontWeight: 600, color: days < 0 ? '#F56565' : days <= 7 ? '#F5A623' : '#3ECF8E' }}>
                            {days < 0 ? `${Math.abs(days)} days overdue` : days === 0 ? 'Today!' : `${days} days left`}
                          </span>
                          <span className="badge" style={{ background: `${pc.color}20`, color: pc.color, fontSize: 10 }}>{pc.label}</span>
                          {rem.documentId && <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}><FileText size={12} /> {rem.documentId.title || 'Document'}</span>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                        <button className="btn-ghost" style={{ padding: '6px 10px', fontSize: 12 }} onClick={() => update(rem._id, 'completed')} title="Mark complete">
                          <Check size={15} color="var(--success)" />
                        </button>
                        <button className="btn-danger" style={{ padding: '6px 10px' }} onClick={() => remove(rem._id)} title="Delete">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Completed */}
          {completed.length > 0 && (
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--text-muted)' }}>COMPLETED ({completed.length})</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {completed.slice(0, 5).map((rem, i) => (
                  <motion.div key={rem._id} initial={{ opacity: 0 }} animate={{ opacity: 0.6 }}
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderLeft: '4px solid var(--success)', borderRadius: 14, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                    <Check size={20} color="var(--success)" />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, textDecoration: 'line-through', color: 'var(--text-muted)' }}>{rem.title}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-disabled)' }}>{new Date(rem.dueDate).toLocaleDateString()}</p>
                    </div>
                    <button className="btn-ghost" style={{ padding: '6px' }} onClick={() => remove(rem._id)}><Trash2 size={14} /></button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {reminders.length === 0 && (
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
              <Bell size={64} style={{ opacity: 0.2, margin: '0 auto 20px', color: 'var(--primary)' }} />
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>No reminders yet</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Upload documents with expiry dates and AI will auto-create reminders</p>
              <button className="btn-primary" onClick={() => setShowCreate(true)}><Plus size={16} /> Create Reminder</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Reminders;
