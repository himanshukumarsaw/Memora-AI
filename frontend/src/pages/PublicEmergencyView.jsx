import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HeartPulse, PhoneCall, ShieldAlert, AlertTriangle, Stethoscope, CheckCircle, Clock } from 'lucide-react';
import { emergencyService } from '../services/emergency.service';

const PublicEmergencyView = () => {
  const { qrToken } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    emergencyService.getPublicProfile(qrToken)
      .then(res => setData(res.data.data))
      .catch(err => setError(err.response?.data?.message || 'Emergency medical record not found'))
      .finally(() => setLoading(false));
  }, [qrToken]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0D0F14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner-lg" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ minHeight: '100vh', background: '#0D0F14', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div className="card" style={{ padding: 40, textAlign: 'center', maxWidth: 460, border: '1px solid rgba(239,68,68,0.4)' }}>
          <AlertTriangle size={48} color="var(--danger)" style={{ marginBottom: 16 }} />
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Record Unavailable</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{error || 'This emergency profile is invalid or has been disabled by the user.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0D0F14', color: '#EDF2FF', padding: '24px 16px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        {/* Banner */}
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ background: 'linear-gradient(135deg, #DC2626, #991B1B)', borderRadius: 16, padding: '20px 24px', marginBottom: 20, boxShadow: '0 8px 32px rgba(220,38,38,0.4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <HeartPulse size={28} color="white" />
              <div>
                <span style={{ fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.9, fontWeight: 700 }}>EMERGENCY MEDICAL PASS</span>
                <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>{data.patientName}</h1>
              </div>
            </div>
            <div style={{ background: '#FFFFFF', color: '#991B1B', borderRadius: 12, padding: '6px 14px', textAlign: 'center' }}>
              <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', display: 'block' }}>BLOOD</span>
              <span style={{ fontSize: 22, fontWeight: 900 }}>{data.bloodGroup || 'UNK'}</span>
            </div>
          </div>
        </motion.div>

        {/* Emergency Contacts (Top Priority for Doctors) */}
        {data.emergencyContacts?.length > 0 && (
          <div className="card" style={{ padding: 20, marginBottom: 16, border: '1px solid rgba(34,197,94,0.4)', background: 'rgba(34,197,94,0.06)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <PhoneCall size={16} /> Immediate Emergency Contacts
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {data.emergencyContacts.map((c, i) => (
                <a key={i} href={`tel:${c.phone}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface-elevated)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 16px' }}>
                  <div>
                    <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{c.name}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block' }}>{c.relation}</span>
                  </div>
                  <span className="btn btn-success btn-sm" style={{ gap: 6 }}>
                    <PhoneCall size={13} /> Call {c.phone}
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Critical Allergies */}
        <div className="card" style={{ padding: 20, marginBottom: 16, border: '1px solid rgba(239,68,68,0.3)' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--danger)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={16} /> Critical Allergies
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {data.allergies?.length > 0 ? data.allergies.map((a, i) => (
              <span key={i} className="badge badge-danger" style={{ fontSize: 13, padding: '6px 12px' }}>⚠️ {a}</span>
            )) : <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>No documented allergies</span>}
          </div>
        </div>

        {/* Current Medications & Chronic Diseases */}
        <div className="card" style={{ padding: 20, marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--warning)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Stethoscope size={16} /> Chronic Conditions & Medications
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {data.chronicDiseases?.length > 0 ? data.chronicDiseases.map((cd, i) => (
              <span key={i} className="badge badge-warning" style={{ fontSize: 13, padding: '6px 12px' }}>{cd}</span>
            )) : <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>No chronic conditions recorded</span>}
          </div>
        </div>

        {/* Security Footer */}
        <div style={{ textAlign: 'center', padding: '16px 0', fontSize: 11, color: 'var(--text-disabled)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <ShieldAlert size={12} />
          <span>Memora AI Life-Saving Emergency Pass · Verified Medical Information</span>
        </div>
      </div>
    </div>
  );
};

export default PublicEmergencyView;
