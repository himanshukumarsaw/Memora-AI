import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Share2, Lock, Key, Copy, Trash2, Eye, Shield, Link as LinkIcon } from 'lucide-react';
import api from '../services/apiClient';

const SharingManager = () => {
  const [docs, setDocs] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState('');
  const [expiry, setExpiry] = useState('24h');
  const [requireOtp, setRequireOtp] = useState(true);
  const [allowDownload, setAllowDownload] = useState(true);
  const [createdShare, setCreatedShare] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/documents').then(r => setDocs(r.data.documents || [])).catch(() => {});
  }, []);

  const handleCreateShare = async () => {
    if (!selectedDoc) return toast.error('Please select a document to share');
    setLoading(true);
    try {
      const res = await api.post('/share', {
        documentId: selectedDoc,
        expiry,
        requireOtp,
        permission: allowDownload ? 'download' : 'view',
      });
      setCreatedShare(res.data.shareLink);
      toast.success('Share link generated! 🔒');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create share link');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <div style={{ padding: 32, minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800 }}>Secure Document Sharing</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Create OTP-protected, auto-expiring links to safely share documents</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
        {/* Form Card */}
        <div className="card" style={{ padding: 28 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Generate Share Link</h3>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Select Document</label>
            <select className="input-field" value={selectedDoc} onChange={e => setSelectedDoc(e.target.value)}>
              <option value="">-- Choose document --</option>
              {docs.map(d => (
                <option key={d._id} value={d._id}>{d.title} ({d.documentType || d.category})</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Link Expiry</label>
            <select className="input-field" value={expiry} onChange={e => setExpiry(e.target.value)}>
              <option value="1h">1 Hour</option>
              <option value="24h">24 Hours</option>
              <option value="7d">7 Days</option>
              <option value="30d">30 Days</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14 }}>
              <input type="checkbox" checked={requireOtp} onChange={e => setRequireOtp(e.target.checked)} />
              <span>Require OTP verification</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14 }}>
              <input type="checkbox" checked={allowDownload} onChange={e => setAllowDownload(e.target.checked)} />
              <span>Allow file download</span>
            </label>
          </div>

          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleCreateShare} disabled={loading || !selectedDoc}>
            {loading ? <div className="spinner" style={{ borderTopColor: 'white' }} /> : <><Share2 size={16} /> Generate Link</>}
          </button>
        </div>

        {/* Output Card */}
        {createdShare ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card" style={{ padding: 28, border: '1px solid rgba(37,99,235,0.4)', background: 'linear-gradient(135deg, rgba(37,99,235,0.08), rgba(6,182,212,0.05))' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, color: 'var(--success)' }}>
              <Shield size={20} />
              <span style={{ fontWeight: 700, fontSize: 16 }}>Secure Link Created</span>
            </div>

            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Public Share URL</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="input-field" readOnly value={`http://localhost:3000/share/${createdShare.token}`} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }} />
                <button className="btn btn-secondary btn-icon" onClick={() => copyToClipboard(`http://localhost:3000/share/${createdShare.token}`)}><Copy size={16} /></button>
              </div>
            </div>

            {createdShare.otp && (
              <div style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Verification OTP</p>
                <p style={{ fontSize: 24, fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', color: 'var(--primary-hover)', letterSpacing: '4px' }}>{createdShare.otp}</p>
                <p style={{ fontSize: 11, color: 'var(--text-disabled)', marginTop: 4 }}>Provide this 6-digit OTP to the recipient</p>
              </div>
            )}

            <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <p>• Access Level: <strong>{createdShare.permission}</strong></p>
              <p>• Expires on: <strong>{new Date(createdShare.expiresAt).toLocaleString()}</strong></p>
            </div>
          </motion.div>
        ) : (
          <div className="card" style={{ padding: 40, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <LinkIcon size={48} color="var(--primary)" style={{ opacity: 0.3, marginBottom: 16 }} />
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Generated link details will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SharingManager;
