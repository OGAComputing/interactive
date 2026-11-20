// hub-demo.js — the hub's demo mode: index.html?demo signs in as a made-up teacher with three
// made-up classes, so the Live view (and the rest of the teacher hub) can be tried without a
// Google account or real students. Today's assignment in each class moves on while you watch:
// students finish tasks every few minutes, two get stuck, two are absent, and game scores climb.
//
// index.html?demo=45 starts 45 minutes into today's lesson (default 12).
//
// Nothing reaches Google: every googleapis.com / google.com request is answered here, and
// anything that would change Classroom (posting, grading) is refused. localStorage and
// sessionStorage are swapped for copies under an 'oga_demo:' prefix, so the demo never touches
// the real hub's sign-in, chosen class or hidden-from-leaderboard list.
//
// A plain script, loaded first in index.html's <head>: it must swap the storage and fetch
// before the hub's own scripts run. Without ?demo it does nothing.
(function () {
  'use strict';
  if (!new URLSearchParams(location.search).has('demo')) return;

  // ── Storage: the demo's own copy ───────────────────────────────────────────
  const PREFIX = 'oga_demo:';
  function prefixed(real) {
    const keys = () => { const out = []; for (let i = 0; i < real.length; i++) { const k = real.key(i); if (k && k.startsWith(PREFIX)) out.push(k.slice(PREFIX.length)); } return out; };
    return {
      getItem: k => real.getItem(PREFIX + k),
      setItem: (k, v) => real.setItem(PREFIX + k, String(v)),
      removeItem: k => real.removeItem(PREFIX + k),
      clear: () => keys().forEach(k => real.removeItem(PREFIX + k)),
      key: i => keys()[i] ?? null,
      get length() { return keys().length; },
    };
  }
  let local, session;
  try {
    local = prefixed(window.localStorage);
    session = prefixed(window.sessionStorage);
    Object.defineProperty(window, 'localStorage', { value: local, configurable: true });
    Object.defineProperty(window, 'sessionStorage', { value: session, configurable: true });
  } catch (_) { /* checked below */ }
  if (!local || window.localStorage !== local || window.sessionStorage !== session) {
    // Without its own storage the demo would overwrite the real hub's, so it doesn't start.
    console.error('Demo mode: could not separate its storage, so it is off.');
    return;
  }

  // ── Made-up classes ────────────────────────────────────────────────────────
  // A seeded random number per key, so every student does the same each time the page loads.
  function rand(key) {
    let h = 1779033703 ^ key.length;
    for (let i = 0; i < key.length; i++) { h = Math.imul(h ^ key.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
    h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  }
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  const FIRST = ['Amelia', 'Ben', 'Cara', 'Dan', 'Ella', 'Finn', 'Grace', 'Harry', 'Isla', 'Jack', 'Kiran', 'Leah', 'Mason', 'Nia',
    'Oscar', 'Priya', 'Quinn', 'Ruby', 'Sam', 'Sam', 'Tia', 'Umar', 'Violet', 'Will', 'Zara', 'Theo', 'Maya', 'Leo'];
  const LAST = ['Smith', 'Jones', 'Lee', 'Ward', 'Patel', 'Brown', 'Osei', 'Turner', 'Khan', 'Evans', 'Hughes', 'Wright', 'Green', 'Hall',
    'Wood', 'Clarke', 'Ahmed', 'Moore', 'Taylor', 'Thomas', 'Walker', 'Hussain', 'Young', 'King', 'Scott', 'Baker', 'Mills', 'Cole'];

  const page = path => new URL(path, location.href).href;
  const DAY = 86400000;
  // Today's lesson started 12 minutes before the page opened, so there is something to see at once;
  // ?demo=45 jumps to 45 minutes in (the end of the lesson, when Most improved means most).
  const minutesIn = clamp(Number(new URLSearchParams(location.search).get('demo')) || 12, 1, 120);
  const LESSON_START = Date.now() - minutesIn * 60000;
  const CLASSES = [
    { id: 'demo-8x', name: '8X Computing (demo)', size: 26, works: [
      { id: 'demo-8x-1', title: 'Binary and Denary', ago: 14, url: 'Y8/Data_Representation/L1_Binary_And_Denary/1_Binary_And_Denary.html' },
      { id: 'demo-8x-2', title: 'Binary Addition', ago: 7, url: 'Y8/Data_Representation/L2_Binary_Addition/1_Binary_Addition.html' },
      { id: 'demo-8x-3', title: 'Hexadecimal', ago: 0, url: 'Y8/Data_Representation/L3_Hexadecimal/1_Hexadecimal.html', game: 'Hex Rush X7' },
    ] },
    { id: 'demo-9y', name: '9Y Computing (demo)', size: 24, works: [
      { id: 'demo-9y-1', title: 'Locked In', ago: 14, url: 'Y9/Python/L3_While_Loops/1_Locked_In_PRIMM.html' },
      { id: 'demo-9y-2', title: 'Distress Signal', ago: 7, url: 'Y9/Python/L4_For_Loops/1_Distress_Signal_PRIMM.html' },
      { id: 'demo-9y-3', title: 'The Drone', ago: 0, url: 'Y9/Python/L5_Functions/1_The_Drone_PRIMM.html' },
    ] },
    { id: 'demo-9f', name: '9F Computing (demo)', size: 22, works: [
      { id: 'demo-9f-1', title: 'Criminal Database Investigation', ago: 7, url: 'Y9/Digital_Forensics/L4_Criminal_Database/Criminal_Database_Investigation.html' },
      { id: 'demo-9f-2', title: 'Searching the Computer', ago: 0, url: 'Y9/Digital_Forensics/L5_Searching_the_Computer/Searching_the_Computer.html', game: 'Breach Defence' },
    ] },
  ];
  const TASKS = 5;
  CLASSES.forEach((c, ci) => {
    c.students = Array.from({ length: c.size }, (_, i) => {
      const n = (i + ci * 7) % FIRST.length;
      return { i, name: `${FIRST[n]} ${LAST[n]}`, who: `demo-${c.id}-${i}`, ability: 0.3 + 0.7 * rand(`${c.id}|${i}|ability`) };
    });
    c.works.forEach(w => { w.created = w.ago ? LESSON_START - w.ago * DAY : LESSON_START; });
  });

  // One student's evidence file for one assignment, or null (absent, or nothing saved yet).
  function evidence(c, w, s, now) {
    const latest = w === c.works[c.works.length - 1];
    const key = `${c.id}|${s.i}|${w.id}`;
    // The story the demo tells: students 3 and 11 have turned a corner this week (most improved);
    // student 6, usually strong, had one bad week last time; students 8 and 17 are stuck today.
    let ability = s.ability;
    if (s.i === 3 || s.i === 11) ability = latest ? 0.97 : 0.3;
    if (s.i === 6) ability = w === c.works[c.works.length - 2] ? 0.2 : 0.9;
    const props = { ogaCourse: c.id, ogaWork: w.id, ogaSub: `demo-sub-${w.id}-${s.i}`, ogaSync: '1' };
    let done, modified;
    if (!latest) {
      if (rand(key + '|absent') < 0.1) return null;
      done = Math.round(clamp(ability + (rand(key + '|noise') - 0.5) * 0.3, 0, 1) * TASKS);
      modified = w.created + (30 + rand(key + '|end') * 25) * 60000;
    } else {
      if (s.i === 20 || s.i === 21) return null;   // absent today
      const stuck = s.i === 8 || s.i === 17;
      const cap = stuck ? 1 : Math.max(1, Math.round(clamp(ability + (rand(key + '|noise') - 0.5) * 0.2, 0, 1) * TASKS));
      // The first task is quick (2–10 minutes in); the rest are spread so everyone reaches their
      // last task between about 25 and 55 minutes in, and only the stuck two go quiet early.
      const first = stuck ? 1.5 : 2 + rand(key + '|first') * 8;
      const last = Math.max(first, 25 + rand(key + '|pace') * 20 + (1 - ability) * 10);
      const pace = cap > 1 ? (last - first) / (cap - 1) : 0;
      const t = (now - LESSON_START) / 60000;
      done = t < first ? 0 : cap > 1 ? clamp(1 + Math.floor((t - first) / pace), 1, cap) : 1;
      if (!done) return null;   // nothing saved yet
      modified = LESSON_START + (first + (done - 1) * pace) * 60000;
      if (w.game && done >= 2) {
        const played = clamp((t - first - pace) / 25, 0.15, 1);
        props.ogaLboard = String(Math.round((300 + ability * 3200 * played + rand(key + '|board') * 300) / 10) * 10);
        props.ogaLboardLabel = s.i % 9 === 4 ? w.game.replace(/ X7$/, '') : w.game;   // a few play solo
      }
    }
    props.ogaScore = String(done * (100 / TASKS));
    props.ogaLtask = `${done}/${TASKS}`;
    return {
      id: `demo-file-${w.id}-${s.i}`, modifiedTime: new Date(Math.min(modified, now)).toISOString(), appProperties: props,
      lastModifyingUser: { displayName: s.name }, owners: [{ displayName: s.name, permissionId: s.who }],
    };
  }

  // ── Google, answered here ──────────────────────────────────────────────────
  const findWork = id => { for (const c of CLASSES) { const w = c.works.find(x => x.id === id); if (w) return [c, w]; } return []; };
  function answer(url) {
    const path = url.pathname;
    let m;
    if (url.hostname === 'classroom.googleapis.com') {
      if (/^\/v1\/courses\/?$/.test(path)) return { courses: CLASSES.map(c => ({ id: c.id, name: c.name })) };
      if ((m = path.match(/^\/v1\/courses\/([^/]+)\/topics/))) return { topic: [] };
      if ((m = path.match(/^\/v1\/courses\/([^/]+)\/courseWork\/([^/]+)\/studentSubmissions/))) {
        const [c, w] = findWork(m[2]);
        return { studentSubmissions: c ? c.students.map(s => ({ id: `demo-sub-${w.id}-${s.i}` })) : [] };
      }
      if ((m = path.match(/^\/v1\/courses\/([^/]+)\/courseWork\/([^/]+)$/))) return { id: m[2], state: 'PUBLISHED' };
      if ((m = path.match(/^\/v1\/courses\/([^/]+)\/courseWork\/?$/))) {
        const c = CLASSES.find(x => x.id === m[1]);
        return { courseWork: (c ? c.works : []).map(w => ({
          id: w.id, title: w.title, creationTime: new Date(w.created).toISOString(), associatedWithDeveloper: true,
          materials: [{ link: { url: page(w.url) } }],
        })) };
      }
      return {};
    }
    if (path === '/oauth2/v3/userinfo') return { sub: 'demo-teacher', email: 'demo.teacher@example.invalid' };
    if (path.startsWith('/drive/v3/files')) {
      const work = (url.searchParams.get('q') || '').match(/key='ogaWork' and value='([^']+)'/);
      const [c, w] = work ? findWork(work[1]) : [];
      const now = Date.now();
      return { files: c ? c.students.map(s => evidence(c, w, s, now)).filter(Boolean) : [] };
    }
    return {};
  }

  const realFetch = window.fetch.bind(window);
  const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
  window.fetch = async function (input, init = {}) {
    const url = new URL(typeof input === 'string' || input instanceof URL ? input : input.url, location.href);
    if (!/(^|\.)(googleapis|google)\.com$/.test(url.hostname)) return realFetch(input, init);
    const method = String(init.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();
    await new Promise(r => setTimeout(r, 120 + Math.random() * 250));   // feels like a network
    if (method !== 'GET') return json({ error: { code: 403, message: 'Demo mode: nothing is sent to Google Classroom.' } }, 403);
    return json(answer(url));
  };

  // Signed in already: the hub's own restore picks this token up.
  sessionStorage.setItem('oga_oauth_token', JSON.stringify({ access_token: 'demo-token', scope: '', expires_at: Date.now() + 8 * 3600000 }));
  window.HubDemo = { active: true, classes: CLASSES };

  // A badge that stays on top of everything, the Live view included, with the way out.
  document.addEventListener('DOMContentLoaded', () => {
    const badge = document.createElement('div');
    badge.id = 'demo-badge';
    badge.setAttribute('role', 'note');
    badge.innerHTML = '<strong>Demo</strong> made-up classes · nothing is sent to Google · <a href="' + location.pathname + '">Exit demo</a>';
    const css = document.createElement('style');
    css.textContent = '#demo-badge{position:fixed;left:12px;bottom:12px;z-index:9500;display:flex;gap:.4rem;align-items:center;padding:.45rem .9rem;border-radius:999px;'
      + 'background:#f5a623;color:#1a1200;font:600 .85rem/1.2 "Segoe UI",system-ui,sans-serif;box-shadow:0 4px 14px rgba(0,0,0,.35)}'
      + '#demo-badge strong{text-transform:uppercase;letter-spacing:.08em}#demo-badge a{color:inherit;text-decoration:underline;padding:.3rem 0}';
    document.head.appendChild(css);
    document.body.appendChild(badge);
  });
})();
