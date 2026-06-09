export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { path = '' } = req.query;
    const pathStr = Array.isArray(path) ? path.join('/') : path;
    const url = `https://api.adsb.lol/${pathStr}${req.url.split('?')[1] ? '?' + req.url.split('?')[1] : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Flight-Tracker/1.0',
      },
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('[adsb proxy error]', error.message);
    res.status(502).json({ error: 'Bad Gateway', message: error.message });
  }
}
