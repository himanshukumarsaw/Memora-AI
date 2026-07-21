import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Network, Sparkles, Send, FileText, Home, Shield, Building, User, Activity, ArrowRight, CornerDownRight } from 'lucide-react';
import { knowledgeGraphService } from '../services/knowledgeGraph.service';

const entityTypeIcons = {
  property: Home,
  insurance: Shield,
  organization: Building,
  person: User,
  treatment: Activity,
  other: Network,
};

const entityTypeColors = {
  property: 'var(--warning)',
  insurance: 'var(--success)',
  organization: 'var(--info)',
  person: 'var(--primary)',
  treatment: 'var(--danger)',
  other: 'var(--secondary)',
};

const presetQuestions = [
  "Show everything related to my Chandigarh house",
  "Which insurance policy covers my father?",
  "Show all documents connected to my internship",
  "Find every document where my passport number appears"
];

const KnowledgeGraph = () => {
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState('');
  const [queryResult, setQueryResult] = useState(null);
  const [querying, setQuerying] = useState(false);

  const loadGraph = async () => {
    try {
      const res = await knowledgeGraphService.getNodes();
      setGraphData(res.data.data);
    } catch (err) {
      toast.error('Failed to load Knowledge Graph');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadGraph(); }, []);

  const handleQuery = async (q) => {
    const queryText = q || question;
    if (!queryText.trim()) return toast.error('Enter a question');
    setQuerying(true);
    try {
      const res = await knowledgeGraphService.queryGraph(queryText);
      setQueryResult(res.data.data);
      toast.success('Graph connected answer generated! ✨');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Query failed');
    } finally {
      setQuerying(false);
    }
  };

  if (loading) return <div style={{ padding: 40 }}><div className="spinner-lg" style={{ margin: '40px auto' }} /></div>;

  return (
    <div style={{ padding: 32, minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--info-dim)', border: '1px solid rgba(6,182,212,0.3)', borderRadius: 99, padding: '4px 12px', fontSize: 12, color: 'var(--info)', fontWeight: 600, marginBottom: 8 }}>
          <Network size={13} /> Feature 3 — Memora AI: The Life Operating System
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800 }}>Connected Knowledge Graph</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Instead of storing disconnected folders, Memora AI connects related files (Sale Deed + Tax Receipt + Bills) into an intelligent digital memory of your life</p>
      </div>

      {/* Preset Questions Bar */}
      <div style={{ marginBottom: 24, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {presetQuestions.map((pq, i) => (
          <button key={i} className="btn btn-secondary btn-sm" onClick={() => { setQuestion(pq); handleQuery(pq); }} style={{ fontSize: 12 }}>
            <Sparkles size={12} color="var(--primary)" /> {pq}
          </button>
        ))}
      </div>

      {/* Query Bar */}
      <div className="card" style={{ padding: 16, marginBottom: 32, display: 'flex', gap: 12, alignItems: 'center' }}>
        <input
          className="input-field"
          placeholder="Ask anything about connected files (e.g. Show all documents related to my Chandigarh house)..."
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleQuery()}
          style={{ flex: 1 }}
        />
        <button className="btn btn-primary" onClick={() => handleQuery()} disabled={querying || !question.trim()}>
          {querying ? <div className="spinner" style={{ borderTopColor: 'white' }} /> : <><Send size={15} /> Ask Life OS</>}
        </button>
      </div>

      {/* Answer Box if Query Executed */}
      {queryResult && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: 24, marginBottom: 32, border: '1px solid rgba(37,99,235,0.4)', background: 'linear-gradient(135deg, rgba(37,99,235,0.08), rgba(6,182,212,0.05))' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: 'var(--primary-hover)', fontWeight: 700, fontSize: 15 }}>
            <Sparkles size={18} /> Graph Connected Answer
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text)', whiteSpace: 'pre-wrap', marginBottom: 16 }}>
            {queryResult.answer}
          </p>

          {queryResult.documentsUsed?.length > 0 && (
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Cross-Referenced Documents:</span>
              {queryResult.documentsUsed.map((d, idx) => (
                <span key={idx} className="badge badge-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <FileText size={11} /> {d.title}
                </span>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Visual Connected Graph Node Cards */}
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Connected Entity Graph ({graphData?.entityRelations?.length || 0} Entities)</h3>

      {!graphData?.entityRelations?.length ? (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <Network size={40} color="var(--info)" style={{ opacity: 0.3, marginBottom: 12 }} />
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Upload documents like Property Deeds, Insurance Policies, and Employment letters, and AI will automatically link them into connected entity clusters!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          {graphData.entityRelations.map((rel) => {
            const IconComp = entityTypeIcons[rel.entityType] || Network;
            const color = entityTypeColors[rel.entityType] || 'var(--primary)';

            return (
              <motion.div key={rel._id} whileHover={{ y: -4 }} className="card" style={{ padding: 20, borderTop: `3px solid ${color}` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <IconComp size={16} color={color} />
                    </div>
                    <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{rel.entityName}</h4>
                  </div>
                  <span className="badge" style={{ background: `${color}15`, color, border: `1px solid ${color}30`, fontSize: 11, textTransform: 'capitalize' }}>
                    {rel.entityType}
                  </span>
                </div>

                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
                  Relationship: <span style={{ color: 'var(--text)', fontWeight: 600 }}>{rel.relationshipLabel}</span>
                </p>

                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-disabled)', textTransform: 'uppercase' }}>Connected Files ({rel.connectedDocumentIds?.length || 0}):</span>
                  {rel.connectedDocumentIds?.map((doc, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text)' }}>
                      <CornerDownRight size={12} color={color} />
                      <span style={{ fontWeight: 600 }}>{doc.title || 'Attached Document'}</span>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>({doc.documentType || doc.category})</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default KnowledgeGraph;
