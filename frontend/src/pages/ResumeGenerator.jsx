import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Sparkles, Download, FileText, CheckCircle, RefreshCw, Eye, Brain } from 'lucide-react';
import { resumeService } from '../services/featureServices';

const ResumeGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [resumeData, setResumeData] = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await resumeService.generateResume();
      setResumeData(res.data.data);
      toast.success('Resume generated using AI ✨');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Resume generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!resumeData?.resumeId) return;
    try {
      const res = await resumeService.downloadResume(resumeData.resumeId);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Memora_AI_Resume.txt');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Resume downloaded!');
    } catch {
      toast.error('Download failed');
    }
  };

  return (
    <div style={{ padding: 32, minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--primary-dim)', border: '1px solid rgba(37,99,235,0.3)', borderRadius: 99, padding: '4px 12px', fontSize: 12, color: 'var(--primary-hover)', fontWeight: 600, marginBottom: 8 }}>
            <Sparkles size={13} /> AI Career Engine
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800 }}>Resume Generator</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Creates an ATS-optimised resume automatically from your verified vault documents</p>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="btn btn-primary"
          onClick={handleGenerate}
          disabled={loading}
          style={{ gap: 8 }}
        >
          {loading ? <div className="spinner" style={{ borderTopColor: 'white' }} /> : <><Sparkles size={16} /> Generate Resume</>}
        </motion.button>
      </div>

      {!resumeData ? (
        <div className="card" style={{ padding: 60, textAlign: 'center', maxWidth: 640, margin: '40px auto' }}>
          <div style={{ width: 80, height: 80, borderRadius: 24, background: 'var(--primary-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <FileText size={38} color="var(--primary)" />
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Ready to Generate Your Resume</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.6, marginBottom: 28 }}>
            Memora AI reads your uploaded Degree Certificates, Work Experience letters, and Universal Profile to draft a professional, ATS-optimized resume.
          </p>
          <button className="btn btn-primary btn-lg" onClick={handleGenerate} disabled={loading}>
            {loading ? 'Analyzing Vault & Generating...' : 'Start AI Generation'}
          </button>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <CheckCircle size={20} color="var(--success)" />
              <span style={{ fontWeight: 700, fontSize: 16 }}>ATS Resume Draft Ready</span>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-secondary btn-sm" onClick={handleGenerate}><RefreshCw size={14} /> Regenerate</button>
              <button className="btn btn-primary btn-sm" onClick={handleDownload}><Download size={14} /> Download (.txt)</button>
            </div>
          </div>

          <div style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, fontFamily: 'JetBrains Mono, monospace', fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap', color: 'var(--text)' }}>
            {resumeData.preview}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ResumeGenerator;
