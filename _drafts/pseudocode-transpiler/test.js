// Test harness for the pseudocode transpiler.
// Run with: node test.js
//
// For each sample under ./samples, prints the source, the generated Python
// with a [src=N] gutter, then shells out to `py` to ast.parse the Python and
// confirm it is valid (or, for the deliberate-error sample, that the Python
// error line maps back to the right pseudocode line).

import { readFileSync, readdirSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { transpile, mapErrorLine } from './transpiler.js';

const here = dirname(fileURLToPath(import.meta.url));
const samplesDir = join(here, 'samples');

const PY = process.platform === 'win32' ? 'py' : 'python3';

// Expected stdout (and any input() answers) for each sample. If a sample is
// absent here, only ast.parse is run on it.
const EXPECTED = {
  '01_count_loop.psc':       { stdout: 'Hello\n'.repeat(8).trimEnd() },
  '02_password_while.psc':   { inputs: ['nope', 'computer'], stdout: 'What is the password?What is the password?Access granted' },
  '03_password_do_until.psc':{ inputs: ['nope', 'computer'], stdout: 'What is the password?What is the password?Access granted' },
  '04_if_elseif.psc':        { inputs: ['b'], stdout: 'Pick a or b: You selected B' },
  '05_switch.psc':           { stdout: 'You selected A' },
  '06_function_procedure.psc':{ stdout: '21\nhello Hamish' },
  '07_strings.psc':          { stdout: '16\nput' },
  '08_arrays.psc':           { stdout: 'Dana\nrook' },
  '09_logical_ops.psc':      { stdout: '3\nspecial\n4\nspecial\n5\nspecial\n8\n3' },
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
  if (r.status !== 0) {
    return { ok: false, line: null, msg: 'python failed: ' + (r.stderr || '').trim() };
  }
  try { return JSON.parse(r.stdout.trim()); }
  catch { return { ok: false, line: null, msg: 'unparseable output: ' + r.stdout }; }
}

// Execute the Python and return { ok, stdout, stderr, errLine }.
// `inputs` are fed to stdin so input() prompts can be answered.
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
  // Try to extract the line number from the last "File ..., line N" frame
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
  // Show source with line numbers
  console.log('SOURCE:');
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
  // Validate with Python's ast
  const v = pyParse(python);
  if (file.startsWith('10_')) {
    // expected: this one has a deliberate syntax error in the body
    if (v.ok) {
      console.log('\nVALIDATION: ✗ expected SyntaxError but Python accepted it');
      failed++;
    } else {
      const srcLine = mapErrorLine(map, v.line);
      console.log(`\nVALIDATION: Python SyntaxError on py line ${v.line} → maps back to pseudocode line ${srcLine}`);
      console.log(`            "${v.msg}"`);
      // we expect the original error to be on pseudocode line 3 (`print(i +)`)
      if (srcLine === 3) { console.log('  ✓ line mapping correct'); passed++; }
      else { console.log('  ✗ expected pseudocode line 3'); failed++; }
    }
  } else {
    if (!v.ok) {
      const srcLine = mapErrorLine(map, v.line);
      console.log(`\nVALIDATION: ✗ Python SyntaxError on py line ${v.line} (psc line ${srcLine}): ${v.msg}`);
      failed++;
    } else {
      console.log('\nSYNTAX: ✓ ast.parse accepted the output');
      const expected = EXPECTED[file];
      if (!expected) {
        console.log('EXEC:   (skipped - no expected output declared)');
        passed++;
      } else {
        const r = pyRun(python, expected.inputs || []);
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
    }
  }
}

console.log(bar('SUMMARY'));
console.log(`  ${passed} passed, ${failed} failed, ${files.length} total`);
process.exit(failed === 0 ? 0 : 1);
