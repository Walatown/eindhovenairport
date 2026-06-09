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
    const url = `https://www.eindhovenairport.nl/${pathStr}${req.url.split('?')[1] ? '?' + req.url.split('?')[1] : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Flight-Tracker/1.0',
      },
    });

    // Handle different content types
    const contentType = response.headers.get('content-type');
    let data;

    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else if (contentType?.includes('text/plain')) {
      data = await response.text();
    } else {
      data = await response.text();
    }

    res.status(response.status).setHeader('Content-Type', contentType || 'application/json').send(data);
  } catch (error) {
    console.error('[ein-api proxy error]', error.message);
    res.status(502).json({ error: 'Bad Gateway', message: error.message });
  }
}
