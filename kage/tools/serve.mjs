/* Development server for Kage.
 *
 * Serves the repository statically and exposes POST /__save?path=… so the asset
 * generator pages can write their rendered WebP output straight into assets/.
 * Nothing in this file ships with the site.
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.PORT || 8751);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (req.method === 'POST' && url.pathname === '/__save') {
    const rel = url.searchParams.get('path') || '';
    const dest = path.resolve(ROOT, rel);
    if (!dest.startsWith(ROOT) || rel.includes('..')) {
      res.writeHead(400).end('bad path');
      return;
    }
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      const buf = Buffer.concat(chunks);
      fs.writeFileSync(dest, buf);
      process.stdout.write(`saved ${rel} (${(buf.length / 1024).toFixed(1)} kB)\n`);
      res.writeHead(200, { 'content-type': 'text/plain' }).end('ok');
    });
    return;
  }

  let pathname = decodeURIComponent(url.pathname);
  if (pathname.endsWith('/')) pathname += 'index.html';
  const file = path.resolve(ROOT, `.${pathname}`);
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404, { 'content-type': 'text/plain' }).end('404');
    return;
  }
  res.writeHead(200, {
    'content-type': TYPES[path.extname(file)] || 'application/octet-stream',
    'cache-control': 'no-store',
  });
  fs.createReadStream(file).pipe(res);
});

server.listen(PORT, '127.0.0.1', () => {
  process.stdout.write(`kage dev server on http://127.0.0.1:${PORT}/\n`);
});
