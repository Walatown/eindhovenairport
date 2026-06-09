import { useState, useEffect, useCallback } from 'react';
import { airlineFromCallsign } from '../data/airlines';
import { lookupAirport } from '../data/airports';

// ─────────────────────────────────────────────────────────────────────────────
// DATA SOURCES
//
// Flight board  GET https://www.eindhovenairport.nl/api/flights
//   Authoritative list of EIN flights (rolling window, ~4–6 h history).
//   Base64-encoded JSON. No auth. 60 s server cache. Proxied locally via /ein-api.
//
// Position — by callsign  GET https://api.adsb.lol/v2/callsign/{cs}
//   Global ADS-B position lookup. Used as primary position source for
//   board-matched flights regardless of distance from EIN.
//
// Position — by radius  GET https://api.adsb.lol/v2/lat/.../lon/.../dist/...
//   Used as a secondary sweep for DEPARTURES only: finds EIN-origin flights
//   that have aged off the board but are still airborne within 500 nmi.
//
// VRS Standing Route Data  GET https://vrs-standing-data.adsb.lol/routes/…
//   Used alongside the radius sweep to confirm an aircraft departed from EHEH.
//   CORS-open — fetched directly (no proxy needed).
//
// STRATEGY
//   Arrivals:   board → per-callsign global lookup. No radius sweep needed
//               because inbound flights are always on the board.
//   Departures: board → per-callsign global lookup  (recent departures)
//               PLUS radius sweep + VRS origin check (older departures still
//               airborne but no longer on the board).
// ─────────────────────────────────────────────────────────────────────────────

const EHEH = { lat: 51.4501, lng: 5.37453 };
const EIN_CODES = new Set(['EHEH', 'EIN']);
const DEP_RADIUS = 500; // nmi — radius sweep for older departures (~925 km)

const EIN_API_BASE = import.meta.env.VITE_EIN_API_BASE ?? '/ein-api';
const ADSB_API_BASE = import.meta.env.VITE_ADSB_API_BASE ?? '/adsb';

function apiUrl(base, path) {
  return `${base.replace(/\/$/, '')}${path}`;
}

// ── Distance ──────────────────────────────────────────────────────────────────
function toRad(d) { return d * Math.PI / 180; }

function distanceKm(lat1, lng1, lat2, lng2) {
  const dLat = (lat2 - lat1) * 111.32;
  const dLng = (lng2 - lng1) * 111.32 * Math.cos(toRad(lat1));
  return Math.sqrt(dLat * dLat + dLng * dLng);
}

// ── Eindhoven Airport flight board ────────────────────────────────────────────
let _boardCache = null;
let _boardCacheTs = 0;
const BOARD_TTL = 60_000;

async function fetchFlightBoard() {
  if (_boardCache && Date.now() - _boardCacheTs < BOARD_TTL) return _boardCache;

  const res = await fetch(apiUrl(EIN_API_BASE, '/api/flights'));
  if (!res.ok) throw new Error(`Flight board HTTP ${res.status}`);

  const b64 = await res.json();
  const payload = JSON.parse(atob(b64));
  _boardCache = payload.flights ?? [];
  _boardCacheTs = Date.now();
  return _boardCache;
}

function norm(s) {
  return s ? s.replace(/\s+/g, '').toUpperCase() : '';
}

// Callsign candidates for a board flight (in priority order):
//   1. callSign stripped   → "RYR3QR"  (ATC callsign = transponder)
//   2. ICAO prefix + num   → "RYR6832"
function callsignCandidates(boardFlight) {
  const out = [];
  const cs = norm(boardFlight.callSign);
  if (cs) out.push(cs);
  const icao = norm(boardFlight.flightNumber?.prefixICAO);
  const num = norm(boardFlight.flightNumber?.number);
  if (icao && num && icao + num !== cs) out.push(icao + num);
  return out;
}

function routeAirports(boardFlight) {
  const orig = boardFlight.route?.origin;
  const dest = boardFlight.route?.destination;
  const toAp = ap => ap ? { city: ap.name ?? null, iata: ap.codeIATA ?? null } : null;
  return { departureAirport: toAp(orig), arrivalAirport: toAp(dest) };
}

// ── adsb.lol — per-callsign global lookup ─────────────────────────────────────
async function fetchByCallsign(callsign) {
  try {
    const res = await fetch(apiUrl(ADSB_API_BASE, `/v2/callsign/${encodeURIComponent(callsign)}`));
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data.ac) || data.ac.length === 0) return null;
    return data.ac.find(ac => norm(ac.flight) === callsign) ?? data.ac[0];
  } catch {
    return null;
  }
}

async function lookupBoardFlight(boardFlight) {
  for (const cs of callsignCandidates(boardFlight)) {
    const ac = await fetchByCallsign(cs);
    if (ac) return { ac, matchedCallsign: cs };
  }
  return null;
}

// ── adsb.lol — radius sweep ───────────────────────────────────────────────────
async function fetchRadius(nmi) {
  try {
    const res = await fetch(apiUrl(ADSB_API_BASE, `/v2/lat/${EHEH.lat}/lon/${EHEH.lng}/dist/${nmi}`));
    if (!res.ok) return [];
    const data = await res.json();
    return (Array.isArray(data.ac) ? data.ac : []).filter(
      ac => typeof ac.lat === 'number' && typeof ac.lon === 'number'
    );
  } catch {
    return [];
  }
}

// ── VRS Standing Route Data (departure confirmation) ──────────────────────────
const _routeCache = new Map(); // callsign → { data, ts }
const ROUTE_TTL = 30 * 60 * 1000;

async function lookupRouteVRS(callsign) {
  const hit = _routeCache.get(callsign);
  if (hit && Date.now() - hit.ts < ROUTE_TTL) return hit.data;

  try {
    const prefix = callsign.slice(0, 2).toUpperCase();
    const res = await fetch(
      `https://vrs-standing-data.adsb.lol/routes/${prefix}/${callsign}.json`,
      { signal: AbortSignal.timeout(4_000) }
    );
    const data = res.ok ? await res.json() : null;
    _routeCache.set(callsign, { data, ts: Date.now() });
    return data;
  } catch {
    return null; // timeout/error — don't cache, allow retry
  }
}

// Extract destination airport from a VRS route object
function vrsDestinationAirport(route) {
  const stops = (route.airport_codes ?? '').split('-').map(s => s.trim().toUpperCase());
  const icao = stops[stops.length - 1];
  const vrsAp = route._airports?.find(a => a.icao === icao);
  if (vrsAp) return { city: vrsAp.location ?? vrsAp.name ?? null, iata: vrsAp.iata ?? null };
  return lookupAirport(icao);
}

// ── Parse adsb.lol aircraft object → internal flight model ───────────────────
function parseAircraft(ac) {
  const lat = typeof ac.lat === 'number' ? ac.lat : null;
  const lng = typeof ac.lon === 'number' ? ac.lon : null;

  const onGround = ac.alt_baro === 'ground';
  const altFt = onGround ? 0
    : typeof ac.alt_baro === 'number' ? Math.round(ac.alt_baro) : null;

  const speedKts = typeof ac.gs === 'number' ? ac.gs : null;
  const velocityKmh = speedKts !== null ? Math.round(speedKts * 1.852) : null;
  const velocityMs = speedKts !== null ? Math.round(speedKts * 0.51444 * 10) / 10 : null;
  const vertRateMs = typeof ac.baro_rate === 'number' ? ac.baro_rate * 0.00508 : null;

  const geoAltFt = typeof ac.alt_geom === 'number' ? ac.alt_geom : null;
  const baroAltM = altFt !== null ? Math.round(altFt * 0.3048) : null;
  const geoAltM = geoAltFt !== null ? Math.round(geoAltFt * 0.3048) : null;

  const rawCallsign = typeof ac.flight === 'string' ? ac.flight.trim() : null;
  const callsign = rawCallsign || ac.hex;

  const dist = lat !== null && lng !== null
    ? Math.round(distanceKm(lat, lng, EHEH.lat, EHEH.lng))
    : null;

  return {
    icao24: ac.hex,
    callsign,
    airline: airlineFromCallsign(callsign),
    longitude: lng,
    latitude: lat,
    altitudeFt: altFt,
    baroAltitudeM: baroAltM,
    onGround,
    velocityMs,
    velocityKmh,
    heading: typeof ac.track === 'number' ? ac.track : null,
    verticalRateMs: vertRateMs,
    geoAltitudeM: geoAltM,
    squawk: ac.squawk ?? null,
    distanceKm: dist,
    departureAirport: null,
    arrivalAirport: null,
  };
}

function resolveStatus(altFt, vertRateMs, mode) {
  if (mode === 'departures') {
    if (altFt === null) return 'Departing';
    if (altFt < 5000) return 'Just departed';
    if (vertRateMs !== null && vertRateMs > 0.5) return 'Climbing';
    return 'En route';
  }
  if (altFt === null) return 'En route';
  if (altFt < 2200) return 'Final approach';
  if (altFt < 6500) return 'Descending';
  return 'En route';
}

// ── Arrivals — board + global callsign lookup ─────────────────────────────────
async function fetchArrivals() {
  const boardFlights = await fetchFlightBoard();
  const arrivals = boardFlights.filter(f => f.flightDirection === 'A');

  const results = await Promise.all(
    arrivals.map(async boardFlight => {
      const hit = await lookupBoardFlight(boardFlight);
      if (!hit) return null;
      const f = parseAircraft(hit.ac);
      if (f.onGround || f.latitude === null) return null;
      if (import.meta.env.DEV) console.log(`[ARR ✓] ${f.callsign} — ${f.distanceKm} km, ${f.altitudeFt} ft`);
      return { ...f, ...routeAirports(boardFlight) };
    })
  );

  const matched = results.filter(Boolean);

  if (import.meta.env.DEV) {
    const missed = arrivals.filter((_, i) => !results[i]).map(b => norm(b.callSign) || b.flightNumber?.flightName || '?');
    console.log(`[ARRIVALS] board=${arrivals.length} matched=${matched.length} not-airborne=[${missed.join(', ')}]`);
  }

  return matched.sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
}

// ── Departures — board + global lookup, extended by radius + VRS sweep ────────
async function fetchDepartures() {
  const [boardFlights, radiusAc] = await Promise.all([
    fetchFlightBoard(),
    fetchRadius(DEP_RADIUS),
  ]);

  const matched = [];
  const seenIcao24 = new Set();

  // ── Pass 1: board flights — global callsign lookup ────────────────────────
  const departures = boardFlights.filter(f => f.flightDirection === 'D');

  const boardResults = await Promise.all(
    departures.map(async boardFlight => {
      const hit = await lookupBoardFlight(boardFlight);
      if (!hit) return null;
      const f = parseAircraft(hit.ac);
      if (f.onGround || f.latitude === null) return null;
      if (import.meta.env.DEV) console.log(`[DEP ✓ board] ${f.callsign} — ${f.distanceKm} km, ${f.altitudeFt} ft`);
      return { ...f, ...routeAirports(boardFlight) };
    })
  );

  for (const f of boardResults) {
    if (f) { matched.push(f); seenIcao24.add(f.icao24); }
  }

  // ── Pass 2: radius sweep — VRS confirms EHEH as origin ───────────────────
  // Catches departures that have aged off the board but are still airborne
  const sweepCandidates = radiusAc.filter(ac => {
    if (seenIcao24.has(ac.hex)) return false;          // already found in pass 1
    if (ac.alt_baro === 'ground') return false;        // on ground
    const cs = typeof ac.flight === 'string' ? ac.flight.trim() : null;
    if (!cs || cs === ac.hex) return false;             // no real callsign
    if (typeof ac.gs !== 'number' || ac.gs < 135) return false; // < 250 km/h
    return true;
  });

  const sweepResults = await Promise.all(
    sweepCandidates.map(async ac => {
      const callsign = ac.flight.trim().toUpperCase();
      const route = await lookupRouteVRS(callsign);
      if (!route?.airport_codes) return null;

      const stops = route.airport_codes.split('-').map(s => s.trim().toUpperCase());
      if (!EIN_CODES.has(stops[0])) return null; // origin is not EIN

      const f = parseAircraft(ac);
      if (f.latitude === null) return null;

      if (import.meta.env.DEV) console.log(`[DEP ✓ sweep] ${f.callsign} — ${f.distanceKm} km, ${f.altitudeFt} ft`);
      return {
        ...f,
        departureAirport: { city: 'Eindhoven', iata: 'EIN' },
        arrivalAirport: vrsDestinationAirport(route),
      };
    })
  );

  for (const f of sweepResults) {
    if (f && !seenIcao24.has(f.icao24)) { matched.push(f); seenIcao24.add(f.icao24); }
  }

  if (import.meta.env.DEV) {
    const missed = departures.filter((_, i) => !boardResults[i]).map(b => norm(b.callSign) || '?');
    console.log(`[DEPARTURES] board=${departures.length} sweep-candidates=${sweepCandidates.length} total=${matched.length} board-not-airborne=[${missed.join(', ')}]`);
  }

  return matched.sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useFlights(mode = 'arrivals') {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchFlights = useCallback(async () => {
    try {
      const raw = mode === 'departures'
        ? await fetchDepartures()
        : await fetchArrivals();

      const enriched = raw.map(f => {
        const etaMin = f.distanceKm !== null && f.velocityKmh && f.velocityKmh > 0
          ? Math.max(1, Math.round((f.distanceKm / f.velocityKmh) * 60))
          : null;
        return { ...f, etaMin, status: resolveStatus(f.altitudeFt, f.verticalRateMs, mode) };
      });

      setFlights(enriched);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [mode]);

  useEffect(() => {
    setLoading(true);
    setFlights([]);
    fetchFlights();
    const id = setInterval(fetchFlights, 15_000);
    return () => clearInterval(id);
  }, [fetchFlights]);

  return { flights, loading, error, lastUpdated };
}
