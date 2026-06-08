// ICAO 3-letter operator code (first 3 letters of callsign) → airline name
// Used to identify the carrier from the callsign when no route metadata is available.
export const AIRLINE_BY_ICAO = {
  // Low-cost / charter – common at Eindhoven
  RYR: 'Ryanair',
  TRA: 'Transavia',
  WZZ: 'Wizz Air',
  EZY: 'easyJet',
  EJU: 'easyJet Europe',
  TOM: 'TUI fly',
  ORB: 'TUI fly Belgium',
  JAF: 'Jet2',
  EXS: 'Jet2',
  VLG: 'Vueling',
  IBE: 'Iberia',
  IBS: 'Iberia Express',
  BEL: 'Brussels Airlines',
  SAS: 'Scandinavian Airlines',
  FIN: 'Finnair',
  NOZ: 'Norwegian Air Shuttle',
  NOS: 'Norwegian Air International',
  NAX: 'Norwegian Air Sweden',
  AZA: 'ITA Airways',
  AZI: 'ITA Airways',
  AEE: 'Aegean Airlines',
  // Legacy / full-service
  KLM: 'KLM',
  BAW: 'British Airways',
  DLH: 'Lufthansa',
  AUA: 'Austrian Airlines',
  TAP: 'TAP Air Portugal',
  UAE: 'Emirates',
  THY: 'Turkish Airlines',
  EIN: 'Aer Lingus',
  EWG: 'Eurowings',
  SWR: 'Swiss International',
  CSN: 'China Southern',
  CCA: 'Air China',
  AAL: 'American Airlines',
  UAL: 'United Airlines',
  DAL: 'Delta Air Lines',
  AFR: 'Air France',
  // Cargo / mixed
  DHL: 'DHL Aviation',
  FDX: 'FedEx',
  UPS: 'UPS Airlines',
  TNT: 'ASL Airlines Belgium',
  CLX: 'Cargolux',
};

/**
 * Returns the airline name for a given callsign by matching its 3-letter
 * ICAO operator prefix.  Returns null if unrecognised or not a valid callsign.
 */
export function airlineFromCallsign(callsign) {
  if (!callsign || callsign.length < 3) return null;
  const prefix = callsign.slice(0, 3).toUpperCase();
  if (!/^[A-Z]{3}$/.test(prefix)) return null;
  return AIRLINE_BY_ICAO[prefix] ?? null;
}
