import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig, Plugin} from 'vite';

const STORE_CACHE_FILE = path.resolve(__dirname, 'store_data.json');

function storeApiPlugin(): Plugin {
  return {
    name: 'store-api-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url) return next();
        const cleanUrl = req.url.split('?')[0];

        if (cleanUrl === '/api/store') {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

          if (req.method === 'OPTIONS') {
            res.statusCode = 200;
            res.end();
            return;
          }

          if (req.method === 'GET') {
            res.setHeader('Content-Type', 'application/json');
            if (fs.existsSync(STORE_CACHE_FILE)) {
              try {
                const data = fs.readFileSync(STORE_CACHE_FILE, 'utf-8');
                res.statusCode = 200;
                res.end(data);
                return;
              } catch (e) {
                console.error('Error reading store file:', e);
              }
            }
            res.statusCode = 200;
            res.end(JSON.stringify(null));
            return;
          }

          if (req.method === 'POST') {
            let body = '';
            req.on('data', (chunk) => {
              body += chunk;
            });
            req.on('end', () => {
              try {
                JSON.parse(body);
                fs.writeFileSync(STORE_CACHE_FILE, body, 'utf-8');

                // Asynchronously forward to online cloud bin
                fetch('https://extendsclass.com/api/json-storage/bin/eedfddc', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body,
                }).catch(() => {});

                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true }));
              } catch {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
              }
            });
            return;
          }
        }
        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), storeApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
