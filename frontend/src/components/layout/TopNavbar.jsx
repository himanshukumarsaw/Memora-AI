import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, Upload, X, FileText, MessageSquare, ChevronRight } from 'lucide-react';
import api from '../../services/apiClient';

const TopNavbar = ({ onUploadClick }) => {
  const [query, setQuery]       = useState('');
  const [results, setResults]   = useState([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen]         = useState(false);
  const inputRef = useRef();
  const navigate = useNavigate();
  let searchTimer = useRef(null);

  /* Debounced global search */
  useEffect(() => {
    if (!query.trim()) { setResults([]); setOpen(false); return; }
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await api.get('/documents', { params: { search: query, limit: 5 } });
        setResults(res.data.documents || []);
        setOpen(true);
      } catch { /* silent */ }
      finally { setSearching(false); }
    }, 350);
    return () => clearTimeout(searchTimer.current);
  }, [query]);

  /* Close on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest('#global-search-wrapper')) { setOpen(false); }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleResultClick = (id) => {
    setOpen(false); setQuery('');
    navigate(`/document/${id}`);
  };

  const handleChatSearch = () => {
    setOpen(false);
    navigate('/chat');
  };

  return (
    <div className="top-navbar">
      {/* ── Global Search Bar (spec: every page) ── */}
      <div id="global-search-wrapper" style={{ position: 'relative', flex: 1, maxWidth: 520 }}>
        <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-disabled)', pointerEvents: 'none', zIndex: 1 }} />
        <input
          ref={inputRef}
          className="input-search"
          style={{ width: '100%' }}
          placeholder="Search documents, categories, tags… (AI-powered)"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => query && setOpen(true)}
          onKeyDown={e => e.key === 'Escape' && (setOpen(false), setQuery(''))}
        />
        {query && (
          <button onClick={() => { setQuery(''); setOpen(false); inputRef.current?.focus(); }}
            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-disabled)', display: 'flex' }}>
            <X size={14} />
          </button>
        )}

        {/* Search Dropdown */}
        <AnimatePresence>
          {open && (
            <motion.div initial={{ opacity: 0, y: -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.97 }} transition={{ duration: 0.15 }}
              style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, boxShadow: 'var(--shadow-lg)', zIndex: 200, overflow: 'hidden' }}>
              {searching ? (
                <div style={{ padding: '20px', textAlign: 'center', display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
                  <div className="spinner" style={{ width: 14, height: 14 }} />
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Searching…</span>
                </div>
              ) : results.length > 0 ? (
                <>
                  <div style={{ padding: '10px 14px 6px', fontSize: 11, color: 'var(--text-disabled)', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                    Documents
                  </div>
                  {results.map(doc => (
                    <button key={doc._id} onClick={() => handleResultClick(doc._id)}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'none', border: 'none', width: '100%', cursor: 'pointer', color: 'var(--text)', transition: 'background 0.15s', textAlign: 'left' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-elevated)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                      <FileText size={15} color="var(--primary)" style={{ flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.title}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{doc.documentType || doc.category}</p>
                      </div>
                      <ChevronRight size={13} color="var(--text-disabled)" />
                    </button>
                  ))}
                  <div style={{ borderTop: '1px solid var(--border)', padding: 8 }}>
                    <button onClick={handleChatSearch}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', width: '100%', background: 'var(--primary-dim)', border: '1px solid rgba(37,99,235,0.2)', borderRadius: 10, cursor: 'pointer', color: 'var(--primary-hover)', fontSize: 13, fontWeight: 600 }}>
                      <MessageSquare size={14} />
                      Ask AI: "{query}"
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ padding: 16 }}>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', marginBottom: 10 }}>No documents found for "{query}"</p>
                  <button onClick={handleChatSearch}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', width: '100%', background: 'var(--primary-dim)', border: '1px solid rgba(37,99,235,0.2)', borderRadius: 10, cursor: 'pointer', color: 'var(--primary-hover)', fontSize: 13, fontWeight: 600, justifyContent: 'center' }}>
                    <MessageSquare size={14} />
                    Ask AI: "{query}"
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Right Actions ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
        {/* Upload Button */}
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          className="btn btn-primary btn-sm"
          onClick={onUploadClick}
          style={{ gap: 6 }}>
          <Upload size={14} /> Upload
        </motion.button>

        {/* Notifications */}
        <button className="btn btn-ghost btn-icon" style={{ position: 'relative' }} title="Notifications">
          <Bell size={18} />
          <span style={{ position: 'absolute', top: 6, right: 6, width: 7, height: 7, borderRadius: '50%', background: 'var(--danger)', border: '1.5px solid var(--bg)' }} />
        </button>
      </div>
    </div>
  );
};

export default TopNavbar;
