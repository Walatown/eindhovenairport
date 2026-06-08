import { useState, useEffect } from 'react';

const STATUS_COLORS = {
  'Final approach': '#19b36b',
  'Descending':     '#2f6bfe',
  'En route':       '#8b93a3',
  'Just departed':  '#f59e0b',
  'Climbing':       '#f97316',
  'Departing':      '#f59e0b',
};

function compassDir(h) {
  if (h == null) return '';
  return ['N','NE','E','SE','S','SW','W','NW'][Math.round(h / 45) % 8];
}

function vertLabel(rateMs) {
  if (rateMs == null) return null;
  const fpm = Math.round(rateMs * 196.85);
  const dir = rateMs > 0.5 ? '↑' : rateMs < -0.5 ? '↓' : '→';
  return `${dir} ${Math.abs(fpm).toLocaleString()} ft/min`;
}

function routeProgress(distKm) {
  if (distKm === null) return 0.5;
  return Math.min(0.96, Math.max(0.04, 1 - distKm / 300));
}

export default function FlightCard({ flight, mode, onClose }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if (flight) { const id = requestAnimationFrame(() => setMounted(true)); return () => cancelAnimationFrame(id); }
    setMounted(false);
  }, [!!flight]);

  if (!flight) return null;

  const sc      = STATUS_COLORS[flight.status] ?? '#8b93a3';
  const compass = compassDir(flight.heading);
  const vert    = vertLabel(flight.verticalRateMs);
  const prog    = mode === 'arrivals' ? routeProgress(flight.distanceKm) : 1 - routeProgress(flight.distanceKm);

  const depLabel = flight.departureAirport?.city ?? (mode === 'arrivals' ? '···' : 'Eindhoven');
  const depIata  = flight.departureAirport?.iata  ?? (mode === 'arrivals' ? '···' : 'EIN');
  const arrLabel = flight.arrivalAirport?.city    ?? (mode === 'arrivals' ? 'Eindhoven' : '···');
  const arrIata  = flight.arrivalAirport?.iata    ?? (mode === 'arrivals' ? 'EIN' : '···');

  const stats = [
    {
      label: 'Altitude',
      value: flight.altitudeFt != null ? flight.altitudeFt.toLocaleString() : '—',
      unit: 'ft',
    },
    {
      label: 'Ground speed',
      value: flight.velocityKmh ?? '—',
      unit: 'km/h',
    },
    {
      label: 'Heading',
      value: flight.heading != null ? `${Math.round(flight.heading)}°` : '—',
      unit: compass,
    },
    {
      label: mode === 'arrivals' ? 'ETA' : 'Distance',
      value: mode === 'arrivals' ? (flight.etaMin ?? '—') : (flight.distanceKm ?? '—'),
      unit:  mode === 'arrivals' ? 'min' : 'km',
    },
  ];

  return (
    <div style={{
      position: 'fixed',
      right: 20,
      top: '50%',
      zIndex: 90,
      width: 316,
      maxHeight: 'calc(100vh - 40px)',
      overflowY: 'auto',
      background: 'rgba(9,12,22,0.94)',
      backdropFilter: 'blur(28px)',
      border: '1px solid rgba(255,255,255,.1)',
      borderRadius: 18,
      boxShadow: '0 32px 80px rgba(0,0,0,.7), 0 0 0 0.5px rgba(255,255,255,.06) inset',
      transform: mounted ? 'translate(0, -50%)' : 'translate(calc(100% + 40px), -50%)',
      transition: 'transform .42s cubic-bezier(.22,1,.36,1)',
      willChange: 'transform',
    }}>

      {/* ── Header ── */}
      <div style={{
        padding: '16px 18px 14px',
        borderBottom: '1px solid rgba(255,255,255,.06)',
        position: 'relative',
      }}>
        {/* Close — top right, inside header */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute', top: 14, right: 14,
            width: 28, height: 28, borderRadius: 999,
            border: '1px solid rgba(255,255,255,.1)',
            background: 'rgba(255,255,255,.05)',
            color: '#3a4f6a', fontSize: 13, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font)',
          }}
        >✕</button>

        {/* Airline + status — padded away from close button */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          marginBottom: 8, paddingRight: 40,
        }}>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: '#3a4f6a' }}>
            {flight.airline ?? flight.icao24.toUpperCase()}
          </span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            fontSize: 10.5, fontWeight: 700, padding: '3px 9px', borderRadius: 999,
            color: sc, background: sc + '22',
          }}>
            <span style={{ width: 5, height: 5, borderRadius: 999, background: sc, display: 'block' }} />
            {flight.status}
          </span>
        </div>

        {/* Callsign */}
        <div style={{
          fontSize: 34, fontWeight: 800, letterSpacing: '-0.04em',
          lineHeight: 1, color: '#f0f4ff', marginBottom: 6,
        }}>
          {flight.callsign}
        </div>

        {/* ICAO24 */}
        <div style={{
          fontSize: 11, color: '#2a3650',
          fontFamily: 'monospace', letterSpacing: '.06em',
        }}>
          {flight.icao24.toUpperCase()}
        </div>
      </div>

      {/* ── Route progress ── */}
      <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Departure */}
          <div style={{ minWidth: 0, flexShrink: 0 }}>
            <div style={{
              fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em',
              color: '#f0f4ff', lineHeight: 1,
            }}>{depIata}</div>
            <div style={{
              fontSize: 10.5, color: '#3a4f6a', marginTop: 3,
              fontWeight: 500, whiteSpace: 'nowrap',
            }}>{depLabel}</div>
          </div>

          {/* Progress bar */}
          <div style={{ position: 'relative', flex: 1, height: 20, display: 'flex', alignItems: 'center' }}>
            <div style={{ position: 'absolute', left: 0, right: 0, height: 1.5, background: 'rgba(255,255,255,.1)', borderRadius: 999 }} />
            <div style={{ position: 'absolute', left: 0, width: `${prog * 100}%`, height: 1.5, background: 'rgba(47,107,254,.55)', borderRadius: 999 }} />
            <div style={{
              position: 'absolute', left: `${prog * 100}%`, top: '50%',
              transform: 'translate(-50%, -50%)',
            }}>
              <svg viewBox="0 0 24 24" width="16" height="16" style={{ transform: 'rotate(90deg)', display: 'block' }}>
                <path d="M12 1.6 13.3 9 21 13.6 21 15.7 13.3 13.4 13.1 19.2 16 21.3 16 22.6 12 21.2 8 22.6 8 21.3 10.9 19.2 10.7 13.4 3 15.7 3 13.6 10.7 9 12 1.6Z" fill="#2f6bfe" />
              </svg>
            </div>
          </div>

          {/* Arrival */}
          <div style={{ textAlign: 'right', minWidth: 0, flexShrink: 0 }}>
            <div style={{
              fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em',
              color: '#f0f4ff', lineHeight: 1,
            }}>{arrIata}</div>
            <div style={{
              fontSize: 10.5, color: '#3a4f6a', marginTop: 3,
              fontWeight: 500, whiteSpace: 'nowrap',
            }}>{arrLabel}</div>
          </div>
        </div>
      </div>

      {/* ── Stats 2×2 ── */}
      <div style={{
        padding: '14px 18px',
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
        borderBottom: vert ? '1px solid rgba(255,255,255,.06)' : 'none',
      }}>
        {stats.map(s => (
          <div key={s.label} style={{
            height: 76,
            padding: '12px 13px',
            background: 'rgba(255,255,255,.03)',
            border: '1px solid rgba(255,255,255,.06)',
            borderRadius: 12,
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <div style={{
              fontSize: 9, fontWeight: 800, letterSpacing: '.14em',
              color: '#2a3650', textTransform: 'uppercase',
            }}>
              {s.label}
            </div>
            <div style={{
              fontSize: 21, fontWeight: 800, letterSpacing: '-0.03em',
              color: '#dde4f0', lineHeight: 1,
            }}>
              {s.value}
              <span style={{ fontSize: 11, fontWeight: 600, color: '#3a4f6a', marginLeft: 3 }}>
                {s.unit}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Vertical rate ── */}
      {vert && (
        <div style={{ padding: '11px 18px 14px', fontSize: 11.5, color: '#3a4f6a', fontWeight: 500 }}>
          Vertical rate: <strong style={{ color: '#7a9abf', fontWeight: 700 }}>{vert}</strong>
        </div>
      )}
    </div>
  );
}
