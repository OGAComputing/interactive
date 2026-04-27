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

import { analyzeCode } from './pyodide-runner.js';

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
      overflow: hidden;
      min-height: 200px;
      white-space: pre;
    }
    :where(.highlight-layer) {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
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
      display: block;
    }
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

async function _runHeavyTasks(ta) {
  let val = ta.value;
  let result;
  
  try {
    result = await analyzeCode(val);
  } catch (err) {
    console.warn("Analysis failed for editor:", err);
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
      hint.classList.remove('visible');
    } else {
      hint.textContent = '⚠ ' + result.msg + (result.line ? ` — line ${result.line}` : '');
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
 */
export function setEditorOutput(ta, text, isError = false) {
  const panel = _outputMap.get(ta);
  if (!panel) return;
  panel.classList.toggle('error', isError);
  const content = panel.querySelector('.output-content');
  if (content) content.textContent = text || '';
}

/**
 * Upgrade every textarea matching `selector` into a code editor:
 *   - wraps it in a flex row with a line-number gutter
 *   - injects a syntax-hint strip below the gutter
 *   - wires auto-resize, live syntax checking, and Tab indentation
 *
 * Call once in DOMContentLoaded after restoring any saved state.
 */
export function setupEditors(selector = '.checker-textarea') {
  _injectStyles();

  document.querySelectorAll(selector).forEach(ta => {
    if (ta.dataset.editorInitialized) return;
    ta.dataset.editorInitialized = "true";

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

    const nums = document.createElement('div');
    nums.className = 'line-nums';
    nums.setAttribute('aria-hidden', 'true');
    wrap.insertBefore(nums, container);
    _numsMap.set(ta, nums);

    // Output panel sits on the right
    const output = document.createElement('div');
    output.className = 'output-panel';
    output.innerHTML = '<div class="output-header">Python Shell Output</div><div class="output-content"></div>';
    wrap.appendChild(output);
    _outputMap.set(ta, output);

    // Hint sits after the wrap so it spans the full editor width
    const hint = document.createElement('div');
    hint.className = 'syntax-hint';
    wrap.insertAdjacentElement('afterend', hint);
    _hintMap.set(ta, hint);

    // ── Events ────────────────────────────────────────────────────────────
    ta.addEventListener('input', () => {
      _debouncedCheck(ta); 
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
      _debouncedCheck(ta);
      window.saveState?.(); // activities expose saveState as a global
    });

    // ── Initial render (value already restored by the activity) ───────────
    _updateNums(ta, nums);
    _autoResize(ta);
    _runHeavyTasks(ta);
  });
}
