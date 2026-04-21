// Minimal static file server for Playwright tests.
// Unlike `serve`, this does not rewrite URLs or strip query strings.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORT = 3000;
const ROOT = join(fileURLToPath(import.meta.url), '..');
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.png':  'image/png',
  '.ico':  'image/x-icon',
  '.svg':  'image/svg+xml',
};

createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const filePath = join(ROOT, url.pathname);
  try {
    const data = await readFile(filePath);
    const mime = TYPES[extname(filePath)] ?? 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
}).listen(PORT, '127.0.0.1', () =>
  process.stdout.write(`Test server running at http://localhost:${PORT}\n`)
);
