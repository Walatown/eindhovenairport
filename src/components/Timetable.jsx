import { useState, useMemo } from 'react';

const ORIGINS = [
  ['Barcelona',       'BCN'], ['Alicante',      'ALC'], ['London Stansted', 'STN'],
  ['Bucharest',       'OTP'], ['Lisbon',         'LIS'], ['Málaga',          'AGP'],
  ['Faro',            'FAO'], ['Milan Bergamo',  'BGY'], ['Kraków',          'KRK'],
  ['Warsaw',          'WAW'], ['Madrid',         'MAD'], ['Vienna',          'VIE'],
  ['Budapest',        'BUD'], ['Porto',          'OPO'], ['Palma',           'PMI'],
  ['Gdańsk',          'GDN'], ['Wrocław',        'WRO'], ['Split',           'SPU'],
  ['Tenerife South',  'TFS'], ['Glasgow',        'GLA'], ['Edinburgh',       'EDI'],
];

const AIRLINES = [
  ['Ryanair', 'FR'], ['Transavia', 'HV'], ['Wizz Air', 'W6'],
  ['TUI fly', 'OR'], ['easyJet',   'EZY'], ['Jet2',    'LS'],
];

const STATUSES = [
  { label: 'On time',   color: '#19b36b' },
  { label: 'On time',   color: '#19b36b' },
  { label: 'On time',   color: '#19b36b' },
  { label: 'Boarding',  color: '#2f6bfe' },
  { label: 'Gate open', color: '#2f6bfe' },
  { label: 'Delayed',   color: '#e8a317' },
  { label: 'Last call', color: '#e2603b' },
];

function pad(n) { return n < 10 ? '0' + n : '' + n; }

function buildBoard(kind) {
  let h = 6, m = 45;
  return Array.from({ length: 12 }).map((_, i) => {
    m += 8 + Math.floor(Math.random() * 20);
    while (m >= 60) { m -= 60; h += 1; }
    const origin  = ORIGINS[(i * 3  + (kind === 'dep' ? 1 : 5)) % ORIGINS.length];
    const airline = AIRLINES[(i      + (kind === 'dep' ? 0 : 2)) % AIRLINES.length];
    const status  = STATUSES[(i * 2  + (kind === 'dep' ? 0 : 3)) % STATUSES.length];
    return {
      time:    pad(h) + ':' + pad(m),
      city:    origin[0],
      iata:    origin[1],
      flight:  airline[1] + ' ' + (1000 + ((i * 737 + (kind === 'dep' ? 11 : 521)) % 8000)),
      airline: airline[0],
      gate:    kind === 'dep'
        ? (i % 2 === 0 ? 'Gate ' + (1 + (i % 8)) : '—')
        : 'Belt ' + (1 + (i % 4)),
      status,
    };
  });
}

function PlaneIcon({ flip }) {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" style={{ transform: flip ? 'scaleY(-1)' : 'none', flexShrink: 0 }}>
      <path d="M3.5 19h17M5 14.5l4.5.6 3-5.1c.4-.7 1.3-.9 2-.5.6.4.8 1.2.5 1.9l-1.8 3.9 3.6.5 1.3-1.9 1.4.2-1 3.4L5 16.4z" fill="currentColor" />
    </svg>
  );
}

export default function Timetable() {
  const [tab,  setTab]  = useState('arr');
  const [open, setOpen] = useState(true);
  const boards = useMemo(() => ({ arr: buildBoard('arr'), dep: buildBoard('dep') }), []);
  const rows   = boards[tab];

  const dateLabel = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  return (
    <section style={{
      background: 'linear-gradient(180deg,#eef3fb 0%,#f7f9fd 100%)',
      padding: '84px 28px 96px',
      display: 'flex', justifyContent: 'center',
    }}>
      <div style={{ width: '100%', maxWidth: 1000 }}>

        {/* Section heading */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 26, gap: 20, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.16em', color: 'var(--blue)', marginBottom: 10 }}>LIVE BOARD</div>
            <h2 style={{ fontSize: 42, fontWeight: 800, letterSpacing: '-0.035em', color: 'var(--ink)', lineHeight: 1 }}>Today at Eindhoven</h2>
            <div style={{ fontSize: 16, color: 'var(--muted)', marginTop: 10, fontWeight: 500 }}>{dateLabel}</div>
          </div>
          <button
            onClick={() => setOpen(v => !v)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              border: '1px solid var(--line)', background: '#fff', borderRadius: 999,
              padding: '11px 20px', fontSize: 14.5, fontWeight: 700,
              color: 'var(--ink)', cursor: 'pointer', fontFamily: 'var(--font)',
              boxShadow: '0 1px 2px rgba(16,24,40,.05)',
            }}
          >
            {open ? 'Hide board' : 'Show board'}
            <span style={{ fontSize: 18, lineHeight: 1, transition: 'transform .3s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', color: 'var(--muted)' }}>⌄</span>
          </button>
        </div>

        {/* Collapsible body */}
        <div style={{ display: 'grid', gridTemplateRows: open ? '1fr' : '0fr', transition: 'grid-template-rows .4s cubic-bezier(.22,1,.36,1)', opacity: open ? 1 : 0 }}>
          <div style={{ overflow: 'hidden' }}>

            {/* Arrivals / Departures segmented toggle */}
            <div style={{ display: 'flex', gap: 6, background: '#e6ecf6', borderRadius: 16, padding: 6, marginBottom: 18 }}>
              {[
                { k: 'arr', label: 'Arrivals',   flip: true  },
                { k: 'dep', label: 'Departures', flip: false },
              ].map(t => {
                const active = tab === t.k;
                return (
                  <button
                    key={t.k}
                    onClick={() => setTab(t.k)}
                    style={{
                      flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                      padding: '15px 0', background: active ? 'var(--blue)' : 'transparent',
                      border: 'none', borderRadius: 11, fontSize: 16.5, fontWeight: 700,
                      cursor: 'pointer', fontFamily: 'var(--font)', letterSpacing: '-0.01em',
                      color: active ? '#fff' : '#6b7280',
                      transition: 'background .2s, color .2s, box-shadow .2s',
                      boxShadow: active ? '0 8px 20px rgba(47,107,254,.32)' : 'none',
                    }}
                  >
                    <PlaneIcon flip={t.flip} />
                    {t.label}
                  </button>
                );
              })}
            </div>

            {/* Board */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Header row */}
              <div style={{
                display: 'grid', gridTemplateColumns: '84px 1.5fr 1fr 170px', gap: 20,
                padding: '4px 24px 6px', fontSize: 11.5, fontWeight: 800,
                letterSpacing: '.09em', textTransform: 'uppercase', color: '#9aa3b4',
              }}>
                <span>Time</span>
                <span>{tab === 'dep' ? 'Destination' : 'Origin'}</span>
                <span>Flight</span>
                <span style={{ textAlign: 'right' }}>Status</span>
              </div>

              {/* Data rows */}
              {rows.map((r, i) => (
                <div
                  key={i}
                  className="tt-row"
                  style={{
                    display: 'grid', gridTemplateColumns: '84px 1.5fr 1fr 170px', gap: 20,
                    alignItems: 'center', background: '#fff',
                    border: '1px solid #e4e9f1', borderLeft: '4px solid transparent', borderRadius: 16,
                    padding: '18px 24px', cursor: 'default', fontFamily: 'var(--font)',
                    transition: 'box-shadow .16s, transform .16s, border-color .16s',
                    boxShadow: '0 1px 2px rgba(16,24,40,.04)',
                  }}
                >
                  <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>{r.time}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 9 }}>
                    <span style={{ fontSize: 21, fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--blue)' }}>{r.city}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#aeb6c6', letterSpacing: '.02em' }}>{r.iata}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums' }}>{r.flight}</span>
                    <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 500 }}>{r.airline}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 7 }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      fontSize: 12.5, fontWeight: 700, padding: '5px 11px', borderRadius: 999,
                      color: r.status.color,
                      background: r.status.color + '18',
                      whiteSpace: 'nowrap',
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: 999, background: r.status.color, display: 'block' }} />
                      {r.status.label}
                    </span>
                    <span className="tt-track" style={{ fontSize: 12.5, color: 'var(--blue)', fontWeight: 700, opacity: 0, transition: 'opacity .16s', whiteSpace: 'nowrap' }}>
                      Track on map →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
