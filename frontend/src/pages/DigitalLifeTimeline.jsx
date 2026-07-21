import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Calendar, Sparkles, Plus, Search, Filter, GraduationCap, Briefcase, Home, Shield, Award, FileText, Trash2, Clock, ChevronRight } from 'lucide-react';
import { timelineService } from '../services/timeline.service';
import { Link } from 'react-router-dom';

const categoryIcons = {
  education: GraduationCap,
  career: Briefcase,
  professional: Briefcase,
  property: Home,
  identity: Shield,
  financial: Award,
  medical: Sparkles,
  personal: Calendar,
};

const categoryColors = {
  education: 'var(--primary)',
  career: 'var(--info)',
  professional: 'var(--info)',
  property: 'var(--warning)',
  identity: 'var(--success)',
  financial: '#F59E0B',
  medical: 'var(--danger)',
  personal: 'var(--secondary)',
};

const DigitalLifeTimeline = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  // Add Milestone Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [mTitle, setMTitle] = useState('');
  const [mDesc, setMDesc] = useState('');
  const [mDate, setMDate] = useState('');
  const [mCat, setMCat] = useState('personal');
  const [creating, setCreating] = useState(false);

  const loadTimeline = async () => {
    try {
      const res = await timelineService.getTimeline({
        year: selectedYear || undefined,
        category: selectedCategory || undefined,
        search: search || undefined,
      });
      setData(res.data.data);
    } catch (err) {
      toast.error('Failed to load life history timeline');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTimeline(); }, [selectedYear, selectedCategory, search]);

  const handleCreate = async () => {
    if (!mTitle || !mDate) return toast.error('Title and Date are required');
    setCreating(true);
    try {
      await timelineService.createMilestone({
        title: mTitle,
        description: mDesc,
        eventDate: mDate,
        category: mCat,
      });
      toast.success('Life milestone added! 🌟');
      setShowAddModal(false);
      setMTitle(''); setMDesc(''); setMDate('');
      loadTimeline();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add milestone');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await timelineService.deleteMilestone(id);
      toast.success('Milestone removed');
      loadTimeline();
    } catch {
      toast.error('Failed to delete milestone');
    }
  };

  if (loading) return <div style={{ padding: 40 }}><div className="spinner-lg" style={{ margin: '40px auto' }} /></div>;

  return (
    <div style={{ padding: 32, minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--primary-dim)', border: '1px solid rgba(37,99,235,0.3)', borderRadius: 99, padding: '4px 12px', fontSize: 12, color: 'var(--primary-hover)', fontWeight: 600, marginBottom: 8 }}>
            <Sparkles size={13} /> Feature 2 — Digital Life History
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800 }}>Chronological Life Timeline</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Every document automatically tells your life story — search by year, milestone, or life event</p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Add Life Milestone
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="card" style={{ padding: 18, marginBottom: 32, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-disabled)' }} />
          <input className="input-search" placeholder="Search milestone (e.g. Class 10, First Job, House...)" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 34 }} />
        </div>

        <select className="input-field" style={{ width: 160 }} value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
          <option value="">All Categories</option>
          <option value="education">Education</option>
          <option value="career">Career</option>
          <option value="identity">Identity</option>
          <option value="financial">Financial</option>
          <option value="property">Property</option>
          <option value="medical">Medical</option>
          <option value="personal">Personal</option>
        </select>

        {data?.availableYears?.length > 0 && (
          <select className="input-field" style={{ width: 140 }} value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
            <option value="">All Years</option>
            {data.availableYears.map(yr => (
              <option key={yr} value={yr}>{yr}</option>
            ))}
          </select>
        )}
      </div>

      {/* Vertical Timeline */}
      {!data?.milestones?.length ? (
        <div className="card" style={{ padding: 60, textAlign: 'center', maxWidth: 540, margin: '40px auto' }}>
          <Clock size={48} color="var(--primary)" style={{ opacity: 0.4, marginBottom: 16 }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No Life Milestones Found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>Upload certificates, degrees, or job letters, and AI will automatically build your chronological life story!</p>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>Add Custom Milestone</button>
        </div>
      ) : (
        <div style={{ position: 'relative', maxWidth: 840, margin: '0 auto', paddingLeft: 24 }}>
          {/* Vertical Spine Line */}
          <div style={{ position: 'absolute', left: 18, top: 0, bottom: 0, width: 2, background: 'linear-gradient(to bottom, var(--primary), var(--info), var(--surface-elevated))' }} />

          {Object.keys(data.yearGroups || {}).sort((a, b) => b - a).map((year) => (
            <div key={year} style={{ marginBottom: 40 }}>
              {/* Year Header Marker */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, position: 'relative' }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, boxShadow: '0 0 16px rgba(37,99,235,0.6)', zIndex: 2 }}>
                  {year.substring(2)}'
                </div>
                <div style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border)', padding: '4px 16px', borderRadius: 99 }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)' }}>{year}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 8 }}>({data.yearGroups[year].length} event{data.yearGroups[year].length > 1 ? 's' : ''})</span>
                </div>
              </div>

              {/* Milestones list in this year */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingLeft: 48 }}>
                {data.yearGroups[year].map((m) => {
                  const IconComp = categoryIcons[m.category] || Calendar;
                  const catColor = categoryColors[m.category] || 'var(--primary)';

                  return (
                    <motion.div
                      key={m._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="card"
                      style={{ padding: 20, borderLeft: `4px solid ${catColor}`, background: 'var(--surface-elevated)' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                            <span className="badge" style={{ background: `${catColor}20`, color: catColor, border: `1px solid ${catColor}40`, textTransform: 'capitalize' }}>
                              <IconComp size={12} style={{ marginRight: 4 }} /> {m.category}
                            </span>
                            {m.isAutoExtracted && (
                              <span className="badge badge-info" style={{ fontSize: 10 }}>✨ AI Catalogued</span>
                            )}
                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(m.eventDate).toLocaleDateString()}</span>
                          </div>

                          <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{m.title}</h4>
                          {m.description && <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 10 }}>{m.description}</p>}

                          {m.documentId && (
                            <Link to={`/document/${m.documentId._id || m.documentId}`} style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--primary-hover)', fontWeight: 600 }}>
                              <FileText size={14} /> View Attached Document ({m.documentId.title || 'Document'}) <ChevronRight size={12} />
                            </Link>
                          )}
                        </div>

                        {!m.isAutoExtracted && (
                          <button className="btn-ghost" style={{ color: 'var(--danger)', opacity: 0.7 }} onClick={() => handleDelete(m._id)}>
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Milestone Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="card" style={{ padding: 28, width: '100%', maxWidth: 480 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Add Custom Life Milestone</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Event Title *</label>
                  <input className="input-field" placeholder="e.g. Started College, Class 10 Result, House Purchase" value={mTitle} onChange={e => setMTitle(e.target.value)} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Event Date *</label>
                    <input type="date" className="input-field" value={mDate} onChange={e => setMDate(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Category</label>
                    <select className="input-field" value={mCat} onChange={e => setMCat(e.target.value)}>
                      <option value="education">Education</option>
                      <option value="career">Career</option>
                      <option value="identity">Identity</option>
                      <option value="financial">Financial</option>
                      <option value="property">Property</option>
                      <option value="medical">Medical</option>
                      <option value="personal">Personal</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Description</label>
                  <textarea className="input-field" rows={3} placeholder="Brief summary of this milestone..." value={mDesc} onChange={e => setMDesc(e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleCreate} disabled={creating}>
                  {creating ? <div className="spinner" style={{ borderTopColor: 'white' }} /> : 'Add Milestone'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DigitalLifeTimeline;
