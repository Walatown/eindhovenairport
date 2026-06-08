import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'terminal-logger',
      configureServer(server) {
        server.middlewares.use('/debug-log', (req, res) => {
          if (req.method !== 'POST') { res.end(); return; }
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const { label, data } = JSON.parse(body);
              console.log(`\n\x1b[36m[DEBUG] ${label}\x1b[0m`);
              console.log(JSON.stringify(data, null, 2));
            } catch {
              console.log('[DEBUG raw]', body);
            }
            res.setHeader('Content-Type', 'text/plain');
            res.end('ok');
          });
        });
      },
    },
  ],
  server: {
    proxy: {
      '/adsb': {
        target: 'https://api.adsb.lol',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/adsb/, ''),
      },
      '/ein-api': {
        target: 'https://www.eindhovenairport.nl',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/ein-api/, ''),
      },
    },
  },
})
