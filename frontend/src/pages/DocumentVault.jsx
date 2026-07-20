import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/apiClient';
import { Search, Upload, Filter, Grid, List, FolderOpen, FileText, Image, Trash2, Share2, Eye, Clock, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

const CATEGORIES = ['all', 'identity', 'education', 'professional', 'medical', 'financial', 'property', 'vehicle', 'legal', 'other'];
const CAT_COLORS = { identity: '#7C6FF7', education: '#4299E1', professional: '#48BB78', medical: '#FC8181', financial: '#F6C90E', property: '#38B2AC', vehicle: '#ED8936', legal: '#667EEA', other: '#718096' };
const STATUS_ICONS = { ready: <CheckCircle size={13} color="#3ECF8E" />, processing: <Clock size={13} color="#F5A623" />, failed: <XCircle size={13} color="#F56565" />, uploading: <Clock size={13} color="#F5A623" /> };

const DocumentVault = () => {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();
  const navigate = useNavigate();

  const loadDocs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (category !== 'all') params.category = category;
      const res = await api.get('/documents', { params });
      setDocs(res.data.documents);
    } catch { toast.error('Failed to load documents'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadDocs(); }, [category]);

  const handleSearch = (e) => { e.preventDefault(); loadDocs(); };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('title', file.name.replace(/\.[^/.]+$/, ''));
      await api.post('/documents/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Uploaded! AI is processing...');
      setFile(null); setUploadOpen(false);
      setTimeout(loadDocs, 1000);
    } catch (err) { toast.error(err.response?.data?.message || 'Upload failed'); }
    finally { setUploading(false); }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Delete this document?')) return;
    try { await api.delete(`/documents/${id}`); setDocs(d => d.filter(x => x._id !== id)); toast.success('Deleted'); }
    catch { toast.error('Delete failed'); }
  };

  return (
    <div style={{ padding: '32px', minHeight: '100vh' }}>
      {/* Upload Modal */}
      <AnimatePresence>
        {uploadOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setUploadOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 460 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Upload Document</h2>
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => { e.preventDefault(); setDragging(false); setFile(e.dataTransfer.files[0]); }}
                onClick={() => fileRef.current?.click()}
                style={{ border: `2px dashed ${dragging ? 'var(--primary)' : file ? '#3ECF8E' : 'var(--border)'}`, borderRadius: 12, padding: '48px 24px', textAlign: 'center', cursor: 'pointer', background: dragging ? 'rgba(124,111,247,0.05)' : 'var(--surface-elevated)', marginBottom: 20 }}>
                <Upload size={40} color={file ? '#3ECF8E' : 'var(--primary)'} style={{ margin: '0 auto 12px' }} />
                <p style={{ fontWeight: 600, marginBottom: 6 }}>{file ? `✓ ${file.name}` : 'Drop file here or click'}</p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>PDF, JPG, PNG, WEBP · Max 20MB</p>
                <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" style={{ display: 'none' }} onChange={e => setFile(e.target.files[0])} />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => { setUploadOpen(false); setFile(null); }}>Cancel</button>
                <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleUpload} disabled={!file || uploading}>
                  {uploading ? <div className="spinner" style={{ borderTopColor: 'white' }} /> : 'Upload & Process'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800 }}>Document Vault</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>{docs.length} document{docs.length !== 1 ? 's' : ''} stored</p>
        </div>
        <button className="btn-primary" onClick={() => setUploadOpen(true)}><Upload size={16} /> Upload</button>
      </div>

      {/* Search & Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, flex: 1, minWidth: 280 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-disabled)' }} />
            <input className="input-field" placeholder="Search documents (semantic AI search)..." style={{ paddingLeft: 42 }} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary" style={{ padding: '10px 20px' }}>Search</button>
        </form>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className={`btn-${viewMode === 'grid' ? 'primary' : 'ghost'}`} style={{ padding: '10px 12px' }} onClick={() => setViewMode('grid')}><Grid size={16} /></button>
          <button className={`btn-${viewMode === 'list' ? 'primary' : 'ghost'}`} style={{ padding: '10px 12px' }} onClick={() => setViewMode('list')}><List size={16} /></button>
        </div>
      </div>

      {/* Category Filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, overflowX: 'auto', paddingBottom: 4 }}>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)}
            style={{ padding: '7px 16px', borderRadius: 20, border: `1px solid ${category === cat ? (CAT_COLORS[cat] || 'var(--primary)') : 'var(--border)'}`, background: category === cat ? `${(CAT_COLORS[cat] || '#7C6FF7')}20` : 'transparent', color: category === cat ? (CAT_COLORS[cat] || 'var(--primary)') : 'var(--text-muted)', cursor: 'pointer', fontSize: 13, fontWeight: category === cat ? 600 : 400, whiteSpace: 'nowrap', transition: 'all 0.15s ease' }}>
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Grid / List */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(200px, 1fr))' : '1fr', gap: 16 }}>
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: viewMode === 'grid' ? 200 : 72, borderRadius: 12 }} />)}
        </div>
      ) : docs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <FolderOpen size={64} style={{ opacity: 0.2, margin: '0 auto 20px', color: 'var(--primary)' }} />
          <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>No documents found</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Upload your first document to get started</p>
          <button className="btn-primary" onClick={() => setUploadOpen(true)}><Upload size={16} /> Upload Document</button>
        </div>
      ) : viewMode === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {docs.map((doc, i) => (
            <motion.div key={doc._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} whileHover={{ y: -4, boxShadow: `0 12px 32px ${CAT_COLORS[doc.category] || '#7C6FF7'}20` }}
              onClick={() => navigate(`/document/${doc._id}`)}
              style={{ background: 'var(--surface)', border: `1px solid var(--border)`, borderRadius: 14, overflow: 'hidden', cursor: 'pointer', position: 'relative' }}>
              <div style={{ height: 100, background: `linear-gradient(135deg, ${CAT_COLORS[doc.category] || '#7C6FF7'}20, ${CAT_COLORS[doc.category] || '#7C6FF7'}08)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {doc.fileType?.includes('pdf') ? <FileText size={40} color={CAT_COLORS[doc.category] || '#7C6FF7'} /> : <Image size={40} color={CAT_COLORS[doc.category] || '#7C6FF7'} />}
              </div>
              <div style={{ padding: '12px 14px' }}>
                <p style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 4 }}>{doc.title}</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>{doc.documentType || doc.category}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>{STATUS_ICONS[doc.status]}<span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{doc.status}</span></div>
                  <button onClick={e => handleDelete(doc._id, e)} className="btn-danger" style={{ padding: '3px 8px', fontSize: 11 }}><Trash2 size={11} /></button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {docs.map((doc, i) => (
            <motion.div key={doc._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} whileHover={{ x: 4 }}
              onClick={() => navigate(`/document/${doc._id}`)}
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${CAT_COLORS[doc.category] || '#7C6FF7'}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {doc.fileType?.includes('pdf') ? <FileText size={20} color={CAT_COLORS[doc.category] || '#7C6FF7'} /> : <Image size={20} color={CAT_COLORS[doc.category] || '#7C6FF7'} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.title}</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{doc.documentType || doc.category} · {new Date(doc.createdAt).toLocaleDateString()}</p>
              </div>
              {doc.expiryStatus && doc.expiryStatus !== 'unknown' && <span className={`badge badge-${doc.expiryStatus === 'expired' ? 'expired' : doc.expiryStatus === 'expiring_soon' ? 'expiring' : 'valid'}`}>{doc.expiryStatus.replace('_', ' ')}</span>}
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn-ghost" style={{ padding: '6px' }} onClick={e => { e.stopPropagation(); navigate(`/document/${doc._id}`); }}><Eye size={15} /></button>
                <button className="btn-danger" style={{ padding: '6px' }} onClick={e => handleDelete(doc._id, e)}><Trash2 size={15} /></button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentVault;
