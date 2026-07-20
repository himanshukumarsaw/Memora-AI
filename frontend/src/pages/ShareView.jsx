import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/apiClient';
import { Shield, FileText, Eye, Download, AlertTriangle, Brain } from 'lucide-react';

const ShareView = () => {
  const { token } = useParams();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [otp, setOtp] = useState('');
  const [needsOtp, setNeedsOtp] = useState(false);

  const load = async (otpVal) => {
    setLoading(true);
    try {
      const params = otpVal ? { otp: otpVal } : {};
      const res = await api.get(`/share/access/${token}`, { params });
      setDoc(res.data);
    } catch (err) {
      if (err.response?.data?.requiresOtp) { setNeedsOtp(true); setLoading(false); return; }
      setError(err.response?.data?.message || 'Link not found or expired');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [token]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: 540 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Brain size={20} color="var(--primary)" />
            <span style={{ fontWeight: 700, color: 'var(--text)' }}>Memora AI</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Shared Document</h1>
        </div>

        {loading ? (
          <div className="card" style={{ padding: 48, textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--text-muted)' }}>Loading shared document...</p>
          </div>
        ) : needsOtp ? (
          <div className="card" style={{ padding: 32 }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Shield size={40} color="var(--primary)" style={{ margin: '0 auto 12px' }} />
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>OTP Required</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 8 }}>Enter the OTP provided by the sender</p>
            </div>
            <input className="input-field" placeholder="Enter 6-digit OTP" value={otp} onChange={e => setOtp(e.target.value)} style={{ marginBottom: 16, textAlign: 'center', letterSpacing: '0.5em', fontSize: 20 }} />
            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => load(otp)}>Verify OTP</button>
          </div>
        ) : error ? (
          <div className="card" style={{ padding: 48, textAlign: 'center' }}>
            <AlertTriangle size={48} color="#F56565" style={{ margin: '0 auto 16px' }} />
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#F56565', marginBottom: 8 }}>{error}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>This link may have expired or been revoked.</p>
          </div>
        ) : doc ? (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', background: 'rgba(124,111,247,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <FileText size={36} color="var(--primary)" />
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 700 }}>{doc.document.title}</h2>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{doc.document.documentType} · {doc.document.category}</p>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: 'rgba(62,207,142,0.15)', border: '1px solid rgba(62,207,142,0.3)', borderRadius: 20 }}>
                  <Eye size={12} color="var(--success)" />
                  <span style={{ fontSize: 12, color: 'var(--success)' }}>Secure View</span>
                </div>
              </div>
            </div>
            <div style={{ padding: 24 }}>
              {doc.document.aiSummary && (
                <div style={{ background: 'var(--surface-elevated)', borderRadius: 12, padding: 16, marginBottom: 20 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary-hover)', marginBottom: 8 }}>AI Summary</p>
                  <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text)' }}>{doc.document.aiSummary}</p>
                </div>
              )}
              {doc.accessType === 'download' && (
                <a href={doc.document.fileUrl} download className="btn-primary" style={{ display: 'inline-flex', textDecoration: 'none', marginBottom: 16 }}>
                  <Download size={16} /> Download Document
                </a>
              )}
              <p style={{ fontSize: 12, color: 'var(--text-disabled)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Shield size={12} /> Shared via Memora AI secure link
              </p>
            </div>
          </div>
        ) : null}

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'var(--text-muted)' }}>
          Powered by <Link to="/" style={{ color: 'var(--primary-hover)', textDecoration: 'none', fontWeight: 600 }}>Memora AI</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default ShareView;
