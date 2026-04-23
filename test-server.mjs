import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORT = process.env.PORT || 3000;
const ROOT = dirname(fileURLToPath(import.meta.url));
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.mjs':  'application/javascript',
  '.json': 'application/json',
  '.wasm': 'application/wasm',
  '.zip':  'application/zip',
  '.png':  'image/png',
  '.ico':  'image/x-icon',
  '.svg':  'image/svg+xml',
};

createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const filePath = join(ROOT, url.pathname);
  
  try {
    const s = await stat(filePath);
    if (s.isDirectory()) {
      res.writeHead(404);
      return res.end('Not found');
    }
    const ext = extname(filePath).toLowerCase();
    const mime = TYPES[ext] || 'application/octet-stream';
    
    res.writeHead(200, { 
      'Content-Type': mime,
      'Content-Length': s.size,
      'Access-Control-Allow-Origin': '*'
    });
    
    if (req.method === 'HEAD') {
      res.end();
    } else {
      res.end(await readFile(filePath));
    }
  } catch (err) {
    res.writeHead(404);
    res.end('Not found');
  }
}).listen(PORT, '127.0.0.1', () =>
  process.stdout.write(`Test server running at http://localhost:${PORT}\n`)
);
