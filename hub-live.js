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
    r.done = r.score === 100;
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
      return { rank, short: r.short, board: r.board, unit };
    });
  }
  return boards;
}

// 3100 → "3,100"; a time in ms (unit 'ms') → "1:23.4".
export function formatBoard(value, unit) {
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

// deps: { getCourseId(), getCourseName(), listAll(url, key), googleGet(url) } from index.html.
export function initLive(deps) {
  const $ = id => document.getElementById(id);
  const panel = $('live-panel');
  const state = { links: {}, workId: '', view: 'progress', order: 'help', board: '', rows: [], total: null, timer: 0, checking: false, lastOk: 0, error: '' };
  try { state.order = localStorage.getItem('oga_live_order') || 'help'; } catch (_) {}

  async function loadAssignments() {
    const courseId = deps.getCourseId();
    const sel = $('live-work');
    sel.innerHTML = '<option value="">Loading assignments…</option>';
    const works = (await deps.listAll(`https://classroom.googleapis.com/v1/courses/${courseId}/courseWork?courseWorkStates=PUBLISHED&fields=courseWork(id,title,creationTime,associatedWithDeveloper,materials(link(url))),nextPageToken`, 'courseWork'))
      .filter(w => w.associatedWithDeveloper)
      .sort((a, b) => (b.creationTime || '').localeCompare(a.creationTime || ''));
    state.links = Object.fromEntries(works.map(w => [w.id, (w.materials || []).map(m => m.link?.url).find(u => u && /\/Y\d+\//.test(u)) || '']));
    if (!works.length) {
      sel.innerHTML = '<option value="">No hub assignments in this class yet</option>';
      state.workId = '';
      return;
    }
    let last = '';
    try { last = localStorage.getItem(`oga_live_work_${courseId}`) || ''; } catch (_) {}
    state.workId = works.some(w => w.id === last) ? last : works[0].id;
    sel.innerHTML = works.map(w => `<option value="${esc(w.id)}"${w.id === state.workId ? ' selected' : ''}>${esc(w.title)}</option>`).join('');
  }

  async function check() {
    if (state.checking || !state.workId || panel.hidden) return;
    state.checking = true;
    const courseId = deps.getCourseId();
    const workId = state.workId;
    try {
      const fields = 'files(id,modifiedTime,appProperties,lastModifyingUser(displayName),owners(displayName)),nextPageToken';
      const [files, subs] = await Promise.all([
        deps.listAll('https://www.googleapis.com/drive/v3/files?corpora=user&fields=' + encodeURIComponent(fields) + '&q=' + encodeURIComponent(liveQuery(workId)), 'files'),
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

  function schedule() {
    clearTimeout(state.timer);
    if (panel.hidden) return;
    state.timer = setTimeout(async () => {
      if (!document.hidden) await check();
      schedule();
    }, POLL_MS);
  }

  function renderProgress() {
    const rows = sortRows(state.rows, state.order);
    if (!rows.length) {
      return `<p class="live-empty">No saves yet. Students appear here once they are signed in and save their first score.</p>`;
    }
    const now = Date.now();
    return `<div class="live-grid">${rows.map(r => {
      const pct = r.score ?? 0;
      const status = r.done ? '<span class="live-chip done">✓ Done</span>'
        : r.idle ? '<span class="live-chip idle" title="No task finished in the last 10 minutes">No save 10 min</span>' : '';
      return `<div class="live-card${r.done ? ' is-done' : ''}${r.idle ? ' is-idle' : ''}" title="${esc(r.name)}">
        <div class="live-card-top"><span class="live-name">${esc(r.short)}</span>${status}</div>
        <div class="live-bar" role="img" aria-label="${pct}%"><span style="width:${pct}%"></span></div>
        <div class="live-meta"><span>${r.score == null ? '–' : pct + '%'}${r.task ? ` · Task ${esc(r.task)}` : ''}</span><span>${ago(now - r.modified)}</span></div>
      </div>`;
    }).join('')}</div>`;
  }

  function renderBoard(boards) {
    const labels = Object.keys(boards).sort();
    if (!labels.length) return `<p class="live-empty">No game scores yet for this assignment.</p>`;
    // Start on the board most students are playing (a class challenge code, usually).
    if (!labels.includes(state.board)) state.board = labels.reduce((a, b) => boards[b].length > boards[a].length ? b : a);
    const pick = labels.length > 1
      ? `<div class="live-board-pick">${labels.map(l => `<button type="button" data-board="${esc(l)}" class="${l === state.board ? 'on' : ''}">${esc(l)}</button>`).join('')}</div>` : '';
    const list = boards[state.board].map(e => `<li class="${e.rank <= 3 ? 'top' : ''}">
        <span class="live-rank">${e.rank <= 3 ? MEDALS[e.rank - 1] : e.rank}</span>
        <span class="live-who">${esc(e.short)}</span>
        <span class="live-pts">${formatBoard(e.board, e.unit)}</span></li>`).join('');
    return `${pick}<h3 class="live-board-title">🏆 ${esc(state.board)}${boards[state.board][0]?.unit === 'ms' ? ' · fastest' : ''}</h3><ol class="live-board">${list}</ol>`;
  }

  // Dress the panel in the look of the lesson being watched.
  function applyTheme() {
    const t = themeFor(state.links[state.workId] || '');
    for (const [attr, v] of [['year', t.year], ['topic', t.topic], ['skin', t.skin]]) {
      if (v) panel.dataset[attr] = v; else delete panel.dataset[attr];
    }
    $('live-heading').textContent = t.skin ? SKINS[t.skin].title : '📡 Live';
  }

  function render() {
    applyTheme();
    const boards = leaderboards(state.rows);
    const hasBoards = Object.keys(boards).length > 0;
    $('live-tab-board').hidden = !hasBoards;
    if (!hasBoards && state.view === 'board') state.view = 'progress';
    $('live-tab-progress').classList.toggle('on', state.view === 'progress');
    $('live-tab-board').classList.toggle('on', state.view === 'board');
    $('live-order').hidden = state.view !== 'progress';
    $('live-order').value = state.order;

    const started = state.rows.length;
    const done = state.rows.filter(r => r.done).length;
    const idle = state.rows.filter(r => r.idle).length;
    $('live-summary').textContent = state.workId
      ? `${started}${state.total != null ? ` of ${state.total}` : ''} started · ${done} finished${idle ? ` · ${idle} with no save in 10 min` : ''}` : '';
    $('live-status').textContent = state.error
      || (state.lastOk ? `Checked ${new Date(state.lastOk).toLocaleTimeString('en-GB')} · updates every ${POLL_MS / 1000} s` : (state.workId ? 'Checking…' : ''));
    $('live-status').classList.toggle('err', !!state.error);
    $('live-body').innerHTML = !state.workId ? '' : state.view === 'board' ? renderBoard(boards) : renderProgress();
  }

  async function open() {
    if (!deps.getCourseId()) {
      deps.alert('⚠️ No class selected', 'Pick a class from the dropdown first, then open the Live view.');
      return;
    }
    panel.hidden = false;
    document.body.classList.add('live-open');
    $('live-class').textContent = deps.getCourseName();
    state.rows = []; state.total = null; state.lastOk = 0; state.error = '';
    render();
    try { await loadAssignments(); } catch (e) {
      console.error('Live view: could not list assignments', e);
      state.error = 'Could not list this class\'s assignments.';
    }
    render();
    await check();
    schedule();
  }

  function close() {
    panel.hidden = true;
    document.body.classList.remove('live-open');
    clearTimeout(state.timer);
  }

  $('btn-live').addEventListener('click', open);
  $('live-close').addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) close(); });
  $('live-refresh').addEventListener('click', async () => { await check(); schedule(); });
  $('live-work').addEventListener('change', async e => {
    state.workId = e.target.value;
    try { localStorage.setItem(`oga_live_work_${deps.getCourseId()}`, state.workId); } catch (_) {}
    state.rows = []; state.total = null; state.lastOk = 0; state.board = '';
    render();
    await check();
    schedule();
  });
  $('live-order').addEventListener('change', e => {
    state.order = e.target.value;
    try { localStorage.setItem('oga_live_order', state.order); } catch (_) {}
    render();
  });
  $('live-tab-progress').addEventListener('click', () => { state.view = 'progress'; render(); });
  $('live-tab-board').addEventListener('click', () => { state.view = 'board'; render(); });
  $('live-body').addEventListener('click', e => {
    const b = e.target.closest('[data-board]');
    if (b) { state.board = b.dataset.board; render(); }
  });
  // Coming back to the tab checks straight away rather than waiting for the next tick.
  document.addEventListener('visibilitychange', () => { if (!document.hidden && !panel.hidden) check(); });
  // "Idle" and "x min ago" move on between checks.
  setInterval(() => { if (!panel.hidden && state.rows.length) render(); }, 30 * 1000);
}
