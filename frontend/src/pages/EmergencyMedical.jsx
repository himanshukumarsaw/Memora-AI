import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { HeartPulse, ShieldAlert, QrCode, Plus, Trash2, Save, Printer, Share2, AlertTriangle, PhoneCall, Stethoscope } from 'lucide-react';
import { emergencyService } from '../services/emergency.service';

const EmergencyMedical = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Form states
  const [bloodGroup, setBloodGroup] = useState('Unknown');
  const [allergies, setAllergies] = useState([]);
  const [currentMedications, setCurrentMedications] = useState([]);
  const [chronicDiseases, setChronicDiseases] = useState([]);
  const [previousSurgeries, setPreviousSurgeries] = useState([]);
  const [emergencyContacts, setEmergencyContacts] = useState([]);

  // Tag inputs
  const [newAllergy, setNewAllergy] = useState('');
  const [newMed, setNewMed] = useState('');
  const [newDisease, setNewDisease] = useState('');

  // New Contact
  const [cName, setCName] = useState('');
  const [cRelation, setCRelation] = useState('');
  const [cPhone, setCPhone] = useState('');

  const loadData = async () => {
    try {
      const res = await emergencyService.getProfile();
      const p = res.data.data.profile;
      setData(res.data.data);
      setBloodGroup(p.bloodGroup || 'Unknown');
      setAllergies(p.allergies || []);
      setCurrentMedications(p.currentMedications || []);
      setChronicDiseases(p.chronicDiseases || []);
      setPreviousSurgeries(p.previousSurgeries || []);
      setEmergencyContacts(p.emergencyContacts || []);
    } catch (err) {
      toast.error('Failed to load emergency profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await emergencyService.updateProfile({
        bloodGroup,
        allergies,
        currentMedications,
        chronicDiseases,
        previousSurgeries,
        emergencyContacts,
      });
      toast.success('Emergency medical profile saved!');
      setEditMode(false);
      loadData();
    } catch (err) {
      toast.error('Failed to save emergency profile');
    } finally {
      setSaving(false);
    }
  };

  const addContact = () => {
    if (!cName || !cRelation || !cPhone) return toast.error('Fill out all contact fields');
    setEmergencyContacts([...emergencyContacts, { name: cName, relation: cRelation, phone: cPhone }]);
    setCName(''); setCRelation(''); setCPhone('');
  };

  const removeContact = (idx) => {
    setEmergencyContacts(emergencyContacts.filter((_, i) => i !== idx));
  };

  const qrUrl = data?.profile?.qrToken
    ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`http://localhost:3000/emergency/view/${data.profile.qrToken}`)}`
    : '';

  if (loading) return <div style={{ padding: 40 }}><div className="spinner-lg" style={{ margin: '40px auto' }} /></div>;

  return (
    <div style={{ padding: 32, minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--danger-dim)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 99, padding: '4px 12px', fontSize: 12, color: 'var(--danger)', fontWeight: 600, marginBottom: 8 }}>
            <HeartPulse size={13} /> Feature 1 — Emergency Medical History
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800 }}>Emergency Medical Profile & QR</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>In an accident or medical emergency, doctors scan your QR code to instantly see life-saving vitals without needing your password</p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary" onClick={() => window.print()}>
            <Printer size={15} /> Print Emergency Card
          </button>
          {!editMode ? (
            <button className="btn btn-primary" onClick={() => setEditMode(true)}>Edit Emergency Vitals</button>
          ) : (
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? <div className="spinner" style={{ borderTopColor: 'white' }} /> : <><Save size={15} /> Save Changes</>}
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
        {/* Left Column: QR Code & Public Card */}
        <div className="card" style={{ padding: 28, border: '1px solid rgba(239,68,68,0.3)', background: 'linear-gradient(135deg, rgba(239,68,68,0.06), rgba(15,23,42,0.6))' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <ShieldAlert size={22} color="var(--danger)" />
              <span style={{ fontWeight: 800, fontSize: 17, color: 'var(--text)' }}>Emergency QR Pass</span>
            </div>
            <span className="badge badge-danger">First Responder Access</span>
          </div>

          <div style={{ background: '#FFFFFF', padding: 20, borderRadius: 16, textAlign: 'center', maxWidth: 220, margin: '0 auto 20px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
            {qrUrl ? <img src={qrUrl} alt="Emergency QR Code" style={{ width: '100%', height: 'auto', display: 'block' }} /> : <QrCode size={180} />}
          </div>

          <p style={{ fontSize: 12, textAlign: 'center', color: 'var(--text-muted)', marginBottom: 16 }}>
            Scan with any smartphone camera to view medical vitals & call emergency contacts instantly.
          </p>

          <div style={{ background: 'var(--surface-elevated)', borderRadius: 12, padding: 14, border: '1px solid var(--border)' }}>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', fontWeight: 700 }}>Public Scan Link</p>
            <p style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: 'var(--primary-hover)', wordBreak: 'break-all' }}>
              http://localhost:3000/emergency/view/{data?.profile?.qrToken}
            </p>
          </div>
        </div>

        {/* Right Column: Emergency Vitals & Contacts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Blood Group & Vitals */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Stethoscope size={18} color="var(--danger)" /> Medical Vitals Summary
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16, marginBottom: 20 }}>
              <div style={{ background: 'var(--surface-elevated)', padding: 14, borderRadius: 12, border: '1px solid var(--border)' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>Blood Group</span>
                {!editMode ? (
                  <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--danger)' }}>{bloodGroup}</span>
                ) : (
                  <select className="input-field" style={{ marginTop: 4 }} value={bloodGroup} onChange={e => setBloodGroup(e.target.value)}>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Allergies */}
            <div style={{ marginBottom: 16 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Allergies</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {allergies.length > 0 ? allergies.map((al, i) => (
                  <span key={i} className="badge badge-danger" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {al}
                    {editMode && <span style={{ cursor: 'pointer' }} onClick={() => setAllergies(allergies.filter((_, idx) => idx !== i))}>×</span>}
                  </span>
                )) : <span style={{ fontSize: 12, color: 'var(--text-disabled)' }}>No allergies listed</span>}
              </div>
              {editMode && (
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <input className="input-field" placeholder="Add allergy (e.g. Penicillin)" value={newAllergy} onChange={e => setNewAllergy(e.target.value)} />
                  <button className="btn btn-secondary btn-sm" onClick={() => { if (newAllergy) { setAllergies([...allergies, newAllergy]); setNewAllergy(''); } }}>Add</button>
                </div>
              )}
            </div>

            {/* Chronic Conditions */}
            <div>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Chronic Conditions & Surgeries</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {chronicDiseases.length > 0 ? chronicDiseases.map((cd, i) => (
                  <span key={i} className="badge badge-warning">{cd}</span>
                )) : <span style={{ fontSize: 12, color: 'var(--text-disabled)' }}>None detected</span>}
              </div>
            </div>
          </div>

          {/* Emergency Contacts */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <PhoneCall size={18} color="var(--success)" /> Emergency Contacts
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
              {emergencyContacts.map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, background: 'var(--surface-elevated)', borderRadius: 10, border: '1px solid var(--border)' }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700 }}>{c.name} <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>({c.relation})</span></p>
                    <p style={{ fontSize: 13, color: 'var(--success)', fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>{c.phone}</p>
                  </div>
                  {editMode && (
                    <button className="btn-ghost" style={{ color: 'var(--danger)' }} onClick={() => removeContact(i)}>
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {editMode && (
              <div style={{ background: 'var(--surface-elevated)', padding: 14, borderRadius: 10, border: '1px solid var(--border)' }}>
                <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Add Emergency Contact</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                  <input className="input-field" placeholder="Contact Name" value={cName} onChange={e => setCName(e.target.value)} />
                  <input className="input-field" placeholder="Relation (e.g. Spouse)" value={cRelation} onChange={e => setCRelation(e.target.value)} />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input className="input-field" placeholder="Phone Number" value={cPhone} onChange={e => setCPhone(e.target.value)} />
                  <button className="btn btn-primary btn-sm" onClick={addContact}><Plus size={14} /> Add</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyMedical;
