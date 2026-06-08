import { useState } from 'react';

function PlaneMark({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="var(--blue)" />
      <path d="M6.6 12.2l10.9-3.7c.6-.2.9.5.4.9l-3.1 2.4 1 4.2c.1.5-.5.8-.9.4l-2-2-1.7 1.3c-.2.2-.5.1-.5-.2l-.1-2.4-3.6-.4c-.6 0-.7-.7-.3-.9z" fill="#fff" />
    </svg>
  );
}

export default function LoginModal({ open, onClose }) {
  const [email, setEmail] = useState('');
  const [pw,    setPw]    = useState('');
  const [err,   setErr]   = useState('');

  if (!open) return null;

  const submit = e => {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return setErr('Enter a valid email address.');
    if (pw.length < 6)                               return setErr('Password must be at least 6 characters.');
    setErr('');
    onClose();
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(10,14,22,.5)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'ehfade .2s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'relative', width: 400, background: '#fff',
          borderRadius: 22, padding: '34px 32px',
          boxShadow: '0 40px 90px rgba(0,0,0,.3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 18 }}>
          <PlaneMark />
          <span style={{ fontWeight: 800, fontSize: 19, letterSpacing: '-0.02em' }}>EHEH</span>
        </div>
        <h3 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em' }}>Welcome back</h3>
        <p style={{ fontSize: 15, color: 'var(--muted)', marginTop: 6, marginBottom: 22 }}>
          Sign in to your flight-tracking dashboard.
        </p>

        <form onSubmit={submit}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 7, marginTop: 14 }}>Email</label>
          <input
            style={{ width: '100%', border: '1px solid var(--line)', borderRadius: 11, padding: '12px 14px', fontSize: 15, fontFamily: 'var(--font)', outline: 'none', boxSizing: 'border-box' }}
            type="text" value={email} placeholder="you@example.com"
            onChange={e => setEmail(e.target.value)} autoFocus
          />
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 7, marginTop: 14 }}>Password</label>
          <input
            style={{ width: '100%', border: '1px solid var(--line)', borderRadius: 11, padding: '12px 14px', fontSize: 15, fontFamily: 'var(--font)', outline: 'none', boxSizing: 'border-box' }}
            type="password" value={pw} placeholder="••••••••"
            onChange={e => setPw(e.target.value)}
          />
          {err && <div style={{ color: '#e23b3b', fontSize: 13, marginTop: 12, fontWeight: 600 }}>{err}</div>}
          <button
            type="submit"
            style={{ width: '100%', marginTop: 22, border: 'none', background: 'var(--blue)', color: '#fff', borderRadius: 11, padding: 14, fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)' }}
          >
            Sign in
          </button>
        </form>

        <button
          onClick={onClose}
          style={{ position: 'absolute', top: 18, right: 18, border: 'none', background: 'transparent', fontSize: 16, color: 'var(--muted)', cursor: 'pointer' }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
