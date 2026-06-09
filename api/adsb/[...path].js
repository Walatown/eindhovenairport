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
    const url = new URL(`https://api.adsb.lol/${pathStr}`);

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

    console.log('[adsb]', url.toString());

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'User-Agent': 'Flight-Tracker/1.0',
      },
    });

    // Get response body as text first to safely parse
    const responseText = await response.text();

    if (!response.ok) {
      console.error(`[adsb] upstream error ${response.status}: ${responseText.substring(0, 200)}`);
      return res.status(response.status).json({
        error: `adsb.lol returned ${response.status}`,
        body: responseText.substring(0, 500)
      });
    }

    // Try to parse as JSON, fall back to text if it fails
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      console.error(`[adsb] failed to parse JSON: ${responseText.substring(0, 200)}`);
      return res.status(502).json({
        error: 'Invalid JSON from adsb.lol',
        body: responseText.substring(0, 500)
      });
    }

    res.status(response.status).json(data);
  } catch (error) {
    console.error('[adsb] fetch error:', error.message);
    res.status(502).json({ error: 'Upstream request failed', details: error.message });
  }
}
