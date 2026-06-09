# Flight Tracker

Real-time arrivals and departures for Eindhoven Airport. Built with React + Vite + Mapbox GL JS. Combines official flight schedules, ADS-B tracking, and route data for reliable, global flight tracking.

**[View live](https://eindhovenairport.vercel.app/)** | 

## Features

- **Live globe view** — Mapbox 3D globe with smooth scroll-driven camera animation
- **Real-time aircraft** — Plane positions update every 15s from global ADS-B feed
- **Authoritative data** — Flight list from official Eindhoven Airport API, not guesswork
- **Complete departures** — Catches flights that aged off the official board but remain airborne
- **Route visualization** — Blue line for distance flown, grey line for remaining route
- **Arrivals & Departures modes** — Toggle between inbound and outbound flights
- **Flight detail panel** — Tap any aircraft to see callsign, altitude, heading, ETA, destination

## Quick Start

### Development
```bash
npm install
npm run dev
# Opens http://localhost:5173
```

### Production Build
```bash
npm run build
npm run preview
# Test the production build locally before deploying
```

### Linting
```bash
npm run lint
npm run lint -- --fix
```

## Setup

1. **Mapbox token** (optional, but required for the map to render):
   ```bash
   cp .env.example .env.local
   # Edit .env.local and add your public Mapbox token
   # Get one at https://account.mapbox.com/tokens/
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start dev server**:
   ```bash
   npm run dev
   ```

That's it. The app runs without a Mapbox token (shows a "Map unavailable" message), so you can still develop other features.

## Stack

| Layer | Technology |
|-------|-----------|
| **UI** | React 19, Vite, Mapbox GL JS, Tailwind CSS |
| **Data** | Multiple public APIs (Eindhoven Airport, adsb.lol, VRS) |
| **Deployment** | Vercel (static + serverless proxies) |

## Data Architecture

The system combines three sources for reliable flight tracking:

1. **Eindhoven Airport Board** — Official arrivals & departures list (60s cache)
2. **adsb.lol Global Lookup** — Live aircraft positions by callsign (worldwide coverage)
3. **VRS Route Data** — Confirmed origin/destination for radius-matched departures

See [TECHNICAL_CHANGELOG.md](./TECHNICAL_CHANGELOG.md) for detailed logic and why this hybrid approach works.

## File Structure

```
src/
├── components/
│   ├── Map.jsx              # Mapbox globe, flight list, route rendering
│   ├── FlightCard.jsx       # Detail panel (bottom sheet)
│   └── ...
├── hooks/
│   └── useFlights.js        # Flight data fetching & filtering logic
├── data/
│   ├── airports.js          # Airport lookup table
│   └── airlines.js          # Airline name lookup
└── App.jsx                  # Main entry point

vite.config.js              # Build config & dev API proxies
vercel.json                 # Production deployment config
TECHNICAL_CHANGELOG.md      # Architecture & logic docs
CONTRIBUTING.md             # Contributor onboarding
```

## Common Tasks

### Add a new airport to the route display
Edit `src/data/airports.js` — add `IATA: [longitude, latitude]` to `AIRPORT_COORDS`.

### Debug flight data
Open DevTools console. You'll see logs like:

## Known Limitations

- **Mapbox token required** for map rendering (without it, only data sidebar is visible)
- **No historical data** — only shows active flights, no past flight tracking
- **~15s latency** — flight data updates every 15 seconds (not real-time)
- **Military/GA flights** may have incomplete data (no public ADS-B squawk or routing)

## Deployment

The app is deployed to Vercel:
- **Branch deploys** — Each branch gets a preview URL
- **Main deploys** — Auto-deployed to production on merge
- **API proxies** — Vercel rewrites `/adsb/*` and `/ein-api/*` requests to upstream APIs

See `vercel.json` for proxy configuration.

## Contributing

New to the project? Start with [CONTRIBUTING.md](./CONTRIBUTING.md) — it has setup instructions, a code tour, and common gotchas.

## License

MIT

## Acknowledgments

- Flight data: [Eindhoven Airport](https://www.eindhovenairport.nl), [adsb.lol](https://api.adsb.lol), [VRS](https://github.com/vradarserver)
- Map: [Mapbox](https://www.mapbox.com/)
- Framework: [React](https://react.dev/), [Vite](https://vitejs.dev/)
