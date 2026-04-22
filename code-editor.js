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

import { checkSyntax } from './pyodide-runner.js';

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
    :where(.checker-textarea) {
      flex: 1;
      background: #0d0d1a;
      color: #cdd6f4;
      font-family: 'Courier New', monospace;
      font-size: .88rem;
      line-height: 1.7;
      padding: .8rem 1rem;
      border: none;
      outline: none;
      resize: none;
      overflow: hidden;
      min-height: 200px;
    }
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
  `;
  document.head.appendChild(s);
}

// ── Module-level state ────────────────────────────────────────────────────────
const _hintMap = new Map(); // textarea → .syntax-hint element
const _timers  = new Map(); // textarea → debounce timer id

// ── Private helpers ───────────────────────────────────────────────────────────
function _autoResize(ta) {
  ta.style.height = 'auto';
  ta.style.height = ta.scrollHeight + 'px';
}

function _updateNums(ta, nums) {
  const count = ta.value.split('\n').length;
  nums.textContent = Array.from({ length: count }, (_, i) => i + 1).join('\n');
}

function _debouncedCheck(ta) {
  clearTimeout(_timers.get(ta));
  _timers.set(ta, setTimeout(() => _doCheck(ta), 700));
}

async function _doCheck(ta) {
  const hint = _hintMap.get(ta);
  if (!hint) return;
  const code = ta.value;
  if (code.trim().length < 5) { hint.classList.remove('visible'); return; }
  const result = await checkSyntax(code);
  if (result.ok) {
    hint.classList.remove('visible');
  } else {
    const lineStr = result.line ? ` — line ${result.line}` : '';
    hint.textContent = '⚠ ' + result.msg + lineStr;
    hint.classList.add('visible');
  }
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
    wrap.appendChild(ta);

    const nums = document.createElement('div');
    nums.className = 'line-nums';
    nums.setAttribute('aria-hidden', 'true');
    wrap.insertBefore(nums, ta);

    // Hint sits after the wrap so it spans the full editor width
    const hint = document.createElement('div');
    hint.className = 'syntax-hint';
    wrap.insertAdjacentElement('afterend', hint);
    _hintMap.set(ta, hint);

    // ── Events ────────────────────────────────────────────────────────────
    ta.addEventListener('input', () => {
      _updateNums(ta, nums);
      _autoResize(ta);
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
      _updateNums(ta, nums);
      _autoResize(ta);
      _debouncedCheck(ta);
      window.saveState?.(); // activities expose saveState as a global
    });

    // ── Initial render (value already restored by the activity) ───────────
    _updateNums(ta, nums);
    _autoResize(ta);
  });
}
