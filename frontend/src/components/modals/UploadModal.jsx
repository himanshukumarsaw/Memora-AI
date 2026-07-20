import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Upload, X, FileText, CheckCircle, Brain } from 'lucide-react';
import api from '../../services/apiClient';

const UploadModal = ({ isOpen, onClose, onUploaded }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  if (!isOpen) return null;

  const handleUpload = async () => {
    if (!file) return toast.error('Please select a file to upload');
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('title', title || file.name.replace(/\.[^/.]+$/, ''));
      await api.post('/documents/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Document uploaded! AI processing started ✨');
      setFile(null);
      setTitle('');
      onClose();
      if (onUploaded) onUploaded();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="modal-overlay"
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 10 }}
          onClick={e => e.stopPropagation()}
          className="modal-box"
          style={{ maxWidth: 480 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--primary-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Upload size={18} color="var(--primary-hover)" />
              </div>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>Upload Document</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>AI will process and extract information</p>
              </div>
            </div>
            <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
          </div>

          {/* Dropzone */}
          <div
            className={`dropzone ${dragging ? 'drag-active' : ''} ${file ? 'has-file' : ''}`}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) { setFile(f); setTitle(f.name.replace(/\.[^/.]+$/, '')); } }}
            onClick={() => inputRef.current?.click()}
            style={{ marginBottom: 20 }}
          >
            {file ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <CheckCircle size={40} color="var(--success)" />
                <p style={{ fontWeight: 600, fontSize: 14 }}>{file.name}</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{(file.size / 1024 / 1024).toFixed(2)} MB · Click or drop to replace</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <Upload size={40} color="var(--primary)" style={{ opacity: 0.8 }} />
                <p style={{ fontWeight: 600, fontSize: 15 }}>Drop file here or click to browse</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Supports PDF, JPG, PNG, WEBP up to 20MB</p>
              </div>
            )}
            <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" style={{ display: 'none' }} onChange={e => { const f = e.target.files[0]; if (f) { setFile(f); setTitle(f.name.replace(/\.[^/.]+$/, '')); } }} />
          </div>

          {file && (
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Document Title</label>
              <input className="input-field" placeholder="Enter title" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
          )}

          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleUpload} disabled={!file || loading}>
              {loading ? <div className="spinner" style={{ borderTopColor: 'white' }} /> : <>Upload & Process</>}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UploadModal;
