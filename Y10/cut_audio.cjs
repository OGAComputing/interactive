// Cuts an MP3 into a short clip: one or more time ranges joined in order, each cut moved to the quietest moment
// near it so it falls in a pause rather than mid-word. No ffmpeg needed: MP3 is cut at frame boundaries, and
// Playwright's Chromium decodes the audio to find the pauses.
//   node Y10/cut_audio.cjs <source.mp3> <out.mp3> 13:59-14:45 15:33-16:16      a clip (90 s at most)
//   node Y10/cut_audio.cjs <source.mp3> <out.mp3> 15:30-18:35 --check          a check file to listen through (no limit, no snapping)
// Options: --exact (cut at the times given, no snapping), --snap=<seconds> (search window either side; default 2).
// Times are m:ss(.s) or seconds, of the source. Keep the source and the clips outside the repo (Y10/CLAUDE.md).
const fs = require('fs');
const path = require('path');

const MAX_CLIP = 90;   // seconds (Nick, 2026-11-20)
const BITRATES = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320];
const RATES = [44100, 48000, 32000];

// '1:02.5' → 62.5; '75' → 75
function parseTime(s) {
  const parts = String(s).trim().split(':').map(Number);
  if (!parts.length || parts.some((n) => !Number.isFinite(n) || n < 0)) throw new Error(`Not a time: ${s}`);
  return parts.reduce((a, v) => a * 60 + v, 0);
}
// '13:59-14:45' → [839, 885]
function parseSpan(s) {
  const m = String(s).match(/^([\d:.]+)-([\d:.]+)$/);
  if (!m) throw new Error(`Not a time range (from-to): ${s}`);
  const [a, b] = [parseTime(m[1]), parseTime(m[2])];
  if (b <= a) throw new Error(`Range ends before it starts: ${s}`);
  return [a, b];
}
const fmt = (t) => `${Math.floor(t / 60)}:${(t % 60).toFixed(1).padStart(4, '0')}`;

// MPEG-1 Layer III frames: [{ offset, length, time }]. Skips an ID3v2 tag and the Xing/Info header frame
// (its frame count is for the whole source, so a clip that kept it would show the wrong length).
function frames(buf) {
  let i = 0;
  if (buf.slice(0, 3).toString('latin1') === 'ID3') i = 10 + ((buf[6] << 21) | (buf[7] << 14) | (buf[8] << 7) | buf[9]);
  const out = [];
  let t = 0;
  while (i + 4 <= buf.length) {
    const ver = (buf[i + 1] >> 3) & 3, layer = (buf[i + 1] >> 1) & 3, bri = buf[i + 2] >> 4, sri = (buf[i + 2] >> 2) & 3;
    if (buf[i] !== 0xff || (buf[i + 1] & 0xe0) !== 0xe0 || ver !== 3 || layer !== 1 || bri === 0 || bri === 15 || sri === 3) { i++; continue; }
    const rate = RATES[sri], length = Math.floor(144 * BITRATES[bri] * 1000 / rate) + ((buf[i + 2] >> 1) & 1);
    out.push({ offset: i, length, time: t });
    t += 1152 / rate; i += length;
  }
  if (!out.length) throw new Error('No MPEG-1 Layer III frames found: is it an MP3?');
  const head = buf.slice(out[0].offset, out[0].offset + out[0].length).toString('latin1');
  if (head.includes('Xing') || head.includes('Info')) {
    const d = out[1]?.time || 0;
    out.shift();
    out.forEach((f) => { f.time -= d; });
  }
  return out;
}

function cut(buf, fr, spans) {
  return Buffer.concat(spans.flatMap(([a, b]) => fr.filter((f) => f.time >= a && f.time < b).map((f) => buf.subarray(f.offset, f.offset + f.length))));
}

// Loudness every 0.1 s, decoded by Chromium (Web Audio resamples to 8 kHz mono).
async function loudness(file) {
  const { chromium } = require(path.join(__dirname, '..', 'node_modules', 'playwright'));
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.route('http://clip.local/a.mp3', (r) => r.fulfill({ body: fs.readFileSync(file), contentType: 'audio/mpeg' }));
    await page.route('http://clip.local/', (r) => r.fulfill({ body: '<html></html>', contentType: 'text/html' }));
    await page.goto('http://clip.local/');
    return await page.evaluate(async () => {
      const ab = await new OfflineAudioContext(1, 8000, 8000).decodeAudioData(await (await fetch('http://clip.local/a.mp3')).arrayBuffer());
      const d = ab.getChannelData(0), w = Math.round(ab.sampleRate / 10), rms = [];
      for (let i = 0; i + w <= d.length; i += w) { let s = 0; for (let j = i; j < i + w; j++) s += d[j] * d[j]; rms.push(Math.sqrt(s / w)); }
      return rms;
    });
  } finally { await browser.close(); }
}
// The middle of the quietest 0.4 s within `win` seconds of t.
function quietest(rms, t, win) {
  const lo = Math.max(0, Math.round((t - win) * 10)), hi = Math.min(rms.length - 4, Math.round((t + win) * 10));
  let best = Math.round(t * 10), bestSum = Infinity;
  for (let k = lo; k <= hi; k++) { const s = rms[k] + rms[k + 1] + rms[k + 2] + rms[k + 3]; if (s < bestSum) { bestSum = s; best = k; } }
  return (best + 2) / 10;
}

module.exports = { parseTime, parseSpan, frames, cut, quietest, MAX_CLIP };

if (require.main === module) (async () => {
  const args = process.argv.slice(2), flags = args.filter((a) => a.startsWith('--')), [src, out, ...rest] = args.filter((a) => !a.startsWith('--'));
  if (!src || !out || !rest.length) throw new Error('Usage: node Y10/cut_audio.cjs <source.mp3> <out.mp3> <from-to> [<from-to> …] [--check|--exact|--snap=2]');
  const check = flags.includes('--check'), exact = check || flags.includes('--exact');
  const win = Number(flags.find((f) => f.startsWith('--snap='))?.slice(7) || 2);
  let spans = rest.map(parseSpan);
  if (!exact) {
    const rms = await loudness(src);
    spans = spans.map(([a, b]) => [a === 0 ? 0 : quietest(rms, a, win), quietest(rms, b, win)]);
  }
  const total = spans.reduce((s, [a, b]) => s + b - a, 0);
  if (!check && total > MAX_CLIP) throw new Error(`That clip would be ${total.toFixed(1)} s: clips are ${MAX_CLIP} s at most. Shorten a range.`);
  const buf = fs.readFileSync(src);
  fs.writeFileSync(out, cut(buf, frames(buf), spans));
  let at = 0;
  console.log(`${out}: ${fmt(total)} (${(fs.statSync(out).size / 1024).toFixed(0)} KB)`);
  for (const [a, b] of spans) { console.log(`  clip ${fmt(at)}–${fmt(at + b - a)}  =  source ${fmt(a)}–${fmt(b)}`); at += b - a; }
})().catch((e) => { console.error(e.message); process.exit(1); });
