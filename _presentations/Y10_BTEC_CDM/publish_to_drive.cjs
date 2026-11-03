// Publish Component 1 lesson decks to the course Drive folder as Google Slides.
//
//   node publish_to_drive.cjs                  rebuild every lesson deck, then upload each deck (and its resources) that changed
//   node publish_to_drive.cjs L1.1_Media_Everywhere.pptx [--force]
//   node publish_to_drive.cjs --dry-run        rebuild and list what would be uploaded, without signing in
//
// Every deck is rebuilt from its build_L<n>.cjs first, so Drive always gets the latest builder and kit; a build
// that fails (usually: the deck is open in PowerPoint) stops the run before anything is uploaded.
// Each deck goes to <course folder>/<term folder>/<lesson folder>, e.g. "Term 2 (Component 1 Theory)/1.1 Media
// Everywhere", converted to Google Slides. Files in resources/<deck name>/ go in the same folder (Word, Excel
// and PowerPoint files are converted to Docs, Sheets and Slides). Drive IDs and content hashes are kept in
// drive.json, so a republish replaces the contents of the same Slides file and links posted in Classroom keep working.
// Anything changed by hand in the Slides copy is overwritten: edit the builder, not the Slides file.
//
// One-time setup (see README.md): a Desktop OAuth client JSON at ~/.oga-drive/client_secret.json. The first run
// opens a browser to sign in; the token is kept in ~/.oga-drive/token.json, outside the repo.

const fs = require('fs');
const path = require('path');
const http = require('http');
const crypto = require('crypto');
const os = require('os');
const zlib = require('zlib');
const { spawn, execFileSync } = require('child_process');

const HERE = __dirname;
const CONFIG = path.join(HERE, 'drive.json');
const AUTH_DIR = path.join(os.homedir(), '.oga-drive');
const SCOPE = 'https://www.googleapis.com/auth/drive';
const API = 'https://www.googleapis.com/drive/v3';
const UPLOAD = 'https://www.googleapis.com/upload/drive/v3';
const ALL_DRIVES = 'supportsAllDrives=true';
const FOLDER = 'application/vnd.google-apps.folder';
const CONVERT = {
  '.pptx': ['application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/vnd.google-apps.presentation'],
  '.docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.google-apps.document'],
  '.xlsx': ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.google-apps.spreadsheet'],
};
const PLAIN = { '.pdf': 'application/pdf', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.mp4': 'video/mp4', '.txt': 'text/plain' };

const args = process.argv.slice(2);
const force = args.includes('--force'), dryRun = args.includes('--dry-run');
const named = args.filter((a) => !a.startsWith('--')).map((a) => path.basename(a));

const sha = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
// A rebuilt deck differs from the last build only in its save time (docProps/core.xml) and the random section IDs
// in ppt/presentation.xml, so a deck's hash covers every other file in the .pptx (by CRC) and presentation.xml
// without those IDs. Unchanged slides then hash the same and are not uploaded again.
function deckSig(file) {
  const b = fs.readFileSync(file), rows = [];
  let e = b.length - 22;
  while (b.readUInt32LE(e) !== 0x06054b50) e--;
  for (let i = 0, p = b.readUInt32LE(e + 16); i < b.readUInt16LE(e + 10); i++) {
    const crc = b.readUInt32LE(p + 16), nl = b.readUInt16LE(p + 28), name = b.toString('utf8', p + 46, p + 46 + nl);
    if (name === 'ppt/presentation.xml') {
      const lo = b.readUInt32LE(p + 42), data = b.subarray(lo + 30 + b.readUInt16LE(lo + 26) + b.readUInt16LE(lo + 28)).subarray(0, b.readUInt32LE(p + 20));
      const xml = (b.readUInt16LE(p + 10) ? zlib.inflateRawSync(data) : data).toString('utf8');
      rows.push(name + ':' + xml.replace(/ id="\{[0-9a-fA-F-]+\}"/g, ''));
    } else if (name !== 'docProps/core.xml') rows.push(`${name}:${crc}`);
    p += 46 + nl + b.readUInt16LE(p + 30) + b.readUInt16LE(p + 32);
  }
  return crypto.createHash('sha256').update(rows.sort().join('\n')).digest('hex');
}
// Runs build_L<n>.cjs, which rewrites L<n>_<Name>.pptx. Shows the builder's warnings (images still to supply).
function rebuild(builder) {
  try {
    const out = execFileSync(process.execPath, [builder], { cwd: HERE, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    console.log(`rebuilt ${builder}`);
    out.split('\n').filter((l) => l.trim() && !l.startsWith('Wrote')).forEach((l) => console.log('  ' + l.trim()));
  } catch (e) {
    const busy = /EBUSY/.test(e.stderr);
    throw new Error(`${builder} failed${busy ? ': its deck is open in PowerPoint. Close it and run again.' : ':\n' + e.stderr}`);
  }
}
// L1.1_Media_Everywhere.pptx → "1.1 Media Everywhere"
const lessonName = (deck) => path.basename(deck, '.pptx').replace(/^L/, '').replace(/_/g, ' ');

// ── Sign-in (OAuth loopback flow for a Desktop client) ────────────────────────
async function accessToken() {
  const secretFile = path.join(AUTH_DIR, 'client_secret.json'), tokenFile = path.join(AUTH_DIR, 'token.json');
  if (!fs.existsSync(secretFile)) throw new Error(`No OAuth client at ${secretFile}. See "Publishing to Drive" in README.md.`);
  const c = JSON.parse(fs.readFileSync(secretFile, 'utf8'));
  const { client_id, client_secret } = c.installed || c.web;
  if (fs.existsSync(tokenFile)) {
    const { refresh_token } = JSON.parse(fs.readFileSync(tokenFile, 'utf8'));
    const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST',
      body: new URLSearchParams({ client_id, client_secret, refresh_token, grant_type: 'refresh_token' }) });
    if (r.ok) return (await r.json()).access_token;
    console.log('Saved sign-in no longer works; signing in again.');
  }
  let port;
  const code = await new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const u = new URL(req.url, 'http://127.0.0.1');
      if (!u.searchParams.has('code') && !u.searchParams.has('error')) { res.end(); return; }
      res.end('Signed in. You can close this tab and go back to the terminal.');
      server.close();
      u.searchParams.get('code') ? resolve(u.searchParams.get('code')) : reject(new Error(u.searchParams.get('error')));
    });
    server.listen(0, '127.0.0.1', () => {
      port = server.address().port;
      const url = 'https://accounts.google.com/o/oauth2/v2/auth?' + new URLSearchParams({ client_id, scope: SCOPE,
        redirect_uri: `http://127.0.0.1:${port}`, response_type: 'code', access_type: 'offline', prompt: 'consent' });
      console.log('Opening the browser to sign in to Google. If it does not open, visit:\n' + url);
      spawn('rundll32', ['url.dll,FileProtocolHandler', url], { detached: true, stdio: 'ignore' }).unref();
    });
  });
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: new URLSearchParams({
    client_id, client_secret, code, redirect_uri: `http://127.0.0.1:${port}`, grant_type: 'authorization_code' }) });
  if (!r.ok) throw new Error('Sign-in failed: ' + await r.text());
  const t = await r.json();
  fs.mkdirSync(AUTH_DIR, { recursive: true });
  fs.writeFileSync(tokenFile, JSON.stringify({ refresh_token: t.refresh_token }));
  return t.access_token;
}

// ── Drive calls ────────────────────────────────────────────────────────────────
let TOKEN;
async function drive(url, opts = {}) {
  const r = await fetch(url, { ...opts, headers: { Authorization: `Bearer ${TOKEN}`, ...opts.headers } });
  if (!r.ok) { const e = new Error(`${opts.method || 'GET'} ${url.split('?')[0]} → ${r.status} ${await r.text()}`); e.status = r.status; throw e; }
  return r.status === 204 ? null : r.json();
}

async function exists(id) {
  if (!id) return false;
  try { const f = await drive(`${API}/files/${id}?${ALL_DRIVES}&fields=id,trashed`); return !f.trashed; }
  catch (e) { if (e.status === 404) return false; throw e; }
}

async function folder(parentId, name, knownId) {
  if (await exists(knownId)) return knownId;
  const q = `'${parentId}' in parents and name = '${name.replace(/'/g, "\\'")}' and mimeType = '${FOLDER}' and trashed = false`;
  const found = await drive(`${API}/files?${ALL_DRIVES}&includeItemsFromAllDrives=true&corpora=allDrives&fields=files(id)&q=${encodeURIComponent(q)}`);
  if (found.files.length) return found.files[0].id;
  const made = await drive(`${API}/files?${ALL_DRIVES}&fields=id`, { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, mimeType: FOLDER, parents: [parentId] }) });
  console.log(`  made folder "${name}"`);
  return made.id;
}

// Resumable upload (multipart is limited to 5 MB). New file: converted on create. Existing file: its contents are
// replaced and Drive imports them into the same Google file, so its ID and links stay the same.
async function upload(file, { parentId, name, existingId }) {
  const ext = path.extname(file).toLowerCase();
  const [contentType, googleType] = CONVERT[ext] || [PLAIN[ext] || 'application/octet-stream'];
  const replace = await exists(existingId);
  const meta = replace ? {} : { name, parents: [parentId], ...(googleType && { mimeType: googleType }) };
  const start = await fetch(replace ? `${UPLOAD}/files/${existingId}?uploadType=resumable&${ALL_DRIVES}` : `${UPLOAD}/files?uploadType=resumable&${ALL_DRIVES}`, {
    method: replace ? 'PATCH' : 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json; charset=UTF-8', 'X-Upload-Content-Type': contentType },
    body: JSON.stringify(meta) });
  if (!start.ok) throw new Error(`Upload of ${path.basename(file)} refused: ${start.status} ${await start.text()}`);
  const r = await fetch(start.headers.get('location'), { method: 'PUT', headers: { 'Content-Type': contentType }, body: fs.readFileSync(file) });
  if (!r.ok) throw new Error(`Upload of ${path.basename(file)} failed: ${r.status} ${await r.text()}`);
  const f = await r.json();
  return drive(`${API}/files/${f.id}?${ALL_DRIVES}&fields=id,name,webViewLink`);
}

// ── Main ───────────────────────────────────────────────────────────────────────
(async () => {
  const cfg = JSON.parse(fs.readFileSync(CONFIG, 'utf8'));
  cfg.lessons ||= {};
  // build_L1.1.cjs writes L1.1_<Name>.pptx; a named deck rebuilds only its own builder.
  const lessonId = (f) => f.match(/^(?:build_)?(L[\d.]*\d[A-Z]?)[_.]/)?.[1];
  const wanted = named.map(lessonId);
  fs.readdirSync(HERE).filter((f) => /^build_L.+\.cjs$/.test(f) && (!named.length || wanted.includes(lessonId(f)))).forEach(rebuild);
  const decks = fs.readdirSync(HERE).filter((f) => /^L[\d.]+[A-Z]?_.+\.pptx$/.test(f) && (!named.length || named.includes(f)));
  if (named.length && decks.length < named.length) throw new Error(`Not a lesson deck in this folder: ${named.filter((n) => !decks.includes(n)).join(', ')}`);

  // Work out what changed before signing in, so a run with nothing to do needs no browser.
  const jobs = [];
  for (const deck of decks) {
    const key = path.basename(deck, '.pptx'), rec = cfg.lessons[key] || {};
    const resDir = path.join(HERE, 'resources', key);
    const resources = fs.existsSync(resDir) ? fs.readdirSync(resDir).filter((f) => fs.statSync(path.join(resDir, f)).isFile()) : [];
    const files = [{ file: path.join(HERE, deck), name: `Lesson ${lessonName(deck)}`, slot: 'deck' },
      ...resources.map((r) => ({ file: path.join(resDir, r), name: path.basename(r, path.extname(r)), slot: r }))];
    files.forEach((f) => { f.sha = f.slot === 'deck' ? deckSig(f.file) : sha(f.file); });
    const todo = files.filter((f) => force || (f.slot === 'deck' ? rec.sha : rec.resources?.[f.slot]?.sha) !== f.sha);
    if (todo.length) jobs.push({ deck, key, todo });
  }
  if (!jobs.length) { console.log('Drive is up to date: no deck or resource has changed since it was published.'); return; }
  for (const j of jobs) console.log(`${j.deck}: ${j.todo.map((t) => t.slot === 'deck' ? 'deck' : t.slot).join(', ')}`);
  if (dryRun) return;

  TOKEN = await accessToken();
  cfg.termId = await folder(cfg.courseFolderId, cfg.termFolder, cfg.termId);
  const save = () => fs.writeFileSync(CONFIG, JSON.stringify(cfg, null, 2) + '\n');
  for (const { deck, key, todo } of jobs) {
    const rec = cfg.lessons[key] ||= {};
    rec.folderId = await folder(cfg.termId, lessonName(deck), rec.folderId);
    for (const t of todo) {
      const prev = t.slot === 'deck' ? rec.slidesId : rec.resources?.[t.slot]?.id;
      const f = await upload(t.file, { parentId: rec.folderId, name: t.name, existingId: prev });
      if (t.slot === 'deck') Object.assign(rec, { slidesId: f.id, sha: t.sha, link: f.webViewLink });
      else (rec.resources ||= {})[t.slot] = { id: f.id, sha: t.sha };
      console.log(`  ${prev === f.id ? 'updated' : 'uploaded'} ${f.name}: ${f.webViewLink}`);
      save();
    }
    console.log(`  folder: https://drive.google.com/drive/folders/${rec.folderId}`);
  }
})().catch((e) => { console.error(e.message); process.exit(1); });
