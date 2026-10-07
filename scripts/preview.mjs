import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.mjs': 'text/javascript' };
http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/') { res.writeHead(302, { Location: '/web/index.html' }).end(); return; }
    const file = path.resolve(root, '.' + decodeURIComponent(url.pathname === '/' ? '/web/index.html' : url.pathname));
    if (!file.startsWith(root) || path.relative(root, file).startsWith('..')) { res.writeHead(403).end(); return; }
    const data = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' }).end(data);
  } catch { res.writeHead(404).end('Not found'); }
}).listen(4175, '127.0.0.1', () => console.log('Pet preview: http://127.0.0.1:4175'));
