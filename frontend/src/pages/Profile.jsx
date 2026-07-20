import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/apiClient';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Calendar, MapPin, Hash, Briefcase, GraduationCap, Heart, DollarSign, Home, Car, Shield, Brain } from 'lucide-react';

const CAT_CONFIG = {
  identity: { icon: Hash, color: '#7C6FF7', label: 'Identity Documents' },
  education: { icon: GraduationCap, color: '#4299E1', label: 'Education' },
  professional: { icon: Briefcase, color: '#48BB78', label: 'Professional' },
  medical: { icon: Heart, color: '#FC8181', label: 'Medical' },
  financial: { icon: DollarSign, color: '#F6C90E', label: 'Financial' },
  property: { icon: Home, color: '#38B2AC', label: 'Property' },
  vehicle: { icon: Car, color: '#ED8936', label: 'Vehicle' },
};

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/profile').then(r => setProfile(r.data.profile)).catch(() => toast.error('Failed to load profile')).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 32 }}>{[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 16, marginBottom: 16 }} />)}</div>;

  return (
    <div style={{ padding: '32px', minHeight: '100vh' }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Universal Profile</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 32 }}>Automatically aggregated from all your documents</p>

      {/* Personal Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: 'linear-gradient(135deg, rgba(124,111,247,0.15), rgba(62,207,142,0.08))', border: '1px solid rgba(124,111,247,0.3)', borderRadius: 20, padding: 28, marginBottom: 24, display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #7C6FF7, #3ECF8E)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: 'white', flexShrink: 0 }}>
          {(profile?.personal?.name || user?.name || 'M')[0].toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 16 }}>{profile?.personal?.name || user?.name}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            {profile?.personal?.email && <ProfileField icon={<Mail size={14} />} label="Email" value={profile.personal.email} />}
            {profile?.personal?.dob && <ProfileField icon={<Calendar size={14} />} label="Date of Birth" value={profile.personal.dob} />}
            {profile?.personal?.address && <ProfileField icon={<MapPin size={14} />} label="Address" value={profile.personal.address} />}
            {profile?.personal?.allNames?.length > 1 && <ProfileField icon={<User size={14} />} label="Also known as" value={profile.personal.allNames.slice(1).join(', ')} />}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: 'rgba(62,207,142,0.15)', border: '1px solid rgba(62,207,142,0.3)', borderRadius: 20 }}>
          <Brain size={14} color="var(--success)" />
          <span style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600 }}>AI Generated</span>
        </div>
      </motion.div>

      {/* Category Sections */}
      {Object.entries(CAT_CONFIG).map(([key, { icon: Icon, color, label }], catIdx) => {
        const docs = profile?.[key] || [];
        if (docs.length === 0) return null;
        return (
          <motion.div key={key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: catIdx * 0.1 }}
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={18} color={color} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>{label}</h3>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>({docs.length} document{docs.length > 1 ? 's' : ''})</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              {docs.map((entry, i) => (
                <div key={i} style={{ background: 'var(--surface-elevated)', border: `1px solid ${color}30`, borderRadius: 12, padding: 16 }}>
                  <p style={{ fontWeight: 700, color, marginBottom: 12, fontSize: 14 }}>{entry.documentType}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {entry.name && <ProfileField icon={<User size={12} />} label="Name" value={entry.name} small />}
                    {entry.idNumber && <ProfileField icon={<Hash size={12} />} label="ID Number" value={entry.idNumber} small mono />}
                    {entry.issueDate && <ProfileField icon={<Calendar size={12} />} label="Issue Date" value={entry.issueDate} small />}
                    {entry.expiryDate && <ProfileField icon={<Shield size={12} />} label="Expiry" value={entry.expiryDate} small />}
                    {entry.issuingAuthority && <ProfileField icon={<Briefcase size={12} />} label="Issued By" value={entry.issuingAuthority} small />}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        );
      })}

      {(!profile || Object.values(profile).every(v => !Array.isArray(v) || v.length === 0)) && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Brain size={60} style={{ opacity: 0.2, margin: '0 auto 20px' }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Profile builds automatically</h3>
          <p style={{ color: 'var(--text-muted)' }}>Upload documents and AI will build your profile from extracted data</p>
        </div>
      )}
    </div>
  );
};

const ProfileField = ({ icon, label, value, small, mono }) => (
  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
    <div style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: 1 }}>{icon}</div>
    <div>
      <p style={{ fontSize: small ? 10 : 11, color: 'var(--text-muted)', marginBottom: 1 }}>{label}</p>
      <p style={{ fontSize: small ? 12 : 13, fontWeight: 500, fontFamily: mono ? 'JetBrains Mono, monospace' : 'inherit', wordBreak: 'break-word' }}>{String(value)}</p>
    </div>
  </div>
);

export default Profile;
