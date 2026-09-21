// Shared page error reporter — shows unexpected errors at the bottom of the page.
//
// Why: on student computers the browser dev console isn't available, so when an
// activity breaks there is no way to see why. This script collects anything that
// goes wrong and prints it in a footer panel (with a "Copy report" button) that the
// teacher can read, photograph or paste into a message.
//
// Load it as a plain (non-module) script BEFORE the other scripts, so it is already
// listening if one of them fails to load or throws while starting up:
//   <script src="../../../error-reporter.js"></script>
//
// It catches, automatically:
//   • uncaught JavaScript errors                    (window "error")
//   • unhandled promise rejections                  ("unhandledrejection")
//   • scripts / stylesheets / images that fail to load (error events, capture phase)
// and exposes one manual hook for failures that an activity catches itself:
//   window.ErrorReporter?.report('Python engine failed to load', err);
//
// It deliberately does NOT report mistakes in the student's own Python code —
// those are expected and are shown in the editor's output panel.
//
// Nothing renders until the first error, and the reporter never throws itself.

(function () {
  'use strict';
  if (window.ErrorReporter) return;

  const MAX_ENTRIES = 20;
  const MAX_MESSAGE = 600;
  const MAX_STACK_LINES = 6;

  // Noise that isn't a fault in the activity.
  const IGNORED_MESSAGES = [/ResizeObserver loop/i];
  const IGNORED_FILES = /^(?:chrome|moz|safari|edge)-extension:/i;

  const entries = [];
  const byKey = new Map();
  let panel = null;
  let logEl = null;
  let countEl = null;
  let copyBtn = null;
  let renderTimer = 0;

  function shorten(text, max) {
    const s = String(text);
    return s.length > max ? s.slice(0, max) + '…' : s;
  }

  // "http://host/Y8/Python%20Unit%201/x.html" → "/Y8/Python Unit 1/x.html"
  function pathOf(url) {
    try {
      const u = new URL(url, location.href);
      const p = decodeURIComponent(u.pathname);
      return u.origin === location.origin ? p : u.origin + p;
    } catch {
      return String(url);
    }
  }

  function describe(err) {
    if (err && typeof err === 'object' && 'message' in err) {
      const name = err.name && err.name !== 'Error' ? err.name + ': ' : (err.name ? 'Error: ' : '');
      return { message: name + err.message, stack: typeof err.stack === 'string' ? err.stack : '' };
    }
    if (err === undefined || err === null || err === '') return { message: '(no error details given)', stack: '' };
    return { message: typeof err === 'string' ? err : safeStringify(err), stack: '' };
  }

  function safeStringify(value) {
    try { return JSON.stringify(value); } catch { return String(value); }
  }

  // Chrome stacks start with a repeat of the message, Firefox ones don't — keep just the frames.
  function trimStack(stack) {
    if (!stack) return '';
    let lines = stack.split('\n').filter(l => l.trim());
    const firstFrame = lines.findIndex(l => /^\s+at\s/.test(l));
    if (firstFrame > 0) lines = lines.slice(firstFrame);
    return lines
      .slice(0, MAX_STACK_LINES)
      .map(l => l.trim().split(location.origin).join('').replace(/%20/g, ' '))
      .join('\n');
  }

  function record(kind, message, where, stack) {
    try {
      message = shorten(message, MAX_MESSAGE);
      if (IGNORED_MESSAGES.some(re => re.test(message))) return;
      if (where && IGNORED_FILES.test(where)) return;

      const key = kind + '|' + message + '|' + (where || '');
      const existing = byKey.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        if (entries.length >= MAX_ENTRIES) return;
        const entry = { kind, message, where: where || '', stack: trimStack(stack), time: new Date(), count: 1 };
        entries.push(entry);
        byKey.set(key, entry);
      }
      scheduleRender();
    } catch { /* the reporter must never throw */ }
  }

  // ── Report text (also what "Copy report" puts on the clipboard) ──────────────

  function timeText(d) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  function buildReport() {
    const head = [
      'Page error report',
      'Page: ' + pathOf(location.href),
      'Browser: ' + navigator.userAgent,
      'Online: ' + (navigator.onLine ? 'yes' : 'NO'),
      'Reported: ' + new Date().toLocaleString(),
      ''
    ];
    const body = entries.map((e, i) => {
      const lines = ['#' + (i + 1) + '  ' + e.kind + (e.count > 1 ? '  (happened ' + e.count + ' times)' : '') + '  — first at ' + timeText(e.time)];
      lines.push(e.message);
      if (e.where) lines.push('at ' + e.where);
      if (e.stack) lines.push(e.stack);
      return lines.join('\n');
    });
    return head.concat(body.join('\n\n')).join('\n');
  }

  // ── Panel ────────────────────────────────────────────────────────────────────

  function injectStyles() {
    if (document.getElementById('error-reporter-styles')) return;
    const style = document.createElement('style');
    style.id = 'error-reporter-styles';
    style.textContent =
      '#error-reporter{box-sizing:border-box;width:min(900px,calc(100% - 32px));margin:40px auto 90px;padding:16px 18px;' +
        'background:#2a1215;color:#fde8e8;border:2px solid #f87171;border-radius:12px;font:14px/1.5 system-ui,sans-serif;text-align:left}' +
      '#error-reporter *{box-sizing:border-box}' +
      '#error-reporter .er-head{display:flex;flex-wrap:wrap;align-items:center;gap:10px;justify-content:space-between}' +
      '#error-reporter .er-title{font-weight:700;font-size:1rem;color:#fecaca}' +
      '#error-reporter .er-help{margin:6px 0 10px;color:#fca5a5}' +
      '#error-reporter .er-copy{cursor:pointer;border:1px solid #f87171;background:transparent;color:#fecaca;border-radius:8px;padding:6px 12px;font:600 0.85rem system-ui,sans-serif}' +
      '#error-reporter .er-copy:hover,#error-reporter .er-copy:focus-visible{background:#f87171;color:#2a1215}' +
      '#error-reporter .er-log{margin:0;padding:12px;max-height:320px;overflow:auto;background:#1a0b0d;border-radius:8px;' +
        'font:12px/1.5 ui-monospace,Consolas,monospace;color:#fde8e8;white-space:pre-wrap;word-break:break-word;user-select:text}';
    document.head.appendChild(style);
  }

  function build() {
    injectStyles();
    panel = document.createElement('section');
    panel.id = 'error-reporter';
    panel.setAttribute('aria-live', 'polite');

    const head = document.createElement('div');
    head.className = 'er-head';
    const title = document.createElement('span');
    title.className = 'er-title';
    countEl = title;
    copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'er-copy';
    copyBtn.textContent = 'Copy report';
    copyBtn.addEventListener('click', copyReport);
    head.append(title, copyBtn);

    const help = document.createElement('p');
    help.className = 'er-help';
    help.textContent = 'Please show this to your teacher (or take a photo of it) so they can fix it.';

    logEl = document.createElement('pre');
    logEl.className = 'er-log';
    logEl.tabIndex = 0;

    panel.append(head, help, logEl);
  }

  function render() {
    renderTimer = 0;
    try {
      if (!entries.length || !document.body) return;
      if (!panel) build();
      const total = entries.reduce((n, e) => n + e.count, 0);
      countEl.textContent = '⚠ Something went wrong on this page (' + total + (total === 1 ? ' error)' : ' errors)');
      logEl.textContent = buildReport();
      // Keep it the very last thing on the page, whatever else has been appended since.
      document.body.appendChild(panel);
    } catch { /* the reporter must never throw */ }
  }

  function scheduleRender() {
    if (renderTimer) return;
    if (!document.body) {
      document.addEventListener('DOMContentLoaded', render, { once: true });
      renderTimer = -1;
      return;
    }
    renderTimer = setTimeout(render, 150);
  }

  async function copyReport() {
    const text = buildReport();
    const flash = msg => {
      copyBtn.textContent = msg;
      setTimeout(() => { copyBtn.textContent = 'Copy report'; }, 2500);
    };
    try {
      await navigator.clipboard.writeText(text);
      flash('Copied ✓');
      return;
    } catch { /* clipboard blocked — fall back to selecting the text */ }
    try {
      const range = document.createRange();
      range.selectNodeContents(logEl);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      flash(document.execCommand('copy') ? 'Copied ✓' : 'Press Ctrl+C to copy');
    } catch {
      flash('Select the text and press Ctrl+C');
    }
  }

  // ── Automatic capture ────────────────────────────────────────────────────────

  // Capture phase, so failed <script>/<link>/<img> loads (which don't bubble) are seen too.
  window.addEventListener('error', function (e) {
    try {
      const t = e.target;
      if (t && t !== window && t.tagName) {
        const url = t.currentSrc || t.src || t.href;
        if (url) record('Resource failed to load', '<' + t.tagName.toLowerCase() + '> ' + pathOf(url), '', '');
        return;
      }
      const where = e.filename ? pathOf(e.filename) + (e.lineno ? ':' + e.lineno + (e.colno ? ':' + e.colno : '') : '') : '';
      const d = describe(e.error || e.message);
      record('JavaScript error', d.message, where, d.stack);
    } catch { /* the reporter must never throw */ }
  }, true);

  window.addEventListener('unhandledrejection', function (e) {
    try {
      const d = describe(e.reason);
      record('Unhandled promise rejection', d.message, '', d.stack);
    } catch { /* the reporter must never throw */ }
  });

  window.ErrorReporter = {
    // For failures an activity catches itself but that a teacher still needs to know about.
    report(source, err) {
      const d = describe(err);
      record(source, d.message, '', d.stack);
    },
    getReport: buildReport,
    count: () => entries.length
  };
})();
