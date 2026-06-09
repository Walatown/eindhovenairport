export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract path from query parameter
    let pathStr = req.query.path || '';
    if (Array.isArray(pathStr)) {
      pathStr = pathStr.join('/');
    }

    // Reconstruct query string (excluding 'path' parameter)
    const queryParams = new URLSearchParams(req.query);
    queryParams.delete('path');
    const queryStr = queryParams.toString();

    // Build final URL
    const baseUrl = `https://api.adsb.lol/${pathStr}`;
    const url = queryStr ? `${baseUrl}?${queryStr}` : baseUrl;

    console.log('[adsb proxy]', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Flight-Tracker/1.0',
      },
    });

    if (!response.ok) {
      console.error(`[adsb] upstream error ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('[adsb error]', error.message, error.stack);
    res.status(502).json({ error: 'Bad Gateway', details: error.message });
  }
}
