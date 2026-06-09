# Flight Tracker: Technical Changelog

## Overview

This document describes the evolution of the Eindhoven Airport flight tracker from initial concept through production deployment. It focuses on data flow, search logic, and architectural decisions—not UI details.

## Development Workflow

1. **Research Phase** — investigated requirements for a real-time flight tracking system
2. **Inspiration Gathering** — browsed online for reference implementations and design patterns
3. **Design Phase** — designed the system architecture in Claude Code
4. **Implementation Phase** — implemented logic via iterative AI prompts
5. **Problem-Solving Phase** — encountered API limitations and rate-limit issues, developed multi-source hybrid approach
6. **Deployment** — deployed to Vercel with CORS proxy workarounds

---

## High-Level Summary

The flight tracker displays live arrivals and departures for Eindhoven Airport (EIN). Originally, the system attempted to infer Eindhoven-bound flights purely from ADS-B geometry (radius-based proximity). This approach was unreliable and missed many flights.

The system now uses an **authoritative board + live position matching** strategy:
- **Source of truth**: Eindhoven Airport's official flight board API (arrivals & departures list)
- **Live positions**: Global ADS-B position lookups via adsb.lol
- **Extended coverage for departures**: Radius sweep + VRS route confirmation to catch older flights that aged off the board but remain airborne
- **Reasoning**: The official board is accurate but time-limited (~4–6 hour rolling window); ADS-B coverage is global but noisy; combining them ensures both accuracy and completeness

---

## Old Logic (Simple Geometry-Based Approach)

**Data source**: ADS-B Network (OpenSky or adsb.lol) via radius search around Eindhoven

**Flow**:
1. Query ADS-B API for all aircraft within a fixed radius of Eindhoven (e.g., 100–200 km)
2. Parse returned aircraft array for altitude, heading, and position
3. Apply heuristics to guess if each flight is "arriving" or "departing":
   - If descending and heading toward Eindhoven → arrival
   - If climbing and heading away → departure
4. Display all matches on the map

**Problems**:
- Heuristics are unreliable — a aircraft could be transiting past Eindhoven, not landing there
- No awareness of which flights are actually scheduled to/from EIN
- Misses older departures that are still airborne but outside the radius
- High false positive rate; hard to trust the list
- No way to know if an inbound flight is actually destined for EIN or just passing through nearby airspace

---

## New Logic (Board + Global Lookup + Radius Sweep)

### Data Sources

| Source | Purpose | Endpoint | Notes |
|--------|---------|----------|-------|
| **Eindhoven Airport Board API** | Authoritative flight schedule | `GET https://www.eindhovenairport.nl/api/flights` | Base64-encoded JSON; 60s server cache; no auth; CORS-blocked (proxied via `/ein-api`) |
| **adsb.lol Callsign Lookup** | Global live position for a specific flight | `GET https://api.adsb.lol/v2/callsign/{callsign}` | Returns aircraft object with lat, lon, altitude, heading, speed; CORS-open |
| **adsb.lol Radius Search** | All aircraft near Eindhoven | `GET https://api.adsb.lol/v2/lat/{lat}/lon/{lon}/dist/{nmi}` | Finds departures that aged off the board but remain airborne; CORS-open |
| **VRS Standing Route Data** | Flight routing (origin/destination airports) | `GET https://vrs-standing-data.adsb.lol/routes/{PREFIX}/{CALLSIGN}.json` | Used to confirm a radius-matched aircraft actually departed from EIN; CORS-open |

### Search Strategy

#### Arrivals
1. Fetch the flight board from Eindhoven Airport API
2. Filter for `flightDirection === 'A'` (arrivals)
3. For each arrival, extract callsign candidates:
   - Primary: the ATC callsign (e.g., `RYR3QR`)
   - Secondary: ICAO prefix + flight number (e.g., `RYR6832`)
4. Look up each callsign globally via adsb.lol `/v2/callsign/{cs}`
5. Filter out aircraft on the ground or with no position data
6. Combine the ADS-B live data with the board's route information (origin/destination airports)
7. Sort by distance from EIN (closest first)

**Why this works**: Every inbound flight appears on the board. The callsign lookup finds its live position anywhere in the world, even if it's far away. No false positives — if it's not on the board, it's not shown.

#### Departures (Two-Pass Approach)

**Pass 1: Recent departures (on the board)**
- Fetch flight board; filter for `flightDirection === 'D'`
- Same callsign lookup and enrichment as arrivals
- Add to results; track seen ICAO24 hex codes to avoid duplicates

**Pass 2: Older departures (aged off the board, still airborne)**
- Fetch all aircraft within 500 nmi radius of EIN
- Filter candidates:
  - Not already seen in Pass 1
  - Not on the ground
  - Has a real callsign (not just ICAO hex)
  - Moving at >= 250 km/h (filters out slow/stationary aircraft)
- For each candidate, fetch its VRS route (via `routes/{PREFIX}/{CALLSIGN}.json`)
- Check if the route's origin airports include EHEH or EIN
- If confirmed, add to results with departure airport = Eindhoven

**Why two passes**: The board only keeps ~4–6 hours of history. A long-haul departure from 8 hours ago is gone from the board but still in the air. The radius sweep + VRS confirmation catches it without false positives.

### Search Result Matching

**Callsign normalization**: `callSign → uppercase + remove all whitespace`
- `"ryr 3qr"` → `"RYR3QR"`
- `"KLM  42"` → `"KLM42"`

**Route airport extraction**: From the board flight object:
- `boardFlight.route.origin.name` → departure city
- `boardFlight.route.origin.codeIATA` → departure IATA code
- Same for destination

**VRS route parsing** (for Pass 2 departures):
- Extract airport chain from `route.airport_codes` (e.g., `"EHEH-EGLL-LIRF"`)
- Confirm first airport is EHEH or EIN
- Look up final airport in `route._airports` array to get city + IATA

### Data Model

Each flight returned to the UI includes:
```javascript
{
  icao24,           // hex code (e.g., "a4401a")
  callsign,         // flight identifier (e.g., "RYR3QR")
  airline,          // carrier name (looked up from callsign prefix)
  latitude,         // decimal degrees
  longitude,        // decimal degrees
  altitudeFt,       // feet above ground level (or null if on ground)
  velocityKmh,      // ground speed
  heading,          // degrees (0–359)
  verticalRateMs,   // meters/second (positive = climbing, negative = descending)
  distanceKm,       // distance from EIN
  etaMin,           // estimated arrival in minutes (for arrivals)
  status,           // "En route", "Descending", "Final approach", "Climbing", "Departing", etc.
  departureAirport: { city, iata },
  arrivalAirport:   { city, iata },
}
```

---

## Key Differences: Old vs. New

| Aspect | Old (Geometry) | New (Board + Lookup) |
|--------|---|---|
| **Data source** | ADS-B radius search only | Official flight board + ADS-B global lookup |
| **Source of truth** | Heuristics (altitude, heading, proximity) | Eindhoven Airport's authoritative flight list |
| **Search mechanism** | Radius distance filter; altitude/heading heuristics | Exact callsign match via global API |
| **Arrivals** | All descending aircraft near EIN (false positives) | Only flights on the arrival list with confirmed position |
| **Departures** | All climbing aircraft leaving EIN (false positives & misses) | Board departures + radius sweep with VRS origin confirmation (no misses) |
| **Error handling** | High false positive rate; no recovery mechanism | Strict filtering; 404s on VRS cached locally so no network waste |
| **Performance** | Single fast radius query | Multiple parallel queries (board, callsign lookups, VRS); cached board (60s TTL); VRS route cached (30 min TTL) |
| **Reliability** | Unreliable heuristics fail for transiting traffic | Authoritative board eliminates false positives; global lookup guarantees coverage |

---

## Prompts Used During Development

The system was designed and implemented through iterative AI-assisted prompts. Key directions:

1. **Architecture & Data Source Selection**
   > "Replace geometric inference with the official Eindhoven Airport arrivals/departures API as the source of truth. Match live aircraft to board flights by callsign. Fetch live positions from adsb.lol global callsign lookup. For departures, add a radius sweep + VRS route origin check to catch flights that aged off the board but remain airborne."

2. **Two-Pass Departure Logic**
   > "Implement a two-pass approach for departures: Pass 1 uses the flight board with global callsign lookup; Pass 2 uses a radius sweep within 500 nmi of Eindhoven, filters by speed and callsign presence, and confirms origin via VRS route data."

3. **Route Visualization**
   > "Improve the Mapbox route UI for each selected flight. Show one clean line from origin → destination, split at the plane's current live position: passed distance = blue, remaining distance = grey. Use two GeoJSON sources and rounded line caps/joins for a polished look."

4. **Map Interaction**
   > "Fix the map drag behavior. Enable dragPan at progress >= 0.85 and skip jumpTo() in interactive mode so user dragging does not fight the scroll-driven camera animation. Ensure all non-interactive overlays use pointer-events: none."

5. **UI Polish & Consistency**
   > "Redesign the airport arrivals timetable and flight information panel for visual consistency with the dark map. Remove redundant status labels, add column headers, replace relative times with exact times, strengthen the panel's visual hierarchy, and ensure card sizing is uniform."

6. **Interaction Refinement**
   > "When the user clicks a flight or route, automatically center the selected aircraft on the map. Make the grey route line thicker for visibility. Redesign the flight info panel as a vertical pillar with a clean header, and move the close button to the top-right corner with proper spacing."

---

## Deployment Notes

- **CORS Proxy**: Eindhoven Airport board API is CORS-blocked. Requests are routed through a Vercel proxy to avoid browser CORS errors in production.
- **API Rate Limits**: adsb.lol is public and free; ~15s poll interval is used to balance freshness and load.
- **Caching Strategy**: Board cached for 60s (server-side TTL); VRS routes cached for 30 min per callsign (client-side) to avoid redundant requests for military/charter flights that have no public route data.
- **Deployment Platform**: Vercel (handles both frontend and proxy rewrites)

---

## Summary

The flight tracker evolved from a flawed geometry-based approach to a hybrid multi-API system anchored by the official flight board. This shift eliminated false positives, improved reliability, and enables tracking of flights worldwide—not just those visible within a fixed radius. The system demonstrates how combining multiple authoritative data sources (board + positions + routes) creates a more robust and trustworthy experience than any single source alone.
