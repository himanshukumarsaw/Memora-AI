import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Target, Sparkles, Award, ExternalLink, CheckCircle2, Clock, RefreshCw, Briefcase, GraduationCap, DollarSign, Building } from 'lucide-react';
import { opportunityService } from '../services/opportunity.service';

const categoryIcons = {
  scholarship: GraduationCap,
  grant: DollarSign,
  fellowship: Award,
  scheme: Building,
  job: Briefcase,
  internship: Briefcase,
  competition: Sparkles,
};

const OpportunityHub = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');

  const loadOpportunities = async () => {
    try {
      const res = await opportunityService.getOpportunities();
      setData(res.data.data);
    } catch (err) {
      toast.error('Failed to load opportunities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadOpportunities(); }, []);

  const handleScan = async () => {
    setScanning(true);
    try {
      const res = await opportunityService.checkEligibility();
      toast.success('AI Eligibility scan completed! ✨');
      loadOpportunities();
    } catch {
      toast.error('Scan failed');
    } finally {
      setScanning(false);
    }
  };

  if (loading) return <div style={{ padding: 40 }}><div className="spinner-lg" style={{ margin: '40px auto' }} /></div>;

  const filteredMatches = (data?.matches || []).filter(m => !selectedCategory || m.opportunity.category === selectedCategory);

  return (
    <div style={{ padding: 32, minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--success-dim)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 99, padding: '4px 12px', fontSize: 12, color: 'var(--success)', fontWeight: 600, marginBottom: 8 }}>
            <Target size={13} /> Feature 4 — Personal Opportunity Engine
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800 }}>Opportunities You Qualify For</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Memora AI scans your verified documents & profile attributes to find scholarships, grants, and research fellowships you never knew you qualified for</p>
        </div>

        <button className="btn btn-primary" onClick={handleScan} disabled={scanning}>
          {scanning ? <div className="spinner" style={{ borderTopColor: 'white' }} /> : <><RefreshCw size={15} /> Re-evaluate Eligibility</>}
        </button>
      </div>

      {/* Category Filter Chips */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
        {['', 'fellowship', 'grant', 'scholarship', 'job', 'competition'].map((cat) => (
          <button
            key={cat}
            className={`btn btn-sm ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSelectedCategory(cat)}
            style={{ textTransform: 'capitalize' }}
          >
            {cat || 'All Opportunities'}
          </button>
        ))}
      </div>

      {/* Opportunity Cards Grid */}
      {!filteredMatches.length ? (
        <div className="card" style={{ padding: 60, textAlign: 'center' }}>
          <Target size={44} color="var(--primary)" style={{ opacity: 0.4, marginBottom: 12 }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No Active Opportunity Matches</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Upload academic certificates, degree documents, or job letters to discover eligible scholarships and grants!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
          {filteredMatches.map(({ opportunity: opp, matchScore, matchReasons, daysLeft, isEligible }) => {
            const IconComp = categoryIcons[opp.category] || Award;
            const scoreColor = matchScore >= 90 ? 'var(--success)' : matchScore >= 75 ? 'var(--primary-hover)' : 'var(--warning)';

            return (
              <motion.div
                key={opp._id}
                whileHover={{ y: -4 }}
                className="card"
                style={{
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                  border: isEligible ? `1px solid ${scoreColor}40` : '1px solid var(--border)',
                  background: isEligible ? `linear-gradient(135deg, ${scoreColor}08, var(--surface-elevated))` : 'var(--surface-elevated)',
                }}
              >
                <div>
                  {/* Top Bar: Match Badge & Deadline */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ background: `${scoreColor}20`, color: scoreColor, borderRadius: 10, padding: '6px 12px', fontWeight: 800, fontSize: 14, border: `1px solid ${scoreColor}40` }}>
                        {matchScore}% Match
                      </div>
                      <span className="badge" style={{ background: 'var(--surface)', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                        <IconComp size={12} style={{ marginRight: 4 }} /> {opp.category}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: daysLeft <= 14 ? 'var(--danger)' : 'var(--warning)', fontWeight: 700 }}>
                      <Clock size={13} /> Closes in {daysLeft} days
                    </div>
                  </div>

                  {/* Title & Organization */}
                  <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>{opp.title}</h3>
                  <p style={{ fontSize: 13, color: 'var(--primary-hover)', fontWeight: 600, marginBottom: 12 }}>{opp.organization}</p>

                  <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 16 }}>{opp.description}</p>

                  {/* Award Value Banner */}
                  <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Award / Grant Value:</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--success)' }}>{opp.awardValue}</span>
                  </div>

                  {/* AI Eligibility Match Rationale */}
                  <div style={{ marginBottom: 20 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-disabled)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>AI Match Criteria Alignment:</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {matchReasons.map((reason, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 12, color: 'var(--text)' }}>
                          <CheckCircle2 size={14} color="var(--success)" style={{ marginTop: 2, flexShrink: 0 }} />
                          <span>{reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Apply Button */}
                <a
                  href={opp.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', gap: 8, textDecoration: 'none' }}
                >
                  Apply Now <ExternalLink size={14} />
                </a>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OpportunityHub;
