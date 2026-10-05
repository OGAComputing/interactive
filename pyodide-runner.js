// Shared Pyodide runner — lazy-loaded, singleton instance.
// Usage: import { runPython, preload, checkSyntax } from '../../pyodide-runner.js';
//
// preload()  — starts downloading Pyodide in the background; returns the
//              Promise so callers can .then()/.catch() for status feedback.
// runPython(code, { inputs: [], onInputsExhausted, seed, timeLimitMs })
//           — runs `code` in the shared interpreter; resolves with
//             { ok: boolean, output: string, line?: number }
//             or, when onInputsExhausted is 'ask' and the program wants
//             another answer, { ok: false, needsInput: true, prompt, output }
//             (see the option notes above runPython). With traceLines it
//             also resolves with `trace` and `stdout` (see traceLines below).
// checkSyntax(code)
//           — parses `code` with Python's ast module; resolves with
//             { ok: boolean, line?: number, msg?: string }
//             Does NOT execute the code — safe to call on every keystroke.
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
  // Use fetch to probe for the self-hosted file — more reliable than catching
  // a failed import() because browsers can cache import failures within a session.
  let indexURL = PYODIDE_CDN;
  try {
    const probe = await fetch(PYODIDE_BASE + 'pyodide.asm.js', { method: 'HEAD' });
    if (probe.ok) indexURL = PYODIDE_BASE;
  } catch { /* network error — stay on CDN */ }

  const { loadPyodide } = await import(indexURL + 'pyodide.mjs');
  _pyodide = await loadPyodide({ indexURL });
  return _pyodide;
}

export function preload() {
  if (!_loading) _loading = _init();
  return _loading;
}

// Translate Python's terse error messages into plain English for novices.
function _cleanSyntaxMsg(raw) {
  const s = String(raw);
  if (/EOL while scanning string literal|unterminated string/i.test(s))
    return 'Missing closing quote — check your speech marks are paired';
  if (/EOF while parsing|unexpected EOF/i.test(s))
    return 'Code looks incomplete — are you missing a closing bracket?';
  if (/expected an indented block/i.test(s))
    return 'Indentation needed — the line after def / if / for / while must be indented (4 spaces or Tab)';
  if (/unexpected indent/i.test(s))
    return 'Unexpected indent — this line has too many spaces at the start';
  if (/unindent does not match/i.test(s))
    return 'Indentation mismatch — check your spacing is consistent (4 spaces or Tab throughout)';
  if (/invalid syntax/i.test(s))
    return 'Syntax error — check for a missing colon (:) after def / if / for / while, or unmatched brackets';
  if (/invalid character/i.test(s))
    return 'Invalid character — you may have "curly quotes" (“”) instead of straight quote marks (")';
  // Strip the exception class prefix and return the remainder as-is
  return s.replace(/^(?:SyntaxError|IndentationError|TabError): /, '').split('\n')[0];
}

export async function checkSyntax(code) {
  if (!_loading) _loading = _init();
  await _loading;
  // Run a Python try/except so we can read e.lineno and e.msg directly,
  // avoiding the unreliable regex-on-traceback approach (the traceback
  // includes internal Python file line numbers which swamp the student's line).
  // Assign to _r so it is the final top-level expression; a bare try/except
  // block is a statement and runPython() would return undefined otherwise.
  const pySnippet =
    `import ast as _ast, json as _json\n` +
    `try:\n` +
    `    _ast.parse(${JSON.stringify(code)})\n` +
    `    _r = _json.dumps({'ok': True})\n` +
    `except SyntaxError as _e:\n` +
    `    _r = _json.dumps({'ok': False, 'line': _e.lineno, 'msg': _e.msg})\n` +
    `_r\n`;
  try {
    const result = JSON.parse(_pyodide.runPython(pySnippet));
    if (result.ok) return { ok: true };
    return { ok: false, line: result.line, msg: _cleanSyntaxMsg(result.msg) };
  } catch (err) {
    // Fallback: something unexpected went wrong (e.g. IndentationError subclass)
    const raw = String(err);
    const lines = raw.split('\n').filter(l => l.trim());
    return { ok: false, line: null, msg: _cleanSyntaxMsg(lines[lines.length - 1] || raw) };
  }
}

// Pyodide runs on the page's main thread and cannot be interrupted, so a
// never-ending loop would freeze the whole tab. Every run therefore has a loop
// guard: before running, the student's code is parsed and a `_rq_tick()` call
// is inserted as the first statement of every while/for body. Once the program
// has been running longer than timeLimitMs, the tick raises InfiniteLoopError
// at that loop, and keeps raising on every later pass, so a bare `except:`
// inside the loop can't swallow it and carry on. (A sys.settrace tracer can't
// do this: CPython switches tracing off the first time a tracer raises.)
// Inputs are always pre-supplied (mocked), so the clock never includes time a
// student spends typing.
const DEFAULT_TIME_LIMIT_MS = 4000;
// Cap on captured stdout chunks, so `while True: print(...)` can't exhaust
// memory in the seconds before the time limit trips.
const MAX_OUTPUT_CHUNKS = 5000;
// Written to stdout by input() when it needs an answer it wasn't given ('ask'
// mode). Output is cut here, so anything the program prints afterwards (e.g.
// from a bare `except:` swallowing the stop) never reaches the student.
// (Plain text — Pyodide's stdout drops control characters such as NUL.)
const NEED_INPUT_MARK = '@@rq-needs-input@@';
// Reads the trackVars snapshot: [[name, typeName, display], …] as JSON, for the
// names in _rq_names that currently hold a value. Strings are shown in double
// quotes (as students write them); builtins are reached through the module so
// a student's `repr = …` or `len = …` can't break it.
const SNAPSHOT_DEF =
  `def _rq_snap():\n` +
  `    import builtins as _bb, json as _js\n` +
  `    _g, _out = globals(), []\n` +
  `    for _n in _g.get('_rq_names', []):\n` +
  `        if _n not in _g: continue\n` +
  `        _v = _g[_n]\n` +
  `        _t = _bb.type(_v).__name__\n` +
  `        _d = '"' + _v + '"' if _t == 'str' else _bb.repr(_v)\n` +
  `        if _bb.len(_d) > 60: _d = _d[:57] + '...'\n` +
  `        _out.append([_n, _t, _d])\n` +
  `    return _js.dumps(_out)\n`;
const SNAPSHOT_PY = SNAPSHOT_DEF + `_rq_snap()`;
// traceLines records at most this many line steps; a longer program (or a
// never-ending loop) runs on untraced, so the step-through replay stays short.
const MAX_TRACE_STEPS = 150;

// Options:
//   inputs            — answers fed to input(), in order.
//   onInputsExhausted — what input() does once `inputs` has run out:
//       'zero'  (default, legacy) returns '0'. If that then traps the program
//               in a loop, the InfiniteLoopError says it was waiting on input.
//       'error' raises EOFError (what real Python does when stdin runs out).
//               Use this for checkers that feed a fixed list of test inputs.
//       'ask'   stops the program and resolves with
//               { ok: false, needsInput: true, prompt, output } so the editor
//               can ask the student for one more answer and re-run with it.
//   seed              — seeds `random` so re-runs with the same answers make
//                       the same choices (needed by 'ask' re-runs).
//   trackVars         — also resolve with `vars`: [[name, type, display], …]
//                       for each variable the student's code assigned, in
//                       source order, as memory held them when the run stopped.
//   traceLines        — also resolve with `trace`: [{ line, at, vars? }, …], one
//                       entry per student line, in the order they ran, recorded
//                       just *before* each line runs. `at` is how many characters
//                       of stdout had been printed by then, and `vars` (with
//                       trackVars) is memory at that moment. Also resolves with
//                       `stdout`: the program's printed output, kept even when it
//                       crashed (where `output` holds only the error), and
//                       `inputs`: [{ at, text }, …], each answer input() was fed
//                       and where it starts in `stdout`. Used by the editor's
//                       step-through replay; see MAX_TRACE_STEPS.
//   timeLimitMs       — see DEFAULT_TIME_LIMIT_MS.
export async function runPython(code, {
  inputs = [],
  onInputsExhausted = 'zero',
  seed = null,
  timeLimitMs = DEFAULT_TIME_LIMIT_MS,
  trackVars = false,
  traceLines = false,
} = {}) {
  if (!_loading) _loading = _init();
  await _loading;

  const out = [];
  let outChars = 0;   // length of stdout() so far: each chunk is followed by '\n'
  _pyodide.setStdout({ batched: s => {
    if (out.length < MAX_OUTPUT_CHUNKS) { out.push(s); outChars += s.length + 1; }
  } });
  _pyodide.setStderr({ batched: () => {} }); // errors surface via exception

  // The interpreter's global namespace persists between runs (later calls,
  // e.g. getWrittenFiles(), rely on that to read back what the last run set).
  // But that means a student's mistake can otherwise leak forever: if code
  // shadows a builtin (`print = "Jordan"`), every later run keeps seeing that
  // string instead of the real print() — "stuck" until the page is reloaded.
  // Reset any previously-shadowed builtin names before running, and always
  // restore the real input() before deciding whether to re-mock it below.
  const resetPreamble =
    `import builtins as _b\n` +
    `if not hasattr(_b, '_orig_input'): _b._orig_input = _b.input\n` +
    `_b.input = _b._orig_input\n` +
    `for _n in list(globals()):\n` +
    `    if hasattr(_b, _n) and globals()[_n] is not getattr(_b, _n):\n` +
    `        globals()[_n] = getattr(_b, _n)\n` +
    `_rq_need = None\n` +
    `_rq_ran_out = False\n`;

  // Inject input() mock when test values are supplied (or when running out of
  // them must be caught rather than falling back to '0').
  // Echo the prompt + the "typed" value to stdout so the output matches a real
  // terminal: `name = input("What is your name? ")` with value "Nick" shows the
  // line `What is your name? Nick`, then later print()s follow.
  // Legacy fallback '0' (not '') so exhausted inputs don't produce a str that
  // breaks arithmetic. 'error' / 'ask' also set _rg['halt'], so the program
  // still stops if student code swallows the exception with a bare `except:`.
  const onExhausted = {
    zero:  `        _v = '0'\n`,
    error: `        _rg['halt'] = lambda: EOFError('the program asked for input more times than it was given answers')\n` +
           `        raise _rg['halt']()\n`,
    ask:   `        _rq_need = str(prompt)\n` +
           `        _sys.stdout.write(${JSON.stringify(NEED_INPUT_MARK)} + '\\n')\n` +
           `        _rg['halt'] = _RunnerNeedsInput\n` +
           `        raise _RunnerNeedsInput()\n`,
  }[onInputsExhausted] ?? `        _v = '0'\n`;
  const inputsPreamble = (inputs.length || onInputsExhausted !== 'zero')
    ? `import sys as _sys\n` +
      `_q = iter(${JSON.stringify(inputs)})\n` +
      `def _mock_input(prompt=''):\n` +
      `    global _rq_need, _rq_ran_out\n` +
      `    _v = next(_q, None)\n` +
      `    if _v is None:\n` +
      `        _rq_ran_out = True\n` +
      onExhausted +
      (traceLines
        ? `    try:\n` +
          `        _sys.stdout.flush()\n` +
          `        _rq_js_input(str(prompt), str(_v))\n` +
          `    except Exception: pass\n`
        : '') +
      `    _sys.stdout.write(str(prompt) + str(_v) + '\\n')\n` +
      `    return _v\n` +
      `_b.input = _mock_input\n`
    : '';

  const seedPreamble = seed === null ? '' :
    `import random as _rnd\n_rnd.seed(${Math.trunc(Number(seed)) || 0})\n`;

  // Variable tracking (trackVars): list every name the student's code assigns,
  // in source order, and drop any value left over from an earlier run, so the
  // snapshot shows only what *this* run stored. Off by default: other
  // activities may rely on globals persisting between runs.
  const trackPreamble =
    `_rq_names = sorted({(n.lineno, n.col_offset, n.id) for n in _ast.walk(_rq_tree)\n` +
    `                    if isinstance(n, _ast.Name) and isinstance(n.ctx, _ast.Store)})\n` +
    `_rq_names = list(dict.fromkeys(n for _, _, n in _rq_names if not n.startswith('_')))\n` +
    `for _n in _rq_names: globals().pop(_n, None)\n`;

  // Line tracing (traceLines): a sys.settrace tracer that, on each line of the
  // student's code (and of their functions), flushes stdout and hands the line
  // number (plus a memory snapshot, with trackVars) to _rq_js_mark. It never
  // raises, so CPython's switch-tracing-off-on-error can't apply, and it turns
  // itself off after MAX_TRACE_STEPS. Only the exec of the student's code is
  // traced; the finally drops the tracer again however the run ends.
  const trace = [];
  const fedInputs = [];   // traceLines: where each answer input() was fed sits in stdout
  if (traceLines) {
    _pyodide.globals.set('_rq_js_mark', (line, vars) => {
      trace.push(vars == null ? { line, at: outChars } : { line, at: outChars, vars: JSON.parse(vars) });
    });
    _pyodide.globals.set('_rq_js_input', (prompt, text) => {
      fedInputs.push({ at: outChars + prompt.length, text });   // JS length, as stdout is measured
    });
  }
  const traceExec =
    `import sys as _rq_sys\n` +
    (trackVars ? SNAPSHOT_DEF : '') +
    `_rq_steps = [0]\n` +
    `def _rq_trace(frame, event, arg):\n` +
    `    if frame.f_code.co_filename != '<student>': return None\n` +
    `    if event == 'line':\n` +
    `        if _rq_steps[0] >= ${MAX_TRACE_STEPS}:\n` +
    `            _rq_sys.settrace(None)\n` +
    `            return None\n` +
    `        _rq_steps[0] += 1\n` +
    `        try:\n` +
    `            _rq_sys.stdout.flush()\n` +
    `            _rq_js_mark(frame.f_lineno, ${trackVars ? '_rq_snap()' : 'None'})\n` +
    `        except Exception: pass\n` +
    `    return _rq_trace\n` +
    `_rq_sys.settrace(_rq_trace)\n` +
    `try:\n` +
    `    exec(compile(_rq_tree, '<student>', 'exec'), globals())\n` +
    `finally:\n` +
    `    _rq_sys.settrace(None)\n`;

  // Loop guard (see DEFAULT_TIME_LIMIT_MS). The student's code is compiled as
  // '<student>' with its own line numbers, so traceback lines need no offset.
  const limitSecs = Math.max(0.1, timeLimitMs / 1000);
  const guardPreamble =
    `import ast as _ast, time as _time\n` +
    `class InfiniteLoopError(Exception): pass\n` +
    `class _RunnerNeedsInput(EOFError): pass\n` +
    `def _rq_loop_error():\n` +
    `    if _rq_ran_out:\n` +
    `        return InfiniteLoopError('the program kept asking for input after every answer had been used, so it was stopped - check the loop can finish')\n` +
    `    return InfiniteLoopError('the program was still running after ${limitSecs} seconds, so it was stopped - a loop probably never finishes')\n` +
    `_rg = {'n': 0, 'end': _time.monotonic() + ${limitSecs}, 'halt': None}\n` +
    `def _rq_tick():\n` +
    `    if _rg['halt'] is not None:\n` +
    `        raise _rg['halt']()\n` +
    `    _rg['n'] += 1\n` +
    `    if _rg['n'] >= 200:\n` +
    `        _rg['n'] = 0\n` +
    `        if _time.monotonic() > _rg['end']:\n` +
    `            _rg['halt'] = _rq_loop_error\n` +
    `            raise _rq_loop_error()\n` +
    `class _RqAddTicks(_ast.NodeTransformer):\n` +
    `    def _tick(self, node):\n` +
    `        self.generic_visit(node)\n` +
    `        t = _ast.Expr(_ast.Call(_ast.Name('_rq_tick', _ast.Load()), [], []))\n` +
    `        node.body.insert(0, _ast.copy_location(t, node.body[0]))\n` +
    `        return node\n` +
    `    visit_While = visit_For = _tick\n` +
    `_rq_names = []\n` +
    `_rq_tree = _RqAddTicks().visit(_ast.parse(${JSON.stringify(code)}, '<student>'))\n` +
    (trackVars ? trackPreamble : '') +
    `_ast.fix_missing_locations(_rq_tree)\n` +
    (traceLines ? traceExec : `exec(compile(_rq_tree, '<student>', 'exec'), globals())\n`);

  const preamble = resetPreamble + inputsPreamble + seedPreamble + guardPreamble;
  const stdout = () => out.length ? out.join('\n') + '\n' : '';

  let result;
  try {
    await _pyodide.runPythonAsync(preamble);
    result = { ok: true, output: stdout() };
  } catch (err) {
    // Return only the final error line — strip the Python traceback header
    const raw = String(err);
    const lines = raw.split('\n').filter(l => l.trim());
    const msg = lines[lines.length - 1] || raw;
    // Pull the deepest student-code "line N" the traceback reports — the frame
    // closest to the actual failure — so the help card can point at it.
    const lineMatches = [...raw.matchAll(/File "<student>", line (\d+)/g)];
    const line = lineMatches.length
      ? parseInt(lineMatches[lineMatches.length - 1][1], 10)
      : null;
    result = { ok: false, output: msg, line };
  }

  // The snapshot is read after the run stops — however it stopped (finished,
  // crashed, or paused for input) — so it shows what memory held at that moment.
  if (trackVars) {
    try { result.vars = JSON.parse(_pyodide.runPython(SNAPSHOT_PY)); }
    catch { result.vars = []; }
  }
  if (traceLines) {
    result.trace = trace;
    result.stdout = stdout();
    result.inputs = fedInputs;
  }

  if (onInputsExhausted === 'ask') {
    const prompt = _pyodide.globals.get('_rq_need');
    if (typeof prompt === 'string') {
      const output = stdout();
      const cut = output.indexOf(NEED_INPUT_MARK);
      const shown = cut < 0 ? output : output.slice(0, cut);
      return { ok: false, needsInput: true, prompt, output: shown, vars: result.vars,
               ...(traceLines ? { trace, stdout: shown, inputs: fedInputs } : {}) };
    }
  }
  return result;
}

export async function analyzeCode(code) {
  if (!_loading) _loading = _init();
  const py = await _loading;

  if (!py.globals.get('_py_analyze')) {
    py.runPython(`
import tokenize, io, html, keyword, json, ast
def _py_analyze(code):
    result = {"ok": True, "line": None, "msg": "", "html": "", "type": ""}
    # 1. Syntax Check
    try:
        ast.parse(code)
    except SyntaxError as e:
        result.update({"ok": False, "line": e.lineno, "msg": str(e.msg), "type": type(e).__name__})
    except Exception as e:
        result.update({"ok": False, "line": None, "msg": str(e), "type": type(e).__name__})

    # 2. Highlighting
    tokens_html = []
    lines = code.splitlines(keepends=True)
    last_ln, last_col = 1, 0
    try:
        tokens = tokenize.generate_tokens(io.StringIO(code).readline)
        for tok in tokens:
            if tok.type == tokenize.ENCODING or tok.type == tokenize.ENDMARKER: continue
            s_ln, s_col = tok.start
            if (s_ln, s_col) > (last_ln, last_col):
                if s_ln == last_ln: tokens_html.append(html.escape(lines[s_ln-1][last_col:s_col]))
                else:
                    tokens_html.append(html.escape(lines[last_ln-1][last_col:]))
                    for i in range(last_ln, s_ln - 1): tokens_html.append(html.escape(lines[i]))
                    tokens_html.append(html.escape(lines[s_ln-1][:s_col]))
            val = html.escape(tok.string)
            cls = "tok-default"
            if tok.type == tokenize.NAME:
                if keyword.iskeyword(tok.string): cls = "tok-kw"
                elif tok.string in ['print', 'input', 'len', 'range', 'int', 'str', 'float',
                                    'bool', 'list', 'dict', 'set', 'tuple', 'type',
                                    'abs', 'round', 'max', 'min', 'sorted', 'enumerate', 'zip']: cls = "tok-builtin"
            else:
                cls = {tokenize.STRING: "tok-str", tokenize.FSTRING_START: "tok-str",
                       tokenize.FSTRING_MIDDLE: "tok-str", tokenize.FSTRING_END: "tok-str",
                       tokenize.NUMBER: "tok-num",
                       tokenize.COMMENT: "tok-comment", tokenize.OP: "tok-op"}.get(tok.type, "tok-default")
            if cls == "tok-default": tokens_html.append(val)
            else: tokens_html.append(f'<span class="{cls}">{val}</span>')
            last_ln, last_col = tok.end
    except Exception:
        tokens_html.append(html.escape(code[sum(len(l) for l in lines[:last_ln-1]) + last_col:]))
    
    result["html"] = "".join(tokens_html)
    return json.dumps(result)
`);
  }
  return JSON.parse(py.globals.get('_py_analyze')(code));
}
