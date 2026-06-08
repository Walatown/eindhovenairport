function PlaneMark({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="var(--blue)" />
      <path d="M6.6 12.2l10.9-3.7c.6-.2.9.5.4.9l-3.1 2.4 1 4.2c.1.5-.5.8-.9.4l-2-2-1.7 1.3c-.2.2-.5.1-.5-.2l-.1-2.4-3.6-.4c-.6 0-.7-.7-.3-.9z" fill="#fff" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer style={{ background: '#fff', borderTop: '1px solid var(--line)' }}>
      <div style={{
        maxWidth: 1180, margin: '0 auto', padding: '26px 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
          <PlaneMark />
          EHEH
        </div>
        <span style={{ fontSize: 13, color: 'var(--muted)' }}>
          Live flight tracker · Eindhoven Airport (EIN / EHEH)
        </span>
        <span style={{ fontSize: 13, color: 'var(--muted)' }}>
          Powered by adsb.lol · Map © Mapbox
        </span>
      </div>
    </footer>
  );
}
