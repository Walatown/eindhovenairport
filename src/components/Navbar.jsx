import { useState } from 'react';

function PlaneMark({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="var(--blue)" />
      <path d="M6.6 12.2l10.9-3.7c.6-.2.9.5.4.9l-3.1 2.4 1 4.2c.1.5-.5.8-.9.4l-2-2-1.7 1.3c-.2.2-.5.1-.5-.2l-.1-2.4-3.6-.4c-.6 0-.7-.7-.3-.9z" fill="#fff" />
    </svg>
  );
}

const NAV_LINKS = ['Product', 'Live Map', 'Airlines', 'Pricing'];

export default function Navbar({ onLogin, onTracker }) {
  const [hover, setHover] = useState(null);

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      background: 'rgba(255,255,255,.82)', backdropFilter: 'blur(14px)',
      borderBottom: '1px solid var(--line)',
    }}>
      <div style={{
        maxWidth: 1180, margin: '0 auto', height: 68, padding: '0 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <PlaneMark />
          <span style={{ fontWeight: 800, fontSize: 19, letterSpacing: '-0.02em' }}>EHEH</span>
        </div>

        {/* Nav links – centered */}
        <nav style={{
          display: 'flex', alignItems: 'center', gap: 30,
          position: 'absolute', left: '50%', transform: 'translateX(-50%)',
        }}>
          {NAV_LINKS.map((l, i) => (
            <a
              key={l}
              href="#"
              onClick={e => e.preventDefault()}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                textDecoration: 'none', fontSize: 15, fontWeight: 500,
                color: hover === i ? 'var(--ink)' : '#4b5161',
                transition: 'color .15s',
              }}
            >
              {l}
              {(l === 'Product' || l === 'Live Map') && (
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none" style={{ opacity: .55 }}>
                  <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </a>
          ))}
        </nav>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={onLogin}
            style={{
              border: '1px solid var(--line)', background: '#fff',
              borderRadius: 999, padding: '9px 20px',
              fontSize: 15, fontWeight: 600, cursor: 'pointer',
              color: 'var(--ink)', fontFamily: 'var(--font)',
            }}
          >
            Login
          </button>
          <button
            onClick={onTracker}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--blue-dark)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--blue)'}
            style={{
              border: 'none', background: 'var(--blue)', color: '#fff',
              borderRadius: 999, padding: '10px 22px',
              fontSize: 15, fontWeight: 700, cursor: 'pointer',
              transition: 'background .15s', fontFamily: 'var(--font)',
            }}
          >
            Open Tracker
          </button>
        </div>
      </div>
    </header>
  );
}
