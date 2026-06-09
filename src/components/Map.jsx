import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { useFlights } from '../hooks/useFlights';
import FlightCard from './FlightCard';
import { AIRPORT_COORDS } from '../data/airports';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const hasMapboxToken = Boolean(MAPBOX_TOKEN && MAPBOX_TOKEN !== 'your_mapbox_token_here');

mapboxgl.accessToken = MAPBOX_TOKEN || '';

// ── Constants ─────────────────────────────────────────────────────────────────
const EIN = [5.3745, 51.4501];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp  = (a, b, t) => a + (b - a) * t;
const ease  = (t) => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2;

const PLANE_SVG = `<svg viewBox="0 0 24 24" width="26" height="26">
  <path d="M12 1.6 13.3 9 21 13.6 21 15.7 13.3 13.4 13.1 19.2 16 21.3 16 22.6 12 21.2 8 22.6 8 21.3 10.9 19.2 10.7 13.4 3 15.7 3 13.6 10.7 9 12 1.6Z"
    fill="#2f6bfe" stroke="#fff" stroke-width="1.1" stroke-linejoin="round"/>
</svg>`;

const STATUS_COLORS = {
  'Final approach': '#19b36b',
  'Descending':     '#2f6bfe',
  'En route':       '#8b93a3',
  'Just departed':  '#f59e0b',
  'Climbing':       '#f97316',
  'Departing':      '#f59e0b',
};

function statusColor(s) { return STATUS_COLORS[s] ?? '#8b93a3'; }

// White dot marker for non-EIN airports (shown when a flight is selected)
function makeApEl(city, iata) {
  const el = document.createElement('div');
  el.style.cssText = 'position:relative;width:0;height:0;';
  const label = city ? `${city} · ${iata}` : iata;
  el.innerHTML =
    '<span style="position:absolute;left:-5px;top:-5px;width:10px;height:10px;border-radius:50%;' +
    'background:#fff;border:2px solid rgba(200,212,234,.45);box-shadow:0 0 0 1px rgba(0,0,0,.3);display:block"></span>' +
    `<span style="position:absolute;left:12px;top:-11px;white-space:nowrap;background:rgba(9,12,22,.85);` +
    `color:#dde4f0;font:600 11px/1 var(--font);padding:5px 9px;border-radius:7px;` +
    `border:1px solid rgba(255,255,255,.1)">${label}</span>`;
  return el;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function etaToTime(etaMin) {
  if (!etaMin) return '—';
  const d = new Date(Date.now() + etaMin * 60 * 1000);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function fmtAlt(ft) {
  if (!ft) return '—';
  return ft >= 1000 ? `FL${Math.round(ft / 100)}` : `${ft.toLocaleString()} ft`;
}

// ── Side flight panel ─────────────────────────────────────────────────────────
function FlightPanel({ flights, mode, loading, selectedId, onSelect, opacity }) {
  const sorted = mode === 'arrivals'
    ? [...flights].sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999))
    : [...flights].sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));

  const dateLabel = new Date().toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short',
  });

  // col widths: city | airline | flight | time
  const COLS = '1.45fr 1.1fr 0.95fr 48px';

  return (
    <div style={{
      position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)',
      width: 316,
      background: 'rgba(9,12,22,0.86)', backdropFilter: 'blur(26px)',
      border: '1px solid rgba(255,255,255,.08)', borderRadius: 18,
      overflow: 'hidden',
      boxShadow: '0 28px 70px rgba(0,0,0,.6), 0 0 0 0.5px rgba(255,255,255,.04) inset',
      opacity, transition: 'opacity .25s',
      pointerEvents: opacity > 0.5 ? 'auto' : 'none',
    }}>

      {/* ── Header ── */}
      <div style={{ padding: '15px 18px 13px', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 15.5, fontWeight: 800, letterSpacing: '-0.025em', color: '#f0f4ff' }}>
              {mode === 'arrivals' ? 'Arrivals' : 'Departures'}
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#2f6bfe', letterSpacing: '.02em' }}>EIN</span>
          </div>
          <span style={{ fontSize: 11, color: '#2e3a50', fontWeight: 600 }}>{dateLabel}</span>
        </div>
        <div style={{ fontSize: 11, color: '#2e3a50', fontWeight: 500, marginTop: 5 }}>
          {loading ? 'Fetching…' : `${flights.length} ${flights.length === 1 ? 'flight' : 'flights'} tracked`}
        </div>
      </div>

      {/* ── Column headers ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: COLS, alignItems: 'center',
        padding: '7px 18px',
        background: 'rgba(255,255,255,.02)',
        borderBottom: '1px solid rgba(255,255,255,.05)',
        gap: 10,
      }}>
        {[
          mode === 'arrivals' ? 'FROM' : 'TO',
          'AIRLINE',
          'FLIGHT',
          mode === 'arrivals' ? 'LANDS' : 'ALT',
        ].map((h, i) => (
          <span key={h} style={{
            fontSize: 9, fontWeight: 800, letterSpacing: '.14em', color: '#2a3650',
            textAlign: i === 3 ? 'right' : 'left',
          }}>{h}</span>
        ))}
      </div>

      {/* ── Rows ── */}
      <div style={{ maxHeight: 368, overflowY: 'auto' }}>
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 18px', color: '#2e3a50', fontSize: 12 }}>
            <div className="ein-spin" />
            Fetching live data…
          </div>
        )}
        {!loading && sorted.length === 0 && (
          <p style={{ fontSize: 12, color: '#2a3650', padding: '16px 18px', margin: 0 }}>No aircraft tracked.</p>
        )}
        {sorted.map((f, idx) => {
          const isSel = f.icao24 === selectedId;
          const showStatus = f.status && f.status !== 'En route';
          const sc = showStatus ? statusColor(f.status) : null;

          const city = mode === 'arrivals'
            ? (f.departureAirport?.city ?? f.departureAirport?.iata ?? '—')
            : (f.arrivalAirport?.city   ?? f.arrivalAirport?.iata   ?? '—');

          const timeCell = mode === 'arrivals'
            ? etaToTime(f.etaMin)
            : fmtAlt(f.altitudeFt);

          return (
            <div
              key={f.icao24}
              onClick={() => onSelect(f)}
              style={{
                display: 'grid', gridTemplateColumns: COLS, alignItems: 'center',
                gap: 10, padding: '11px 18px', cursor: 'pointer',
                background: isSel ? 'rgba(47,107,254,.09)' : 'transparent',
                borderLeft: `2px solid ${isSel ? 'var(--blue)' : 'transparent'}`,
                borderBottom: idx < sorted.length - 1 ? '1px solid rgba(255,255,255,.04)' : 'none',
                transition: 'background .15s',
              }}
            >
              {/* City */}
              <div style={{ overflow: 'hidden' }}>
                <div style={{
                  fontSize: 13, fontWeight: 700, color: '#dde4f0',
                  letterSpacing: '-0.01em', whiteSpace: 'nowrap',
                  overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {city}
                </div>
                {showStatus && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2.5 }}>
                    <span style={{ width: 4, height: 4, borderRadius: 999, background: sc, flexShrink: 0 }} />
                    <span style={{ fontSize: 10, color: sc, fontWeight: 600, letterSpacing: '.01em' }}>{f.status}</span>
                  </div>
                )}
              </div>

              {/* Airline */}
              <div style={{
                fontSize: 11, color: '#3a4f6a', fontWeight: 600,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {f.airline ?? '—'}
              </div>

              {/* Flight */}
              <div style={{
                fontSize: 11.5, fontWeight: 700, color: '#5a7aa8',
                fontVariantNumeric: 'tabular-nums', letterSpacing: '.02em',
              }}>
                {f.callsign}
              </div>

              {/* Time / Altitude */}
              <div style={{
                fontSize: 13, fontWeight: 800, color: '#c6d4ea',
                textAlign: 'right', fontVariantNumeric: 'tabular-nums',
                letterSpacing: '.01em',
              }}>
                {timeCell}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Mode toggle ───────────────────────────────────────────────────────────────
function ModeToggle({ mode, onChange, opacity }) {
  return (
    <div style={{
      position: 'absolute', top: 22, left: '50%', transform: 'translateX(-50%)',
      display: 'flex', borderRadius: 12,
      background: 'rgba(9,12,22,0.82)', backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,.09)',
      overflow: 'hidden',
      boxShadow: '0 8px 28px rgba(0,0,0,.4)',
      opacity, transition: 'opacity .25s',
      pointerEvents: opacity > 0.5 ? 'auto' : 'none',
    }}>
      {[
        { key: 'arrivals',   label: 'Arrivals',   icon: '↙' },
        { key: 'departures', label: 'Departures', icon: '↗' },
      ].map(t => {
        const active = mode === t.key;
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 22px', border: 'none', cursor: 'pointer',
              background: active ? 'var(--blue)' : 'transparent',
              color: active ? '#fff' : '#3a4f6a',
              fontSize: 13.5, fontWeight: 700, fontFamily: 'var(--font)',
              transition: 'background .2s, color .2s',
            }}
          >
            <span>{t.icon}</span>{t.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function MapSection() {
  const sectionRef   = useRef(null);
  const mapEl        = useRef(null);
  const mapRef       = useRef(null);
  const markerRef    = useRef(null);
  const markersRef   = useRef({});
  const selectedRef  = useRef(null);
  const apMarkersRef = useRef([]);
  const userPannedRef = useRef(false);

  const [mode, setMode]           = useState('arrivals');
  const [selected, setSelected]   = useState(null);
  const [progress, setProgress]   = useState(0);
  const [ready, setReady]         = useState(false);

  const { flights, loading } = useFlights(mode);

  // Keep selectedRef in sync for use inside rAF / event handlers
  useEffect(() => { selectedRef.current = selected?.icao24 ?? null; }, [selected]);

  // ── Init map ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!hasMapboxToken) return;
    if (!mapEl.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapEl.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: EIN,
      zoom: 1.55,
      pitch: 0,
      bearing: 18,
      projection: 'globe',
      attributionControl: { compact: true },
    });
    mapRef.current = map;

    map.scrollZoom.disable();
    map.doubleClickZoom.disable();
    map.boxZoom.disable();
    map.keyboard.disable();

    map.on('style.load', () => {
      map.setFog({
        color:              'rgb(10, 10, 20)',
        'high-color':       'rgb(20, 30, 60)',
        'horizon-blend':     0.04,
        'space-color':      'rgb(5, 5, 15)',
        'star-intensity':    0.6,
        'atmosphere-blend': ['interpolate', ['linear'], ['zoom'], 0, 1, 6, 0.4, 10, 0],
      });

      // 3-D buildings (visible once zoomed in)
      const layers     = map.getStyle().layers;
      const labelLayer = layers.find(l => l.type === 'symbol' && l.layout?.['text-field']);
      map.addLayer({
        id: '3d-buildings', source: 'composite', 'source-layer': 'building',
        filter: ['==', 'extrude', 'true'], type: 'fill-extrusion', minzoom: 12,
        paint: {
          'fill-extrusion-color':   '#1a1b2e',
          'fill-extrusion-height':  ['get', 'height'],
          'fill-extrusion-base':    ['get', 'min_height'],
          'fill-extrusion-opacity': 0.8,
        },
      }, labelLayer?.id);

      // Route line sources — two segments: flown (blue) and remaining (grey)
      const emptyLine = { type: 'Feature', geometry: { type: 'LineString', coordinates: [] } };
      map.addSource('route-remaining', { type: 'geojson', data: emptyLine });
      map.addSource('route-flown',     { type: 'geojson', data: emptyLine });
      map.addLayer({
        id: 'route-remaining', type: 'line', source: 'route-remaining',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#5c6880', 'line-width': 4.5, 'line-opacity': 0.65 },
      });
      map.addLayer({
        id: 'route-flown', type: 'line', source: 'route-flown',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#2f6bfe', 'line-width': 3.5, 'line-opacity': 0.9 },
      });

      // Pulsing airport marker
      const el = document.createElement('div');
      el.className = 'ein-marker';
      el.innerHTML = '<span class="ein-pulse"></span><span class="ein-core"></span><span class="ein-label">EIN · Eindhoven Airport</span>';
      markerRef.current = new mapboxgl.Marker({ element: el })
        .setLngLat(EIN)
        .addTo(map);

      // User manually dragged the map — release scroll-driven camera control
      map.on('dragstart', () => { userPannedRef.current = true; });

      // Deselect on map click
      map.on('click', () => {
        Object.values(markersRef.current).forEach(m => m.el?.classList?.remove('sel'));
        setSelected(null);
        clearRoute(map);
        apMarkersRef.current.forEach(m => m.remove());
        apMarkersRef.current = [];
      });

      setReady(true);
    });

    return () => {
      Object.values(markersRef.current).forEach(m => m.marker?.remove());
      markerRef.current?.remove();
      apMarkersRef.current.forEach(m => m.remove());
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // ── Sync plane markers with real flight data ──────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    const currentIds = new Set(flights.map(f => f.icao24));

    // Remove stale markers
    Object.keys(markersRef.current).forEach(id => {
      if (!currentIds.has(id)) {
        markersRef.current[id].marker.remove();
        delete markersRef.current[id];
      }
    });

    // Add / update markers
    flights.forEach(f => {
      if (markersRef.current[f.icao24]) {
        const { marker, el } = markersRef.current[f.icao24];
        marker.setLngLat([f.longitude, f.latitude]);
        const icon = el.querySelector('.pl-icon');
        if (icon) icon.style.transform = `rotate(${f.heading ?? 0}deg)`;
        // Update route if this is the selected flight
        if (selectedRef.current === f.icao24) updateRoute(map, f);
        return;
      }

      // Create new 3-D plane marker
      const el = document.createElement('div');
      el.className = 'plane3d';
      el.innerHTML =
        '<div class="pl-shadow"></div>' +
        '<div class="pl-stalk"></div>' +
        '<div class="pl-lift">' +
          '<span class="pl-ring"></span>' +
          '<span class="pl-icon">' + PLANE_SVG + '</span>' +
        '</div>' +
        '<div class="pl-tag"></div>';

      el.querySelector('.pl-tag').textContent = f.callsign;
      el.querySelector('.pl-icon').style.transform = `rotate(${f.heading ?? 0}deg)`;

      el.addEventListener('click', ev => {
        ev.stopPropagation();
        Object.values(markersRef.current).forEach(m => m.el?.classList?.remove('sel'));
        el.classList.add('sel');
        setSelected(f);
        updateRoute(map, f);
        // Show white dot markers at route endpoint airports
        apMarkersRef.current.forEach(m => m.remove());
        apMarkersRef.current = [];
        for (const ap of [f.departureAirport, f.arrivalAirport]) {
          if (!ap?.iata || ap.iata === 'EIN') continue;
          const coords = AIRPORT_COORDS[ap.iata.toUpperCase()];
          if (!coords) continue;
          apMarkersRef.current.push(
            new mapboxgl.Marker({ element: makeApEl(ap.city, ap.iata) }).setLngLat(coords).addTo(map)
          );
        }
        // Smooth center on selected aircraft
        if (f.latitude != null && f.longitude != null) {
          map.easeTo({ center: [f.longitude, f.latitude], duration: 900 });
        }
      });

      const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
        .setLngLat([f.longitude, f.latitude])
        .addTo(map);

      markersRef.current[f.icao24] = { marker, el };
    });

    // Update selected flight's route and data
    if (selectedRef.current) {
      const live = flights.find(f => f.icao24 === selectedRef.current);
      if (live) {
        setSelected(live);
        updateRoute(map, live);
      }
    }
  }, [flights, ready]);

  // Opacity of markers follows scroll progress
  useEffect(() => {
    const op = clamp((progress - 0.55) / 0.3, 0, 1);
    Object.values(markersRef.current).forEach(({ el }) => {
      if (el) { el.style.opacity = op; el.style.pointerEvents = op > 0.5 ? 'auto' : 'none'; }
    });
  }, [progress]);

  // Opacity of airport marker
  useEffect(() => {
    if (markerRef.current) {
      const op = clamp((progress - 0.45) / 0.3, 0, 1);
      markerRef.current.getElement().style.opacity = op;
    }
  }, [progress]);

  // ── Scroll → progress ────────────────────────────────────────────────────
  const onScroll = useCallback(() => {
    const sec = sectionRef.current;
    if (!sec) return;
    const rect  = sec.getBoundingClientRect();
    const total = sec.offsetHeight - window.innerHeight;
    setProgress(clamp(-rect.top / total, 0, 1));
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [onScroll]);

  // ── Progress → camera ────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    // When the user scrolls back to the globe view, reset the panned flag so
    // the scroll-driven animation can run again on the next descent.
    if (progress < 0.3) userPannedRef.current = false;

    // A flight is selected OR the user has manually dragged the map — hand
    // full camera control to the user and never call jumpTo again until reset.
    if (selectedRef.current || userPannedRef.current) {
      map.dragPan.enable();
      map.scrollZoom.enable();
      return;
    }

    // Below threshold the scroll animation owns the camera.
    if (progress >= 0.85) {
      map.dragPan.enable();
      if (progress >= 0.985) map.scrollZoom.enable();
      return;
    }

    map.dragPan.disable();
    map.scrollZoom.disable();
    const e = ease(progress);
    map.jumpTo({
      center:  EIN,
      zoom:    lerp(1.55, 13.2, e),
      pitch:   lerp(0, 52, clamp((progress - 0.55) / 0.45, 0, 1)),
      bearing: lerp(18, -12, e),
    });
  }, [progress, ready]);

  // ── Derived opacities ────────────────────────────────────────────────────
  const captionOpacity = clamp(1 - progress / 0.28, 0, 1);
  // Panel appears as soon as the caption is gone (~0.3) so Arrivals/Departures
  // UI is visible throughout the zoom-in animation.
  const panelOpacity   = clamp((progress - 0.32) / 0.18, 0, 1);

  // ── Mode change ──────────────────────────────────────────────────────────
  const handleModeChange = (m) => {
    setMode(m);
    setSelected(null);
    if (mapRef.current) clearRoute(mapRef.current);
  };

  return (
    <section
      ref={sectionRef}
      style={{ height: '320vh', position: 'relative', background: '#05070f' }}
    >
      <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}>
        {/* Map canvas */}
        <div ref={mapEl} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />

        {/* Vignette */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', boxShadow: 'inset 0 0 220px 40px rgba(0,0,0,.55)' }} />

        {/* Caption — fades as you scroll */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, paddingTop: 80,
          textAlign: 'center', color: '#fff', pointerEvents: 'none',
          opacity: captionOpacity, transform: `translateY(${captionOpacity ? 0 : -12}px)`,
          transition: 'opacity .2s, transform .3s',
        }}>
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.22em', color: '#9cc0ff', marginBottom: 14 }}>
            3D · GLOBE VIEW
          </div>
          <h2 style={{ fontSize: 44, fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.08, textShadow: '0 2px 30px rgba(0,0,0,.55)' }}>
            Keep scrolling to descend<br />into Eindhoven.
          </h2>
        </div>

        {/* Scroll progress rail */}
        <div style={{ position: 'absolute', left: 24, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: 14, pointerEvents: 'none' }}>
          <div style={{ position: 'relative', width: 3, height: 160 }}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,.18)', borderRadius: 999 }} />
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: `${progress * 100}%`, background: 'var(--blue)', borderRadius: 999, transition: 'height .1s' }} />
            <div style={{
              position: 'absolute', left: '50%', top: `${clamp(progress, 0, 1) * 100}%`,
              transform: 'translate(-50%, -50%)',
              width: 10, height: 10, borderRadius: 999,
              background: '#fff', boxShadow: '0 0 0 2.5px var(--blue)',
              transition: 'top .1s',
            }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: 160 }}>
            <span style={{
              fontSize: 10, fontWeight: 800, letterSpacing: '.13em', textTransform: 'uppercase',
              color: '#fff', opacity: clamp(1 - progress / 0.35, 0.3, 1), transition: 'opacity .3s',
            }}>Orbit</span>
            <span style={{
              fontSize: 10, fontWeight: 800, letterSpacing: '.13em', textTransform: 'uppercase',
              color: '#fff', opacity: clamp((progress - 0.5) / 0.3, 0.3, 1), transition: 'opacity .3s',
            }}>Eindhoven</span>
          </div>
        </div>

        {/* Mode toggle */}
        <ModeToggle mode={mode} onChange={handleModeChange} opacity={panelOpacity} />

        {/* Side flight panel */}
        <FlightPanel
          flights={flights}
          mode={mode}
          loading={loading}
          selectedId={selected?.icao24}
          onSelect={f => {
            setSelected(prev => prev?.icao24 === f.icao24 ? null : f);
            if (mapRef.current) {
              const map = mapRef.current;
              const deselecting = selected?.icao24 === f.icao24;
              Object.values(markersRef.current).forEach(m => m.el?.classList?.remove('sel'));
              if (!deselecting) {
                markersRef.current[f.icao24]?.el?.classList?.add('sel');
                updateRoute(map, f);
                // Airport endpoint markers
                apMarkersRef.current.forEach(m => m.remove());
                apMarkersRef.current = [];
                for (const ap of [f.departureAirport, f.arrivalAirport]) {
                  if (!ap?.iata || ap.iata === 'EIN') continue;
                  const coords = AIRPORT_COORDS[ap.iata.toUpperCase()];
                  if (!coords) continue;
                  apMarkersRef.current.push(
                    new mapboxgl.Marker({ element: makeApEl(ap.city, ap.iata) }).setLngLat(coords).addTo(map)
                  );
                }
                // Smooth center on selected aircraft
                if (f.latitude != null && f.longitude != null) {
                  map.easeTo({ center: [f.longitude, f.latitude], duration: 900 });
                }
              } else {
                clearRoute(map);
                apMarkersRef.current.forEach(m => m.remove());
                apMarkersRef.current = [];
              }
            }
          }}
          opacity={selected ? 0 : panelOpacity}
        />

        {!hasMapboxToken && (
          <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, color: '#cdd6ea', fontSize: 14, fontWeight: 500, textAlign: 'center', maxWidth: 360, padding: '0 24px' }}>
            <strong style={{ color: '#f0f4ff', fontSize: 16 }}>Map unavailable</strong>
            <span>Add a public Mapbox token to enable the live globe.</span>
          </div>
        )}

        {/* Loading overlay */}
        {hasMapboxToken && !ready && (
          <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', display: 'flex', alignItems: 'center', gap: 12, color: '#cdd6ea', fontSize: 14, fontWeight: 500 }}>
            <div className="ein-spin" />
            Acquiring satellite imagery…
          </div>
        )}

        {/* Tap hint */}
        {panelOpacity > 0.6 && !selected && flights.length > 0 && (
          <div style={{
            position: 'absolute', bottom: 26, left: '50%', transform: 'translateX(-50%)',
            display: 'inline-flex', alignItems: 'center', gap: 9,
            background: 'rgba(12,16,24,.72)', backdropFilter: 'blur(14px)',
            border: '1px solid rgba(255,255,255,.14)', color: '#fff',
            fontSize: 13, fontWeight: 600, padding: '9px 16px',
            borderRadius: 999, boxShadow: '0 12px 30px rgba(0,0,0,.4)',
          }}>
            <span style={{ width: 7, height: 7, borderRadius: 999, background: 'var(--blue)', boxShadow: '0 0 0 4px rgba(47,107,254,.22)', display: 'block' }} />
            Tap any aircraft for live flight details
          </div>
        )}
      </div>

      {/* Detail panel */}
      <FlightCard flight={selected} mode={mode} flights={flights} onClose={() => {
        setSelected(null);
        Object.values(markersRef.current).forEach(m => m.el?.classList?.remove('sel'));
        if (mapRef.current) clearRoute(mapRef.current);
        apMarkersRef.current.forEach(m => m.remove());
        apMarkersRef.current = [];
      }} />
    </section>
  );
}

// ── Route helpers ─────────────────────────────────────────────────────────────
function apCoords(iata) {
  return iata ? (AIRPORT_COORDS[iata.toUpperCase()] ?? null) : null;
}

function updateRoute(map, f) {
  if (!map?.getSource('route-remaining')) return;

  const empty = { type: 'Feature', geometry: { type: 'LineString', coordinates: [] } };
  const line  = coords => ({ type: 'Feature', geometry: { type: 'LineString', coordinates: coords } });

  const cur  = f.latitude != null && f.longitude != null ? [f.longitude, f.latitude] : null;
  const from = apCoords(f.departureAirport?.iata);
  const to   = apCoords(f.arrivalAirport?.iata);

  if (!cur) {
    // No live position — show full route in grey
    const coords = [from, to].filter(Boolean);
    map.getSource('route-remaining').setData(coords.length >= 2 ? line(coords) : empty);
    map.getSource('route-flown').setData(empty);
    return;
  }

  // Blue: origin → current position
  map.getSource('route-flown').setData(from ? line([from, cur]) : empty);
  // Grey: current position → destination
  map.getSource('route-remaining').setData(to ? line([cur, to]) : empty);
}

function clearRoute(map) {
  if (!map?.getSource('route-remaining')) return;
  const empty = { type: 'Feature', geometry: { type: 'LineString', coordinates: [] } };
  map.getSource('route-remaining').setData(empty);
  map.getSource('route-flown').setData(empty);
}
