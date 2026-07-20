import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Brain, Shield, Zap, MessageSquare, Bell, Share2, ArrowRight, Check, Lock, Search, FileText, ChevronRight, Star, Upload, Clock, Database, Sparkles, Eye } from 'lucide-react';

/* ─── Data ─────────────────────────────────────── */
const features = [
  { icon: Brain, title: 'AI Document Understanding', desc: 'Reads, extracts, and understands every document automatically. No manual work.', color: '#818CF8', bg: 'rgba(129,140,248,0.12)' },
  { icon: Search, title: 'Conversational Search', desc: 'Ask questions in plain English. "Show my passport" — and it appears instantly.', color: '#38BDF8', bg: 'rgba(56,189,248,0.12)' },
  { icon: Shield, title: 'Military-Grade Vault', desc: 'End-to-end encrypted storage. Your documents never leave your secure vault.', color: '#34D399', bg: 'rgba(52,211,153,0.12)' },
  { icon: Bell, title: 'Smart Reminders', desc: 'AI tracks every expiry date. Never miss a passport renewal or insurance deadline.', color: '#FBBF24', bg: 'rgba(251,191,36,0.12)' },
  { icon: Share2, title: 'Secure Sharing', desc: 'OTP-protected, auto-expiring links. Share safely without permanent access.', color: '#FB7185', bg: 'rgba(251,113,133,0.12)' },
  { icon: Zap, title: 'Instant Retrieval', desc: 'Semantic AI search across your entire vault. Any document in under 3 seconds.', color: '#34D399', bg: 'rgba(52,211,153,0.12)' },
];

const steps = [
  { num: '01', icon: Upload,      title: 'Upload',         desc: 'Drag & drop any PDF, image, or scan.' },
  { num: '02', icon: Brain,       title: 'AI Understands', desc: 'Extracts fields, categories, expiry dates.' },
  { num: '03', icon: MessageSquare, title: 'Ask Questions', desc: 'Chat naturally with your documents.' },
  { num: '04', icon: Zap,         title: 'Get Answers',    desc: 'Instant, accurate, grounded responses.' },
];

const queryExamples = [
  '"When does my passport expire?"',
  '"Show all medical documents from 2024."',
  '"Find documents with my PAN number."',
  '"Generate my resume from certificates."',
];

/* ─── Animated Vault Illustration ──────────────── */
const FloatingDoc = ({ icon, label, style, delay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.7, y: 20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{ delay, duration: 0.5, ease: 'backOut' }}
    style={{
      position: 'absolute', ...style,
      background: 'rgba(30,41,59,0.9)',
      border: '1px solid rgba(37,99,235,0.3)',
      borderRadius: 12,
      padding: '10px 14px',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', gap: 8,
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      whiteSpace: 'nowrap',
      zIndex: 2,
    }}
  >
    <span style={{ fontSize: 18 }}>{icon}</span>
    <span style={{ fontSize: 12, color: '#CBD5E1', fontWeight: 500 }}>{label}</span>
    <span style={{ fontSize: 10, color: '#22C55E', fontWeight: 700, background: 'rgba(34,197,94,0.12)', padding: '2px 6px', borderRadius: 4 }}>✓ Safe</span>
  </motion.div>
);

const VaultIllustration = () => (
  <div style={{ position: 'relative', width: '100%', height: 480, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    {/* Central brain / vault */}
    <motion.div
      animate={{ scale: [1, 1.03, 1] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        width: 160, height: 160, borderRadius: '50%',
        background: 'linear-gradient(135deg, #1E3A8A, #1D4ED8, #2563EB)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 0 60px rgba(37,99,235,0.5), 0 0 120px rgba(37,99,235,0.2)',
        position: 'relative', zIndex: 3,
      }}
    >
      <Brain size={72} color="white" />
    </motion.div>

    {/* Orbit ring */}
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      style={{
        position: 'absolute', width: 280, height: 280,
        border: '1px dashed rgba(37,99,235,0.3)',
        borderRadius: '50%', zIndex: 1,
      }}
    />
    <motion.div
      animate={{ rotate: -360 }}
      transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      style={{
        position: 'absolute', width: 380, height: 380,
        border: '1px dashed rgba(6,182,212,0.2)',
        borderRadius: '50%', zIndex: 1,
      }}
    />

    {/* Lock icon at top of orbit */}
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      style={{ position: 'absolute', width: 280, height: 280, zIndex: 2 }}
    >
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        style={{
          position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)',
          width: 36, height: 36, borderRadius: '50%',
          background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <Lock size={16} color="#22C55E" />
      </motion.div>
    </motion.div>

    {/* Floating document cards */}
    <FloatingDoc icon="🛂" label="Passport · Expires 2027"   style={{ top: '8%',  left: '-5%'  }} delay={0.3} />
    <FloatingDoc icon="📋" label="PAN Card · Active"         style={{ top: '20%', right: '-8%' }} delay={0.5} />
    <FloatingDoc icon="🎓" label="Degree · 2023"             style={{ bottom:'18%', left: '-8%' }} delay={0.7} />
    <FloatingDoc icon="🏥" label="Health Insurance · Valid"  style={{ bottom:'8%', right: '-5%' }} delay={0.9} />

    {/* AI pulse lines */}
    {[0, 60, 120, 180, 240, 300].map((angle, i) => (
      <motion.div
        key={i}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: [0, 1, 0], opacity: [0, 0.5, 0] }}
        transition={{ delay: i * 0.3, duration: 1.5, repeat: Infinity, repeatDelay: 1.5 }}
        style={{
          position: 'absolute',
          width: 80, height: 1,
          background: 'linear-gradient(90deg, #2563EB, transparent)',
          transformOrigin: 'left center',
          left: '50%', top: '50%',
          transform: `rotate(${angle}deg)`,
        }}
      />
    ))}
  </div>
);

/* ─── Main Component ────────────────────────────── */
const Landing = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'Inter, sans-serif', overflowX: 'hidden' }}>

      {/* ── Sticky Navbar ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(15,23,42,0.9)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 48px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(37,99,235,0.4)' }}>
            <Brain size={20} color="white" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--text)', letterSpacing: '-0.3px' }}>Memora AI</span>
        </div>

        {/* Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {['Features', 'How it Works', 'Security'].map(link => (
            <button key={link} className="btn btn-ghost btn-sm" style={{ color: 'var(--text-muted)', fontSize: 14 }}>{link}</button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost" onClick={() => navigate('/login')}>Sign In</button>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="btn btn-primary" onClick={() => navigate('/register')}>
            Get Started <ArrowRight size={16} />
          </motion.button>
        </div>
      </nav>

      {/* ── Hero Section — Left + Right Layout ── */}
      <section style={{ padding: '80px 64px 60px', position: 'relative', overflow: 'hidden', minHeight: '88vh', display: 'flex', alignItems: 'center' }}>
        {/* Background glow */}
        <div style={{ position: 'absolute', top: 0, right: 0, width: '55%', height: '100%', background: 'radial-gradient(ellipse at center right, rgba(37,99,235,0.1) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '40%', left: '20%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center', width: '100%', maxWidth: 1200, margin: '0 auto' }}>

          {/* LEFT — Text Content */}
          <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: 'easeOut' }}>
            {/* Tag */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.3)', borderRadius: 99, padding: '6px 14px', fontSize: 13, color: '#93C5FD', marginBottom: 28 }}>
              <Sparkles size={13} />
              <span>AI-Powered Document Intelligence</span>
            </motion.div>

            {/* Heading */}
            <h1 className="text-display" style={{ marginBottom: 20, lineHeight: 1.05 }}>
              Your Digital<br />
              Memory <span className="gradient-text">for Life</span>
            </h1>

            {/* Sub */}
            <p className="text-body-lg" style={{ color: 'var(--text-muted)', maxWidth: 460, lineHeight: 1.7, marginBottom: 40 }}>
              Upload once. Never search again.<br />
              Memora AI understands, organizes, and answers questions about every document you own.
            </p>

            {/* CTA Buttons */}
            <div style={{ display: 'flex', gap: 14, marginBottom: 40, flexWrap: 'wrap' }}>
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="btn btn-primary btn-lg"
                onClick={() => navigate('/register')}
                style={{ boxShadow: 'var(--shadow-primary)' }}>
                Get Started Free <ArrowRight size={18} />
              </motion.button>
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="btn btn-secondary btn-lg"
                onClick={() => navigate('/login')}>
                <Eye size={17} /> Watch Demo
              </motion.button>
            </div>

            {/* Trust signals */}
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              {[
                { icon: <Check size={14} />, label: 'No credit card' },
                { icon: <Lock size={14} />, label: 'End-to-end encrypted' },
                { icon: <Zap size={14} />, label: 'Gemini AI powered' },
              ].map(({ icon, label }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}>
                  <span style={{ color: 'var(--success)' }}>{icon}</span>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* RIGHT — Animated AI Vault */}
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}>
            <VaultIllustration />
          </motion.div>
        </div>
      </section>

      {/* ── AI Query Demo Bar ── */}
      <section style={{ padding: '0 64px 80px', maxWidth: 700, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-card)', padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Ask Memora AI anything</span>
          </div>
          {queryExamples.map((q, i) => (
            <motion.div key={q}
              initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              onClick={() => navigate('/register')}
              style={{ padding: '11px 16px', borderRadius: 10, background: 'var(--surface-elevated)', border: '1px solid var(--border)', marginBottom: 8, fontSize: 14, color: 'var(--primary-hover)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(37,99,235,0.5)'; e.currentTarget.style.background = 'rgba(37,99,235,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface-elevated)'; }}>
              <Search size={13} color="var(--primary)" style={{ flexShrink: 0 }} />
              <span>{q}</span>
              <ChevronRight size={13} style={{ marginLeft: 'auto', opacity: 0.5 }} />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Stats Banner ── */}
      <section style={{ padding: '0 64px 80px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.08), rgba(6,182,212,0.05))', border: '1px solid rgba(37,99,235,0.15)', borderRadius: 'var(--radius-card)', padding: '32px 48px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 32, textAlign: 'center', maxWidth: 900, margin: '0 auto' }}>
          {[
            { value: '<3s',   label: 'Search time' },
            { value: '>95%',  label: 'AI accuracy' },
            { value: '100%',  label: 'Encrypted' },
            { value: '20+',   label: 'Doc types' },
            { value: 'Free',  label: 'To start' },
          ].map(({ value, label }) => (
            <div key={label}>
              <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--primary-hover)', marginBottom: 4 }}>{value}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── Features Grid ── */}
      <section style={{ padding: '80px 64px', background: 'var(--surface)' }}>
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 style={{ fontSize: 40, fontWeight: 800, marginBottom: 14, letterSpacing: '-1px' }}>
            Everything in one <span className="gradient-text">intelligent vault</span>
          </h2>
          <p className="text-body-lg" style={{ color: 'var(--text-muted)', maxWidth: 520, margin: '0 auto' }}>
            Not just storage. A smart assistant that understands every document you own.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, maxWidth: 1000, margin: '0 auto' }}>
          {features.map(({ icon: Icon, title, desc, color, bg }, i) => (
            <motion.div key={title}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="card card-hover"
              style={{ padding: 24 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                <Icon size={24} color={color} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{title}</h3>
              <p className="text-body" style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section style={{ padding: '80px 64px' }}>
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 style={{ fontSize: 40, fontWeight: 800, marginBottom: 14, letterSpacing: '-1px' }}>How it works</h2>
          <p className="text-body-lg" style={{ color: 'var(--text-muted)' }}>Three clicks or fewer to an intelligent vault</p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 40, maxWidth: 900, margin: '0 auto', position: 'relative' }}>
          {steps.map(({ num, icon: Icon, title, desc }, i) => (
            <motion.div key={num}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              style={{ textAlign: 'center', position: 'relative' }}>
              <div style={{ position: 'relative', marginBottom: 20 }}>
                <motion.div whileHover={{ scale: 1.1 }}
                  style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', boxShadow: 'var(--shadow-primary)' }}>
                  <Icon size={30} color="white" />
                </motion.div>
                <div style={{ position: 'absolute', top: -10, right: 'calc(50% - 46px)', background: 'var(--surface-elevated)', border: '2px solid var(--primary)', borderRadius: 8, padding: '2px 7px', fontSize: 10, fontWeight: 800, color: 'var(--primary-hover)', fontFamily: 'JetBrains Mono, monospace' }}>
                  {num}
                </div>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{title}</h3>
              <p className="text-body" style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Security Section ── */}
      <section style={{ padding: '80px 64px', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--success-dim)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 99, padding: '6px 14px', fontSize: 12, color: 'var(--success)', fontWeight: 600, marginBottom: 24 }}>
              <Shield size={13} /> Security First
            </div>
            <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16, letterSpacing: '-0.5px' }}>
              Your documents are<br /><span className="gradient-text">always protected</span>
            </h2>
            <p className="text-body-lg" style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 28 }}>
              Bank-grade encryption at rest and in transit. Zero-knowledge architecture. Your data is yours alone.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {['End-to-end encryption', 'JWT secured APIs', 'OTP-protected sharing', 'Auto-expiring links'].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--success-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={12} color="var(--success)" />
                  </div>
                  <span className="text-body" style={{ color: 'var(--text-secondary)' }}>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.08), rgba(37,99,235,0.08))', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 'var(--radius-card)', padding: 32 }}>
              {[
                { icon: '🔒', label: 'End-to-End Encrypted', status: 'Active' },
                { icon: '🛡️', label: 'Vault Secured', status: 'Protected' },
                { icon: '🔐', label: 'JWT Authentication', status: 'Enabled' },
                { icon: '🕐', label: 'Session Timeout', status: '7 days' },
              ].map(({ icon, label, status }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 18 }}>{icon}</span>
                    <span className="text-body" style={{ fontWeight: 500 }}>{label}</span>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600, background: 'var(--success-dim)', padding: '3px 10px', borderRadius: 99 }}>{status}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '100px 64px', textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
          style={{ maxWidth: 620, margin: '0 auto' }}>
          <div style={{ fontSize: 56, marginBottom: 20 }}>🧠</div>
          <h2 style={{ fontSize: 44, fontWeight: 800, marginBottom: 16, letterSpacing: '-1px' }}>
            Stop searching.<br /><span className="gradient-text">Start asking.</span>
          </h2>
          <p className="text-body-lg" style={{ color: 'var(--text-muted)', marginBottom: 36, lineHeight: 1.7 }}>
            Join the people who never waste time searching for their own documents again.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
              className="btn btn-primary btn-lg"
              onClick={() => navigate('/register')}
              style={{ boxShadow: 'var(--shadow-primary)' }}>
              Create Your Vault Free <ArrowRight size={18} />
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
              className="btn btn-outline btn-lg"
              onClick={() => navigate('/login')}>
              Sign In
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '28px 64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, background: 'var(--surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Brain size={18} color="var(--primary)" />
          <span style={{ fontWeight: 800, color: 'var(--text)', fontSize: 15 }}>Memora AI</span>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          {['About', 'Privacy', 'Terms', 'Contact'].map(l => (
            <a key={l} href="#" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = 'var(--text)'}
              onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>{l}</a>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Lock size={12} color="var(--success)" />
          <span style={{ fontSize: 13, color: 'var(--text-disabled)' }}>© 2024 Memora AI · Your time is worth more than a search bar.</span>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
