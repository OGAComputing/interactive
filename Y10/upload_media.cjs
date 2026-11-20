// Uploads media to a folder in the course's Drive folder, then prints each file's Drive ID, its links and who it is
// shared with (it must be the Outwood domain only, view-only: Y10/CLAUDE.md).
//   node Y10/upload_media.cjs --to Clips "<clip>.mp3" "<clip>.mp4"          audio and video clips (/add-clip)
//   node Y10/upload_media.cjs --to Images "<poster>.jpg"                     master copies of product images (/find-images)
//   node Y10/upload_media.cjs --to "Photo Bank" "<photo>.jpg"                free photos students may edit
// A file whose name is already in that folder is replaced in place, so its ID and every link to it keep working.
// Signs in with drive_publish.cjs's saved Google sign-in (~/.oga-drive; the first run opens a browser).
// Clips and full-size images are never put in this repo, so upload them from outside it (or from the git-ignored
// _presentations/Y10_BTEC_CDM/images/). Then record each clip's ID in Y10/media.md.
const path = require('path');
const fs = require('fs');
const D = require('../_presentations/drive_publish.cjs');

const COURSE_FOLDER = '1qs5P8Jj3ZcRDurJtcHiJc8iUX75fa3ey';   // shared with the Outwood domain, view-only (Y10/CLAUDE.md)
const FOLDERS = ['Clips', 'Images', 'Photo Bank'];
const q = (s) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
const list = (query) => D.drive(`${D.API}/files?${D.ALL_DRIVES}&includeItemsFromAllDrives=true&corpora=allDrives`
  + `&fields=files(id,name)&q=${encodeURIComponent(query + ' and trashed = false')}`).then((r) => r.files);

(async () => {
  const args = process.argv.slice(2), at = args.indexOf('--to');
  const to = at >= 0 ? args[at + 1] : null, files = args.filter((a, i) => a !== '--to' && i !== at + 1);
  if (!FOLDERS.includes(to) || !files.length) throw new Error(`Usage: node Y10/upload_media.cjs --to ${FOLDERS.map((f) => `"${f}"`).join('|')} <file> [<file> …]`);
  for (const f of files) if (!fs.existsSync(f)) throw new Error(`No such file: ${f}`);
  await D.signIn();
  const dest = (await list(`'${COURSE_FOLDER}' in parents and name = '${q(to)}' and mimeType = 'application/vnd.google-apps.folder'`))[0];
  if (!dest) throw new Error(`No "${to}" folder in the course Drive folder.`);
  for (const file of files) {
    const name = path.basename(file);
    const existing = (await list(`'${dest.id}' in parents and name = '${q(name)}'`))[0];
    const up = await D.upload(file, { parentId: dest.id, name, existingId: existing?.id });
    const perms = await D.drive(`${D.API}/files/${up.id}/permissions?${D.ALL_DRIVES}&fields=permissions(type,role,domain)`)
      .then((r) => r.permissions).catch(() => []);
    const domains = perms.filter((p) => p.type === 'domain').map((p) => `${p.domain} (${p.role})`);
    const anyone = perms.some((p) => p.type === 'anyone');
    console.log(`${existing ? 'replaced' : 'uploaded'} ${to}/${name}\n  id:      ${up.id}`
      + `\n  embed:   https://drive.google.com/file/d/${up.id}/preview?t=0\n  open:    https://drive.google.com/file/d/${up.id}/view?t=0`
      + `\n  sharing: ${domains.join(', ') || 'no domain share'}; ${perms.filter((p) => p.type === 'user').length} named people`
      + (anyone ? '\n  WARNING: shared with anyone with the link. Media must be Outwood-only (Y10/CLAUDE.md).' : '')
      + (domains.length ? '' : '\n  WARNING: not shared with the Outwood domain, so students can\'t open it.'));
  }
})().catch((e) => { console.error(e.message); process.exit(1); });
