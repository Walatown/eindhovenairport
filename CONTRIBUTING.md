# Flight Tracker: Contributor Onboarding

Welcome to the Eindhoven Airport flight tracker project. This guide will get you up and running in 15 minutes.

## Project Overview

**What**: A real-time flight tracker for Eindhoven Airport (EIN). Shows live arrivals and departures on an interactive Mapbox globe with live ADS-B aircraft positions.

**Stack**: React 19 + Vite + Mapbox GL JS + Tailwind CSS (frontend); Vercel (deployment); multiple public APIs (backend data).

**Why you care**: The system combines multiple data sources (official flight board + global ADS-B network + route data) to reliably track flights. It's a good example of data-driven UI and working with public APIs at scale.

---

## Local Setup (5 minutes)

### 1. Clone and install
```bash
git clone <repo-url>
cd flight-tracker
npm install
```

### 2. Set up environment variables
```bash
cp .env.example .env.local
```

Then edit `.env.local`:
```
VITE_MAPBOX_TOKEN=your_token_here
```

**How to get a Mapbox token**:
- Go to https://account.mapbox.com/tokens/
- Create a public token (no secret key needed)
- Paste it into `.env.local`

**Note**: Without a token, the map won't render, but the app won't crash. You'll see a "Map unavailable" message instead.

### 3. Start the dev server
```bash
npm run dev
```

The app opens at `http://localhost:5173`. Changes auto-reload.

### 4. Verify setup
- You should see a full-screen Mapbox globe
- The intro text says "Keep scrolling to descend into Eindhoven"
- Open DevTools console — look for flight fetch logs like `[ARR ✓] RYR3QR — 45 km, 8500 ft`
- If you see logs but no map, you're missing the Mapbox token (see step 2)

---

## Common Tasks

### Run the linter
```bash
npm run lint
```

Fix auto-fixable issues:
```bash
npm run lint -- --fix
```

### Build for production
```bash
npm run build
```

Output goes to `dist/`. Vite minifies and optimizes automatically. Size should be ~200 KB gzipped.

### Test the production build locally
```bash
npm run build
npm run preview
```

Opens at `http://localhost:4173`. Useful for checking if API proxies are working before deploying.

---

## Code Tour: Top 5 Files to Read First

### 1. **`src/hooks/useFlights.js`** — The brain of the app
**What it does**: Fetches and filters live flight data from three sources (Eindhoven board API + adsb.lol callsign lookup + radius sweep for older departures).

**Why read first**: Understand the two-pass departure strategy and why we need it. This is where all the data logic lives.

**Key concepts**:
- `fetchFlightBoard()` — gets the official Eindhoven schedule (60s cache)
- `fetchByCallsign()` — global ADS-B position lookup for a specific flight
- `fetchDepartures()` — two-pass approach: Pass 1 = board + callsign, Pass 2 = radius sweep + VRS confirmation
- `useFlights(mode)` hook — returns `{ flights, loading, error, lastUpdated }`, polls every 15s

**Time to understand**: 10–15 minutes

---

### 2. **`src/components/Map.jsx`** — UI glue and Mapbox interactions
**What it does**: Renders the Mapbox globe, listens for scroll/drag, updates plane markers, renders routes, and shows the flight list sidebar.

**Why read second**: Understand how scroll progress drives the camera animation and how interactions are wired.

**Key concepts**:
- `progress` state (0–1) drives the camera zoom/pitch/bearing via `map.jumpTo()`
- Plane markers are updated via `useEffect` whenever `flights` changes
- Routes are drawn as two GeoJSON layers (blue = flown, grey = remaining)
- `dragPan` disabled during auto-animation (`progress < 0.85`); enabled when user grabs the map
- `FlightPanel` (sidebar) shows the list of flights; `FlightCard` (bottom sheet) shows detail

**Time to understand**: 10 minutes

---

### 3. **`src/components/FlightCard.jsx`** — Flight detail panel (bottom sheet)
**What it does**: Slides up from the bottom when you tap a flight. Shows callsign, status, altitude, speed, heading, route details.

**Why read third**: If you're improving the detail view or fixing layout, you'll be here.

**Key concepts**:
- `position: fixed, right: 20px, top: 50%, zIndex: 90` — slides in from right via `transform: translateX`
- Data comes from the flight object selected in `Map.jsx`
- Stats grid is 3 columns for departures, 2 columns + ETA for arrivals

**Time to understand**: 5 minutes

---

### 4. **`src/data/airports.js`** — Airport lookup table
**What it does**: Maps IATA codes to city names and Mapbox coordinates. Used to render route endpoints on the map.

**Why read if**: You're adding new airports or fixing route rendering bugs.

**Key export**: `AIRPORT_COORDS` — object with ~80 airports (IATA → `[lng, lat]`).

**Time to understand**: 2 minutes

---

### 5. **`vite.config.js`** — Build config and dev API proxies
**What it does**: Sets up Vite, React hot reload, and CORS proxies for Eindhoven & adsb.lol APIs.

**Why read if**: You're debugging API calls or changing the build setup.

**Key concepts**:
- `/adsb` proxy → `https://api.adsb.lol` (CORS-open, no rewrite needed)
- `/ein-api` proxy → `https://www.eindhovenairport.nl` (CORS-blocked, proxied)
- Debug endpoint: POST `/debug-log` to log structured data to the dev server console

**Time to understand**: 3 minutes

---

## Deployment Pipeline

### Development
- You edit code locally
- `npm run dev` starts Vite dev server with hot reload and API proxies

### Staging (Preview)
- Commit and push to your branch
- Vercel auto-deploys a preview URL (check the PR)
- The preview has the same production config (Vercel serverless proxies instead of Vite)

### Production
- Merge to `main`
- Vercel auto-deploys to https://flight-tracker-vercel-url.com
- **Production deployment**:
  - `npm run build` → `dist/`
  - Vercel serves static files + rewrites API calls through `/api/proxy` (see `vercel.json`)
  - Mapbox token is public, so no secrets leaked

### Vercel Config
See `vercel.json` for rewrites. In production, `/ein-api/*` requests are routed through a Vercel serverless function (not Vite proxy) to avoid CORS.

---

## Common Gotchas and How to Avoid Them

### ⚠️ Gotcha #1: API Proxies Don't Work in Production

**The problem**: You test locally and everything works. You deploy, and the flight data doesn't load.

**Why**: Your local setup uses Vite proxies (`vite.config.js`), but production uses Vercel rewrites (`vercel.json`). If you change an API call URL locally and forget to update the Vercel config, it breaks in production.

**How to avoid**:
- **Always test the production build locally** before pushing:
  ```bash
  npm run build
  npm run preview
  ```
- Check `vercel.json` for all rewrites. New API endpoints need to be added there.
- Verify console logs show successful API responses, not CORS errors.

---

### ⚠️ Gotcha #2: Forgetting the Mapbox Token

**The problem**: You pull main, the app starts, but the map is blank. You see "Map unavailable" message.

**Why**: The `.env.local` token wasn't copied or expired.

**How to avoid**:
- Keep your `.env.local` in `.gitignore` (it is by default)
- When you pull, always run `cp .env.example .env.local` and fill in the token
- If the token is blank, the app still runs — it just hides the map

---

### ⚠️ Gotcha #3: Misunderstanding the Two-Pass Departure Logic

**The problem**: You look at `fetchDepartures()` in `useFlights.js` and think "why are we doing two passes? Can't we just query adsb.lol radius and filter by altitude?"

**Why it's wrong**: The Eindhoven board only keeps ~4–6 hours of history. A long-haul departure from 8 hours ago aged off the board but might still be in the air (e.g., London flight 8+ hours). Radius-only approach misses it. VRS confirmation (Pass 2) catches it without false positives.

**How to avoid**:
- Read `TECHNICAL_CHANGELOG.md` — it explains the two-pass strategy and why it exists
- Don't "optimize" this logic without understanding the full data flow

---

### ⚠️ Gotcha #4: ADS-B Data is Cached Longer Than You Think

**The problem**: You fetch flight data, make a code change, and the test data doesn't change for a minute.

**Why**:
- Eindhoven board is cached for 60s (server-side)
- VRS routes are cached for 30 min per callsign (client-side in `_routeCache`)

**How to avoid**:
- Hard refresh (`Cmd+Shift+R` on Mac) to clear the browser cache
- Wait up to 60s for new board data to appear
- Don't assume stale data is a bug — check the caching strategy first

---

### ⚠️ Gotcha #5: The Flight Panel Doesn't Show Data

**The problem**: You tap a flight, the panel slides up, but the stats are blank.

**Why**: The flight object is missing `departureAirport`, `arrivalAirport`, or position data. Check `console.log(flight)` in the browser DevTools.

**How to avoid**:
- Use `npm run dev` to start the dev server
- Open DevTools → Console
- Tap a flight and check `console.log` output for the full flight object
- Look for null fields — these indicate missing data from the APIs

---

## Editor Setup (Optional)

**VS Code** (recommended):
- Install ESLint extension (`dbaeumer.vscode-eslint`)
- Install Tailwind CSS IntelliSense (`bradlc.vscode-tailwindcss`)
- Linting and auto-format run on save (if configured in workspace)

**Prettier**: Not configured. We use ESLint for basic formatting.

---

## Getting Help

- **Questions about data flow?** → Read `TECHNICAL_CHANGELOG.md`
- **Questions about API endpoints?** → Check `useFlights.js` comments and `.env.example`
- **Map rendering issues?** → Check `Map.jsx` and Mapbox GL JS docs
- **Build/deploy issues?** → Check `vite.config.js` and `vercel.json`

---

## First Contribution Checklist

Before submitting a PR:

- [ ] `npm run lint` passes (no errors)
- [ ] `npm run build` succeeds
- [ ] `npm run preview` works and API calls work
- [ ] You tested on both arrival and departure modes
- [ ] You tested with and without Mapbox token (graceful fallback)
- [ ] You verified the flight data loads in the browser console

---

## Summary

You now know:
1. How to run the app locally (`npm run dev`)
2. Where the flight data logic lives (`useFlights.js`)
3. How the map and interactions work (`Map.jsx`)
4. Why the two-pass departure strategy exists (TECHNICAL_CHANGELOG.md)
5. Common gotchas and how to avoid them

**Next step**: Pick an issue, make a small change, and test it locally. The codebase is approachable — don't hesitate to ask questions in PRs or issues.

Happy contributing! 🚀
