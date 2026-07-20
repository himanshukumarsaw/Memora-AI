import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../services/apiClient';
import { Shield, Check, ArrowRight } from 'lucide-react';

const categories = [
  { id: 'academic', label: '🎓 Academic', desc: 'Degrees, marksheets, certificates' },
  { id: 'medical', label: '🏥 Medical', desc: 'Prescriptions, reports, insurance' },
  { id: 'government', label: '🏛️ Government', desc: 'Aadhaar, PAN, passport, voter ID' },
  { id: 'insurance', label: '🛡️ Insurance', desc: 'Life, health, vehicle policies' },
  { id: 'finance', label: '💰 Finance', desc: 'Bank statements, tax returns, payslips' },
  { id: 'property', label: '🏠 Property', desc: 'Deeds, agreements, rent contracts' },
  { id: 'business', label: '💼 Business', desc: 'Contracts, licenses, registration' },
  { id: 'personal', label: '👤 Personal', desc: 'Birth certificate, marriage, photos' },
];

const VaultSetup = () => {
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const { updateUser } = useAuth();
  const navigate = useNavigate();

  const toggle = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const handleCreate = async () => {
    setLoading(true);
    try {
      const res = await api.put('/auth/vault-setup', { categories: selected });
      updateUser(res.data.user);
      toast.success('Vault created! Welcome to Memora AI 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error('Failed to create vault');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: 600 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #7C6FF7, #3ECF8E)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Shield size={32} color="white" />
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12 }}>Set up your vault</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 16 }}>What types of documents do you want to manage?</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 32 }}>
          {categories.map(({ id, label, desc }) => {
            const active = selected.includes(id);
            return (
              <motion.div key={id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => toggle(id)}
                style={{ padding: 16, borderRadius: 12, border: `1px solid ${active ? 'var(--primary)' : 'var(--border)'}`, background: active ? 'rgba(124,111,247,0.1)' : 'var(--surface)', cursor: 'pointer', transition: 'all 0.15s ease', position: 'relative' }}>
                {active && <div style={{ position: 'absolute', top: 10, right: 10, width: 20, height: 20, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={12} color="white" /></div>}
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{desc}</div>
              </motion.div>
            );
          })}
        </div>

        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: 16, justifyContent: 'center' }} onClick={handleCreate} disabled={loading}>
          {loading ? <div className="spinner" style={{ borderTopColor: 'white' }} /> : <>Create My Vault <ArrowRight size={18} /></>}
        </motion.button>
        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--text-disabled)' }}>You can change these settings later</p>
      </motion.div>
    </div>
  );
};

export default VaultSetup;
