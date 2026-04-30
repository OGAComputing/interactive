import { describe, test, expect } from 'vitest';
import { transpile, mapErrorLine } from './pseudocode-transpiler.js';

// ── helpers ───────────────────────────────────────────────────────────────────
function py(src) { return transpile(src).python; }
function errs(src) { return transpile(src).errors; }
function srcLineFor(src, pyLineContent) {
  const { python, map } = transpile(src);
  const idx = python.split('\n').findIndex(l => l.includes(pyLineContent));
  return idx === -1 ? null : map[idx];
}

// ── Preamble ──────────────────────────────────────────────────────────────────
describe('preamble', () => {
  test('every transpilation includes preamble helpers', () => {
    const { python } = transpile('print("hi")');
    expect(python).toContain('def _psc_rng');
    expect(python).toContain('def _psc_len');
    expect(python).toContain('def _psc_substr');
    expect(python).toContain('_psc_open_read');
    expect(python).toContain('_psc_open_write');
  });

  test('preamble lines have null srcLine in the map', () => {
    const { python, map } = transpile('x = 1');
    const preambleCount = python.split('\n').findIndex(l => l.includes('x = 1'));
    for (let i = 0; i < preambleCount; i++) {
      expect(map[i]).toBeNull();
    }
  });

  test('helpers field contains the preamble string', () => {
    const { helpers } = transpile('x = 1');
    expect(helpers).toContain('_psc_rng');
    expect(helpers).toContain('_PscReadFile');
  });
});

// ── Limitation 1: 2D array access ─────────────────────────────────────────────
describe('2D array access rewriting', () => {
  test('board[0,0] rewrites to board[0][0] after array declaration', () => {
    const src = 'array board[3,3]\nboard[1,2] = 5';
    expect(py(src)).toContain('board[1][2] = 5');
  });

  test('reading with board[a,b] syntax also rewrites', () => {
    const src = 'array grid[2,2]\ngrid[0,1] = 99\nprint(grid[0,1])';
    expect(py(src)).toContain('grid[0][1] = 99');
    expect(py(src)).toContain('print(grid[0][1])');
  });

  test('already-Python syntax board[0][0] is untouched', () => {
    const src = 'array board[3,3]\nboard[0][0] = "rook"';
    const out = py(src);
    // should not become board[0][][0]
    expect(out).not.toContain('[0][][0]');
    expect(out).toContain('board[0][0]');
  });

  test('1D array with single index is not affected', () => {
    const src = 'array names[5]\nnames[2] = "Alice"';
    const out = py(src);
    expect(out).toContain('names[2] = "Alice"');
    expect(out).not.toContain('names[2][]');
  });

  test('undeclared name with comma syntax is left alone', () => {
    const src = 'x = f(1,2)';
    // f is not a 2D array, should not be rewritten
    expect(py(src)).toContain('f(1,2)');
  });
});

// ── Limitation 2: for...to...step (including negative) ────────────────────────
describe('for loop with step', () => {
  test('positive step uses _psc_rng', () => {
    const src = 'for i = 0 to 10 step 2\n    print(i)\nnext i';
    expect(py(src)).toContain('_psc_rng(0, 10, 2)');
  });

  test('negative step uses _psc_rng with negative arg', () => {
    const src = 'for i = 5 to 0 step -1\n    print(i)\nnext i';
    expect(py(src)).toContain('_psc_rng(5, 0, -1)');
  });

  test('no-step loop uses _psc_rng with two args', () => {
    const src = 'for i = 0 to 7\n    print(i)\nnext i';
    const out = py(src);
    expect(out).toContain('_psc_rng(0, 7)');
    // must NOT contain range() directly for the student loop
    const studentLines = out.split('\n').filter(l => l.includes('for i'));
    expect(studentLines[0]).not.toContain('range(');
  });

  test('variable step is passed through untouched', () => {
    const src = 'for i = 1 to n step s\n    print(i)\nnext i';
    expect(py(src)).toContain('_psc_rng(1, n, s)');
  });
});

// ── Limitation 3: string-method receiver-walking ──────────────────────────────
describe('.length and .substring receiver walking', () => {
  test('simple identifier .length', () => {
    expect(py('print(text.length)')).toContain('_psc_len(text)');
  });

  test('chained call .length: getName().length', () => {
    const src = 'function getName()\n    return "Alice"\nendfunction\nprint(getName().length)';
    expect(py(src)).toContain('_psc_len(getName())');
  });

  test('subscript receiver arr[i].length', () => {
    const src = 'array words[3]\nwords[0] = "hi"\nprint(words[0].length)';
    expect(py(src)).toContain('_psc_len(words[0])');
  });

  test('simple identifier .substring', () => {
    expect(py('print(text.substring(3, 3))')).toContain('_psc_substr(text, 3, 3)');
  });

  test('chained call .substring: getName().substring(0,3)', () => {
    const src = 'function getName()\n    return "Alice"\nendfunction\nprint(getName().substring(0,3))';
    expect(py(src)).toContain('_psc_substr(getName(), 0, 3)');
  });

  test('.substring inside string literal is not rewritten', () => {
    const src = 'x = "use .substring here"';
    const out = py(src);
    // string content preserved intact
    expect(out).toContain('"use .substring here"');
    // no _psc_substr call in the student line (preamble defines it, so check the assignment line)
    const studentLine = out.split('\n').find(l => l.includes('x ='));
    expect(studentLine).toBeTruthy();
    expect(studentLine).not.toContain('_psc_substr');
  });

  test('.length inside string literal is not rewritten', () => {
    const src = 'x = ".length is a property"';
    const out = py(src);
    expect(out).toContain('".length is a property"');
    const studentLine = out.split('\n').find(l => l.includes('x ='));
    expect(studentLine).not.toContain('_psc_len');
  });
});

// ── File I/O ──────────────────────────────────────────────────────────────────
describe('file I/O transpilation', () => {
  test('openRead rewrites to _psc_open_read', () => {
    expect(py('f = openRead("a.txt")')).toContain('_psc_open_read("a.txt")');
  });

  test('openWrite rewrites to _psc_open_write', () => {
    expect(py('f = openWrite("out.txt")')).toContain('_psc_open_write("out.txt")');
  });

  test('method calls readLine / writeLine / close / endOfFile pass through unchanged', () => {
    const src = [
      'f = openRead("x.txt")',
      'while NOT f.endOfFile()',
      '    line = f.readLine()',
      '    print(line)',
      'endwhile',
      'f.close()',
    ].join('\n');
    const out = py(src);
    expect(out).toContain('f.endOfFile()');
    expect(out).toContain('f.readLine()');
    expect(out).toContain('f.close()');
  });

  test('no transpiler errors for a valid file-I/O program', () => {
    const src = [
      'f = openRead("data.txt")',
      'while NOT f.endOfFile()',
      '    print(f.readLine())',
      'endwhile',
    ].join('\n');
    expect(errs(src)).toHaveLength(0);
  });
});

// ── OOP — friendly errors ─────────────────────────────────────────────────────
describe('unsupported OOP constructs', () => {
  test('class declaration emits a transpiler error', () => {
    const e = errs('class Foo\nendclass');
    expect(e.length).toBeGreaterThan(0);
    expect(e[0].msg).toMatch(/class/i);
  });

  test('error points at the class line', () => {
    const e = errs('x = 1\nclass Foo\nendclass');
    expect(e[0].line).toBe(2);
  });

  test('inherits keyword emits a transpiler error', () => {
    const e = errs('class Bar inherits Foo\nendclass');
    // "class Bar inherits Foo" is caught by the class pattern first
    expect(e.length).toBeGreaterThan(0);
  });

  test('endclass on its own emits a transpiler error', () => {
    const e = errs('endclass');
    expect(e.length).toBeGreaterThan(0);
  });
});

// ── Source-map accuracy ───────────────────────────────────────────────────────
describe('source map', () => {
  test('preamble lines all map to null', () => {
    const { python, map } = transpile('x = 1');
    const firstStudentLine = python.split('\n').findIndex(l => l.includes('x = 1'));
    for (let i = 0; i < firstStudentLine; i++) {
      expect(map[i]).toBeNull();
    }
  });

  test('student lines map to correct pseudocode line numbers', () => {
    const src = 'x = 1\ny = 2\nz = 3';
    const { python, map } = transpile(src);
    expect(srcLineFor(src, 'x = 1')).toBe(1);
    expect(srcLineFor(src, 'y = 2')).toBe(2);
    expect(srcLineFor(src, 'z = 3')).toBe(3);
  });

  test('mapErrorLine returns null for preamble Python lines', () => {
    const { map } = transpile('x = 1');
    // line 1 in Python is the first preamble line
    expect(mapErrorLine(map, 1)).toBeNull();
  });

  test('mapErrorLine returns correct pseudocode line for student code', () => {
    const src = 'for i = 0 to 3\n    bad_expr +\nnext i';
    const { map } = transpile(src);
    // find the Python line that contains 'bad_expr +'
    const { python } = transpile(src);
    const pyIdx = python.split('\n').findIndex(l => l.includes('bad_expr'));
    const pyLine = pyIdx + 1;
    expect(mapErrorLine(map, pyLine)).toBe(2);
  });

  test('mapErrorLine returns null for out-of-range line', () => {
    const { map } = transpile('x = 1');
    expect(mapErrorLine(map, 0)).toBeNull();
    expect(mapErrorLine(map, map.length + 100)).toBeNull();
  });
});

// ── Existing construct coverage ───────────────────────────────────────────────
describe('operator and construct coverage', () => {
  test('AND OR NOT operators rewrite', () => {
    const out = py('if x AND y OR NOT z then\nendif');
    expect(out).toContain('and');
    expect(out).toContain('or');
    expect(out).toContain('not');
  });

  test('MOD DIV rewrite', () => {
    const out = py('x = a MOD 3\ny = b DIV 4');
    expect(out).toContain(' % ');
    expect(out).toContain(' // ');
  });

  test('^ rewrites to **', () => {
    expect(py('x = 2^8')).toContain('**');
  });

  test('true false null rewrite to Python', () => {
    const out = py('x = true\ny = false\nz = null');
    expect(out).toContain('True');
    expect(out).toContain('False');
    expect(out).toContain('None');
  });

  test('while...endwhile', () => {
    const out = py('while x > 0\n    x = x - 1\nendwhile');
    expect(out).toContain('while x > 0:');
  });

  test('do...until', () => {
    const out = py('do\n    x = x - 1\nuntil x == 0');
    expect(out).toContain('while True:');
    expect(out).toContain('if x == 0: break');
  });

  test('function and endfunction', () => {
    const out = py('function add(a, b)\n    return a + b\nendfunction');
    expect(out).toContain('def add(a, b):');
  });

  test('procedure strips :byVal annotations', () => {
    const out = py('procedure greet(name:byVal)\n    print(name)\nendprocedure');
    expect(out).toContain('def greet(name):');
  });

  test('1D array declaration', () => {
    expect(py('array x[5]')).toContain('x = [None] * 5');
  });

  test('2D array declaration', () => {
    expect(py('array m[3,4]')).toContain('[[None] * 4 for _ in range(3)]');
  });

  test('switch/case/endswitch compiles to if/elif chain', () => {
    const out = py('switch x:\n    case 1:\n        print("one")\n    default:\n        print("other")\nendswitch');
    expect(out).toContain('__sw = x');
    expect(out).toContain('if __sw == 1:');
    expect(out).toContain('else:');
  });

  test('inline // comment becomes # comment', () => {
    expect(py('x = 1 // set x')).toContain('# set x');
  });
});
