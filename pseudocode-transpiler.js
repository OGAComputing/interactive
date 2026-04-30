// OCR pseudocode -> Python transpiler.
//
// Returns { python, map, errors, helpers } where:
//   python  - generated Python (preamble + student code)
//   map     - array; map[i] = 1-indexed pseudocode line for python line i+1, or null
//   errors  - array of { line, msg } for unsupported/unrecognised constructs
//   helpers - the preamble Python string (shown in "Transpiled Python" panel)
//
// OCR v2 pseudocode coverage (procedural subset + file I/O):
//   variables, assignment, auto-typed input (int→float→str), explicit casting (int/str/float/real), print, comments
//   for...next (inclusive, step support including negative via _psc_rng)
//   while...endwhile, do...until
//   if/elseif/else/endif
//   switch/case/default/endswitch
//   function/procedure/endfunction/endprocedure, return, global X = ...
//   array name[N] (1D),  array name[R,C] (2D with [a,b] access rewrite)
//   AND OR NOT, MOD DIV, ^
//   .length, .substring(start, count)  (receiver-walking tokenizer)
//   openRead, openWrite, .readLine(), .writeLine(), .endOfFile(), .close()
//
// Unsupported (emits friendly error): class, endclass, inherits

const INDENT = '    ';

// ── Python helper preamble ────────────────────────────────────────────────────
// Always emitted at the top of every generated program; all map entries: null.
// Uses globals().get() so the caller can pre-inject _psc_files before running.
const PREAMBLE = `\
def _psc_rng(a, b, s=1):
    return range(a, b + 1, s) if s > 0 else range(a, b - 1, s)
def _psc_len(x): return len(x)
def _psc_substr(s, start, count): return s[start:start + count]
_psc_files = globals().get('_psc_files', {})
_psc_writes = {}
class _PscReadFile:
    def __init__(self, name):
        self._lines = iter(_psc_files.get(name, '').splitlines())
        self._buffered = None
        self._eof = False
    def readLine(self):
        if self._buffered is not None:
            v, self._buffered = self._buffered, None
            return v
        try: return next(self._lines)
        except StopIteration: self._eof = True; return ''
    def endOfFile(self):
        if self._eof: return True
        try: self._buffered = next(self._lines); return False
        except StopIteration: self._eof = True; return True
    def close(self): pass
class _PscWriteFile:
    def __init__(self, name):
        self._name = name
        _psc_writes[name] = []
    def writeLine(self, s): _psc_writes[self._name].append(str(s))
    def close(self): pass
def _psc_open_read(name): return _PscReadFile(name)
def _psc_open_write(name): return _PscWriteFile(name)
def _psc_input(prompt=''):
    v = input(prompt)
    try: return int(v)
    except (ValueError, TypeError): pass
    try: return float(v)
    except (ValueError, TypeError): pass
    return v
real = float`;

// ── Utilities ─────────────────────────────────────────────────────────────────

function _esc(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Walk left from dotPos to find the start of the receiver expression.
// Balances () [] {} so it can handle chained calls like getName().substring(...)
function _walkLeft(s, dotPos) {
  let i = dotPos - 1;
  let depth = 0;
  while (i >= 0) {
    const c = s[i];
    if (c === ')' || c === ']' || c === '}') { depth++; i--; continue; }
    if (c === '(' || c === '[' || c === '{') {
      if (depth === 0) break;
      depth--; i--; continue;
    }
    if (depth > 0) { i--; continue; }
    if (/[A-Za-z0-9_.]/.test(c)) { i--; continue; }
    break;
  }
  return i + 1;
}

// Find the matching close bracket starting at openPos.
function _findClose(s, openPos, open, close) {
  let depth = 0;
  for (let i = openPos; i < s.length; i++) {
    if (s[i] === open) depth++;
    else if (s[i] === close) { depth--; if (depth === 0) return i; }
  }
  return -1;
}

// Split string at top-level commas only.
function _splitArgs(s) {
  const args = [];
  let depth = 0, start = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '(' || c === '[' || c === '{') depth++;
    else if (c === ')' || c === ']' || c === '}') depth--;
    else if (c === ',' && depth === 0) { args.push(s.slice(start, i)); start = i + 1; }
  }
  args.push(s.slice(start));
  return args;
}

// ── Segmentation ─────────────────────────────────────────────────────────────
// Split a raw source line into { text, kind: 'code'|'string'|'comment' }.
function segment(line) {
  const segs = [];
  let i = 0, start = 0, inStr = false;
  while (i < line.length) {
    const c = line[i];
    if (!inStr && c === '/' && line[i + 1] === '/') {
      if (start < i) segs.push({ text: line.slice(start, i), kind: 'code' });
      segs.push({ text: line.slice(i), kind: 'comment' });
      return segs;
    }
    if (c === '"') {
      if (inStr) {
        segs.push({ text: line.slice(start, i + 1), kind: 'string' });
        start = i + 1; inStr = false;
      } else {
        if (start < i) segs.push({ text: line.slice(start, i), kind: 'code' });
        start = i; inStr = true;
      }
    }
    i++;
  }
  if (start < line.length) segs.push({ text: line.slice(start), kind: inStr ? 'string' : 'code' });
  return segs;
}

// ── String-method rewriter (receiver-walking) ─────────────────────────────────
// Replaces .length and .substring() on any receiver expression (including
// chained calls and subscript expressions), routing through _psc_len/_psc_substr.
function _rewriteStringMethods(code) {
  const reps = [];

  // .length (not followed by '(')
  const lenRe = /\.length\b(?!\()/g;
  let m;
  while ((m = lenRe.exec(code)) !== null) {
    const dotPos = m.index;
    const recStart = _walkLeft(code, dotPos);
    const receiver = code.slice(recStart, dotPos);
    if (!receiver.trim()) continue;
    reps.push({ start: recStart, end: dotPos + m[0].length, replacement: `_psc_len(${receiver})` });
  }

  // .substring( or .subString(
  const subRe = /\.[sS]ubstring\s*\(/g;
  while ((m = subRe.exec(code)) !== null) {
    const dotPos = m.index;
    const openParen = code.indexOf('(', dotPos + 1);
    if (openParen === -1) continue;
    const closeParen = _findClose(code, openParen, '(', ')');
    if (closeParen === -1) continue;
    const recStart = _walkLeft(code, dotPos);
    const receiver = code.slice(recStart, dotPos);
    if (!receiver.trim()) continue;
    const args = _splitArgs(code.slice(openParen + 1, closeParen));
    if (args.length !== 2) continue;
    reps.push({
      start: recStart,
      end: closeParen + 1,
      replacement: `_psc_substr(${receiver}, ${args[0].trim()}, ${args[1].trim()})`,
    });
  }

  reps.sort((a, b) => b.start - a.start);
  let s = code;
  for (const r of reps) s = s.slice(0, r.start) + r.replacement + s.slice(r.end);
  return s;
}

// ── Operator + syntax rewrites (applied to code segments only) ────────────────
function rewriteOperators(code, ctx) {
  let s = code;

  // 2D array access: board[a,b] → board[a][b] for declared 2D arrays
  if (ctx && ctx.twoDArrNames.size > 0) {
    const reps = [];
    for (const name of ctx.twoDArrNames) {
      const re = new RegExp(`\\b${_esc(name)}\\s*\\[`, 'g');
      let m;
      while ((m = re.exec(s)) !== null) {
        const openBracket = m.index + m[0].length - 1;
        const closeBracket = _findClose(s, openBracket, '[', ']');
        if (closeBracket === -1) continue;
        const inner = s.slice(openBracket + 1, closeBracket);
        const args = _splitArgs(inner);
        if (args.length !== 2) continue;
        reps.push({
          start: m.index,
          end: closeBracket + 1,
          replacement: `${name}[${args[0].trim()}][${args[1].trim()}]`,
        });
      }
    }
    reps.sort((a, b) => b.start - a.start);
    for (const r of reps) s = s.slice(0, r.start) + r.replacement + s.slice(r.end);
  }

  // File I/O constructors
  s = s.replace(/\bopenRead\s*\(/g, '_psc_open_read(');
  s = s.replace(/\bopenWrite\s*\(/g, '_psc_open_write(');

  // input() → _psc_input() for OCR-style auto-typing (int → float → str)
  s = s.replace(/\binput\s*\(/g, '_psc_input(');

  // Logical/arithmetic operators
  s = s.replace(/\bAND\b/g, 'and');
  s = s.replace(/\bOR\b/g, 'or');
  s = s.replace(/\bNOT\b/g, 'not');
  s = s.replace(/\s+MOD\s+/g, ' % ');
  s = s.replace(/\s+DIV\s+/g, ' // ');
  s = s.replace(/\^/g, '**');

  // Boolean / null literals
  s = s.replace(/\btrue\b/g, 'True');
  s = s.replace(/\bfalse\b/g, 'False');
  s = s.replace(/\bnull\b/g, 'None');

  // String methods via receiver-walking tokenizer
  s = _rewriteStringMethods(s);

  return s;
}

function rewrite(line, ctx) {
  return segment(line).map(s => {
    if (s.kind === 'string') return s.text;
    if (s.kind === 'comment') return '#' + s.text.slice(2);
    return rewriteOperators(s.text, ctx);
  }).join('');
}

// ── Per-line classification ───────────────────────────────────────────────────
function classify(line, ctx) {
  const t = line.trim();
  if (t === '') return { emit: [''] };

  if (/^\/\//.test(t)) return { emit: ['#' + t.slice(2)] };

  // Unsupported OOP constructs — emit a friendly transpiler error
  if (/^class\s+/i.test(t) || /^endclass$/i.test(t)) {
    return { oop: "classes are not supported — use functions and procedures instead" };
  }
  if (/^inherits\b/i.test(t)) {
    return { oop: "'inherits' is not supported" };
  }

  // ── Python-ism detection — friendly hints for common Python syntax mistakes ──
  if (/^#/.test(t)) {
    return { pythonic: "use '//' for comments in OCR pseudocode, not '#'" };
  }
  if (/^elif\b/i.test(t)) {
    return { pythonic: "use 'elseif <condition> then' not Python's 'elif'" };
  }
  if (/^else\s*:$/.test(t)) {
    return { pythonic: "write 'else' without a colon in OCR pseudocode" };
  }
  if (/^if\s+.+:\s*$/i.test(t) && !/^if\s+.+\s+then\s*$/i.test(t)) {
    return { pythonic: "'if' statements end with 'then' in OCR pseudocode, not ':' — e.g. 'if x > 5 then'" };
  }
  if (/^while\s+.+:\s*$/i.test(t)) {
    return { pythonic: "'while' does not end with ':' in OCR pseudocode — close the loop with 'endwhile'" };
  }
  if (/^for\s+[A-Za-z_]\w*\s+in\s+/i.test(t)) {
    return { pythonic: "use 'for <var> = <start> to <end>' — OCR pseudocode does not use Python's 'for ... in ...'" };
  }
  if (/^def\s+[A-Za-z_]\w*\s*\(/i.test(t)) {
    return { pythonic: "use 'function <name>(<params>)' and 'endfunction' — OCR pseudocode does not use 'def'" };
  }
  if (/^continue$/i.test(t)) {
    return { pythonic: "'continue' is not part of OCR pseudocode — restructure your loop condition to skip iterations" };
  }
  if (/^break$/i.test(t)) {
    return { pythonic: "'break' is not part of OCR pseudocode — use a flag variable or a 'do...until' loop instead" };
  }

  let m;

  // for X = A to B [step S]  (uses _psc_rng for correct inclusive step handling)
  if ((m = t.match(/^for\s+([A-Za-z_]\w*)\s*=\s*(.+?)\s+to\s+(.+?)(?:\s+step\s+(.+))?$/i))) {
    const [, v, a, b, step] = m;
    const A = rewriteOperators(a, ctx), B = rewriteOperators(b, ctx);
    const py = step
      ? `for ${v} in _psc_rng(${A}, ${B}, ${rewriteOperators(step, ctx)}):`
      : `for ${v} in _psc_rng(${A}, ${B}):`;
    return { emit: [py], openBlock: true };
  }

  if (t.match(/^next\s+[A-Za-z_]\w*$/i)) return { emit: [], closeBlock: true };

  if ((m = t.match(/^while\s+(.+)$/i))) {
    return { emit: [`while ${rewriteOperators(m[1], ctx)}:`], openBlock: true };
  }
  if (/^endwhile$/i.test(t)) return { emit: [], closeBlock: true };

  if (/^do$/i.test(t)) return { emit: ['while True:'], openBlock: true };
  if ((m = t.match(/^until\s+(.+)$/i))) {
    return { emit: [`if ${rewriteOperators(m[1], ctx)}: break`], closeBlock: true, emitBeforeClose: true };
  }

  if ((m = t.match(/^if\s+(.+)\s+then$/i))) {
    return { emit: [`if ${rewriteOperators(m[1], ctx)}:`], openBlock: true };
  }
  if ((m = t.match(/^elseif\s+(.+)\s+then$/i))) {
    return { emit: [`elif ${rewriteOperators(m[1], ctx)}:`], midBlock: true };
  }
  if (/^else$/i.test(t)) return { emit: ['else:'], midBlock: true };
  if (/^endif$/i.test(t)) return { emit: [], closeBlock: true };

  if ((m = t.match(/^switch\s+(.+?):?\s*$/i))) {
    return { emit: [`__sw = ${rewriteOperators(m[1].replace(/:$/, ''), ctx)}`], switchOpen: true };
  }
  if ((m = t.match(/^case\s+(.+?):\s*$/i))) {
    return { caseClause: { kind: 'case', val: rewriteOperators(m[1], ctx) } };
  }
  if (/^default:\s*$/i.test(t)) return { caseClause: { kind: 'default' } };
  if (/^endswitch$/i.test(t)) return { emit: [], switchClose: true };

  if ((m = t.match(/^(?:public\s+|private\s+)?function\s+([A-Za-z_]\w*)\s*\((.*?)\)\s*$/i))) {
    return { emit: [`def ${m[1]}(${m[2]}):`], openBlock: true };
  }
  if (/^endfunction$/i.test(t)) return { emit: [], closeBlock: true };

  if ((m = t.match(/^(?:public\s+|private\s+)?procedure\s+([A-Za-z_]\w*)\s*\((.*?)\)\s*$/i))) {
    const params = m[2].split(',').map(p => p.split(':')[0].trim()).filter(Boolean).join(', ');
    return { emit: [`def ${m[1]}(${params}):`], openBlock: true };
  }
  if (/^endprocedure$/i.test(t)) return { emit: [], closeBlock: true };

  if ((m = t.match(/^return(?:\s+(.+))?$/i))) {
    return { emit: [m[1] ? `return ${rewriteOperators(m[1], ctx)}` : 'return'] };
  }

  if ((m = t.match(/^global\s+([A-Za-z_]\w*)\s*=\s*(.+)$/i))) {
    return { emit: [`${m[1]} = ${rewriteOperators(m[2], ctx)}`] };
  }

  // 1D array declaration
  if ((m = t.match(/^array\s+([A-Za-z_]\w*)\s*\[\s*(\d+)\s*\]\s*$/i))) {
    return { emit: [`${m[1]} = [None] * ${m[2]}`] };
  }
  // 2D array declaration — register name so accesses get rewritten
  if ((m = t.match(/^array\s+([A-Za-z_]\w*)\s*\[\s*(\d+)\s*,\s*(\d+)\s*\]\s*$/i))) {
    ctx.twoDArrNames.add(m[1]);
    return { emit: [`${m[1]} = [[None] * ${m[3]} for _ in range(${m[2]})]`] };
  }

  // Fallthrough: plain expression / assignment
  return { emit: [rewrite(t, ctx)] };
}

// ── Driver ────────────────────────────────────────────────────────────────────
export function transpile(src) {
  const srcLines = src.split('\n');
  const out = []; // { py, srcLine }
  const errors = [];
  const ctx = { twoDArrNames: new Set() };

  // Prepend preamble (srcLine: null for all preamble lines)
  for (const py of PREAMBLE.split('\n')) out.push({ py, srcLine: null });

  const depthStack = [{ kind: 'root', hasBody: true }];
  const switchStack = [];

  const depth = () => depthStack.length - 1;
  const ind = (d = depth()) => INDENT.repeat(d);
  const noteBody = () => { if (depthStack.length > 0) depthStack[depthStack.length - 1].hasBody = true; };
  const closeBlock = () => {
    const top = depthStack.pop();
    if (top && !top.hasBody) out.push({ py: ind() + INDENT + 'pass', srcLine: null });
  };

  for (let i = 0; i < srcLines.length; i++) {
    const lineNum = i + 1;
    let cls;
    try {
      cls = classify(srcLines[i], ctx);
    } catch (e) {
      errors.push({ line: lineNum, msg: String(e.message || e) });
      continue;
    }

    if (cls.oop) {
      errors.push({ line: lineNum, msg: cls.oop });
      continue;
    }

    if (cls.pythonic) {
      errors.push({ line: lineNum, msg: cls.pythonic });
      continue;
    }

    if (cls.switchOpen) {
      out.push({ py: ind() + cls.emit[0], srcLine: lineNum });
      noteBody();
      switchStack.push({ depth: depth(), seenCase: false });
      continue;
    }
    if (cls.switchClose) {
      if (switchStack.length) {
        const sw = switchStack[switchStack.length - 1];
        while (depth() > sw.depth) closeBlock();
        switchStack.pop();
      }
      continue;
    }
    if (cls.caseClause) {
      if (!switchStack.length) { errors.push({ line: lineNum, msg: 'case/default outside switch' }); continue; }
      const sw = switchStack[switchStack.length - 1];
      while (depth() > sw.depth) closeBlock();
      let py;
      if (cls.caseClause.kind === 'case') {
        py = sw.seenCase ? `elif __sw == ${cls.caseClause.val}:` : `if __sw == ${cls.caseClause.val}:`;
      } else {
        py = sw.seenCase ? 'else:' : 'if True:';
      }
      sw.seenCase = true;
      out.push({ py: ind() + py, srcLine: lineNum });
      depthStack.push({ kind: 'case', hasBody: false });
      continue;
    }

    if (cls.midBlock) {
      if (!depthStack[depthStack.length - 1].hasBody) out.push({ py: ind() + 'pass', srcLine: null });
      depthStack.pop();
      out.push({ py: ind() + cls.emit[0], srcLine: lineNum });
      depthStack.push({ kind: 'mid', hasBody: false });
      continue;
    }

    if (cls.closeBlock) {
      if (cls.emitBeforeClose && cls.emit.length) {
        for (const e of cls.emit) out.push({ py: ind() + e, srcLine: lineNum });
        noteBody();
      }
      closeBlock();
      continue;
    }

    if (cls.openBlock) {
      for (const e of cls.emit) out.push({ py: ind() + e, srcLine: lineNum });
      noteBody();
      depthStack.push({ kind: 'block', hasBody: false });
      continue;
    }

    for (const e of cls.emit) out.push({ py: e === '' ? '' : ind() + e, srcLine: lineNum });
    if (cls.emit.some(e => e !== '')) noteBody();
  }

  while (depthStack.length > 1) closeBlock();

  return {
    python: out.map(o => o.py).join('\n'),
    map: out.map(o => o.srcLine),
    errors,
    helpers: PREAMBLE,
  };
}

// Convenience: given a Python error line (1-indexed), return the originating
// pseudocode line, or null for preamble/injected lines.
export function mapErrorLine(map, pythonLine) {
  if (!Number.isFinite(pythonLine) || pythonLine < 1 || pythonLine > map.length) return null;
  return map[pythonLine - 1];
}
