// OCR pseudocode -> Python transpiler (prototype).
//
// Returns { python, map, errors } where:
//   python  - string of generated Python source
//   map     - array of length === number of python lines; map[i] is the
//             1-indexed pseudocode source line that produced python line i+1
//             (null if the line is purely structural, e.g. an injected `pass`)
//   errors  - array of { line, msg } for unrecognised constructs
//
// Coverage in this prototype:
//   variables / assignment, casting, print, input, comments
//   for...next (with optional `step`)
//   while...endwhile, do...until
//   if/elseif/else/endif
//   switch/case/default/endswitch (compiled to if/elif chain - no Python `match`
//                                  reliance, keeps it portable)
//   function/endfunction, procedure/endprocedure, return, global
//   array name[N], array name[R,C]
//   AND OR NOT, MOD DIV, ^
//   .length, .substring(start, count)
//
// Out of scope for the prototype (deliberately): file I/O, classes,
// inheritance, byVal/byRef annotations, switch fall-through.

const KW_TO = 'to', KW_STEP = 'step';
const INDENT = '    ';

// ── Segmentation: split a line into string / comment / code regions so
//    keyword rewrites never touch the inside of "..." or //... .
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
        start = i + 1;
        inStr = false;
      } else {
        if (start < i) segs.push({ text: line.slice(start, i), kind: 'code' });
        start = i;
        inStr = true;
      }
    }
    i++;
  }
  if (start < line.length) {
    segs.push({ text: line.slice(start), kind: inStr ? 'string' : 'code' });
  }
  return segs;
}

function rewriteCode(line, fn) {
  return segment(line).map(s => s.kind === 'code' ? fn(s.text) : s.text).join('');
}

// Collapse a comment-only line's `//` into `#` while keeping its position.
function rewriteComment(line) {
  return segment(line).map(s => {
    if (s.kind === 'comment') return '#' + s.text.slice(2);
    return s.text;
  }).join('');
}

// Operator + builtin keyword rewrites. Applied only to `code` segments.
function rewriteOperators(code) {
  let s = code;
  // word-boundary substitutions
  s = s.replace(/\bAND\b/g, 'and');
  s = s.replace(/\bOR\b/g, 'or');
  s = s.replace(/\bNOT\b/g, 'not');
  s = s.replace(/\s+MOD\s+/g, ' % ');
  s = s.replace(/\s+DIV\s+/g, ' // ');
  s = s.replace(/\^/g, '**');
  // Pseudocode boolean / null literals (lowercase) -> Python equivalents.
  s = s.replace(/\btrue\b/g, 'True');
  s = s.replace(/\bfalse\b/g, 'False');
  s = s.replace(/\bnull\b/g, 'None');
  // `s.length` (property, not call) -> `len(s)` for a simple identifier
  s = s.replace(/\b([A-Za-z_]\w*)\.length\b(?!\()/g, 'len($1)');
  // `s.substring(a, b)` and `.subString(...)` -> `s[a:a+b]`
  // (only when both args are simple expressions without nested parens)
  s = s.replace(
    /\b([A-Za-z_]\w*)\.[sS]ubstring\(\s*([^,()]+?)\s*,\s*([^()]+?)\s*\)/g,
    '$1[$2:($2)+($3)]'
  );
  return s;
}

function rewrite(line) {
  // Comments are dealt with at the segment layer; operators only on code segs.
  return segment(line).map(s => {
    if (s.kind === 'string') return s.text;
    if (s.kind === 'comment') return '#' + s.text.slice(2);
    return rewriteOperators(s.text);
  }).join('');
}

// ── Per-line classification + emission ───────────────────────────────────────
//
// Each handler returns { emit: [strings], openBlock?: bool, closeBlock?: bool,
//                       midBlock?: bool }.
// The driver loop below converts that into Python lines tagged with srcLine
// and manages indentation depth + empty-block `pass` injection.

function classify(line) {
  const t = line.trim();
  if (t === '') return { emit: [''] };

  // pure comment line
  if (/^\/\//.test(t)) return { emit: [rewriteComment(t)] };

  // for X = A to B [step S]
  let m;
  if ((m = t.match(/^for\s+([A-Za-z_]\w*)\s*=\s*(.+?)\s+to\s+(.+?)(?:\s+step\s+(.+))?$/i))) {
    const [, v, a, b, step] = m;
    const A = rewriteOperators(a), B = rewriteOperators(b);
    let py;
    if (step) {
      const S = rewriteOperators(step);
      // Pseudocode `to B` is inclusive. Determine inclusive end based on step sign.
      // For unknown sign we default to `B+1` (positive step). Negative-step
      // programs are rare at GCSE level; flagged as a known limitation.
      py = `for ${v} in range(${A}, (${B}) + 1, ${S}):`;
    } else {
      py = `for ${v} in range(${A}, (${B}) + 1):`;
    }
    return { emit: [py], openBlock: true };
  }

  if ((m = t.match(/^next\s+[A-Za-z_]\w*$/i))) {
    return { emit: [], closeBlock: true };
  }

  if ((m = t.match(/^while\s+(.+)$/i))) {
    return { emit: [`while ${rewriteOperators(m[1])}:`], openBlock: true };
  }
  if (/^endwhile$/i.test(t)) return { emit: [], closeBlock: true };

  if (/^do$/i.test(t)) {
    return { emit: ['while True:'], openBlock: true };
  }
  if ((m = t.match(/^until\s+(.+)$/i))) {
    // Emit the break-on-condition at body depth, THEN close the loop.
    return {
      emit: [`if ${rewriteOperators(m[1])}: break`],
      closeBlock: true,
      emitBeforeClose: true,
    };
  }

  if ((m = t.match(/^if\s+(.+)\s+then$/i))) {
    return { emit: [`if ${rewriteOperators(m[1])}:`], openBlock: true };
  }
  if ((m = t.match(/^elseif\s+(.+)\s+then$/i))) {
    return { emit: [`elif ${rewriteOperators(m[1])}:`], midBlock: true };
  }
  if (/^else$/i.test(t)) return { emit: ['else:'], midBlock: true };
  if (/^endif$/i.test(t)) return { emit: [], closeBlock: true };

  // switch X: -> if/elif chain on a temp variable
  if ((m = t.match(/^switch\s+(.+?):?\s*$/i))) {
    const expr = rewriteOperators(m[1].replace(/:$/, ''));
    return {
      emit: [`__sw = ${expr}`],
      switchOpen: true,
    };
  }
  if ((m = t.match(/^case\s+(.+?):\s*$/i))) {
    const val = rewriteOperators(m[1]);
    return { caseClause: { kind: 'case', val } };
  }
  if (/^default:\s*$/i.test(t)) {
    return { caseClause: { kind: 'default' } };
  }
  if (/^endswitch$/i.test(t)) return { emit: [], switchClose: true };

  if ((m = t.match(/^(?:public\s+|private\s+)?function\s+([A-Za-z_]\w*)\s*\((.*?)\)\s*$/i))) {
    return { emit: [`def ${m[1]}(${m[2]}):`], openBlock: true };
  }
  if (/^endfunction$/i.test(t)) return { emit: [], closeBlock: true };

  if ((m = t.match(/^(?:public\s+|private\s+)?procedure\s+([A-Za-z_]\w*)\s*\((.*?)\)\s*$/i))) {
    // Strip OCR's :byVal / :byRef annotations from the parameter list.
    const params = m[2].split(',').map(p => p.split(':')[0].trim()).filter(Boolean).join(', ');
    return { emit: [`def ${m[1]}(${params}):`], openBlock: true };
  }
  if (/^endprocedure$/i.test(t)) return { emit: [], closeBlock: true };

  if ((m = t.match(/^return(?:\s+(.+))?$/i))) {
    return { emit: [m[1] ? `return ${rewriteOperators(m[1])}` : 'return'] };
  }

  if ((m = t.match(/^global\s+([A-Za-z_]\w*)\s*=\s*(.+)$/i))) {
    // At module level, `global X = ...` is just `X = ...`.
    return { emit: [`${m[1]} = ${rewriteOperators(m[2])}`] };
  }

  if ((m = t.match(/^array\s+([A-Za-z_]\w*)\s*\[\s*(\d+)\s*\]\s*$/i))) {
    return { emit: [`${m[1]} = [None] * ${m[2]}`] };
  }
  if ((m = t.match(/^array\s+([A-Za-z_]\w*)\s*\[\s*(\d+)\s*,\s*(\d+)\s*\]\s*$/i))) {
    return {
      emit: [`${m[1]} = [[None] * ${m[3]} for _ in range(${m[2]})]`],
    };
  }

  // Fallthrough: treat as a plain expression / assignment, just rewrite ops + comments.
  return { emit: [rewrite(t)] };
}

export function transpile(src) {
  const srcLines = src.split('\n');
  const out = []; // { py, srcLine }  (srcLine null = injected `pass`)
  const errors = [];

  // Indentation/block bookkeeping.
  // depthStack tracks how many python indents are active and, for each level,
  // whether at least one body line has been emitted (used to inject `pass`).
  const depthStack = [{ kind: 'root', hasBody: true }];
  // switchStack tracks open `switch` constructs so that case clauses know
  // to dedent back to the switch level before re-opening their own block.
  const switchStack = []; // { switchDepth }

  const depth = () => depthStack.length - 1;
  const ind = (d = depth()) => INDENT.repeat(d);
  const noteBody = () => {
    if (depthStack.length > 0) depthStack[depthStack.length - 1].hasBody = true;
  };
  const closeBlock = () => {
    const top = depthStack.pop();
    if (top && !top.hasBody) {
      out.push({ py: ind() + INDENT + 'pass', srcLine: null });
    }
  };

  for (let i = 0; i < srcLines.length; i++) {
    const lineNum = i + 1;
    const line = srcLines[i];
    let cls;
    try {
      cls = classify(line);
    } catch (e) {
      errors.push({ line: lineNum, msg: String(e.message || e) });
      continue;
    }

    // switch opens its own scope: emits `__sw = expr` at current depth, then
    // we DON'T increase depth - cases sit at the same level and self-indent
    // their body. We push a marker so endswitch knows nothing to pop.
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
      // dedent back to switch level, then emit if/elif/else as appropriate
      if (!switchStack.length) {
        errors.push({ line: lineNum, msg: 'case/default outside switch' });
        continue;
      }
      const sw = switchStack[switchStack.length - 1];
      while (depth() > sw.depth) closeBlock();
      let py;
      if (cls.caseClause.kind === 'case') {
        py = sw.seenCase
          ? `elif __sw == ${cls.caseClause.val}:`
          : `if __sw == ${cls.caseClause.val}:`;
      } else { // default
        py = sw.seenCase ? 'else:' : 'if True:';
      }
      sw.seenCase = true;
      out.push({ py: ind() + py, srcLine: lineNum });
      depthStack.push({ kind: 'case', hasBody: false });
      continue;
    }

    if (cls.midBlock) {
      // close current branch, emit clause at outer depth, reopen
      if (!depthStack[depthStack.length - 1].hasBody) {
        out.push({ py: ind() + 'pass', srcLine: null });
      }
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

    // plain emit
    for (const e of cls.emit) {
      out.push({ py: e === '' ? '' : ind() + e, srcLine: lineNum });
    }
    if (cls.emit.some(e => e !== '')) noteBody();
  }

  // close any unclosed blocks (silently - caller can detect via depth > 0
  // by inspecting the source, but we don't error here).
  while (depthStack.length > 1) closeBlock();

  return {
    python: out.map(o => o.py).join('\n'),
    map: out.map(o => o.srcLine),
    errors,
  };
}

// Convenience: given a Python error line (1-indexed), return the originating
// pseudocode line, or null for injected lines.
export function mapErrorLine(map, pythonLine) {
  if (!Number.isFinite(pythonLine) || pythonLine < 1 || pythonLine > map.length) return null;
  return map[pythonLine - 1];
}
