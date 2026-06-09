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
    const { path = [] } = req.query;
    const pathStr = Array.isArray(path) ? path.join('/') : path;

    // Reconstruct URL with query parameters
    const url = new URL(`https://www.eindhovenairport.nl/${pathStr}`);

    // Add any query parameters from the original request
    Object.keys(req.query).forEach(key => {
      if (key !== 'path') {
        const value = req.query[key];
        if (Array.isArray(value)) {
          value.forEach(v => url.searchParams.append(key, v));
        } else {
          url.searchParams.set(key, value);
        }
      }
    });

    console.log('[ein-api]', url.toString());

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'User-Agent': 'Flight-Tracker/1.0',
      },
    });

    if (!response.ok) {
      console.error(`[ein-api] upstream error ${response.status}`);
      return res.status(response.status).json({
        error: `Eindhoven Airport API returned ${response.status}`
      });
    }

    const contentType = response.headers.get('content-type');
    let data;

    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    res.status(response.status).setHeader('Content-Type', contentType || 'application/json').send(data);
  } catch (error) {
    console.error('[ein-api] fetch error:', error.message);
    res.status(502).json({ error: 'Upstream request failed', details: error.message });
  }
}
