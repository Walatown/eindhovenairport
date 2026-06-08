// ICAO → { city, iata } for airports commonly served from Eindhoven (EIN/EHEH)
// Used to display human-readable city names when ICAO route codes are available.
export const AIRPORT_LOOKUP = {
  // Netherlands
  EHAM: { city: 'Amsterdam',          iata: 'AMS' },
  EHRD: { city: 'Rotterdam',          iata: 'RTM' },
  EHGG: { city: 'Groningen',          iata: 'GRQ' },
  EHBK: { city: 'Maastricht',         iata: 'MST' },
  EHTW: { city: 'Twenthe',            iata: 'ENS' },
  EHEH: { city: 'Eindhoven',          iata: 'EIN' },

  // United Kingdom
  EGSS: { city: 'London Stansted',    iata: 'STN' },
  EGKK: { city: 'London Gatwick',     iata: 'LGW' },
  EGLL: { city: 'London Heathrow',    iata: 'LHR' },
  EGGW: { city: 'London Luton',       iata: 'LTN' },
  EGCC: { city: 'Manchester',         iata: 'MAN' },
  EGPF: { city: 'Glasgow',            iata: 'GLA' },
  EGPH: { city: 'Edinburgh',          iata: 'EDI' },
  EGNX: { city: 'Nottingham East Midlands', iata: 'EMA' },
  EGBB: { city: 'Birmingham',         iata: 'BHX' },
  EGGD: { city: 'Bristol',            iata: 'BRS' },

  // Ireland
  EIDW: { city: 'Dublin',             iata: 'DUB' },
  EINN: { city: 'Shannon',            iata: 'SNN' },

  // Belgium
  EBBR: { city: 'Brussels',           iata: 'BRU' },
  EBCI: { city: 'Charleroi',          iata: 'CRL' },
  EBOS: { city: 'Ostend',             iata: 'OST' },

  // Germany
  EDDF: { city: 'Frankfurt',          iata: 'FRA' },
  EDDM: { city: 'Munich',             iata: 'MUC' },
  EDDB: { city: 'Berlin',             iata: 'BER' },
  EDDL: { city: 'Düsseldorf',         iata: 'DUS' },
  EDDC: { city: 'Dresden',            iata: 'DRS' },
  EDDH: { city: 'Hamburg',            iata: 'HAM' },
  EDDK: { city: 'Cologne/Bonn',       iata: 'CGN' },
  EDDS: { city: 'Stuttgart',          iata: 'STR' },
  EDDP: { city: 'Leipzig',            iata: 'LEJ' },
  EDDN: { city: 'Nuremberg',          iata: 'NUE' },
  EDDV: { city: 'Hannover',           iata: 'HAJ' },
  EDDT: { city: 'Berlin Tegel',       iata: 'TXL' },
  EDLO: { city: 'Paderborn',          iata: 'PAD' },

  // France
  LFPG: { city: 'Paris CDG',          iata: 'CDG' },
  LFPO: { city: 'Paris Orly',         iata: 'ORY' },
  LFML: { city: 'Marseille',          iata: 'MRS' },
  LFMN: { city: 'Nice',               iata: 'NCE' },
  LFRS: { city: 'Nantes',             iata: 'NTE' },
  LFBD: { city: 'Bordeaux',           iata: 'BOD' },
  LFLL: { city: 'Lyon',               iata: 'LYS' },
  LFBO: { city: 'Toulouse',           iata: 'TLS' },
  LFST: { city: 'Strasbourg',         iata: 'SXB' },
  LFRN: { city: 'Rennes',             iata: 'RNS' },

  // Spain
  LEBL: { city: 'Barcelona',          iata: 'BCN' },
  LEMD: { city: 'Madrid',             iata: 'MAD' },
  LEAL: { city: 'Alicante',           iata: 'ALC' },
  LEMG: { city: 'Málaga',             iata: 'AGP' },
  LEPA: { city: 'Palma de Mallorca',  iata: 'PMI' },
  LEVT: { city: 'Vitoria',            iata: 'VIT' },
  LERS: { city: 'Reus',               iata: 'REU' },
  LEGE: { city: 'Girona',             iata: 'GRO' },
  LEZL: { city: 'Seville',            iata: 'SVQ' },
  LEGR: { city: 'Granada',            iata: 'GRX' },
  LEBB: { city: 'Bilbao',             iata: 'BIO' },
  LEAS: { city: 'Asturias',           iata: 'OVD' },
  GCFV: { city: 'Fuerteventura',      iata: 'FUE' },
  GCLP: { city: 'Las Palmas',         iata: 'LPA' },
  GCTS: { city: 'Tenerife South',     iata: 'TFS' },
  GCXO: { city: 'Tenerife North',     iata: 'TFN' },
  GCLA: { city: 'La Palma',           iata: 'SPC' },
  GCHI: { city: 'Hierro',             iata: 'VDE' },
  GCRR: { city: 'Lanzarote',          iata: 'ACE' },

  // Portugal
  LPPT: { city: 'Lisbon',             iata: 'LIS' },
  LPPR: { city: 'Porto',              iata: 'OPO' },
  LPFR: { city: 'Faro',               iata: 'FAO' },
  LPMA: { city: 'Madeira',            iata: 'FNC' },

  // Italy
  LIRF: { city: 'Rome Fiumicino',     iata: 'FCO' },
  LIME: { city: 'Milan Bergamo',      iata: 'BGY' },
  LIML: { city: 'Milan Linate',       iata: 'LIN' },
  LIMC: { city: 'Milan Malpensa',     iata: 'MXP' },
  LIPZ: { city: 'Venice',             iata: 'VCE' },
  LIBP: { city: 'Pescara',            iata: 'PSR' },
  LICJ: { city: 'Palermo',            iata: 'PMO' },
  LICC: { city: 'Catania',            iata: 'CTA' },
  LIBR: { city: 'Brindisi',           iata: 'BDS' },
  LIRA: { city: 'Rome Ciampino',      iata: 'CIA' },
  LIBF: { city: 'Foggia',             iata: 'FOG' },
  LIBD: { city: 'Bari',               iata: 'BRI' },
  LIRN: { city: 'Naples',             iata: 'NAP' },
  LIPQ: { city: 'Trieste',            iata: 'TRS' },
  LIPH: { city: 'Treviso',            iata: 'TSF' },

  // Switzerland
  LSZH: { city: 'Zürich',             iata: 'ZRH' },
  LSGG: { city: 'Geneva',             iata: 'GVA' },
  LSZA: { city: 'Lugano',             iata: 'LUG' },

  // Austria
  LOWW: { city: 'Vienna',             iata: 'VIE' },
  LOWS: { city: 'Salzburg',           iata: 'SZG' },
  LOWI: { city: 'Innsbruck',          iata: 'INN' },

  // Czechia
  LKPR: { city: 'Prague',             iata: 'PRG' },
  LKTB: { city: 'Brno',               iata: 'BRQ' },

  // Poland
  EPWA: { city: 'Warsaw',             iata: 'WAW' },
  EPKK: { city: 'Kraków',             iata: 'KRK' },
  EPGD: { city: 'Gdańsk',             iata: 'GDN' },
  EPPO: { city: 'Poznań',             iata: 'POZ' },
  EPWR: { city: 'Wrocław',            iata: 'WRO' },
  EPKT: { city: 'Katowice',           iata: 'KTW' },

  // Hungary
  LHBP: { city: 'Budapest',           iata: 'BUD' },

  // Romania
  LROP: { city: 'Bucharest',          iata: 'OTP' },
  LRCL: { city: 'Cluj-Napoca',        iata: 'CLJ' },

  // Bulgaria
  LBSF: { city: 'Sofia',              iata: 'SOF' },
  LBBG: { city: 'Burgas',             iata: 'BOJ' },
  LBWN: { city: 'Varna',              iata: 'VAR' },

  // Slovakia
  LZIB: { city: 'Bratislava',         iata: 'BTS' },

  // Croatia
  LDZA: { city: 'Zagreb',             iata: 'ZAG' },
  LDSP: { city: 'Split',              iata: 'SPU' },
  LDDU: { city: 'Dubrovnik',          iata: 'DBV' },
  LDLO: { city: 'Lošinj',             iata: 'LSZ' },

  // Serbia
  LYBE: { city: 'Belgrade',           iata: 'BEG' },

  // North Macedonia
  LWSK: { city: 'Skopje',             iata: 'SKP' },

  // Albania
  LATI: { city: 'Tirana',             iata: 'TIA' },

  // Greece
  LGAV: { city: 'Athens',             iata: 'ATH' },
  LGTS: { city: 'Thessaloniki',        iata: 'SKG' },
  LGIR: { city: 'Heraklion',          iata: 'HER' },
  LGKR: { city: 'Corfu',              iata: 'CFU' },
  LGRP: { city: 'Rhodes',             iata: 'RHO' },
  LGTG: { city: 'Kalamata',           iata: 'KLX' },

  // Cyprus
  LCPH: { city: 'Paphos',             iata: 'PFO' },
  LCLK: { city: 'Larnaca',            iata: 'LCA' },

  // Turkey
  LTBA: { city: 'Istanbul Atatürk',   iata: 'IST' },
  LTFJ: { city: 'Istanbul Sabiha',    iata: 'SAW' },
  LTAI: { city: 'Antalya',            iata: 'AYT' },
  LTBJ: { city: 'İzmir',              iata: 'ADB' },

  // Ukraine
  UKBB: { city: 'Kyiv Boryspil',      iata: 'KBP' },
  UKKK: { city: 'Kyiv Zhuliany',      iata: 'IEV' },
  UKLL: { city: 'Lviv',               iata: 'LWO' },

  // Scandinavia & Nordics
  ENGM: { city: 'Oslo',               iata: 'OSL' },
  ENBO: { city: 'Bodø',               iata: 'BOO' },
  ESSA: { city: 'Stockholm Arlanda',  iata: 'ARN' },
  ESGG: { city: 'Gothenburg',         iata: 'GOT' },
  EKCH: { city: 'Copenhagen',         iata: 'CPH' },
  EFHK: { city: 'Helsinki',           iata: 'HEL' },
  EFLP: { city: 'Tampere',            iata: 'TMP' },

  // Morocco
  GMME: { city: 'Rabat',              iata: 'RBA' },
  GMMN: { city: 'Casablanca',         iata: 'CMN' },
  GMAD: { city: 'Agadir',             iata: 'AGA' },
  GMTT: { city: 'Tangier',            iata: 'TNG' },
  GMFM: { city: 'Marrakech',          iata: 'RAK' },

  // Jordan / Israel
  OJAM: { city: 'Amman',              iata: 'AMM' },
  LLBG: { city: 'Tel Aviv',           iata: 'TLV' },
};

export function lookupAirport(icao) {
  if (!icao) return null;
  return AIRPORT_LOOKUP[icao.toUpperCase()] ?? null;
}

// IATA → [longitude, latitude]  used by Map.jsx to draw origin→destination route lines
export const AIRPORT_COORDS = {
  // Eindhoven
  EIN: [5.3745, 51.4501],
  // Netherlands
  AMS: [4.7639, 52.3086], RTM: [4.4371, 51.9569], GRQ: [6.5796, 53.1197],
  MST: [5.7701, 50.9117], ENS: [6.8893, 52.2758],
  // United Kingdom
  STN: [-0.2350, 51.8851], LGW: [-0.1904, 51.1481], LHR: [-0.4619, 51.4775],
  LTN: [-0.3675, 51.8747], MAN: [-2.2750, 53.3537], GLA: [-4.4330, 55.8719],
  EDI: [-3.3725, 55.9500], EMA: [-1.3282, 52.8311], BHX: [-1.7480, 52.4538],
  BRS: [-2.7191, 51.3827],
  // Ireland
  DUB: [-6.2700, 53.4213], SNN: [-8.9182, 52.7020],
  // Belgium
  BRU: [4.4844, 50.9010], CRL: [4.4527, 50.4592], OST: [2.8622, 51.1988],
  // Germany
  FRA: [8.5706, 50.0264], MUC: [11.7861, 48.3537], BER: [13.5033, 52.3667],
  DUS: [6.7668, 51.2895], CGN: [7.1427, 50.8659], HAM: [9.9823, 53.6303],
  STR: [9.2220, 48.6899], LEJ: [12.2361, 51.4239], NUE: [11.0779, 49.4988],
  HAJ: [9.6851, 52.4611], TXL: [13.2877, 52.5548], PAD: [8.6162, 51.6143],
  // France
  CDG: [2.5479, 49.0097], ORY: [2.3601, 48.7253], MRS: [5.2142, 43.4393],
  NCE: [7.2154, 43.6653], NTE: [-1.6103, 47.1532], BOD: [-0.7156, 44.8283],
  LYS: [5.0808, 45.7256], TLS: [1.3679, 43.6293], SXB: [7.6281, 48.5383],
  RNS: [-1.7279, 48.0695],
  // Spain
  BCN: [2.0785, 41.2971], MAD: [-3.5673, 40.4719], ALC: [-0.5582, 38.2822],
  AGP: [-4.4991, 36.6749], PMI: [2.7388, 39.5513], VIT: [-2.7245, 42.8825],
  REU: [1.1669, 41.1474], GRO: [2.7607, 41.9010], SVQ: [-5.8931, 37.4180],
  GRX: [-3.7773, 37.1887], BIO: [-2.9106, 43.3011], OVD: [-6.0345, 43.5635],
  // Canary Islands
  FUE: [-13.8638, 28.4527], LPA: [-15.3866, 27.9319], TFS: [-16.5726, 28.0445],
  TFN: [-16.3414, 28.4827], SPC: [-17.7554, 28.6265], VDE: [-17.8871, 27.8149],
  ACE: [-13.6052, 28.9455],
  // Portugal
  LIS: [-9.1354, 38.7742], OPO: [-8.6814, 41.2481], FAO: [-8.0004, 37.0144],
  FNC: [-16.7781, 32.6979],
  // Italy
  FCO: [12.2508, 41.8003], BGY: [9.7044, 45.6694], LIN: [9.2775, 45.4498],
  MXP: [8.7230, 45.6306], VCE: [12.3519, 45.5053], PSR: [14.1821, 42.4317],
  PMO: [13.1013, 38.1761], CTA: [15.0665, 37.4668], BDS: [17.9470, 40.6576],
  CIA: [12.5921, 41.7994], FOG: [15.5349, 41.4324], BRI: [16.7621, 41.1388],
  NAP: [14.2908, 40.8840], TRS: [13.4727, 45.8275], TSF: [12.1944, 45.6484],
  // Switzerland
  ZRH: [8.5492, 47.4647], GVA: [6.1092, 46.2381], LUG: [8.9105, 46.0044],
  // Austria
  VIE: [16.5698, 48.1103], SZG: [13.0043, 47.7933], INN: [11.3440, 47.2602],
  // Czechia
  PRG: [14.2600, 50.1008], BRQ: [16.6948, 49.1513],
  // Poland
  WAW: [20.9671, 52.1657], KRK: [19.7847, 50.0778], GDN: [18.4662, 54.3776],
  POZ: [16.8263, 52.4210], WRO: [16.8858, 51.1071], KTW: [19.0800, 50.4743],
  // Hungary
  BUD: [19.2611, 47.4369],
  // Romania
  OTP: [26.1021, 44.5722], CLJ: [23.6862, 46.7852],
  // Bulgaria
  SOF: [23.4114, 42.6952], BOJ: [27.5152, 42.5697], VAR: [27.8252, 43.2322],
  // Slovakia
  BTS: [17.2137, 48.1702],
  // Croatia
  ZAG: [16.0688, 45.7429], SPU: [16.2980, 43.5389], DBV: [18.2682, 42.5614],
  LSZ: [14.3935, 44.5658],
  // Serbia
  BEG: [20.3090, 44.8184],
  // North Macedonia
  SKP: [21.6214, 41.9614],
  // Albania
  TIA: [19.7206, 41.4147],
  // Greece
  ATH: [23.9445, 37.9364], SKG: [22.9710, 40.5197], HER: [25.1803, 35.3397],
  CFU: [19.9116, 39.6019], RHO: [28.0862, 36.4054], KLX: [22.0253, 37.0681],
  // Cyprus
  PFO: [32.4857, 34.7179], LCA: [33.6249, 34.8751],
  // Turkey
  IST: [28.7480, 40.9769], SAW: [29.3092, 40.8986], AYT: [30.8003, 36.8988],
  ADB: [27.1570, 38.2924],
  // Ukraine
  KBP: [30.8892, 50.3450], IEV: [30.4521, 50.4019], LWO: [23.9561, 49.8128],
  // Scandinavia & Nordics
  OSL: [11.1003, 60.1939], BOO: [14.3653, 67.2692], ARN: [17.9186, 59.6519],
  GOT: [12.2798, 57.6628], CPH: [12.6560, 55.6179], HEL: [24.9633, 60.3172],
  TMP: [23.6042, 61.4141],
  // Morocco
  RBA: [-6.7513, 34.0514], CMN: [-7.5899, 33.3675], AGA: [-9.4130, 30.3250],
  TNG: [-5.9169, 35.7268], RAK: [-8.0363, 31.6069],
  // Jordan / Israel
  AMM: [35.9913, 31.7226], TLV: [34.8882, 32.0114],
};
