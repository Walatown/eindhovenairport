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

export default function FlightCard({ flight, mode, onClose, flights = [] }) {
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

  const allStats = [
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
      label: mode === 'arrivals' ? 'Arrival time' : 'Distance',
      value: mode === 'arrivals' ? (flight.etaMin ?? '—') : (flight.distanceKm ?? '—'),
      unit:  mode === 'arrivals' ? 'min' : 'km',
    },
  ];

  const stats = mode === 'arrivals' ? [allStats[0], allStats[1], allStats[3]] : allStats.slice(0, 3);

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


      {/* ── Stats 3-column ── */}
      <div style={{
        padding: '18px',
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10,
        borderBottom: vert ? '1px solid rgba(255,255,255,.06)' : 'none',
      }}>
        {stats.slice(0, 3).map(s => (
          <div key={s.label} style={{
            padding: '16px 14px',
            background: 'rgba(255,255,255,.02)',
            border: '1px solid rgba(255,255,255,.08)',
            borderRadius: 12,
            display: 'flex', flexDirection: 'column', justifyContent: 'flex-start',
          }}>
            <div style={{
              fontSize: 8.5, fontWeight: 800, letterSpacing: '.14em',
              color: '#3a4f6a', textTransform: 'uppercase', marginBottom: 10,
            }}>
              {s.label}
            </div>
            <div style={{
              fontSize: 20, fontWeight: 800, letterSpacing: '-0.03em',
              color: '#f0f4ff', lineHeight: 1,
            }}>
              {s.value}
              <span style={{ fontSize: 10, fontWeight: 600, color: '#3a4f6a', marginLeft: 3 }}>
                {s.unit}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Flights list ── */}
      {flights.length > 0 && (
        <div style={{ padding: '14px 18px' }}>
          <div style={{
            fontSize: 9, fontWeight: 800, letterSpacing: '.14em',
            color: '#2a3650', textTransform: 'uppercase', marginBottom: 12,
          }}>
            {mode === 'arrivals' ? 'Inbound to EIN' : 'Outbound from EIN'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {flights.map(f => (
              <div key={f.icao24} style={{
                padding: '10px 0',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                borderBottom: '1px solid rgba(255,255,255,.04)',
                fontSize: 11, color: '#dde4f0',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: 999,
                    background: STATUS_COLORS[f.status] ?? '#8b93a3',
                    flexShrink: 0,
                  }} />
                  <span style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{f.callsign}</span>
                  <span style={{ color: '#3a4f6a', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {f.arrivalAirport?.city || f.departureAirport?.city || '—'} {f.arrivalAirport?.iata || f.departureAirport?.iata}
                  </span>
                </div>
                <span style={{ color: '#3a4f6a', flexShrink: 0, marginLeft: 8 }}>
                  {mode === 'arrivals' ? (f.etaMin ?? '—') + ' min' : (f.distanceKm ?? '—') + ' km'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
