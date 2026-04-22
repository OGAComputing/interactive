// Shared Pyodide runner — lazy-loaded, singleton instance.
// Usage: import { runPython, preload } from '../../pyodide-runner.js';
//
// preload()  — starts downloading Pyodide in the background; returns the
//              Promise so callers can .then()/.catch() for status feedback.
// runPython(code, { inputs: [] })
//           — runs `code` in the shared interpreter; resolves with
//             { ok: boolean, output: string }
//
// Loading strategy: tries the self-hosted /pyodide/ folder first (present on
// the deployed GitHub Pages site after CI commits it). If that 404s — which
// happens during local development before the CI has run — it falls back to
// the jsDelivr CDN so local testing works without any manual setup.

const PYODIDE_VERSION = '0.27.3';
const PYODIDE_BASE    = new URL('./pyodide/', import.meta.url).href;
const PYODIDE_CDN     = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

let _pyodide = null;
let _loading = null;

async function _init() {
  let mod;
  let indexURL = PYODIDE_BASE;

  try {
    // pyodide.mjs is the ES module build — exports loadPyodide as a named export
    mod = await import(PYODIDE_BASE + 'pyodide.mjs');
  } catch {
    // Self-hosted files not present (local dev) — fall back to CDN
    indexURL = PYODIDE_CDN;
    mod = await import(PYODIDE_CDN + 'pyodide.mjs');
  }

  _pyodide = await mod.loadPyodide({ indexURL });
  return _pyodide;
}

export function preload() {
  if (!_loading) _loading = _init();
  return _loading;
}

export async function runPython(code, { inputs = [] } = {}) {
  if (!_loading) _loading = _init();
  await _loading;

  const out = [];
  _pyodide.setStdout({ batched: s => out.push(s) });
  _pyodide.setStderr({ batched: () => {} }); // errors surface via exception

  // Inject input() mock when test values are supplied
  const preamble = inputs.length
    ? `import builtins as _b\n_q = iter(${JSON.stringify(inputs)})\n_b.input = lambda *_: next(_q, '')\n`
    : '';

  try {
    await _pyodide.runPythonAsync(preamble + code);
    return { ok: true, output: out.join('\n') };
  } catch (err) {
    // Return only the final error line — strip the Python traceback header
    const lines = String(err).split('\n').filter(l => l.trim());
    const msg = lines[lines.length - 1] || String(err);
    return { ok: false, output: msg };
  }
}
