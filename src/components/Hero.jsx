export default function Hero({ onTracker }) {
  return (
    <section style={{
      paddingTop: 150, paddingBottom: 80,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      textAlign: 'center', position: 'relative', background: 'var(--bg)',
    }}>
      {/* "NOW BOARDING" badge */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 10,
        border: '1px solid var(--line)', borderRadius: 999,
        padding: '7px 16px 7px 12px', marginBottom: 30,
        boxShadow: '0 1px 2px rgba(16,24,40,.04)',
      }}>
        <span style={{
          width: 7, height: 7, borderRadius: 999, background: '#19b36b',
          boxShadow: '0 0 0 3px rgba(25,179,107,.18)', display: 'block',
        }} />
        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.09em', color: 'var(--blue)' }}>
          NOW BOARDING
        </span>
        <span style={{ fontSize: 13, color: 'var(--muted)' }}>Live data · EHEH / EIN</span>
      </div>

      {/* Headline */}
      <h1 style={{
        fontSize: 76, lineHeight: 1.02, fontWeight: 800,
        letterSpacing: '-0.035em', margin: '4px 0 0',
      }}>
        <span style={{ color: 'var(--blue)' }}>Track every flight.</span>
        <br />
        <span style={{ color: '#aeb4c0' }}>In real time.</span>
      </h1>

      {/* Subtext */}
      <p style={{
        marginTop: 26, fontSize: 21, lineHeight: 1.5,
        color: '#5b6172', maxWidth: 560, fontWeight: 400,
      }}>
        Live flights to and from Eindhoven Airport,
        <br />
        powered by adsb.lol.
      </p>

      {/* CTA */}
      <button
        onClick={onTracker}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--blue-dark)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'var(--blue)';      e.currentTarget.style.transform = 'translateY(0)'; }}
        style={{
          marginTop: 38, border: 'none', background: 'var(--blue)', color: '#fff',
          borderRadius: 999, padding: '16px 36px', fontSize: 17, fontWeight: 700,
          cursor: 'pointer', boxShadow: '0 10px 24px rgba(47,107,254,.32)',
          transition: 'background .15s, transform .15s', fontFamily: 'var(--font)',
        }}
      >
        Open Tracker
      </button>

      {/* Scroll hint */}
      <div style={{
        marginTop: 56, display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 8, fontSize: 13,
        color: 'var(--muted)', letterSpacing: '.02em',
      }}>
        <span>Scroll to descend</span>
        <span style={{ fontSize: 18, animation: 'ehbob 1.6s ease-in-out infinite' }}>↓</span>
      </div>
    </section>
  );
}
