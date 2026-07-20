import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/apiClient';
import { Brain, Send, Plus, Trash2, MessageSquare, Sparkles, User } from 'lucide-react';

const AIChat = () => {
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const messagesEndRef = useRef();
  const inputRef = useRef();

  const suggestions = [
    'When does my passport expire?',
    'Show all my identity documents',
    'What is my PAN number?',
    'Find documents from 2023',
    'Summarize my medical records',
    'Generate my resume',
  ];

  useEffect(() => {
    api.get('/chat/sessions').then(r => setSessions(r.data.sessions)).finally(() => setSessionsLoading(false));
  }, []);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const loadSession = async (id) => {
    try {
      const res = await api.get(`/chat/sessions/${id}`);
      setCurrentSession(res.data.session);
      setMessages(res.data.session.messages || []);
    } catch { toast.error('Failed to load session'); }
  };

  const newChat = () => { setCurrentSession(null); setMessages([]); };

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');
    setLoading(true);

    // Optimistic UI
    const userMsg = { role: 'user', content: msg, timestamp: new Date() };
    setMessages(m => [...m, userMsg]);

    try {
      const res = await api.post('/chat/message', { message: msg, sessionId: currentSession?._id });
      setCurrentSession({ _id: res.data.sessionId });
      setMessages(m => [...m, { role: 'assistant', content: res.data.response, timestamp: new Date() }]);
      // Refresh sessions list
      api.get('/chat/sessions').then(r => setSessions(r.data.sessions));
    } catch (err) {
      toast.error('Failed to get response');
      setMessages(m => [...m, { role: 'assistant', content: '❌ Failed to get a response. Please try again.', timestamp: new Date() }]);
    } finally { setLoading(false); inputRef.current?.focus(); }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sessions Sidebar */}
      <div style={{ width: 260, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', background: 'var(--surface)' }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>AI Chat</h2>
          <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 13 }} onClick={newChat}>
            <Plus size={15} /> New Chat
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}>
          {sessionsLoading ? [...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 52, borderRadius: 8, marginBottom: 6 }} />) :
            sessions.length === 0 ? <p style={{ fontSize: 13, color: 'var(--text-muted)', padding: '16px 8px' }}>No previous chats</p> :
            sessions.map(s => (
              <motion.div key={s._id} whileHover={{ x: 3 }} onClick={() => loadSession(s._id)}
                style={{ padding: '10px 12px', borderRadius: 8, cursor: 'pointer', marginBottom: 4, background: currentSession?._id === s._id ? 'rgba(124,111,247,0.15)' : 'transparent', border: currentSession?._id === s._id ? '1px solid rgba(124,111,247,0.3)' : '1px solid transparent', transition: 'all 0.15s' }}>
                <p style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{new Date(s.updatedAt).toLocaleDateString()}</p>
              </motion.div>
            ))
          }
        </div>
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, background: 'var(--surface)' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #7C6FF7, #5A4FCF)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Brain size={20} color="white" />
          </div>
          <div>
            <h3 style={{ fontWeight: 700 }}>Memora AI</h3>
            <p style={{ fontSize: 12, color: 'var(--success)' }}>● Online · Ready to help</p>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', paddingTop: 60 }}>
              <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 3 }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #7C6FF7, #3ECF8E)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                  <Brain size={40} color="white" />
                </div>
              </motion.div>
              <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Ask me anything about your documents</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: 32, maxWidth: 400, margin: '0 auto 32px' }}>I have access to your entire vault and can answer questions, find information, and help you understand your documents.</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', maxWidth: 600, margin: '0 auto' }}>
                {suggestions.map(s => (
                  <motion.button key={s} whileHover={{ scale: 1.03 }} onClick={() => sendMessage(s)}
                    style={{ padding: '8px 16px', background: 'var(--surface-elevated)', border: '1px solid var(--border)', borderRadius: 20, fontSize: 13, color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.15s' }}>
                    {s}
                  </motion.button>
                ))}
              </div>
            </div>
          ) : (
            <AnimatePresence>
              {messages.map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                  style={{ display: 'flex', gap: 12, marginBottom: 20, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  {msg.role === 'assistant' && (
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #7C6FF7, #5A4FCF)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                      <Brain size={16} color="white" />
                    </div>
                  )}
                  <div style={{ maxWidth: '72%', padding: '12px 16px', borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', background: msg.role === 'user' ? 'linear-gradient(135deg, #7C6FF7, #5A4FCF)' : 'var(--surface-elevated)', border: msg.role === 'assistant' ? '1px solid var(--border)' : 'none', color: 'var(--text)', fontSize: 14, lineHeight: 1.7 }}>
                    {msg.role === 'assistant' ? (
                      <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                    ) : msg.content}
                  </div>
                  {msg.role === 'user' && (
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #3ECF8E, #2A9E6E)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                      <User size={16} color="white" />
                    </div>
                  )}
                </motion.div>
              ))}
              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #7C6FF7, #5A4FCF)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Brain size={16} color="white" />
                  </div>
                  <div style={{ padding: '16px', background: 'var(--surface-elevated)', borderRadius: '18px 18px 18px 4px', border: '1px solid var(--border)', display: 'flex', gap: 6, alignItems: 'center' }}>
                    {[0, 1, 2].map(i => (
                      <motion.div key={i} animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.2 }}
                        style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)' }} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder="Ask about your documents... (Enter to send, Shift+Enter for newline)"
                rows={1}
                style={{ width: '100%', background: 'var(--surface-elevated)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 12, padding: '12px 16px', fontSize: 14, fontFamily: 'Inter, sans-serif', resize: 'none', outline: 'none', transition: 'border-color 0.2s', lineHeight: 1.5 }}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn-primary" style={{ padding: '12px', height: 44, width: 44, justifyContent: 'center', borderRadius: 12 }} onClick={() => sendMessage()} disabled={!input.trim() || loading}>
              {loading ? <div className="spinner" style={{ borderTopColor: 'white', width: 16, height: 16 }} /> : <Send size={18} />}
            </motion.button>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-disabled)', marginTop: 8 }}>
            <Sparkles size={10} style={{ display: 'inline', marginRight: 4 }} />
            Powered by Gemini AI · Searches your entire document vault
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
