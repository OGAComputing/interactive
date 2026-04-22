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
  `;
  document.head.appendChild(s);
}

// ── Module-level state ────────────────────────────────────────────────────────
const _hintMap = new Map(); // textarea → .syntax-hint element
const _outputMap = new Map(); // textarea → .output-panel element
const _hlMap = new Map(); // textarea → .highlight-layer element
const _numsMap = new Map(); // textarea → .line-nums element
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
  const result = await analyzeCode(ta.value);
  
  // Update Highlighting
  const hl = _hlMap.get(ta);
  if (hl) hl.innerHTML = result.html + (ta.value.endsWith('\n') ? ' ' : '');

  // Update Syntax Hint (Debounced separately to 800ms to avoid flicker)
  clearTimeout(_hintTimers.get(ta));
  _hintTimers.set(ta, setTimeout(() => {
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
    // ── Build DOM structure ────────────────────────────────────────────────
    const wrap = document.createElement('div');
    wrap.className = 'editor-wrap';
    ta.parentNode.insertBefore(wrap, ta);

    const container = document.createElement('div');
    container.className = 'editor-container';
    wrap.appendChild(container);

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
    output.innerHTML = '<div class="output-header">Console Output</div><div class="output-content"></div>';
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
