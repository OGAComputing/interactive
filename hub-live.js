// hub-live.js — the hub's Live view: how far each student has got in one assignment,
// and a leaderboard for games, while the lesson runs.
//
// Students' pages save their score (ogaScore) and live fields (setLive in classroom.js:
// ogaLtask, ogaLboard, ogaLboardLabel) on their work evidence file. Classroom shares that
// file with the class's teachers, so the hub finds every file for the assignment with one
// Drive search (ogaWork = the assignment's ID) and redraws every POLL_MS. Nothing new is
// stored anywhere, and no student sees another student's data.
//
// The pure functions are exported for hub-live.test.js; initLive() wires up the panel.

export const POLL_MS = 20 * 1000;
// Pages save when a task is finished, so this is "no task finished for a while", not "not typing".
export const IDLE_MS = 10 * 60 * 1000;
export const BOARD_SIZE = 10;

const num = v => (v != null && v !== '' && Number.isFinite(Number(v)) ? Number(v) : null);

// Drive search for every evidence file saved for one assignment.
export function liveQuery(workId) {
  return `appProperties has { key='ogaWork' and value='${String(workId).replace(/['\\]/g, '')}' } and trashed = false`;
}

// "Amelia Smith" → "Amelia S.". Clashing short names take more of the surname until they differ.
export function shortNames(fullNames) {
  const parts = fullNames.map(n => String(n || 'Student').trim().split(/\s+/));
  const len = parts.map(() => 1);
  const make = i => {
    const [first, ...rest] = parts[i];
    const last = rest.join(' ');
    if (!last) return first;
    return len[i] >= last.length ? `${first} ${last}` : `${first} ${last.slice(0, len[i])}.`;
  };
  for (let round = 0; round < 20; round++) {
    const names = parts.map((_, i) => make(i));
    const seen = new Map();
    names.forEach((n, i) => seen.set(n, [...(seen.get(n) || []), i]));
    const clashes = [...seen.values()].filter(ix => ix.length > 1);
    if (!clashes.length) return names;
    let grew = false;
    for (const ix of clashes) {
      for (const i of ix) {
        if (len[i] < parts[i].slice(1).join(' ').length) { len[i]++; grew = true; }
      }
      // Once one surname is used up, show them all in full ("Jo Li", "Jo Lin", not "Jo Li.").
      if (ix.some(i => len[i] >= parts[i].slice(1).join(' ').length)) ix.forEach(i => { len[i] = Infinity; });
    }
    if (!grew) return names;   // same full name twice: nothing more to show
  }
  return parts.map((_, i) => make(i));
}

// One row per submission (a student with two evidence files keeps the newest), sorted A–Z.
// files: Drive files with id, modifiedTime, appProperties, lastModifyingUser, owners.
export function buildRows(files, now = Date.now()) {
  const bySub = new Map();
  for (const f of files || []) {
    const p = f.appProperties || {};
    const key = p.ogaSub || f.id;
    const modified = Date.parse(f.modifiedTime) || 0;
    const prev = bySub.get(key);
    if (prev && prev.modified >= modified) {
      // An older file still holds a higher score if the newer one was made after a reset.
      prev.score = Math.max(prev.score ?? -1, num(p.ogaScore) ?? -1);
      if (prev.score < 0) prev.score = null;
      continue;
    }
    const name = f.lastModifyingUser?.displayName || f.owners?.[0]?.displayName || 'Student';
    const score = Math.max(prev?.score ?? -1, num(p.ogaScore) ?? -1);
    bySub.set(key, {
      sub: key,
      // The same student across assignments (each assignment has its own submission ID).
      who: f.owners?.[0]?.permissionId || name,
      name,
      score: score < 0 ? null : Math.min(100, score),
      task: p.ogaLtask || '',
      board: num(p.ogaLboard),
      boardLabel: p.ogaLboardLabel || (num(p.ogaLboard) != null ? 'Leaderboard' : ''),
      boardUnit: p.ogaLboardUnit || '',
      modified,
    });
  }
  const rows = [...bySub.values()];
  const shorts = shortNames(rows.map(r => r.name));
  rows.forEach((r, i) => {
    r.short = shorts[i];
    // Perfect = 100% (gold on every task). Done = every task finished (green or better), known from
    // the page's live task field ("5/5"); a page that doesn't send one is only done at 100%.
    const [got, of] = (r.task.match(/^(\d+)\s*\/\s*(\d+)$/) || []).slice(1).map(Number);
    r.perfect = r.score === 100;
    r.done = r.perfect || (of > 0 && got >= of);
    r.idle = !r.done && now - r.modified > IDLE_MS;
  });
  return rows.sort((a, b) => a.name.localeCompare(b.name));
}

// "Needs help first": unfinished before finished, then lowest score, then longest since a save.
export function sortRows(rows, order) {
  const copy = [...rows];
  if (order === 'help') {
    copy.sort((a, b) => (a.done - b.done) || ((a.score ?? -1) - (b.score ?? -1)) || (a.modified - b.modified));
  } else {
    copy.sort((a, b) => a.name.localeCompare(b.name));
  }
  return copy;
}

// { label: [{ rank, short, board, unit }] }, best first; equal scores share a rank (1, 2, 2, 4).
// Highest wins, except a time (boardUnit 'ms'), where lowest wins.
export function leaderboards(rows, size = BOARD_SIZE) {
  const boards = {};
  for (const r of rows) {
    if (r.board == null || r.board <= 0) continue;
    (boards[r.boardLabel] ||= []).push(r);
  }
  for (const label of Object.keys(boards)) {
    const unit = boards[label][0].boardUnit;
    const dir = unit === 'ms' ? 1 : -1;
    const sorted = boards[label].sort((a, b) => dir * (a.board - b.board) || a.modified - b.modified);
    let rank = 0;
    boards[label] = sorted.slice(0, size).map((r, i) => {
      if (i === 0 || r.board !== sorted[i - 1].board) rank = i + 1;
      return { rank, who: r.who, short: r.short, board: r.board, unit };
    });
  }
  return boards;
}

// The board every assignment has, game or not: the top scores, the first to reach a score
// listed first. Same shape as a leaderboards() board, with unit '%'.
export const SCORE_BOARD = 'Top 10';
export function scoreBoard(rows, size = BOARD_SIZE) {
  const sorted = rows.filter(r => r.score > 0).sort((a, b) => (b.score - a.score) || (a.modified - b.modified));
  let rank = 0;
  return sorted.slice(0, size).map((r, i) => {
    if (i === 0 || r.score !== sorted[i - 1].score) rank = i + 1;
    return { rank, who: r.who, short: r.short, board: r.score, unit: '%' };
  });
}

// 1 → "1st", 12 → "12th", 22 → "22nd".
export function ordinal(n) {
  const t = n % 100;
  const suffix = t >= 11 && t <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] || 'th');
  return n + suffix;
}

// Place in the class by score, best first; equal scores share a place (1, 2, 2, 4).
function places(scores) {
  const sorted = [...scores].sort((a, b) => b - a);
  return v => sorted.indexOf(v) + 1;
}

// Each student's usual position, from the earlier assignments they have a score in: their place
// as a share of the class (0 = top, 1 = bottom, so classes of different sizes compare), averaged.
// A student absent from one counts on the one they did; absent from all, they have none.
// earlier: one buildRows() list per assignment. → Map(who → { pos, score, lessons })
export function usualPositions(earlier) {
  const sum = new Map();
  for (const rows of earlier) {
    const scored = rows.filter(r => r.score != null);
    const place = places(scored.map(r => r.score));
    for (const r of scored) {
      const pos = scored.length > 1 ? (place(r.score) - 1) / (scored.length - 1) : 0;
      const s = sum.get(r.who) || { pos: 0, score: 0, lessons: 0 };
      sum.set(r.who, { pos: s.pos + pos, score: s.score + r.score, lessons: s.lessons + 1 });
    }
  }
  return new Map([...sum].map(([who, s]) => [who, { pos: s.pos / s.lessons, score: Math.round(s.score / s.lessons), lessons: s.lessons }]));
}

// Most improved: who climbed most places in the class from their usual position (the earlier
// assignments, averaged, so one bad week doesn't make a big climb) to this assignment. Places,
// not raw %, so a harder task one week doesn't count against anyone. Only students with a score
// now and in at least one earlier assignment count (an absence isn't a "0 → 100" improvement),
// and only those in the top half this time, so the award goes to a good week, not a less bad one.
// Ties: the higher score now. topTwo flags students already in line for a top-two award;
// lessons is how many earlier assignments their usual position comes from.
export function mostImproved(earlier, afterRows, limit = 3) {
  const usual = usualPositions(earlier);
  const scored = afterRows.filter(r => r.score != null);
  const both = scored.filter(r => usual.has(r.who));
  const placeBefore = places(both.map(r => -usual.get(r.who).pos));   // lowest share = 1st
  const placeAfter = places(both.map(r => r.score));
  const nowSorted = both.map(r => r.score).sort((a, b) => b - a);
  const median = nowSorted.length ? nowSorted[Math.ceil(nowSorted.length / 2) - 1] : 0;
  const candidates = both.map(r => {
    const u = usual.get(r.who);
    const from = placeBefore(-u.pos), to = placeAfter(r.score);
    return { who: r.who, short: r.short, name: r.name, before: u.score, lessons: u.lessons, after: r.score, from, to, climbed: from - to, topTwo: to <= 2 };
  })
    .filter(c => c.climbed > 0 && c.after >= median)
    .sort((a, b) => (b.climbed - a.climbed) || (b.after - a.after))
    .slice(0, limit);
  return { candidates, compared: both.length, notCompared: scored.length - both.length };
}

// The earlier assignments to average over, starting from one: it and the lesson before it.
export const COMPARE_LESSONS = 2;
export function compareSet(works, startId, count = COMPARE_LESSONS) {
  const ids = [];
  for (let id = startId; id && ids.length < count && !ids.includes(id); id = defaultCompare(works, id)) ids.push(id);
  return ids;
}

// The assignment to compare with by default: the newest one set at least 2 days before this
// one (last week's lesson, not another page from today's), else the one just before it.
// works: [{ id, creationTime }].
export const COMPARE_GAP_MS = 2 * 24 * 60 * 60 * 1000;
export function defaultCompare(works, workId) {
  const current = works.find(w => w.id === workId);
  if (!current) return '';
  const t = Date.parse(current.creationTime) || 0;
  const earlier = works.filter(w => w.id !== workId && (Date.parse(w.creationTime) || 0) <= t)
    .sort((a, b) => (Date.parse(b.creationTime) || 0) - (Date.parse(a.creationTime) || 0));
  return (earlier.find(w => t - (Date.parse(w.creationTime) || 0) >= COMPARE_GAP_MS) || earlier[0])?.id || '';
}

// Students the teacher has taken off the leaderboards (anxiety, say): { who: full name }, kept in
// this browser's localStorage, so it lasts from lesson to lesson and across classes (who is the
// student's Drive permission ID, the same in every class). Progress and Most improved still show them.
export const HIDDEN_KEY = 'oga_live_hidden';
export function loadHidden(storage = globalThis.localStorage) {
  try {
    const v = JSON.parse(storage?.getItem(HIDDEN_KEY) || '{}');
    return v && typeof v === 'object' && !Array.isArray(v) ? v : {};
  } catch (_) { return {}; }
}
export function saveHidden(hidden, storage = globalThis.localStorage) {
  try { storage?.setItem(HIDDEN_KEY, JSON.stringify(hidden)); } catch (_) {}
}
export function withoutHidden(rows, hidden) {
  return rows.filter(r => !Object.hasOwn(hidden, r.who));
}

// 3100 → "3,100"; a time in ms (unit 'ms') → "1:23.4"; a score (unit '%') → "85%".
export function formatBoard(value, unit) {
  if (unit === '%') return `${Math.round(value)}%`;
  if (unit !== 'ms') return Math.round(value).toLocaleString('en-GB');
  const tenths = Math.round(value / 100);
  const m = Math.floor(tenths / 600), rest = tenths % 600;
  return `${m}:${String(Math.floor(rest / 10)).padStart(2, '0')}.${rest % 10}`;
}

// The look of the lesson an assignment links to: its year and topic (as classroom.js
// derives them, so shared.css's year themes and topic accents apply), plus a skin for
// units with a story look of their own. A link that isn't to an activity gives {}.
export const SKINS = {
  'station-zero': { match: (y, t) => y === '9' && t === 'Python', title: 'Station Zero · Crew monitor' },
  'workstation':  { match: (y, t) => y === '9' && t === 'Digital_Forensics', title: 'Forensic workstation · Live' },
};
export function themeFor(url) {
  let parts;
  try { parts = new URL(url, 'https://x.invalid/').pathname.split('/').map(decodeURIComponent); } catch (_) { return {}; }
  const y = parts.findIndex(p => /^Y\d+$/.test(p));
  if (y < 0 || !parts[y + 1] || /\.html$/i.test(parts[y + 1])) return {};
  const year = parts[y].slice(1);
  const topic = parts[y + 1]
    .replace(/^[\d.&\s]+/, '')
    .replace(/\w/g, c => c.toUpperCase())
    .replace(/\s+/g, '_');
  const skin = Object.keys(SKINS).find(k => SKINS[k].match(year, topic)) || '';
  return { year, topic, skin };
}

export function ago(ms) {
  const s = Math.max(0, Math.round(ms / 1000));
  if (s < 60) return 'just now';
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  return h < 24 ? `${h} h ago` : `${Math.round(h / 24)} d ago`;
}

// ── Panel ────────────────────────────────────────────────────────────────────

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const MEDALS = ['🥇', '🥈', '🥉'];
const ICON_TROPHY = '<svg class="live-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>';
const ICON_EYE = '<svg class="live-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>';
const ICON_EYE_OFF = '<svg class="live-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.53 13.53 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><path d="M2 2l20 20"/></svg>';
const ICON_TREND = '<svg class="live-icon" viewBox="0 0 24 24" aria-hidden="true"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>';
const shortDate = iso => { const d = new Date(iso); return Number.isNaN(+d) ? '' : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }); };

// deps: { getCourseId(), getCourses(), listAll(url, key), alert(title, body) } from index.html.
export function initLive(deps) {
  const $ = id => document.getElementById(id);
  const panel = $('live-panel');
  const state = {
    courseId: '', works: [], links: {}, workId: '', compareId: '', view: 'progress', order: 'help', board: '', reveal: false, hiddenOpen: false,
    rows: [], total: null, earlier: { rows: {}, loading: false, error: '' }, timer: 0, checking: false, lastOk: 0, error: '',
  };
  try { state.order = localStorage.getItem('oga_live_order') || 'help'; } catch (_) {}
  state.hidden = loadHidden();

  function toggleHidden(who, name) {
    if (Object.hasOwn(state.hidden, who)) delete state.hidden[who]; else state.hidden[who] = name;
    saveHidden(state.hidden);
    render();
  }

  function fillClasses() {
    const courses = deps.getCourses() || [];
    $('live-course').innerHTML = courses.map(c => `<option value="${esc(c.id)}"${c.id === state.courseId ? ' selected' : ''}>${esc(c.name)}</option>`).join('');
  }

  async function loadAssignments() {
    const courseId = state.courseId;
    const sel = $('live-work');
    sel.innerHTML = '<option value="">Loading assignments…</option>';
    const works = (await deps.listAll(`https://classroom.googleapis.com/v1/courses/${courseId}/courseWork?courseWorkStates=PUBLISHED&fields=courseWork(id,title,creationTime,associatedWithDeveloper,materials(link(url))),nextPageToken`, 'courseWork'))
      .filter(w => w.associatedWithDeveloper)
      .sort((a, b) => (b.creationTime || '').localeCompare(a.creationTime || ''));
    if (courseId !== state.courseId) return;   // the teacher picked another class meanwhile
    state.works = works;
    state.links = Object.fromEntries(works.map(w => [w.id, (w.materials || []).map(m => m.link?.url).find(u => u && /\/Y\d+\//.test(u)) || '']));
    if (!works.length) {
      sel.innerHTML = '<option value="">No hub assignments in this class yet</option>';
      state.workId = '';
      fillCompare();
      return;
    }
    let last = '';
    try { last = localStorage.getItem(`oga_live_work_${courseId}`) || ''; } catch (_) {}
    state.workId = works.some(w => w.id === last) ? last : works[0].id;
    sel.innerHTML = works.map(w => `<option value="${esc(w.id)}"${w.id === state.workId ? ' selected' : ''}>${esc(w.title)}</option>`).join('');
    fillCompare();
  }

  // "Compared with" offers each other assignment with the lesson before it ("The Drone + Locked In"),
  // starting on last week's.
  function fillCompare() {
    state.compareId = defaultCompare(state.works, state.workId);
    const title = id => { const w = state.works.find(x => x.id === id); return w ? `${w.title} (${shortDate(w.creationTime)})` : ''; };
    const others = state.works.filter(w => w.id !== state.workId);
    $('live-compare').innerHTML = others.length
      ? others.map(w => `<option value="${esc(w.id)}"${w.id === state.compareId ? ' selected' : ''}>${esc(compareSet(state.works, w.id).map(title).join(' + '))}</option>`).join('')
      : '<option value="">No earlier assignment</option>';
  }

  const filesFor = workId => {
    const fields = 'files(id,modifiedTime,appProperties,lastModifyingUser(displayName),owners(displayName,permissionId)),nextPageToken';
    return deps.listAll('https://www.googleapis.com/drive/v3/files?corpora=user&fields=' + encodeURIComponent(fields) + '&q=' + encodeURIComponent(liveQuery(workId)), 'files');
  };

  async function check() {
    if (state.checking || !state.workId || panel.hidden) return;
    state.checking = true;
    renderBusy();
    const courseId = state.courseId;
    const workId = state.workId;
    try {
      const [files, subs] = await Promise.all([
        filesFor(workId),
        state.total == null
          ? deps.listAll(`https://classroom.googleapis.com/v1/courses/${courseId}/courseWork/${workId}/studentSubmissions?fields=studentSubmissions(id),nextPageToken`, 'studentSubmissions').catch(() => null)
          : Promise.resolve(null),
      ]);
      if (workId !== state.workId) return;   // the teacher picked another assignment meanwhile
      state.rows = buildRows(files.filter(f => f.appProperties?.ogaCourse === courseId));
      if (subs) state.total = subs.length;
      state.lastOk = Date.now();
      state.error = '';
    } catch (e) {
      console.error('Live view: check failed', e);
      state.error = /^401 /.test(e.message) ? 'Your Google sign-in has expired: reload the hub to sign in again.' : 'Could not reach Google: trying again shortly.';
    } finally {
      state.checking = false;
      render();
    }
  }

  // Earlier assignments' scores are fetched once each (they have mostly stopped changing) and kept
  // until the class changes.
  async function loadCompare() {
    const courseId = state.courseId;
    const missing = compareSet(state.works, state.compareId).filter(id => !state.earlier.rows[id]);
    if (!missing.length || state.earlier.loading) return;
    state.earlier.loading = true; state.earlier.error = '';
    render();
    try {
      const lists = await Promise.all(missing.map(filesFor));
      if (courseId !== state.courseId) return;
      missing.forEach((id, i) => { state.earlier.rows[id] = buildRows(lists[i].filter(f => f.appProperties?.ogaCourse === courseId)); });
    } catch (e) {
      console.error('Live view: could not load the earlier assignments', e);
      state.earlier.error = 'Could not load the earlier assignments\' scores.';
    } finally {
      state.earlier.loading = false;
    }
    render();
    loadCompare();   // the teacher may have picked another comparison meanwhile
  }

  function schedule() {
    clearTimeout(state.timer);
    if (panel.hidden) return;
    state.timer = setTimeout(async () => {
      if (!document.hidden) await check();
      schedule();
    }, POLL_MS);
  }

  // Students the teacher has hidden appear nowhere here: only in the Hidden list (renderHiddenPop).
  function renderProgress() {
    const rows = sortRows(withoutHidden(state.rows, state.hidden), state.order);
    if (!rows.length) {
      return `<p class="live-empty">No saves yet. Students appear here once they are signed in and save their first score.</p>`;
    }
    const now = Date.now();
    return `<div class="live-grid">${rows.map(r => {
      const pct = r.score ?? 0;
      const status = r.perfect ? '<span class="live-chip perfect" title="Gold on every task">★ 100% perfect</span>'
        : r.done ? '<span class="live-chip done" title="Every task done">✓ Done</span>'
        : r.idle ? '<span class="live-chip idle" title="No task finished in the last 10 minutes">No save 10 min</span>' : '';
      const hide = `<button type="button" class="live-hide" data-hide="${esc(r.who)}" data-name="${esc(r.name)}"
          aria-label="Hide ${esc(r.name)} from the Live view" title="Hide from the Live view and leaderboards">${ICON_EYE}</button>`;
      return `<div class="live-card${r.done ? ' is-done' : ''}${r.perfect ? ' is-perfect' : ''}${r.idle ? ' is-idle' : ''}" title="${esc(r.name)}">
        <div class="live-card-top"><span class="live-name">${esc(r.short)}</span><span class="live-card-tags">${status}${hide}</span></div>
        <div class="live-bar" role="img" aria-label="${pct}%"><span style="width:${pct}%"></span></div>
        <div class="live-meta"><span>${r.score == null ? '–' : pct + '%'}${r.task ? ` · Task ${esc(r.task)}` : ''}</span><span>${ago(now - r.modified)}</span></div>
      </div>`;
    }).join('')}</div>`;
  }

  // The Hidden list: opened from its header button only, so hidden names never sit on the screen.
  // It shows how each hidden student is doing on this assignment, so the teacher can still check.
  function renderHiddenPop() {
    const list = Object.entries(state.hidden).sort((a, b) => a[1].localeCompare(b[1]));
    $('live-hidden-btn').hidden = !list.length;
    $('live-hidden-count').textContent = list.length;
    $('live-hidden-btn').setAttribute('aria-expanded', String(state.hiddenOpen && list.length > 0));
    const pop = $('live-hidden-pop');
    pop.hidden = !state.hiddenOpen || !list.length;
    if (pop.hidden) return;
    const byWho = new Map(state.rows.map(r => [r.who, r]));
    pop.innerHTML = `<p class="live-pop-title">Hidden from the Live view and leaderboards (every class)</p><ul>${list.map(([who, name]) => {
      const r = byWho.get(who);
      const now = r ? `${r.score == null ? '–' : r.score + '%'}${r.task ? ` · Task ${esc(r.task)}` : ''}${r.perfect ? ' · ★ 100% perfect' : r.done ? ' · ✓ Done' : r.idle ? ' · no save in 10 min' : ''}` : 'Not in this assignment';
      return `<li><span><strong>${esc(name)}</strong><span class="live-pop-now">${now}</span></span>
        <button type="button" data-hide="${esc(who)}" data-name="${esc(name)}" aria-label="Show ${esc(name)} again">Show again</button></li>`;
    }).join('')}</ul>`;
  }

  // Most improved, as the teacher sees it: every candidate who isn't hidden, best first.
  // → { ids, ready, error, result } (result: mostImproved's, candidates filtered).
  function improvedNow() {
    const ids = compareSet(state.works, state.compareId);
    if (!ids.length) return { ids };
    if (state.earlier.error) return { ids, error: state.earlier.error };
    if (ids.some(id => !state.earlier.rows[id])) return { ids };
    const r = mostImproved(ids.map(id => state.earlier.rows[id]), state.rows, Infinity);
    return { ids, ready: true, result: { ...r, candidates: r.candidates.filter(c => !Object.hasOwn(state.hidden, c.who)) } };
  }

  // The reveal, for the end of the lesson: the most improved student's name in a colour of its
  // own (no places or scores: the whole class can see it), and their row marked if it's on the board.
  function renderReveal(mi) {
    if (!state.compareId) return { banner: '', button: '' };
    const button = `<div class="live-center"><button type="button" class="live-reveal" data-reveal aria-pressed="${state.reveal}">${ICON_TREND}${state.reveal ? 'Hide most improved' : 'Reveal most improved'}</button></div>`;
    if (!state.reveal) return { banner: '', button };
    let inner;
    if (mi.error) inner = `<span class="live-mi-label">Most improved</span><span class="live-mi-note">${esc(mi.error)}</span>`;
    else if (!mi.ready) inner = `<span class="live-mi-label">Most improved</span><span class="live-mi-note">Working it out…</span>`;
    else if (!mi.result.candidates.length) inner = `<span class="live-mi-label">Most improved</span><span class="live-mi-note">Not decided yet: check again at the end of the lesson.</span>`;
    else inner = `<span class="live-mi-label">${ICON_TREND}Most improved</span><span class="live-mi-name">${esc(mi.result.candidates[0].short)}</span>`;
    return { banner: `<div class="live-mi-banner" role="status">${inner}</div>`, button };
  }

  // Every assignment has the Top 10 board; a game adds a board per label (a class code, usually).
  function renderBoard() {
    const shown = withoutHidden(state.rows, state.hidden);
    const games = leaderboards(shown);
    const gameLabels = Object.keys(games).sort();
    const boards = { ...games, [SCORE_BOARD]: scoreBoard(shown) };
    const labels = [...gameLabels, SCORE_BOARD];
    // Start on the game most students are playing, or the Top 10 when there's no game.
    if (!labels.includes(state.board)) {
      state.board = gameLabels.length ? gameLabels.reduce((a, b) => games[b].length > games[a].length ? b : a) : SCORE_BOARD;
    }
    const pick = labels.length > 1
      ? `<div class="live-board-pick" role="group" aria-label="Leaderboard">${labels.map(l => `<button type="button" data-board="${esc(l)}" class="${l === state.board ? 'on' : ''}" aria-pressed="${l === state.board}">${esc(l)}</button>`).join('')}</div>` : '';
    const mi = state.reveal ? improvedNow() : {};
    const winner = state.reveal && mi.ready ? mi.result.candidates[0]?.who : undefined;
    const { banner, button } = renderReveal(mi);
    const entries = boards[state.board];
    const unit = entries[0]?.unit;
    const title = state.board === SCORE_BOARD ? 'Top 10 · Score' : `${state.board}${unit === 'ms' ? ' · fastest' : ''}`;
    const list = entries.length
      ? `<ol class="live-board">${entries.map(e => `<li class="${[e.rank <= 3 ? 'top' : '', winner && e.who === winner ? 'is-mi' : ''].join(' ').trim()}">
        <span class="live-rank" aria-label="${ordinal(e.rank)}">${e.rank <= 3 ? MEDALS[e.rank - 1] : e.rank}</span>
        <span class="live-who">${esc(e.short)}${winner && e.who === winner ? '<span class="live-chip mi">Most improved</span>' : ''}</span>
        <span class="live-pts">${formatBoard(e.board, e.unit)}</span></li>`).join('')}</ol>`
      : `<p class="live-empty live-center">No scores yet: the board fills as students save.</p>`;
    return `${pick}<h3 class="live-board-title">${ICON_TROPHY}<span>${esc(title)}</span></h3>${banner}${list}${button}`;
  }

  function renderImproved() {
    if (!state.compareId) return `<p class="live-empty">Most improved needs an earlier hub assignment in this class to compare with.</p>`;
    const mi = improvedNow();
    const ids = mi.ids;
    if (mi.error) return `<p class="live-empty err">${esc(mi.error)} <button type="button" class="live-link" data-retry>Try again</button></p>`;
    if (!mi.ready) return `<p class="live-empty">Loading the earlier assignments…</p>`;
    const { compared, notCompared } = mi.result;
    const candidates = mi.result.candidates.slice(0, 3);
    const over = ids.length > 1 ? `their usual place in the class (the average of the ${ids.length} earlier lessons they have a score in)` : 'their place in the earlier lesson';
    const how = `<p class="live-how">Places climbed from ${over} to now, among the <strong>${compared}</strong> students with a score in both. Only students in the top half this time count. Best read at the end of the lesson: earlier lessons have had longer to fill up. The Leaderboard's <em>Reveal most improved</em> shows the top one to the class.</p>`;
    const missing = notCompared ? `<p class="live-how">Not counted: ${notCompared} with no earlier score (absent, or not signed in).</p>` : '';
    if (compared < 4) return `${how}<p class="live-empty">Too few students in both to compare yet.</p>${missing}`;
    if (!candidates.length) return `${how}<p class="live-empty">Nobody in the top half has climbed yet.</p>${missing}`;
    const list = candidates.map((c, i) => `<li class="${i === 0 ? 'lead' : ''}">
        <span class="live-imp-rank" aria-label="${ordinal(i + 1)}">${i + 1}</span>
        <span class="live-imp-who"><span class="live-who" title="${esc(c.name)}">${esc(c.short)}</span>${c.topTwo ? '<span class="live-chip top2">Already top 2</span>' : ''}</span>
        <span class="live-imp-move"><span>${ordinal(c.from)} → ${ordinal(c.to)} place</span><span class="live-imp-scores">${ids.length > 1 ? 'avg ' : ''}${c.before}% → ${c.after}%${ids.length > 1 && c.lessons < ids.length ? ` · ${c.lessons} lesson${c.lessons > 1 ? 's' : ''} only` : ''}</span></span>
        <span class="live-imp-up" aria-label="up ${c.climbed} places">▲ ${c.climbed}</span></li>`).join('');
    return `${how}<ol class="live-improved">${list}</ol>${missing}`;
  }

  // Dress the panel in the look of the lesson being watched.
  function applyTheme() {
    const t = themeFor(state.links[state.workId] || '');
    for (const [attr, v] of [['year', t.year], ['topic', t.topic], ['skin', t.skin]]) {
      if (v) panel.dataset[attr] = v; else delete panel.dataset[attr];
    }
    $('live-heading').textContent = t.skin ? SKINS[t.skin].title : 'Live';
  }

  function renderBusy() {
    $('live-refresh').disabled = state.checking;
    $('live-refresh').classList.toggle('busy', state.checking);
  }

  function render() {
    applyTheme();
    renderBusy();
    for (const v of TABS) {
      const tab = $(`live-tab-${v}`);
      tab.classList.toggle('on', state.view === v);
      tab.setAttribute('aria-selected', String(state.view === v));
      tab.tabIndex = state.view === v ? 0 : -1;
    }
    $('live-order').hidden = state.view !== 'progress';
    $('live-order').value = state.order;
    $('live-compare-row').hidden = state.view !== 'improved' || !state.workId;

    const started = state.rows.length;
    const done = state.rows.filter(r => r.done).length;
    const idle = state.rows.filter(r => r.idle).length;
    $('live-summary').textContent = state.workId
      ? `${started}${state.total != null ? ` of ${state.total}` : ''} started · ${done} finished${idle ? ` · ${idle} with no save in 10 min` : ''}` : '';
    $('live-status').textContent = state.error
      || (state.lastOk ? `Checked ${new Date(state.lastOk).toLocaleTimeString('en-GB')} · updates every ${POLL_MS / 1000} s` : (state.workId ? 'Checking…' : ''));
    $('live-status').classList.toggle('err', !!state.error);
    $('live-body').setAttribute('aria-labelledby', `live-tab-${state.view}`);
    renderHiddenPop();
    $('live-body').innerHTML = !state.workId ? '' : state.view === 'board' ? renderBoard() : state.view === 'improved' ? renderImproved() : renderProgress();
  }

  async function openCourse() {
    clearTimeout(state.timer);
    state.works = []; state.links = {}; state.workId = ''; state.compareId = ''; state.board = ''; state.reveal = false;
    state.rows = []; state.total = null; state.lastOk = 0; state.error = ''; state.earlier = { rows: {}, loading: false, error: '' };
    render();
    try { await loadAssignments(); } catch (e) {
      console.error('Live view: could not list assignments', e);
      state.error = 'Could not list this class\'s assignments.';
    }
    render();
    if (state.view === 'improved') loadCompare();
    await check();
    schedule();
  }

  async function open() {
    // Straight after sign-in the class list may still be on its way: give it a few seconds.
    for (let i = 0; i < 25 && !deps.getCourseId() && !(deps.getCourses() || []).length; i++) await new Promise(r => setTimeout(r, 200));
    const courses = deps.getCourses() || [];
    let last = '';
    try { last = localStorage.getItem('oga_live_course') || ''; } catch (_) {}
    state.courseId = deps.getCourseId() || (courses.some(c => c.id === last) ? last : courses[0]?.id) || '';
    if (!state.courseId) {
      deps.alert('⚠️ No classes yet', 'Your classes are still loading from Google Classroom: try again in a moment.');
      return;
    }
    panel.hidden = false;
    document.body.classList.add('live-open');
    fillClasses();
    await openCourse();
  }

  function close() {
    panel.hidden = true;
    state.hiddenOpen = false;
    document.body.classList.remove('live-open');
    clearTimeout(state.timer);
  }

  function setView(v) {
    state.view = v;
    render();
    if (v === 'improved') loadCompare();
  }

  const TABS = ['progress', 'board', 'improved'];
  $('btn-live').addEventListener('click', open);
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape' || panel.hidden) return;
    if (state.hiddenOpen) { state.hiddenOpen = false; render(); $('live-hidden-btn').focus(); } else close();
  });
  $('live-hidden-btn').addEventListener('click', () => { state.hiddenOpen = !state.hiddenOpen; render(); });
  $('live-hidden-pop').addEventListener('click', e => {
    const h = e.target.closest('[data-hide]');
    if (!h) return;
    toggleHidden(h.dataset.hide, h.dataset.name);
    if (!Object.keys(state.hidden).length) { state.hiddenOpen = false; render(); }
  });
  // A click anywhere else closes the Hidden list. (The path, not closest(): "Show again" redraws
  // the list, so by now the clicked button may be out of the page.)
  document.addEventListener('click', e => {
    if (state.hiddenOpen && !e.composedPath().some(n => n.id === 'live-hidden-pop' || n.id === 'live-hidden-btn')) { state.hiddenOpen = false; render(); }
  });
  $('live-refresh').addEventListener('click', async () => { await check(); schedule(); });
  $('live-course').addEventListener('change', e => {
    state.courseId = e.target.value;
    try { localStorage.setItem('oga_live_course', state.courseId); } catch (_) {}
    openCourse();
  });
  $('live-work').addEventListener('change', async e => {
    state.workId = e.target.value;
    try { localStorage.setItem(`oga_live_work_${state.courseId}`, state.workId); } catch (_) {}
    state.rows = []; state.total = null; state.lastOk = 0; state.board = ''; state.reveal = false;
    fillCompare();
    render();
    if (state.view === 'improved') loadCompare();
    await check();
    schedule();
  });
  $('live-compare').addEventListener('change', e => { state.compareId = e.target.value; loadCompare(); });
  $('live-order').addEventListener('change', e => {
    state.order = e.target.value;
    try { localStorage.setItem('oga_live_order', state.order); } catch (_) {}
    render();
  });
  // Tabs: click, or the arrow keys between them (the ARIA tabs pattern).
  TABS.forEach(v => $(`live-tab-${v}`).addEventListener('click', () => setView(v)));
  $('live-tabs').addEventListener('keydown', e => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (!step) return;
    const v = TABS[(TABS.indexOf(state.view) + step + TABS.length) % TABS.length];
    setView(v);
    $(`live-tab-${v}`).focus();
  });
  $('live-body').addEventListener('click', e => {
    const b = e.target.closest('[data-board]');
    if (b) { state.board = b.dataset.board; render(); }
    const h = e.target.closest('[data-hide]');
    if (h) toggleHidden(h.dataset.hide, h.dataset.name);
    if (e.target.closest('[data-retry]')) { state.earlier.error = ''; loadCompare(); }
    if (e.target.closest('[data-reveal]')) {
      state.reveal = !state.reveal;
      if (state.reveal) state.earlier.error = '';
      render();
      if (state.reveal) loadCompare();
    }
  });
  // Coming back to the tab checks straight away rather than waiting for the next tick.
  document.addEventListener('visibilitychange', () => { if (!document.hidden && !panel.hidden) check(); });
  // "Idle" and "x min ago" move on between checks.
  setInterval(() => { if (!panel.hidden && state.rows.length) render(); }, 30 * 1000);
}
