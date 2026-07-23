import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Upload, CheckCircle, FileText, Download, Sparkles, AlertCircle } from 'lucide-react';
import { autofillService } from '../services/featureServices';

const FormAutofill = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const inputRef = useRef();

  const handleAnalyze = async () => {
    if (!file) return toast.error('Select an application form to analyze');
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await autofillService.analyzeForm(fd);
      setResult(res.data.data);
      toast.success('Form analyzed! Universal Profile matched ✨');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Form analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!result?.formId) return;
    try {
      const res = await autofillService.exportFilledForm(result.formId, result.suggestedFields);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'autofilled_form.txt');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Exported filled form!');
    } catch {
      toast.error('Export failed');
    }
  };

  return (
    <div style={{ padding: 32, minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--info-dim)', border: '1px solid rgba(6,182,212,0.3)', borderRadius: 99, padding: '4px 12px', fontSize: 12, color: 'var(--info)', fontWeight: 600, marginBottom: 8 }}>
          <Sparkles size={13} /> Form Autofill Engine
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800 }}>AI Form Autofill</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Upload any PDF/image application form and AI will automatically fill detected fields from your Universal Profile</p>
      </div>

      {!result ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 640, margin: '0 auto' }}>
          <div className="card" style={{ padding: 40 }}>
            <div
              className={`dropzone ${file ? 'has-file' : ''}`}
              onClick={() => inputRef.current?.click()}
              style={{ marginBottom: 20 }}
            >
              {file ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <CheckCircle size={40} color="var(--success)" />
                  <p style={{ fontWeight: 600, fontSize: 14 }}>{file.name}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Click or drop to replace</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                  <Upload size={40} color="var(--primary)" />
                  <p style={{ fontWeight: 600, fontSize: 15 }}>Upload Application Form</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Supports PDF, JPG, PNG forms up to 20MB</p>
                </div>
              )}
              <input ref={inputRef} type="file" accept=".pdf,.jpg,.png" style={{ display: 'none' }} onChange={e => setFile(e.target.files[0])} />
            </div>

            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleAnalyze} disabled={!file || loading}>
              {loading ? <div className="spinner" style={{ borderTopColor: 'white' }} /> : 'Analyze & Auto-Fill'}
            </button>
          </div>

          <div className="card" style={{ padding: 24, border: '1px solid rgba(37,99,235,0.2)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, color: '#38BDF8', marginBottom: 12 }}>
              <Sparkles size={16} /> Chrome Extension Setup (For Live Autofill)
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 12 }}>
              AutoFill AI includes a browser extension that reads your profile data and automatically fills online forms on any website (e.g. shipping details, college portals, or registry forms).
            </p>
            <div style={{ fontSize: 13, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ fontWeight: 700, color: 'var(--primary)' }}>Step 1:</span>
                <span>Open Google Chrome and navigate to <code>chrome://extensions/</code></span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ fontWeight: 700, color: 'var(--primary)' }}>Step 2:</span>
                <span>Enable <strong>Developer Mode</strong> (toggle in the top-right corner)</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ fontWeight: 700, color: 'var(--primary)' }}>Step 3:</span>
                <span>Click <strong>Load unpacked</strong> (button in the top-left corner)</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ fontWeight: 700, color: 'var(--primary)' }}>Step 4:</span>
                <span>Select the <code>extension</code> folder in the project root directory</span>
              </div>
            </div>
            <div style={{ marginTop: 16, padding: '10px 14px', background: 'var(--info-dim)', borderRadius: 8, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <AlertCircle size={16} color="var(--info)" style={{ flexShrink: 0, marginTop: 2 }} />
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                <strong>Tip:</strong> Once loaded, click the extension icon on any page containing forms to watch it match labels and fill inputs in under 1 second!
              </p>
            </div>
          </div>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>Detected Form Fields ({result.totalFieldsDetected})</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Values auto-matched with high confidence from Universal Profile</p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={handleExport}><Download size={14} /> Export Filled Form</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {result.suggestedFields.map((field, i) => (
              <div key={i} style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{field.fieldName}</span>
                  <span className="badge badge-success">{field.confidence}% Match</span>
                </div>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{field.value}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default FormAutofill;
