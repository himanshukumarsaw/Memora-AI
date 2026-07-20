import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/apiClient';
import { ArrowLeft, FileText, Calendar, Hash, User, MapPin, Shield, Share2, Trash2, MessageSquare, ExternalLink, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const CAT_COLORS = { identity: '#7C6FF7', education: '#4299E1', professional: '#48BB78', medical: '#FC8181', financial: '#F6C90E', property: '#38B2AC', vehicle: '#ED8936', legal: '#667EEA', other: '#718096' };

const DocumentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    api.get(`/documents/${id}`).then(r => setDoc(r.data.document)).catch(() => toast.error('Document not found')).finally(() => setLoading(false));
  }, [id]);

  const handleShare = async () => {
    setShareLoading(true);
    try {
      const res = await api.post('/share', { documentId: id, expiresIn: '24h' });
      setShareUrl(res.data.shareUrl);
      navigator.clipboard.writeText(res.data.shareUrl).then(() => toast.success('Share link copied!')).catch(() => toast.success('Share link created!'));
    } catch { toast.error('Failed to create share link'); }
    finally { setShareLoading(false); }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this document? This cannot be undone.')) return;
    try { await api.delete(`/documents/${id}`); toast.success('Deleted'); navigate('/vault'); }
    catch { toast.error('Delete failed'); }
  };

  if (loading) return <div style={{ padding: 32 }}><div className="skeleton" style={{ height: 400, borderRadius: 16 }} /></div>;
  if (!doc) return <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>Document not found</div>;

  const color = CAT_COLORS[doc.category] || '#718096';
  const expiryStatusMap = { expired: { icon: <XCircle size={14} />, class: 'badge-expired', label: 'Expired' }, expiring_soon: { icon: <AlertTriangle size={14} />, class: 'badge-expiring', label: 'Expiring Soon' }, valid: { icon: <CheckCircle size={14} />, class: 'badge-valid', label: 'Valid' } };

  return (
    <div style={{ padding: '32px', minHeight: '100vh' }}>
      {/* Back */}
      <button className="btn-ghost" style={{ marginBottom: 24 }} onClick={() => navigate('/vault')}>
        <ArrowLeft size={16} /> Back to Vault
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
        {/* Main */}
        <div>
          {/* Document Preview */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', marginBottom: 20 }}>
            <div style={{ height: 280, background: `linear-gradient(135deg, ${color}20, ${color}08)`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              {doc.fileType?.startsWith('image/') ? (
                <img src={doc.fileUrl} alt={doc.title} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <FileText size={80} color={color} style={{ opacity: 0.6 }} />
                  <p style={{ marginTop: 12, color: 'var(--text-muted)', fontSize: 14 }}>PDF Document</p>
                  <a href={doc.fileUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 12, color: color, fontSize: 13, textDecoration: 'none' }}>
                    <ExternalLink size={13} /> Open in new tab
                  </a>
                </div>
              )}
              <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 8 }}>
                <span className={`badge cat-${doc.category}`}>{doc.category}</span>
                {doc.expiryStatus && doc.expiryStatus !== 'unknown' && (
                  <span className={`badge ${expiryStatusMap[doc.expiryStatus]?.class}`}>{expiryStatusMap[doc.expiryStatus]?.label}</span>
                )}
              </div>
            </div>
            <div style={{ padding: '20px 24px' }}>
              <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{doc.title}</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{doc.documentType} · Uploaded {new Date(doc.createdAt).toLocaleDateString()}</p>
            </div>
          </motion.div>

          {/* AI Summary */}
          {doc.aiSummary && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              style={{ background: 'var(--surface)', border: '1px solid rgba(124,111,247,0.3)', borderRadius: 16, padding: 20, marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: 'var(--primary-hover)' }}>
                <Shield size={16} /><span style={{ fontWeight: 700, fontSize: 15 }}>AI Summary</span>
              </div>
              <p style={{ color: 'var(--text)', fontSize: 14, lineHeight: 1.7 }}>{doc.aiSummary}</p>
            </motion.div>
          )}

          {/* Raw Text */}
          {doc.rawText && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 20 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 12, fontSize: 15 }}>Extracted Text</h3>
              <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.7, maxHeight: 300, overflow: 'auto' }}>
                {doc.rawText.substring(0, 2000)}{doc.rawText.length > 2000 ? '...' : ''}
              </pre>
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Actions */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button className="btn-primary" style={{ justifyContent: 'center' }} onClick={handleShare} disabled={shareLoading}>
                {shareLoading ? <div className="spinner" style={{ borderTopColor: 'white' }} /> : <><Share2 size={15} /> Share Document</>}
              </button>
              <button className="btn-secondary" style={{ justifyContent: 'center' }} onClick={() => navigate('/chat')}>
                <MessageSquare size={15} /> Chat about this
              </button>
              <button className="btn-danger" style={{ justifyContent: 'center' }} onClick={handleDelete}>
                <Trash2 size={15} /> Delete Document
              </button>
            </div>
            {shareUrl && (
              <div style={{ marginTop: 16, padding: 12, background: 'var(--surface-elevated)', borderRadius: 8, fontSize: 12, color: 'var(--primary-hover)', wordBreak: 'break-all' }}>
                🔗 {shareUrl}
              </div>
            )}
          </div>

          {/* Extracted Info */}
          {doc.extractedData && Object.values(doc.extractedData).some(v => v && typeof v === 'string' && v.length > 0) && (
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>Extracted Information</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {doc.extractedData.name && <InfoRow icon={<User size={14} />} label="Name" value={doc.extractedData.name} />}
                {doc.extractedData.dob && <InfoRow icon={<Calendar size={14} />} label="Date of Birth" value={doc.extractedData.dob} />}
                {doc.extractedData.idNumber && <InfoRow icon={<Hash size={14} />} label="ID Number" value={doc.extractedData.idNumber} />}
                {doc.extractedData.issueDate && <InfoRow icon={<Calendar size={14} />} label="Issue Date" value={doc.extractedData.issueDate} />}
                {doc.extractedData.expiryDate && <InfoRow icon={<Clock size={14} />} label="Expiry Date" value={doc.extractedData.expiryDate} color={doc.expiryStatus === 'expired' ? '#F56565' : doc.expiryStatus === 'expiring_soon' ? '#F5A623' : undefined} />}
                {doc.extractedData.issuingAuthority && <InfoRow icon={<Shield size={14} />} label="Issuing Authority" value={doc.extractedData.issuingAuthority} />}
                {doc.extractedData.address && <InfoRow icon={<MapPin size={14} />} label="Address" value={doc.extractedData.address} />}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>Metadata</h3>
            <InfoRow icon={<FileText size={14} />} label="Type" value={doc.fileType || 'Unknown'} />
            <div style={{ height: 8 }} />
            <InfoRow icon={<Clock size={14} />} label="Uploaded" value={new Date(doc.createdAt).toLocaleDateString()} />
            <div style={{ height: 8 }} />
            <InfoRow icon={<Shield size={14} />} label="Status" value={doc.status} />
            {doc.viewCount > 0 && <><div style={{ height: 8 }} /><InfoRow icon={<CheckCircle size={14} />} label="Views" value={doc.viewCount} /></>}
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ icon, label, value, color }) => (
  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
    <div style={{ color: 'var(--text-muted)', marginTop: 1, flexShrink: 0 }}>{icon}</div>
    <div>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{label}</p>
      <p style={{ fontSize: 13, fontWeight: 500, color: color || 'var(--text)', wordBreak: 'break-word' }}>{String(value)}</p>
    </div>
  </div>
);

export default DocumentDetail;
