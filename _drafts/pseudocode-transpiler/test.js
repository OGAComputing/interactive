// Test harness for the pseudocode transpiler.
// Run with: node test.js
//
// For each sample, transpiles, pretty-prints the output, then runs it with
// the system Python interpreter to verify stdout.  Sample 10 has a deliberate
// syntax error whose Python line should map back to pseudocode line 3.
// Sample 15 should produce a transpiler error (no Python generated).

import { readFileSync, readdirSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { transpile, mapErrorLine } from './transpiler.js';

const here = dirname(fileURLToPath(import.meta.url));
const samplesDir = join(here, 'samples');

const PY = process.platform === 'win32' ? 'py' : 'python3';

// Expected results for each sample.
// prelude: Python code prepended before the generated code (after the preamble
//          has already set _psc_files = globals().get('_psc_files', {})).
// inputs:  fed to stdin for input() calls.
// stdout:  expected trimmed stdout.
// transpilerError: true if we expect errors[] to be non-empty (no Python run).
const EXPECTED = {
  '01_count_loop.psc':         { stdout: 'Hello\n'.repeat(8).trimEnd() },
  '02_password_while.psc':     { inputs: ['nope', 'computer'], stdout: 'What is the password?What is the password?Access granted' },
  '03_password_do_until.psc':  { inputs: ['nope', 'computer'], stdout: 'What is the password?What is the password?Access granted' },
  '04_if_elseif.psc':          { inputs: ['b'], stdout: 'Pick a or b: You selected B' },
  '05_switch.psc':             { stdout: 'You selected A' },
  '06_function_procedure.psc': { stdout: '21\nhello Hamish' },
  '07_strings.psc':            { stdout: '16\nput' },
  '08_arrays.psc':             { stdout: 'Dana\nrook' },
  '09_logical_ops.psc':        { stdout: '3\nspecial\n4\nspecial\n5\nspecial\n8\n3' },
  '11_step_countdown.psc':     { stdout: '5\n4\n3\n2\n1\n0' },
  '12_string_methods_expr.psc':{ stdout: '5\nlic\n11\nWorld' },
  '13_2d_array_rw.psc':        { stdout: '10\n42\n7' },
  '14_file_io.psc':            { prelude: '_psc_files = {"data.txt": "alpha\\nbeta\\ngamma"}', stdout: 'alpha\nbeta\ngamma' },
  '15_unsupported_class.psc':  { transpilerError: true },
};

function pyParse(code) {
  const tmp = mkdtempSync(join(tmpdir(), 'psc-'));
  const f = join(tmp, 'check.py');
  writeFileSync(f, code);
  const r = spawnSync(PY, [
    '-c',
    `import ast,sys,json
src=open(sys.argv[1],encoding='utf-8').read()
try:
    ast.parse(src)
    print(json.dumps({"ok":True}))
except SyntaxError as e:
    print(json.dumps({"ok":False,"line":e.lineno,"msg":str(e.msg)}))`,
    f,
  ], { encoding: 'utf-8' });
  rmSync(tmp, { recursive: true, force: true });
  if (r.status !== 0) return { ok: false, line: null, msg: 'python failed: ' + (r.stderr || '').trim() };
  try { return JSON.parse(r.stdout.trim()); }
  catch { return { ok: false, line: null, msg: 'unparseable output: ' + r.stdout }; }
}

function pyRun(code, inputs = []) {
  const tmp = mkdtempSync(join(tmpdir(), 'psc-'));
  const f = join(tmp, 'run.py');
  writeFileSync(f, code);
  const r = spawnSync(PY, [f], {
    encoding: 'utf-8',
    input: inputs.join('\n') + (inputs.length ? '\n' : ''),
  });
  rmSync(tmp, { recursive: true, force: true });
  if (r.status === 0) return { ok: true, stdout: r.stdout, stderr: r.stderr };
  const m = (r.stderr || '').match(/File "[^"]*", line (\d+)/g);
  const errLine = m ? Number(m[m.length - 1].match(/(\d+)$/)[1]) : null;
  return { ok: false, stdout: r.stdout, stderr: r.stderr, errLine };
}

function bar(label) {
  return '\n' + '─'.repeat(8) + ' ' + label + ' ' + '─'.repeat(Math.max(2, 70 - label.length)) + '\n';
}

const files = readdirSync(samplesDir).filter(f => f.endsWith('.psc')).sort();
let passed = 0, failed = 0;

for (const file of files) {
  const src = readFileSync(join(samplesDir, file), 'utf-8');
  const { python, map, errors } = transpile(src);
  console.log(bar(file));
  src.split('\n').forEach((l, i) => console.log(`  ${String(i + 1).padStart(3)} │ ${l}`));
  console.log('\nPYTHON:');
  python.split('\n').forEach((l, i) => {
    const sl = map[i];
    const tag = sl == null ? '   ─' : `src=${String(sl).padStart(2)}`;
    console.log(`  ${String(i + 1).padStart(3)} │ [${tag}] ${l}`);
  });
  if (errors.length) {
    console.log('\nTRANSPILER ERRORS:');
    for (const e of errors) console.log(`  line ${e.line}: ${e.msg}`);
  }

  const expected = EXPECTED[file];

  // ── transpiler-error samples ──────────────────────────────────────────────
  if (expected?.transpilerError) {
    if (errors.length > 0) {
      console.log('\nVALIDATION: ✓ transpiler error reported as expected');
      console.log(`            "${errors[0].msg}"`);
      passed++;
    } else {
      console.log('\nVALIDATION: ✗ expected a transpiler error but none was reported');
      failed++;
    }
    continue;
  }

  // ── deliberate-syntax-error sample (10_) ─────────────────────────────────
  if (file.startsWith('10_')) {
    const v = pyParse(python);
    if (v.ok) {
      console.log('\nVALIDATION: ✗ expected SyntaxError but Python accepted it');
      failed++;
    } else {
      const srcLine = mapErrorLine(map, v.line);
      console.log(`\nVALIDATION: Python SyntaxError on py line ${v.line} → maps to pseudocode line ${srcLine}`);
      console.log(`            "${v.msg}"`);
      if (srcLine === 3) { console.log('  ✓ line mapping correct'); passed++; }
      else { console.log('  ✗ expected pseudocode line 3'); failed++; }
    }
    continue;
  }

  // ── normal samples ────────────────────────────────────────────────────────
  const v = pyParse(python);
  if (!v.ok) {
    const srcLine = mapErrorLine(map, v.line);
    console.log(`\nVALIDATION: ✗ Python SyntaxError on py line ${v.line} (psc line ${srcLine}): ${v.msg}`);
    failed++;
    continue;
  }
  console.log('\nSYNTAX: ✓ ast.parse accepted the output');

  if (!expected) {
    console.log('EXEC:   (skipped - no expected output declared)');
    passed++;
    continue;
  }

  // Prepend optional prelude (e.g. _psc_files = {...}) before the generated code
  const runCode = expected.prelude ? expected.prelude + '\n' + python : python;
  const r = pyRun(runCode, expected.inputs || []);
  if (!r.ok) {
    const srcLine = mapErrorLine(map, r.errLine);
    console.log(`EXEC:   ✗ runtime error (py line ${r.errLine} → psc line ${srcLine})`);
    console.log('        ' + (r.stderr.trim().split('\n').pop() || ''));
    failed++;
  } else {
    const got = r.stdout.replace(/\r\n/g, '\n').trimEnd();
    const want = expected.stdout.trimEnd();
    if (got === want) {
      console.log('EXEC:   ✓ stdout matches expected');
      passed++;
    } else {
      console.log('EXEC:   ✗ stdout mismatch');
      console.log('        wanted: ' + JSON.stringify(want));
      console.log('        got:    ' + JSON.stringify(got));
      failed++;
    }
  }
}

console.log(bar('SUMMARY'));
console.log(`  ${passed} passed, ${failed} failed, ${files.length} total`);
process.exit(failed === 0 ? 0 : 1);
