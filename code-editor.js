// Shared code-editor widget — line numbers, auto-resize, Tab indentation,
// and live Python syntax checking via Pyodide's ast module.
//
// Usage (ES module):
//   import { setupEditors, clearSyntaxHint } from '../../code-editor.js';
//
//   // In DOMContentLoaded, after restoring saved state:
//   setupEditors();                    // targets .checker-textarea by default
//   setupEditors('.my-editor');        // or a custom selector
//
//   // After a successful code check, clear the amber hint:
//   clearSyntaxHint(document.getElementById('myTextarea'));
//
// Path depth: activities at topic-level use '../../code-editor.js';
//             activities in a lesson subfolder use '../../../code-editor.js'.
//
// The Tab key inserts 4 spaces; Shift-Tab removes up to 4 leading spaces.
// window.saveState() is called after Tab/Shift-Tab if the activity exposes it.

import { analyzeCode, runPython } from './pyodide-runner.js';
import { explainPythonError } from './python-error-hints.js';

// ── Styles injected once per page ─────────────────────────────────────────────
// :where() gives these zero specificity so any local .checker-textarea rule
// in the activity's own <style> block always takes precedence.
function _injectStyles() {
  if (document.getElementById('_code-editor-css')) return;
  const s = document.createElement('style');
  s.id = '_code-editor-css';
  s.textContent = `
    :where(.editor-wrap) {
      display: flex;
      background: #0d0d1a;
      border-radius: 0 0 12px 12px;
      overflow: hidden;
    }
    :where(.checker-header) {
      background: #1a1040;
      padding: 0.6rem 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8rem;
      color: #b4a0e0;
      font-family: 'Trebuchet MS', 'Calibri', sans-serif;
      border-radius: 12px 12px 0 0;
      border: 2px solid #3d2d5e;
      border-bottom: none;
    }
    :where(.checker-dot) {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    :where(.dot-r) { background: #f38ba8; }
    :where(.dot-y) { background: #f9e2af; }
    :where(.dot-g) { background: #a6e3a1; }
    :where(.checker-header span:last-child) {
      margin-left: auto;
      font-weight: 700;
      color: #cba6f7;
    }
    :where(.line-nums) {
      padding: .8rem .5rem .8rem .7rem;
      font-family: 'Courier New', monospace;
      font-size: .88rem;
      line-height: 1.7;
      color: #585b70;
      text-align: right;
      user-select: none;
      border-right: 1px solid #2d1060;
      white-space: pre;
      min-width: 2.6rem;
      overflow: hidden;
      flex-shrink: 0;
    }
    :where(.editor-container) {
      position: relative;
      flex: 1;
      display: block;
      overflow: hidden;
    }
    /* Higher specificity to ensure text remains hidden even if themes set colors */
    .editor-container .checker-textarea {
      color: transparent !important;
      background: transparent !important;
    }
    .checker-textarea {
      width: 100%;
      caret-color: #cdd6f4;
      position: relative;
      z-index: 2;
      font-family: 'Courier New', 'Consolas', monospace;
      font-size: .88rem;
      line-height: 1.7;
      padding: .8rem 1rem;
      border: none;
      outline: none;
      resize: none;
      overflow-x: auto;
      overflow-y: hidden;
      min-height: 200px;
      white-space: pre;
      scrollbar-width: thin;
      scrollbar-color: #3d2d5e #0d0d1a;
    }
    .checker-textarea::-webkit-scrollbar { height: 8px; }
    .checker-textarea::-webkit-scrollbar-track { background: #0d0d1a; }
    .checker-textarea::-webkit-scrollbar-thumb { background: #3d2d5e; border-radius: 4px; }
    :where(.highlight-layer) {
      position: absolute;
      top: 0; left: 0; bottom: 0;
      min-width: 100%; width: max-content;
      box-sizing: border-box;
      padding: .8rem 1rem;
      font-family: 'Courier New', 'Consolas', monospace;
      font-size: .88rem;
      line-height: 1.7;
      white-space: pre;
      color: #cdd6f4;
      pointer-events: none;
      z-index: 1;
      overflow: hidden;
    }
    /* Token Colors */
    .tok-kw { color: #c678dd; font-weight: bold; }
    .tok-str { color: #98c379; }
    .tok-num { color: #d19a66; }
    .tok-comment { color: #5c6370; font-style: italic; }
    .tok-builtin { color: #61afef; }
    .tok-op { color: #56b6c2; }

    :where(.syntax-hint) {
      display: none;
      padding: .45rem 1rem .45rem 1.2rem;
      font-family: 'Courier New', monospace;
      font-size: .78rem;
      line-height: 1.55;
      color: #f9e2af;
      background: #18100a;
      border-top: 1px solid #4a2e00;
      white-space: pre-wrap;
      word-break: break-word;
    }
    :where(.syntax-hint.visible) {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
    }
    :where(.syntax-hint-msg) { white-space: pre-wrap; word-break: break-word; }
    :where(.syntax-hint-help) {
      flex-shrink: 0;
      cursor: pointer;
      font-family: inherit;
      font-size: 0.74rem;
      font-weight: 700;
      color: #1a1206;
      background: #f9b020;
      border: none;
      border-radius: 6px;
      padding: 0.3rem 0.7rem;
      white-space: nowrap;
    }
    :where(.syntax-hint-help:hover) { background: #ffc44d; }
    :where(.output-help-btn) {
      display: inline-flex;
      align-self: flex-start;
      margin-top: 0.6rem;
      cursor: pointer;
      font-family: inherit;
      font-size: 0.74rem;
      font-weight: 700;
      color: #1a1206;
      background: #f9b020;
      border: none;
      border-radius: 6px;
      padding: 0.3rem 0.7rem;
    }
    :where(.output-help-btn:hover) { background: #ffc44d; }
    :where(.output-help-btn[hidden]) { display: none; }
    :where(.output-panel) {
      flex: 1;
      background: #070710;
      color: #5eead4;
      font-family: 'Courier New', monospace;
      font-size: .82rem;
      padding: .8rem;
      border-left: 1px solid #2d1060;
      display: flex;
      flex-direction: column;
    }
    :where(.output-panel.error) {
      color: #f38ba8;
    }
    :where(.output-header) {
      font-size: 0.65rem;
      color: #585b70;
      text-transform: uppercase;
      margin-bottom: 0.5rem;
      user-select: none;
      letter-spacing: 0.05em;
    }
    :where(.output-content) {
      white-space: pre-wrap;
      word-break: break-all;
    }
    :where(.output-input-row) {
      display: flex;
      align-items: center;
      border-top: 1px solid #1a1060;
      margin-top: 0.3rem;
      padding-top: 0.3rem;
      flex-shrink: 0;
    }
    :where(.output-prompt-label) {
      color: #5eead4;
      white-space: pre;
      font-family: 'Courier New', monospace;
      font-size: .82rem;
      flex-shrink: 0;
    }
    :where(.output-input-field) {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      color: #f9e2af;
      font-family: 'Courier New', monospace;
      font-size: .82rem;
      caret-color: #f9e2af;
      padding: 0;
      min-width: 4ch;
    }

    /* ── Interactive input spotlight ──────────────────────────────────── */
    @keyframes _isp-pulse {
      0%, 100% { box-shadow: 0 0 0 2px rgba(255,176,32,0.55), 0 0 18px rgba(255,176,32,0.30); }
      50%       { box-shadow: 0 0 0 4px rgba(255,176,32,0.90), 0 0 30px rgba(255,176,32,0.60); }
    }
    @keyframes _isp-blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
    :where(.output-panel.waiting-for-input) {
      animation: _isp-pulse 1.4s ease-in-out infinite;
      border-radius: 6px;
    }
    :where(.output-panel.waiting-for-input .output-header) { color: #ffd080; }
    :where(.output-panel.waiting-for-input .output-header::after) {
      content: ' ⌨  type here ↓';
      color: #ffb020;
      font-style: italic;
      font-weight: 700;
    }
    :where(.output-panel.waiting-for-input .output-input-row) {
      border-top: 1px solid rgba(255,176,32,0.45);
      margin-top: 0.4rem;
      padding-top: 0.35rem;
    }
    :where(.output-panel.waiting-for-input .output-prompt-label) { color: #ffd080; }
    :where(.output-panel.waiting-for-input .output-input-field) {
      caret-color: #ffb020;
      border-bottom: 2px solid rgba(255,176,32,0.8);
    }
    :where(.input-type-hint) {
      color: #ffb020;
      font-family: 'Courier New', monospace;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.07em;
      text-align: center;
      margin: 0.3rem 0 0.15rem;
      animation: _isp-blink 1.2s ease-in-out infinite;
    }
    @media (prefers-reduced-motion: reduce) {
      :where(.output-panel.waiting-for-input) { animation: none; box-shadow: 0 0 0 3px #ffb020; }
      :where(.input-type-hint) { animation: none; }
    }

    @media (max-width: 768px) {
      :where(.editor-wrap) {
        flex-direction: column;
      }
      :where(.output-panel) {
        border-left: none;
        border-top: 1px solid #2d1060;
        min-height: 120px;
        flex: none;
      }
    }

    @keyframes ac-skeleton-pulse {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 0.6; }
    }
    .editor-container.loading::after {
      content: "";
      position: absolute;
      top: 0.8rem; left: 1rem; right: 1rem; bottom: 0.8rem;
      background-image: linear-gradient(
        #585b70 0.7rem, 
        transparent 0.7rem, 
        transparent 1.7rem
      );
      background-size: 100% 1.7rem;
      animation: ac-skeleton-pulse 1.5s infinite;
      z-index: 3;
      pointer-events: none;
    }
    .editor-container.loading .checker-textarea,
    .editor-container.loading .highlight-layer {
      visibility: hidden;
    }

    /* Just-in-time error helper (opt-in via setupEditors(..., {errorHints:true})).
       Zero-specificity :where() so an activity can re-theme it locally. */
    :where(.error-helper) {
      background: rgba(255,176,32,0.1);
      border: 1.5px solid #f9b020;
      border-radius: 10px;
      padding: 0.85rem 1.05rem;
      margin: 0.55rem 0 0.2rem;
      color: #ffe6b0;
      font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
      font-size: 0.85rem;
      line-height: 1.5;
      animation: _eh-in 0.4s ease;
    }
    :where(.error-helper[hidden]) { display: none; }
    :where(.error-helper .eh-head) { display: flex; align-items: center; gap: 0.5rem; color: #ffd98a; font-weight: 700; margin-bottom: 0.5rem; }
    :where(.error-helper .eh-icon) { font-size: 1.1rem; flex-shrink: 0; }
    :where(.error-helper .eh-plain) { margin: 0 0 0.5rem; }
    :where(.error-helper .eh-term) { font-family: 'Courier New', monospace; color: #ffcf6b; font-weight: 700; }
    :where(.error-helper .eh-plain strong) { color: #fff; }
    :where(.error-helper .eh-fix) { margin: 0; }
    :where(.error-helper .eh-fix strong) { color: #ffd98a; }
    @keyframes _eh-in { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }
    @media (prefers-reduced-motion: reduce) {
      :where(.error-helper) { animation: none; }
    }

    /* Memory view (opt-in via setupEditors(..., {memoryView:true})): each
       variable as a labelled box at the foot of the output panel. Values use
       the same amber as typed input, so an answer visibly lands in its box. */
    :where(.memory-view) {
      flex: 1 0 auto;               /* fills spare panel height, so the strip sits at the bottom */
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      margin-top: 0.6rem;
      font-family: 'Courier New', monospace;
    }
    :where(.memory-view[hidden]) { display: none; }
    :where(.memory-inner) {
      padding-top: 0.6rem;
      border-top: 1px dashed #2d2f45;
    }
    :where(.memory-header) {
      font-size: 0.65rem;
      color: #585b70;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.45rem;
      user-select: none;
    }
    :where(.memory-boxes) {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-wrap: wrap;
      gap: 0.9rem 0.6rem;
    }
    :where(.mem-box) {
      position: relative;
      min-width: 5.5rem;
      max-width: 100%;
      padding: 0.75rem 0.65rem 0.4rem;
      border: 1.5px solid #3b3f5c;
      border-radius: 4px;
      background: #10121c;
    }
    :where(.mem-label) {
      position: absolute;
      top: -0.6rem;
      left: 0.45rem;
      padding: 0 0.35rem;
      font-size: 0.72rem;
      font-weight: 700;
      color: #0a0c0f;
      background: #5eead4;
      border-radius: 3px;
    }
    :where(.mem-value) {
      display: block;
      color: #f9e2af;
      font-size: 0.85rem;
      white-space: pre-wrap;
      word-break: break-all;
    }
    :where(.mem-box.mem-new) { animation: _mem-in 0.35s ease-out; }
    :where(.mem-box.mem-changed) { animation: _mem-flash 0.9s ease-out; }
    @keyframes _mem-in { from { opacity: 0; transform: translateY(6px) scale(0.92); } to { opacity: 1; transform: none; } }
    @keyframes _mem-flash { from { border-color: #f9b020; box-shadow: 0 0 0 3px rgba(249,176,32,0.35); } to { border-color: #3b3f5c; box-shadow: none; } }
    @media (prefers-reduced-motion: reduce) {
      :where(.mem-box.mem-new), :where(.mem-box.mem-changed) { animation: none; }
    }

    /* Step-through run (opt-in via setupEditors(..., {stepThrough:true})): a bar
       behind the line that is running, its number lit in the gutter, and a
       status row with a Skip button at the top of the output panel. */
    :where(.exec-line) {
      position: absolute;
      left: 0; right: 0;
      z-index: 0;                   /* behind the highlight layer's text */
      pointer-events: none;
      background: rgba(94,234,212,0.14);
      box-shadow: inset 3px 0 0 #5eead4;
      transition: top 0.18s ease;
    }
    :where(.exec-line[hidden]) { display: none; }
    :where(.exec-line.exec-error) { background: rgba(243,139,168,0.16); box-shadow: inset 3px 0 0 #f38ba8; }
    :where(.exec-num) { color: #5eead4; font-weight: 700; }
    :where(.exec-num.exec-error) { color: #f38ba8; }
    :where(.step-status) {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.6rem;
      margin: -0.2rem 0 0.5rem;
      font-size: 0.72rem;
      color: #5eead4;
    }
    :where(.step-status[hidden]) { display: none; }
    :where(.step-skip) {
      cursor: pointer;
      font-family: inherit;
      font-size: 0.7rem;
      font-weight: 700;
      color: #cdd6f4;
      background: transparent;
      border: 1px solid #3b3f5c;
      border-radius: 5px;
      padding: 0.2rem 0.6rem;
    }
    :where(.step-skip:hover) { border-color: #5eead4; color: #5eead4; }
    /* An answer a check fed to input() — typed in during the replay, then kept
       highlighted, so it reads as an input rather than as printed output. */
    :where(.fed-input) {
      color: #fde68a;
      background: rgba(249,176,32,0.16);
      box-shadow: inset 0 -1.5px 0 #f9b020;
      border-radius: 3px;
      padding: 0 0.15em;
    }
    :where(.fed-input.fed-typing) { border-right: 2px solid #f9b020; animation: _fed-caret 0.6s steps(1) infinite; }
    :where(.fed-input.fed-active)::after {
      content: '⌨ typed for you';
      margin-left: 0.5em;
      padding: 0.05em 0.5em;
      border-radius: 999px;
      background: #f9b020;
      color: #1e1e2e;
      font-size: 0.68em;
      font-weight: 700;
      vertical-align: middle;
      white-space: nowrap;
    }
    @keyframes _fed-caret { 50% { border-right-color: transparent; } }
    @media (prefers-reduced-motion: reduce) {
      :where(.exec-line) { transition: none; }
      :where(.fed-input.fed-typing) { animation: none; }
    }
  `;
  document.head.appendChild(s);
}

// ── Module-level state ────────────────────────────────────────────────────────
const _hintMap = new Map(); // textarea → .syntax-hint element
const _outputMap = new Map(); // textarea → .output-panel element
const _hlMap = new Map(); // textarea → .highlight-layer element
const _numsMap = new Map(); // textarea → .line-nums element
const _containerMap = new Map(); // textarea → .editor-container element
const _lastVal = new Map(); // textarea → last processed string
const _pyTimers = new Map(); // textarea → debounce for heavy pyodide tasks
const _hintTimers = new Map(); // textarea → debounce for syntax hint visibility
const _uiTimers = new Map(); // textarea → debounce for fast UI tasks

// ── Just-in-time error helper state ─────────────────────────────────────────────
const _errHintsOn   = new Set(); // textareas opted into friendly error help
const _errHelperMap = new Map(); // textarea → .error-helper element
const _errHelpBtnMap = new Map(); // textarea → "Get help" button shown after a failed run

// ── Memory view state ─────────────────────────────────────────────────────────
const _memOn   = new Set(); // textareas opted into the memory view
const _memMap  = new Map(); // textarea → .memory-view element
const _memPrev = new Map(); // textarea → Map(name → display) from the last render, to spot changes

// ── Step-through run state ────────────────────────────────────────────────────
const _stepOn      = new Set(); // textareas opted into the step-through run
const _execLineMap = new Map(); // textarea → .exec-line bar inside its .editor-container
const _stepRuns    = new Map(); // textarea → { fast, edited, wake } for the replay in progress

function _escapeHTML(s) {
  return String(s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Render a python-error-hints `plain` string: HTML-escape, then **…** → <strong>.
function _boldify(plain) {
  return _escapeHTML(plain).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

// Reduce a raw Python/Pyodide error to the bare phrase the student sees, so the
// help can quote it back to them (e.g. "unterminated string literal").
function _cleanErrorTerm(raw) {
  if (!raw) return '';
  const line = String(raw).split('\n').map(l => l.trim()).filter(Boolean).pop() || '';
  return line
    .replace(/^[A-Za-z]*Error:\s*/, '')                              // drop "SyntaxError:" etc.
    .replace(/\s*\((?:detected at |<[^>]*>,\s*)?line\s*\d+\)\s*$/i, '') // drop "(detected at line 1)"
    .trim();
}

// Pull the exception class name (NameError, SyntaxError, ...) off the raw
// error's last line, so the help card can show it even when no fuller
// explanation matched.
function _errorType(raw) {
  if (!raw) return '';
  const line = String(raw).split('\n').map(l => l.trim()).filter(Boolean).pop() || '';
  const m = line.match(/^([A-Za-z]+Error)\b/);
  return m ? m[1] : '';
}

// ?memory=off / ?memory=on overrides every editor on the page, so one activity
// can be trialled with and without the memory view (e.g. one class each).
const _memParam = new URLSearchParams(location.search).get('memory');

function _memEnabled(ta) {
  if (_memParam === 'off') return false;
  if (_memParam === 'on') return true;
  return _memOn.has(ta) || ta.hasAttribute('data-memory-view');
}

/**
 * Draw `vars` ([[name, type, display], …] from runPython's trackVars) as
 * labelled boxes. A box that wasn't there last time slides in; one whose value
 * changed flashes. Pass null to empty the view (e.g. at the start of a run).
 */
function _renderMemory(ta, vars) {
  const view = _memMap.get(ta);
  if (!view) return;
  const prev = _memPrev.get(ta) || new Map();
  const next = new Map();
  const list = view.querySelector('.memory-boxes');
  list.textContent = '';
  for (const [name, type, display] of vars || []) {
    next.set(name, display);
    const li = document.createElement('li');
    li.className = 'mem-box';
    if (!prev.has(name)) li.classList.add('mem-new');
    else if (prev.get(name) !== display) li.classList.add('mem-changed');
    li.title = `${name} holds ${display} (type: ${type})`;
    const label = document.createElement('span');
    label.className = 'mem-label';
    label.textContent = name;
    const value = document.createElement('span');
    value.className = 'mem-value';
    value.textContent = display;
    li.append(label, value);
    list.appendChild(li);
  }
  _memPrev.set(ta, next);
  view.hidden = next.size === 0;
}

// ?step=off / ?step=on overrides every editor on the page, like ?memory= above.
const _stepParam = new URLSearchParams(location.search).get('step');

function _stepEnabled(ta) {
  if (_stepParam === 'off') return false;
  if (_stepParam === 'on') return true;
  return _stepOn.has(ta) || ta.hasAttribute('data-step-through');
}

function _errHelperEnabled(ta) {
  return _errHintsOn.has(ta) || (ta.hasAttribute && ta.hasAttribute('data-error-hints'));
}

function _getErrHelper(ta) {
  let el = _errHelperMap.get(ta);
  if (el) return el;
  // Sits after the syntax-hint so it spans the full editor width, below the output.
  const anchor = _hintMap.get(ta) || _outputMap.get(ta);
  if (!anchor) return null;
  el = document.createElement('div');
  el.className = 'error-helper';
  el.hidden = true;
  anchor.insertAdjacentElement('afterend', el);
  _errHelperMap.set(ta, el);
  return el;
}

function _getErrHelpBtn(ta) {
  let btn = _errHelpBtnMap.get(ta);
  if (btn) return btn;
  const content = _outputMap.get(ta)?.querySelector('.output-content');
  if (!content) return null;
  btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'output-help-btn';
  btn.textContent = '💡 Get help';
  btn.hidden = true;
  content.insertAdjacentElement('afterend', btn);
  _errHelpBtnMap.set(ta, btn);
  return btn;
}

// Offer help for a failed run: show a "Get help" button next to the output
// rather than popping the explanation open automatically — the student reads
// the raw error first and opens help only if they want it.
function _offerErrHelp(ta, rawError, lineNo = null, errType = null) {
  const btn = _getErrHelpBtn(ta);
  if (!btn) return;
  btn.onclick = () => _showErrHelper(ta, rawError, lineNo, errType);
  btn.hidden = false;
}

// Kept deliberately short (type + line, one meaning sentence, one fix
// sentence) — this is read by Year 8 students straight after a failed run.
function _showErrHelper(ta, rawError, lineNo = null, errType = null) {
  const el = _getErrHelper(ta);
  if (!el) return;
  const term = _cleanErrorTerm(rawError);
  const type = errType || _errorType(rawError) || 'Error';
  const where = lineNo ? ' — line ' + lineNo : '';
  // The offending line lets the library spot errors whose message alone is ambiguous
  // (e.g. "invalid syntax" on an else: line is really an indentation slip above it).
  const lineText = lineNo ? (ta.value.split('\n')[lineNo - 1] ?? '') : '';
  const hint = explainPythonError(rawError, { lineText });
  const meaning = hint
    ? _boldify(hint.plain)
    : 'Python could not read that line.';
  const fix = hint
    ? _escapeHTML(hint.fix)
    : 'Read it out loud and compare it with what you meant to write.';
  const termHTML = term ? '<span class="eh-term">“' + _escapeHTML(term) + '”</span> — ' : '';
  el.innerHTML =
    '<div class="eh-head"><span class="eh-icon">🛠️</span>'
    + '<strong>' + _escapeHTML(type) + where + '</strong></div>'
    + '<p class="eh-plain">' + termHTML + meaning + '</p>'
    + '<p class="eh-fix"><strong>Try:</strong> ' + fix + '</p>';
  el.hidden = false;
}

function _hideErrHelper(ta) {
  const el = _errHelperMap.get(ta);
  if (el) el.hidden = true;
  const btn = _errHelpBtnMap.get(ta);
  if (btn) btn.hidden = true;
}

// Close an already-open help window — used when live analysis sees the syntax
// is clean again (the student may have just fixed a syntax error).
function _dismissOpenErrHelper(ta) {
  const el = _errHelperMap.get(ta);
  if (el && !el.hidden) el.hidden = true;
}

const _EDITOR_CLIPBOARD_TYPE = 'application/x-interactive-code-editor';

// ── Private helpers ───────────────────────────────────────────────────────────
const _lastLineCount = new Map();
function _autoResize(ta, force = false) {
  const lines = ta.value.split('\n').length;
  if (!force && lines === _lastLineCount.get(ta)) return;
  _lastLineCount.set(ta, lines);
  ta.style.height = 'auto';
  ta.style.height = ta.scrollHeight + 'px';
}

function _updateNums(ta, nums) {
  const count = ta.value.split('\n').length;
  nums.textContent = Array.from({ length: count }, (_, i) => i + 1).join('\n');
}

function _debouncedCheck(ta) {
  // Fast UI updates (line numbers and resizing)
  clearTimeout(_uiTimers.get(ta));
  _uiTimers.set(ta, setTimeout(() => {
    _updateNums(ta, _numsMap.get(ta));
    _autoResize(ta);
  }, 20));

  // Heavy Pyodide tasks (highlighting and syntax)
  clearTimeout(_pyTimers.get(ta));
  _pyTimers.set(ta, setTimeout(() => {
    if (ta.value === _lastVal.get(ta)) return;
    _lastVal.set(ta, ta.value);
    _runHeavyTasks(ta);
  }, 50));
}

function _selectedText(ta) {
  return ta.value.slice(ta.selectionStart, ta.selectionEnd);
}

function _tagEditorClipboard(e, text) {
  if (!text || !e.clipboardData) return false;
  e.clipboardData.setData('text/plain', text);
  e.clipboardData.setData(_EDITOR_CLIPBOARD_TYPE, '1');
  e.preventDefault();
  return true;
}

function _pasteIsAllowed(ta, e) {
  if (ta.dataset.allowPaste) return true;
  return e.clipboardData?.types?.includes(_EDITOR_CLIPBOARD_TYPE);
}

async function _runHeavyTasks(ta) {
  let val = ta.value;
  let result;
  
  try {
    result = await analyzeCode(val);
  } catch (err) {
    console.warn("Analysis failed for editor:", err);
    window.ErrorReporter?.report('Code editor analysis failed', err);
    _containerMap.get(ta)?.classList.remove('loading');
    return;
  }
  
  // If the value changed while we were awaiting (e.g. user typed), 
  // a newer _runHeavyTasks call is either already running or about to run.
  // We still clear the loading state so the initial skeleton disappears.
  const container = _containerMap.get(ta);
  if (container) container.classList.remove('loading');

  if (ta.value !== val) return;

  _lastVal.set(ta, val);

  // Update Highlighting
  const hl = _hlMap.get(ta);
  if (hl) hl.innerHTML = result.html + (val.endsWith('\n') ? ' ' : '');

  // Update Syntax Hint (Debounced separately to 800ms to avoid flicker)
  clearTimeout(_hintTimers.get(ta));
  _hintTimers.set(ta, setTimeout(() => {
    // Re-check value to ensure hint is for the latest text
    if (ta.value !== val) return;

    const hint = _hintMap.get(ta);
    if (!hint) return;
    
    if (result.ok || ta.value.trim().length < 5) {
      // Only dismiss an open help window on the visible→clean edge — code that
      // was always syntactically valid (e.g. it only fails at run-time) must
      // never close a help window opened via the run-time "Get help" button.
      const wasVisible = hint.classList.contains('visible');
      hint.classList.remove('visible');
      if (wasVisible && _errHelperEnabled(ta)) _dismissOpenErrHelper(ta);
    } else {
      const label = '⚠ ' + result.msg + (result.line ? ` — line ${result.line}` : '');
      if (_errHelperEnabled(ta)) {
        // Offer an on-demand "Get help" button that opens the friendly explanation.
        hint.innerHTML = '<span class="syntax-hint-msg"></span>' +
          '<button type="button" class="syntax-hint-help">💡 Get help</button>';
        hint.querySelector('.syntax-hint-msg').textContent = label;
        // Re-attach the exception class (e.g. "IndentationError: ") that ast.parse's
        // e.msg strips off, so python-error-hints' class-specific patterns can match.
        const raw = (result.type ? result.type + ': ' : '') + result.msg;
        hint.querySelector('.syntax-hint-help').onclick = () => _showErrHelper(ta, raw, result.line, result.type);
      } else {
        hint.textContent = label;
      }
      hint.classList.add('visible');
    }
  }, 800));
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Manually trigger a refresh of the editor's highlighting, line numbers,
 * and height. Useful after programmatic value changes.
 */
export function refreshEditor(ta) {
  if (!ta) return;
  _updateNums(ta, _numsMap.get(ta));
  _autoResize(ta, true);
  _runHeavyTasks(ta);
}

/**
 * Hide the syntax hint for a textarea — call this after a successful code
 * check so the amber warning doesn't linger once the student's code is correct.
 */
export function clearSyntaxHint(ta) {
  _hintMap.get(ta)?.classList.remove('visible');
}

/**
 * Update the output panel for a specific textarea.
 * @param {HTMLTextAreaElement} ta - The source textarea
 * @param {string} text - The text to display
 * @param {boolean} isError - Whether to style as an error
 * @param {number|null} [lineNo] - Line number the error was reported at, if known
 * @param {Array|null} [vars] - runPython's `vars` (needs trackVars) to show in
 *   the memory view; null empties it; omitted leaves it as it is.
 */
export function setEditorOutput(ta, text, isError = false, lineNo = null, vars) {
  const panel = _outputMap.get(ta);
  if (!panel) return;
  _stopStepping(ta);   // a check writing to this panel ends any step-through replay
  _hideExecLine(ta);
  if (vars !== undefined) _renderMemory(ta, vars);
  panel.classList.toggle('error', isError);
  const content = panel.querySelector('.output-content');
  if (content) content.textContent = text || '';
  const inputRow = panel.querySelector('.output-input-row');
  if (inputRow) inputRow.style.display = 'none';
  if (_errHelperEnabled(ta)) {
    // A failed run offers a "Get help" button next to the output; the
    // syntax-hint's own "Get help" button is a faster, pre-run path to it.
    if (isError) _offerErrHelp(ta, text, lineNo);
    else _hideErrHelper(ta);
  }
}

// ── Interactive input collection ──────────────────────────────────────────────

function _extractPythonPrompts(src) {
  const prompts = [];
  const re = /\binput\s*\(\s*(?:"([^"]*?)"|'([^']*?)')?/g;
  let m;
  while ((m = re.exec(src)) !== null) prompts.push(m[1] ?? m[2] ?? '');
  return prompts;
}

const _inputAbort = new Map();

// keepContent: leave the output panel's text in place (live runs show the
// program's output so far above the prompt) instead of clearing it.
function _collectInputs(ta, prompts, { keepContent = false } = {}) {
  const panel = _outputMap.get(ta);
  if (!panel || prompts.length === 0) return Promise.resolve([]);

  const prev = _inputAbort.get(ta);
  if (prev) prev();

  const content = panel.querySelector('.output-content');
  const inputRow = panel.querySelector('.output-input-row');
  const promptLabel = panel.querySelector('.output-prompt-label');
  const inputField = panel.querySelector('.output-input-field');

  panel.classList.remove('error');
  if (!keepContent) content.textContent = '';

  return new Promise(resolve => {
    const collected = [];
    let idx = 0;
    let done = false;

    function cleanup() {
      inputRow.style.display = 'none';
      promptLabel.textContent = '';
      inputField.value = '';
      panel.classList.remove('waiting-for-input');
      panel.querySelector('.input-type-hint')?.remove();
      inputField.removeEventListener('keydown', onKey);
      _inputAbort.delete(ta);
    }

    function finish() {
      if (done) return;
      done = true;
      cleanup();
      resolve(collected);
    }

    // Called when a newer Run click preempts this still-waiting collection.
    // Resolving with `null` (rather than the partial `collected` array) tells
    // runCode() this attempt was superseded, so it must NOT go on to execute
    // the program with an incomplete/empty inputs list — that was leaving
    // Python's mocked input() unset and letting two runPythonAsync() calls
    // race on the single shared interpreter (surfacing as a raw Pyodide
    // "I/O error" from the real input(), or a corrupted "str is not callable").
    function cancel() {
      if (done) return;
      done = true;
      cleanup();
      resolve(null);
    }

    function advance(val) {
      collected.push(val);
      idx++;
      if (idx >= prompts.length) {
        finish();
      } else {
        promptLabel.textContent = prompts[idx];
        inputField.value = '';
        inputField.focus();
      }
    }

    function onKey(e) {
      if (e.key === 'Enter') { e.preventDefault(); advance(inputField.value); }
    }

    _inputAbort.set(ta, cancel);
    inputField.addEventListener('keydown', onKey);
    promptLabel.textContent = prompts[0];
    inputField.value = '';
    panel.classList.add('waiting-for-input');
    const typeHint = document.createElement('p');
    typeHint.className = 'input-type-hint';
    typeHint.textContent = '⌨  type your answer and press Enter';
    inputRow.insertAdjacentElement('beforebegin', typeHint);
    inputRow.style.display = 'flex';
    inputField.focus();
    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
}

// Collecting one answer per input() written in the source (above) only works
// for straight-line code: an input() inside a loop or function can run any
// number of times. Such programs are run "live" instead — run until input()
// wants an answer it hasn't got, show the output so far, ask the student,
// then re-run from the start with the answers so far (runPython's 'ask' mode).
// The same `random` seed is used for every re-run of one Run click, so e.g. a
// guessing game's secret number doesn't change between guesses.
function _needsLiveInput(src) {
  return /\binput\s*\(/.test(src) && /\b(?:while|for|def)\b/.test(src);
}

const _liveRuns = new Map(); // ta → token of its newest live run

async function _runLive(ta) {
  const token = {};
  _liveRuns.set(ta, token);
  const seed = Math.floor(Math.random() * 2 ** 31);
  const answers = [];
  const trackVars = _memEnabled(ta);
  if (trackVars) _renderMemory(ta, null);   // a fresh run starts with empty memory
  for (;;) {
    const r = await runPython(ta.value, { inputs: answers, onInputsExhausted: 'ask', seed, trackVars });
    // A newer Run click owns the output panel now.
    if (_liveRuns.get(ta) !== token) return { ok: true, output: '', cancelled: true };
    if (!r.needsInput) {
      _liveRuns.delete(ta);
      if (r.ok) setEditorOutput(ta, r.output || '(no output)', false, null, r.vars);
      else setEditorOutput(ta, r.output, true, r.line, r.vars);
      return r;
    }
    setEditorOutput(ta, r.output, false, null, r.vars);
    const got = await _collectInputs(ta, [r.prompt], { keepContent: true });
    if (got === null || _liveRuns.get(ta) !== token) return { ok: true, output: '', cancelled: true };
    answers.push(got[0]);
  }
}

// ── Step-through run ──────────────────────────────────────────────────────────
// With stepThrough on, Run still executes the whole program in one go (Pyodide
// can't pause mid-run), but with runPython's traceLines, then *replays* it: a
// bar sits on each line in the order it ran, STEP_MS per line, and the output
// that line printed appears while it is lit. input() works as in _runLive: the
// replay stops on the input line, the student answers, the program re-runs from
// the start with the same seed, and the replay carries on from where it was.
// Checks that run the code themselves (Modify/Make) replay it with replayRun().
const STEP_MS = 500;
// No replay takes longer than this: a program with more than MAX_REPLAY_MS /
// STEP_MS lines to show gets shorter steps, so it still fits. With input(),
// each stretch between answers gets its own budget (later lines aren't known
// until the student has answered).
const MAX_REPLAY_MS = 5000;
const STEP_OUTPUT_AT = 0.4;   // share of a step before its output appears

function _lineHeightPx(ta) {
  const cs = getComputedStyle(ta);
  const lh = cs.lineHeight;
  if (lh.endsWith('px')) return parseFloat(lh);
  return (parseFloat(lh) || 1.7) * parseFloat(cs.fontSize);
}

// Put the bar (and the gutter highlight) on 1-based `line`. kind 'error' turns
// both red, for the line a crash happened on.
function _showExecLine(ta, line, kind = 'run') {
  const bar = _execLineMap.get(ta);
  if (!bar) return;
  const lh = _lineHeightPx(ta);
  bar.style.top = (parseFloat(getComputedStyle(ta).paddingTop) + (line - 1) * lh) + 'px';
  bar.style.height = lh + 'px';
  bar.classList.toggle('exec-error', kind === 'error');
  bar.hidden = false;
  const nums = _numsMap.get(ta);
  if (nums) {
    const cls = kind === 'error' ? 'exec-num exec-error' : 'exec-num';
    const count = ta.value.split('\n').length;
    nums.innerHTML = Array.from({ length: count }, (_, i) =>
      i + 1 === line ? `<span class="${cls}">${i + 1}</span>` : String(i + 1)).join('\n');
  }
}

function _hideExecLine(ta) {
  const bar = _execLineMap.get(ta);
  if (!bar || bar.hidden) return;
  bar.hidden = true;
  _updateNums(ta, _numsMap.get(ta));
}

// The status row ("Running line 3" + Skip) at the top of the output panel.
function _stepStatus(ta, text) {
  const row = _outputMap.get(ta)?.querySelector('.step-status');
  if (!row) return;
  row.hidden = text === null;
  if (text !== null) row.querySelector('.step-label').textContent = text;
}

// Finish the replay in progress at once (Skip, or the student typing).
function _skipStepping(ta, edited = false) {
  const run = _stepRuns.get(ta);
  if (!run) return;
  run.fast = true;
  if (edited) run.edited = true;
  run.wake?.();
}

// Abandon the replay in progress — a newer run or check owns the panel now.
function _stopStepping(ta) {
  const run = _stepRuns.get(ta);
  if (!run) return;
  _stepRuns.delete(ta);
  run.fast = true;
  run.wake?.();
  _stepStatus(ta, null);
}

function _stepPause(run, ms) {
  if (run.fast) return Promise.resolve();
  return new Promise(resolve => {
    const done = () => { clearTimeout(t); run.wake = null; resolve(); };
    const t = setTimeout(done, ms);
    run.wake = done;
  });
}

// Answers a check fed to input() (runPython's `inputs`, with traceLines) are
// typed into the output a character at a time, in a highlighted box tagged
// "typed for you", so students see the program still stopped for an input.
const TYPE_CHAR_MS = 70;
const TYPE_MAX_MS = 700;    // a long answer types faster, so it still fits
const TYPE_HOLD_MS = 350;   // the finished answer stays tagged this long

// Write `text` into `content`, wrapping each fed answer in a .fed-input span
// (cut short, with a caret, if `text` ends part-way through it). `active` is
// the answer being typed now, which carries the "typed for you" tag.
function _renderFed(content, text, fed, active = null) {
  content.textContent = '';
  let pos = 0;
  for (const f of fed) {
    if (f.at > text.length) break;
    if (!f.text || f.at < pos) continue;
    const end = Math.min(f.at + f.text.length, text.length);
    const span = document.createElement('span');
    span.className = 'fed-input';
    span.title = 'Typed in automatically to test your program';
    if (end < f.at + f.text.length) span.classList.add('fed-typing');
    if (f === active) span.classList.add('fed-active');
    span.textContent = text.slice(f.at, end);
    content.append(text.slice(pos, f.at), span);
    pos = end;
  }
  content.append(text.slice(pos));
}

function _writeStepOutput(ta, text, fed = null, active = null) {
  const panel = _outputMap.get(ta);
  const content = panel?.querySelector('.output-content');
  if (!content) return;
  panel.classList.remove('error');
  if (fed?.length) _renderFed(content, text, fed, active);
  else content.textContent = text;
}

// Type each fed answer that lands in out[start, end). Resolves false if a
// newer run took over the panel part-way through.
async function _typeFedInputs(ta, run, out, fed, start, end, line) {
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  for (const f of fed || []) {
    if (run.fast) break;
    if (!f.text || f.at < start || f.at >= end) continue;
    _stepStatus(ta, `⌨ input() on line ${line} — typing the answer "${f.text}"`);
    if (!reduced) {
      const charMs = Math.min(TYPE_CHAR_MS, TYPE_MAX_MS / f.text.length);
      for (let k = 0; k < f.text.length && !run.fast; k++) {
        _writeStepOutput(ta, out.slice(0, f.at + k), fed, f);
        await _stepPause(run, charMs);
        if (_stepRuns.get(ta) !== run) return false;
      }
    }
    _writeStepOutput(ta, out.slice(0, f.at + f.text.length), fed, f);
    await _stepPause(run, TYPE_HOLD_MS);
    if (_stepRuns.get(ta) !== run) return false;
    _stepStatus(ta, '▶ Running line ' + line);
  }
  return true;
}

// Start a replay on `ta`: abandon any earlier one and clear the panel.
function _beginStepping(ta, trackVars) {
  _stopStepping(ta);
  _inputAbort.get(ta)?.();   // a prompt still waiting from an earlier run
  const run = { fast: false, edited: false, wake: null };
  _stepRuns.set(ta, run);
  _writeStepOutput(ta, '');
  if (_errHelperEnabled(ta)) _hideErrHelper(ta);
  if (trackVars) _renderMemory(ta, null);
  _outputMap.get(ta)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  return run;
}

// Replay r.trace from step `from`, in at most MAX_REPLAY_MS (plus the time
// spent typing `fed` answers — see _typeFedInputs). Resolves false if a newer
// run took over the panel part-way through.
async function _replaySteps(ta, run, r, from, trackVars, fed = null) {
  const out = r.stdout ?? '';
  const trace = r.trace || [];
  if (from >= trace.length) return true;
  const stepMs = Math.min(STEP_MS, MAX_REPLAY_MS / (trace.length - from));
  // Output from before the first new step (e.g. the echo of the answer just
  // typed) belongs to the input line, which has already been shown.
  _writeStepOutput(ta, out.slice(0, trace[from].at), fed);
  for (let i = from; i < trace.length && !run.fast; i++) {
    const next = trace[i + 1];
    const upTo = next ? next.at : out.length;
    _showExecLine(ta, trace[i].line);
    _stepStatus(ta, '▶ Running line ' + trace[i].line);
    await _stepPause(run, stepMs * STEP_OUTPUT_AT);
    if (_stepRuns.get(ta) !== run) return false;
    if (!(await _typeFedInputs(ta, run, out, fed, trace[i].at, upTo, trace[i].line))) return false;
    _writeStepOutput(ta, out.slice(0, upTo), fed);
    if (trackVars) _renderMemory(ta, next ? next.vars : r.vars);
    await _stepPause(run, stepMs * (1 - STEP_OUTPUT_AT));
    if (_stepRuns.get(ta) !== run) return false;
  }
  return true;
}

// Show the finished run's final output — after a crash, the output printed
// before it stays above the error and the failing line stays lit in red.
// Fed answers (`fed`) stay highlighted in the final output.
function _finishStepping(ta, run, r, fed = null) {
  _stopStepping(ta);
  const out = r.stdout ?? r.output ?? '';
  const content = () => _outputMap.get(ta).querySelector('.output-content');
  if (r.ok) {
    setEditorOutput(ta, out || '(no output)', false, null, r.vars);
    if (out && fed?.length) _renderFed(content(), out, fed);
  } else {
    setEditorOutput(ta, r.output, true, r.line, r.vars);
    if (r.stdout) {
      if (fed?.length) _renderFed(content(), r.stdout + r.output, fed);
      else content().textContent = r.stdout + r.output;
    }
    if (r.line && !run.edited) _showExecLine(ta, r.line, 'error');
  }
}

/**
 * Show a run the activity made itself (e.g. a Modify/Make check's runPython
 * call) in `ta`'s output panel. With stepThrough on and `run` from
 * runPython(..., { traceLines: true }), it is replayed line by line first;
 * otherwise it is shown at once, as setEditorOutput would.
 * Pass `run.vars` through by calling runPython with trackVars.
 * @returns {Promise<boolean>} false if a newer run took over part-way — the
 *   caller should stop, as its result is no longer the one on screen.
 */
export async function replayRun(ta, run) {
  if (!_stepEnabled(ta) || !run.trace) {
    setEditorOutput(ta, run.output, !run.ok, run.ok ? null : run.line, run.vars);
    return true;
  }
  const trackVars = run.vars !== undefined;
  const state = _beginStepping(ta, trackVars);
  const ok = await _replaySteps(ta, state, run, 0, trackVars, run.inputs);
  if (!ok) return false;
  _finishStepping(ta, state, run, run.inputs);
  return true;
}

async function _runStepped(ta, inputs) {
  const cancelled = { ok: true, output: '', cancelled: true };
  const code = ta.value;
  const live = inputs === null;
  const answers = live ? [] : inputs;
  const seed = Math.floor(Math.random() * 2 ** 31);
  const trackVars = _memEnabled(ta);
  const run = _beginStepping(ta, trackVars);

  let shown = 0;   // trace steps already replayed (re-runs after input() repeat them)
  for (;;) {
    _stepStatus(ta, '▶ Running…');
    const r = await runPython(code, {
      inputs: answers, onInputsExhausted: live ? 'ask' : 'zero', seed, trackVars, traceLines: true,
    });
    if (_stepRuns.get(ta) !== run) return cancelled;
    // Preset answers are typed in for the student; their own live answers aren't.
    const fed = live ? null : r.inputs;
    if (!(await _replaySteps(ta, run, r, shown, trackVars, fed))) return cancelled;
    shown = Math.max(shown, (r.trace || []).length);

    if (!r.needsInput) {
      _finishStepping(ta, run, r, fed);
      return r;
    }
    const out = r.stdout ?? '';

    // Paused on input(): the input line stays lit while the student answers.
    _writeStepOutput(ta, out);
    if (trackVars) _renderMemory(ta, r.vars);
    _stepStatus(ta, '⌨ Waiting for your answer');
    const got = await _collectInputs(ta, [r.prompt], { keepContent: true });
    if (got === null || _stepRuns.get(ta) !== run) return cancelled;
    answers.push(got[0]);
  }
}

/**
 * Run the Python code in `ta`, collecting any required inputs interactively
 * via the output panel, then display the result.
 *
 * inputs = null  → auto-collect from output panel (default)
 * inputs = []    → run with no inputs
 * inputs = [...] → use supplied values directly
 *
 * @param {HTMLTextAreaElement} ta
 * @param {{ inputs?: string[]|null }} opts
 * @returns {Promise<{ ok: boolean, output: string }>}
 */
export async function runCode(ta, { inputs = null } = {}) {
  if (_stepEnabled(ta)) return _runStepped(ta, inputs);
  // The memory view always runs live, even for straight-line code, so each
  // answer drops into its box the moment it's typed (not all at the end).
  if (inputs === null && (_needsLiveInput(ta.value) || _memEnabled(ta))) return _runLive(ta);

  let resolvedInputs = inputs;
  if (resolvedInputs === null) {
    const prompts = _extractPythonPrompts(ta.value);
    resolvedInputs = prompts.length > 0 ? await _collectInputs(ta, prompts) : [];
  }

  // A later Run click preempted this run while it was still waiting for the
  // student to answer an earlier prompt — bail out without touching Python or
  // the DOM. The newer run owns the output panel now; letting this one carry
  // on would execute the program with no (or stale) input() mocking while the
  // other run is doing the same on the one shared Pyodide interpreter.
  if (resolvedInputs === null) return { ok: true, output: '', cancelled: true };

  const trackVars = _memEnabled(ta);
  const r = await runPython(ta.value, { inputs: resolvedInputs, trackVars });
  if (trackVars) { _renderMemory(ta, null); _renderMemory(ta, r.vars); }

  const panel = _outputMap.get(ta);
  const content = panel?.querySelector('.output-content');
  const hasHistory = resolvedInputs.length > 0 && content?.textContent;

  if (r.ok) {
    const out = r.output || '(no output)';
    if (hasHistory) {
      panel.classList.remove('error');
      content.textContent += out;
      if (_errHelperEnabled(ta)) _hideErrHelper(ta);
    } else {
      setEditorOutput(ta, out);
    }
  } else {
    const msg = r.output;
    if (hasHistory) {
      panel.classList.add('error');
      content.textContent += '\n' + msg;
      if (_errHelperEnabled(ta)) _offerErrHelp(ta, msg, r.line);
    } else {
      setEditorOutput(ta, msg, true, r.line);
    }
  }
  return r;
}

/**
 * Upgrade every textarea matching `selector` into a code editor:
 *   - wraps it in a flex row with a line-number gutter
 *   - injects a syntax-hint strip below the gutter
 *   - wires auto-resize, live syntax checking, and Tab indentation
 *
 * Call once in DOMContentLoaded after restoring any saved state.
 *
 * @param {string} selector - CSS selector for the textareas to upgrade.
 * @param {{errorHints?: boolean}} [opts] - Pass `{errorHints: true}` to show a
 *   just-in-time, Year-8-friendly explanation + Debugging Recipe below an editor
 *   a few seconds after a run fails. (A per-editor `data-error-hints` attribute
 *   opts a single textarea in regardless of this flag.)
 *   Pass `{memoryView: true}` (or `data-memory-view` on one textarea) to show
 *   each variable as a labelled box under the output, filled as the program
 *   runs. `?memory=off` / `?memory=on` in the page URL overrides both.
 *   Pass `{stepThrough: true}` (or `data-step-through` on one textarea) to make
 *   runCode() replay the run line by line, STEP_MS per line, lighting the line
 *   that is running and printing its output as it goes (with a Skip button).
 *   `?step=off` / `?step=on` in the page URL overrides both.
 */
export function setupEditors(selector = '.checker-textarea', opts = {}) {
  _injectStyles();

  document.querySelectorAll(selector).forEach(ta => {
    if (ta.dataset.editorInitialized) return;
    ta.dataset.editorInitialized = "true";
    if (opts.errorHints) _errHintsOn.add(ta);

    // ── Build DOM structure ────────────────────────────────────────────────
    const wrap = document.createElement('div');
    wrap.className = 'editor-wrap';
    ta.parentNode.insertBefore(wrap, ta);

    // Optional header if data-title is present and no header exists
    if (ta.dataset.title) {
      const existingHeader = ta.closest('.code-checker')?.querySelector('.checker-header');
      if (!existingHeader) {
        const header = document.createElement('div');
        header.className = 'checker-header';
        header.innerHTML = '<span class="checker-dot dot-r"></span><span class="checker-dot dot-y"></span><span class="checker-dot dot-g"></span><span>' + ta.dataset.title + '</span>';
        wrap.parentNode.insertBefore(header, wrap);
      }
    }

    const container = document.createElement('div');
    container.className = 'editor-container loading';
    wrap.appendChild(container);
    _containerMap.set(ta, container);

    const hl = document.createElement('div');
    hl.className = 'highlight-layer';
    hl.setAttribute('aria-hidden', 'true');
    container.appendChild(hl);
    _hlMap.set(ta, hl);

    container.appendChild(ta);

    if (opts.stepThrough) _stepOn.add(ta);
    const execLine = document.createElement('div');
    execLine.className = 'exec-line';
    execLine.hidden = true;
    execLine.setAttribute('aria-hidden', 'true');
    container.insertBefore(execLine, hl);
    _execLineMap.set(ta, execLine);

    const nums = document.createElement('div');
    nums.className = 'line-nums';
    nums.setAttribute('aria-hidden', 'true');
    wrap.insertBefore(nums, container);
    _numsMap.set(ta, nums);

    // Output panel sits on the right
    const output = document.createElement('div');
    output.className = 'output-panel';
    output.innerHTML =
      '<div class="output-header">Python Shell Output</div>' +
      '<div class="output-content"></div>' +
      '<div class="output-input-row" style="display:none">' +
        '<span class="output-prompt-label"></span>' +
        '<input class="output-input-field" type="text" autocomplete="off" spellcheck="false">' +
      '</div>';
    wrap.appendChild(output);
    _outputMap.set(ta, output);

    if (_stepEnabled(ta)) {
      const status = document.createElement('div');
      status.className = 'step-status';
      status.hidden = true;
      status.innerHTML =
        '<span class="step-label" aria-live="polite"></span>' +
        '<button type="button" class="step-skip">⏩ Skip to end</button>';
      status.querySelector('.step-skip').addEventListener('click', () => _skipStepping(ta));
      output.querySelector('.output-header').insertAdjacentElement('afterend', status);
    }

    if (opts.memoryView) _memOn.add(ta);
    if (_memEnabled(ta)) {
      const mem = document.createElement('div');
      mem.className = 'memory-view';
      mem.hidden = true;
      mem.setAttribute('role', 'region');
      mem.setAttribute('aria-label', 'Variables in memory');
      mem.innerHTML =
        '<div class="memory-inner">' +
          '<div class="memory-header">Memory — your variables</div>' +
          '<ul class="memory-boxes"></ul>' +
        '</div>';
      output.appendChild(mem);
      _memMap.set(ta, mem);
    }

    // Hint sits after the wrap so it spans the full editor width
    const hint = document.createElement('div');
    hint.className = 'syntax-hint';
    wrap.insertAdjacentElement('afterend', hint);
    _hintMap.set(ta, hint);

    // ── Events ────────────────────────────────────────────────────────────
    ta.addEventListener('copy', e => {
      _tagEditorClipboard(e, _selectedText(ta));
    });

    ta.addEventListener('cut', e => {
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      if (!_tagEditorClipboard(e, _selectedText(ta))) return;

      ta.value = ta.value.slice(0, start) + ta.value.slice(end);
      ta.selectionStart = ta.selectionEnd = start;
      ta.dispatchEvent(new Event('input', { bubbles: true }));
      window.saveState?.();
    });

    ta.addEventListener('paste', e => {
      if (!_pasteIsAllowed(ta, e)) e.preventDefault();
    });

    ta.addEventListener('input', () => {
      // Editing mid-replay jumps it to the end; the lit line no longer matches the code.
      _skipStepping(ta, true);
      _hideExecLine(ta);
      _debouncedCheck(ta);
    });

    ta.addEventListener('scroll', () => {
      // overflow-y:hidden hides the scrollbar but doesn't prevent scrollTop drifting.
      // A non-zero scrollTop shifts the cursor mapping vs the highlight layer, causing
      // clicks to land one line above the visual text. Reset it immediately.
      if (ta.scrollTop !== 0) ta.scrollTop = 0;
      hl.style.transform = `translateX(-${ta.scrollLeft}px)`;
    });

    ta.addEventListener('focus', () => {
      // Refresh on focus in case the value changed programmatically 
      // or the editor was hidden during its initial render.
      _debouncedCheck(ta);
    });

    ta.addEventListener('keydown', e => {
      if (e.key !== 'Tab') return;
      e.preventDefault();
      const start = ta.selectionStart;
      const end   = ta.selectionEnd;
      if (e.shiftKey) {
        // Remove up to 4 leading spaces from the current line
        const lineStart = ta.value.lastIndexOf('\n', start - 1) + 1;
        const m = ta.value.slice(lineStart).match(/^( {1,4})/);
        if (m) {
          const n = m[1].length;
          ta.value = ta.value.slice(0, lineStart) + ta.value.slice(lineStart + n);
          ta.selectionStart = ta.selectionEnd = Math.max(lineStart, start - n);
        }
      } else {
        // Insert 4 spaces at cursor
        ta.value = ta.value.slice(0, start) + '    ' + ta.value.slice(end);
        ta.selectionStart = ta.selectionEnd = start + 4;
      }
      // Changing .value from script fires no 'input' event, so announce the edit the way a
      // real keystroke would — the editor's own listener re-checks syntax, and an activity's
      // oninput (saveState, live tick-lists) sees the new indentation straight away.
      ta.dispatchEvent(new Event('input', { bubbles: true }));
      window.saveState?.(); // activities expose saveState as a global
    });

    // ── Initial render (value already restored by the activity) ───────────
    _updateNums(ta, nums);
    _autoResize(ta);
    _runHeavyTasks(ta);
  });
}
