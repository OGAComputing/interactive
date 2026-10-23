import { describe, test, expect } from 'vitest';
import { evalInv, evalMod, evalMake, evalExt, breakCode, hasBugLine, hasFixedLine, isBugFixed, isBugPairLine,
         ownOutput, askedCount, deniedCount, runKind, typedCodes, codeIn, fillCode,
         MOD_TESTS, MAKE_TESTS, EXT_TESTS, MOD_TEST_BANK, MAKE_TEST_BANK, EXT_TEST_BANK,
         AIRLOCK_CODES, SEALS_CHOICES } from './checkers.js';

const code = (...lines) => lines.join('\n');
const ran = (src, ok = true) => ({ code: src, ok });

// The airlock keypad students start from.
const STARTER = [
  'code = input("Enter airlock code: ")',
  'while code != "4271":',
  '    print("ACCESS DENIED")',
  '    code = input("Enter airlock code: ")',
  'print("Airlock open")',
];
const withLine = (i, line) => STARTER.map((l, k) => (k === i ? line : l));

// Fake runs: each "program" is a function from the typed answers to its trace — a list of
// { ask: prompt } (it asked, and used the next answer) and { say: line } (it printed). The fake
// echoes "prompt + answer" for every answer it uses, as the runner does, and stops asking when
// the answers run out (the real runner would raise EOFError; the checks see fewer answers used).
const run = (prog, answers) => {
  const out = [];
  let i = 0;
  const ask = prompt => { if (i >= answers.length) throw new Error('EOF'); const v = answers[i++]; out.push(prompt + v); return v; };
  const say = line => out.push(line);
  try { prog(ask, say); } catch (e) { if (e.message !== 'EOF') throw e; }
  return out.join('\n') + '\n';
};
const outputsFor = (tests, prog) => tests.map(t => run(prog, t));
const PROMPT = 'Enter airlock code: ';

// The keypad with options for each Modify step.
function keypad({ secret = '4271', attempts = false, startAt = 1, numbered = false, pressure = false, lowAt = 100,
                  openInside = false } = {}) {
  return (ask, say) => {
    let n = startAt;
    let c = ask(PROMPT);
    while (c !== secret) {
      say(numbered ? `ACCESS DENIED: try ${n}` : 'ACCESS DENIED');
      c = ask(PROMPT);
      n++;
      if (openInside) say('Airlock open');
    }
    if (!openInside) say('Airlock open');
    if (attempts) say('Tries: ' + n);
    if (pressure) {
      let p = Number(ask('Pressure (kPa): '));
      while (p < lowAt) { say('Too low - pump more'); p = Number(ask('Pressure (kPa): ')); }
      say('Pressure OK');
    }
  };
}

test('the test answers cover the boundaries', () => {
  expect(MOD_TESTS.mod1[1][0]).toBe('4271');
  expect(MOD_TESTS.mod4.flat()).toEqual(expect.arrayContaining(['99', '100']));
  expect(EXT_TESTS[1]).toEqual(['63', '61', '62']);
  expect(MAKE_TESTS[1]).toEqual(['62']);
});

describe('ownOutput / askedCount / Run helpers', () => {
  test('drops one echo per answer, in order, and counts the answers used', () => {
    const out = run(keypad(), ['1234', '5555', '4271']);
    expect(ownOutput(out, ['1234', '5555', '4271'])).toBe('ACCESS DENIED\nACCESS DENIED\nAirlock open');
    expect(askedCount(out, ['1234', '5555', '4271'])).toBe(3);
    expect(askedCount(run(keypad(), ['1234']), ['1234', '4271'])).toBe(1);
  });
  test('a prompt containing Unlocked never counts as the program printing it', () => {
    expect(ownOutput('Guess to get it unlocked: 62\nDone\n', ['62'])).toBe('Done');
  });
  test('runKind: right first time, one wrong code, or at least three wrong codes', () => {
    expect(runKind(run(keypad(), ['4271']))).toBe('first');
    expect(runKind(run(keypad(), ['1', '2', '3', '4271']))).toBe('three');
    expect(runKind(run(keypad(), ['1', '4271']))).toBe('one');
    expect(runKind(run(keypad(), ['1', '2', '4271']))).toBe(null);
    expect(deniedCount(run(keypad(), ['1', '2', '4271']))).toBe(2);
  });
  test('typedCodes reads the codes off the echoed prompts', () => {
    expect(typedCodes(run(keypad(), ['1234', '4271']))).toEqual(['1234', '4271']);
  });
});

// ─── Investigate ─────────────────────────────────────────────────────────────

// What the page records after an Investigate run: the code run, and its output (the typed codes
// are echoed after each prompt; only those lines matter to the step 1 check).
const runOf = (lines, answers) =>
  ({ lastRun: { code: code(...lines), ok: true, output: answers.map(a => 'Enter airlock code: ' + a).join('\n') + '\n' } });

describe('evalInv step 1 — while becomes if', () => {
  test('if code != "4271" passes; the starter does not', () => {
    expect(evalInv(1, code(...STARTER)).pass).toBe(false);
    expect(evalInv(1, code(...withLine(1, 'if code != "4271":')), runOf(withLine(1, 'if code != "4271":'), ['1234', '5678'])).pass).toBe(true);
  });
  test('spacing is flexible', () => {
    expect(evalInv(1, code(...withLine(1, 'if code!="4271" :')), runOf(withLine(1, 'if code!="4271" :'), ['1', '2'])).pass).toBe(true);
  });
  test('the run must be of the code on screen, with two wrong codes typed', () => {
    const ifCode = withLine(1, 'if code != "4271":');
    expect(evalInv(1, code(...ifCode)).results).toEqual([true, false]);                               // not run yet
    expect(evalInv(1, code(...ifCode), runOf(STARTER, ['1234', '5678', '4271'])).results).toEqual([true, false]);  // ran the old code
    expect(evalInv(1, code(...ifCode), runOf(ifCode, ['4271'])).results).toEqual([true, false]);       // right code first
    expect(evalInv(1, code(...ifCode), runOf(ifCode, ['1234', '4271'])).results).toEqual([true, false]);   // second code right
    expect(evalInv(1, code(...ifCode), runOf(ifCode, ['1234', '5678'])).pass).toBe(true);
  });
});

describe('evalInv step 2 — back to while, Airlock open indented into the loop', () => {
  const openAt = lead => STARTER.map((l, i) => (i === 4 ? lead + l : l));
  test('the step 1 code: line 2 not yet back to while', () => {
    const r = evalInv(2, code(...withLine(1, 'if code != "4271":')));
    expect(r.results[0]).toBe(false);
  });
  test('4 spaces, lined up with line 4, then a run starting with a wrong code, passes', () => {
    const ok = openAt('    ');
    expect(evalInv(2, code(...ok)).results).toEqual([true, true, false]);
    expect(evalInv(2, code(...ok), runOf(ok, ['4271'])).results).toEqual([true, true, false]);   // loop never ran
    expect(evalInv(2, code(...ok), runOf(ok, ['4271'])).msg).toMatch(/start with a wrong code/);
    expect(evalInv(2, code(...ok), runOf(ok, ['1111', '2222', '4271'])).pass).toBe(true);
    expect(evalInv(2, code(...ok), runOf(STARTER, ['1111', '2222', '4271'])).pass).toBe(false);   // ran before indenting
  });
  test('the starter: coach says press Tab, nothing red', () => {
    const r = evalInv(2, code(...STARTER));
    expect(r.results).toEqual([true, false, false]);
    expect(r.wrongs).toEqual([false, false, false]);
    expect(r.msg).toMatch(/press Tab/);
  });
  test('2 or 8 spaces: red, and the hint counts the spaces', () => {
    const two = evalInv(2, code(...openAt('  ')));
    expect(two.wrongs).toEqual([false, true, false]);
    expect(two.wrongMsg).toMatch(/2 spaces.*line 4 has 4/);
    expect(evalInv(2, code(...openAt('        '))).wrongMsg).toMatch(/8 spaces.*Shift\+Tab/);
  });
  test('a Tab character next to 4 spaces is red', () => {
    expect(evalInv(2, code(...openAt('\t'))).wrongMsg).toMatch(/Tab character/);
  });
  test('a deleted line is told to reset', () => {
    expect(evalInv(2, code(...STARTER.slice(0, 4))).msg).toMatch(/Reset/);
  });
});

describe('evalInv step 3 — back to the left edge, != becomes ==', () => {
  test('while code == "4271" with Airlock open at the left edge, then 4271 and 1234 typed, passes', () => {
    const eq = withLine(1, 'while code == "4271":');
    expect(evalInv(3, code(...eq)).results).toEqual([true, true, false]);
    expect(evalInv(3, code(...eq), runOf(eq, ['1234'])).msg).toMatch(/4271 first, then 1234/);
    expect(evalInv(3, code(...eq), runOf(eq, ['4271', '4271', '1234'])).pass).toBe(false);
    expect(evalInv(3, code(...eq), runOf(eq, ['4271', '1234'])).pass).toBe(true);
    const r = evalInv(3, code(...STARTER));
    expect(r.results).toEqual([true, false, false]);
    expect(r.msg).toMatch(/change != to ==/);
  });
  test('Airlock open still indented fails the first bullet', () => {
    const s = withLine(1, 'while code == "4271":').map((l, i) => (i === 4 ? '    ' + l : l));
    expect(evalInv(3, code(...s)).results).toEqual([false, true, false]);
  });
});

describe('Break it / fix it (step 4)', () => {
  const step3 = code(...withLine(1, 'while code == "4271":'));
  test('breakCode deletes the ask-again line, puts != back, and is safe to mash', () => {
    const once = breakCode(step3);
    expect(once.lineNo).toBe(4);
    expect(once.code).not.toMatch(/^\s+code = input/m);
    expect(once.code).toMatch(/while code != "4271":/);
    expect(breakCode(once.code).code).toBe(once.code);
    expect(hasBugLine(once.code)).toBe(true);
    expect(isBugFixed(once.code)).toBe(false);
  });
  test('the line asked for first (line 1) is kept', () => {
    expect(breakCode(code(...STARTER)).code.split('\n')[0]).toBe(STARTER[0]);
  });
  test('with the loop gone, the broken starter comes back', () => {
    const r = breakCode('print("hi")\n');
    expect(r.code).toMatch(/while code != "4271":/);
    expect(hasBugLine(r.code)).toBe(true);
  });
  test('putting the line back inside the loop fixes it, in either order', () => {
    expect(isBugFixed(code(...STARTER))).toBe(true);
    const swapped = [STARTER[0], STARTER[1], STARTER[3], STARTER[2], STARTER[4]];
    expect(isBugFixed(code(...swapped))).toBe(true);
  });
  test('the line put back AFTER the loop is not a fix, and the hint says to indent it', () => {
    const after = code(STARTER[0], STARTER[1], STARTER[2], 'code = input("Enter airlock code: ")', STARTER[4]);
    expect(isBugFixed(after)).toBe(false);
    const r = evalInv(4, after, { breaks: 1, looped: true, lastRun: ran(after, false) });
    expect(r.msg).toMatch(/after the loop/);
  });
  test('a commented-out line does not count', () => {
    expect(hasFixedLine(code(STARTER[0], STARTER[1], STARTER[2], '    # code = input("x")', STARTER[4]))).toBe(false);
  });
  test('ticks: Break it, the loop that never ends, then fixed AND run', () => {
    const fixed = code(...STARTER);
    expect(evalInv(4, fixed).results).toEqual([false, false, false]);
    expect(evalInv(4, fixed, { breaks: 1 }).results).toEqual([true, false, false]);
    expect(evalInv(4, fixed, { breaks: 1, lastRun: ran(fixed) }).results).toEqual([true, false, true]);   // never saw it loop
    expect(evalInv(4, fixed, { breaks: 1, lastRun: ran(fixed) }).msg).toMatch(/type a wrong code/);
    expect(evalInv(4, fixed, { breaks: 1, looped: true, lastRun: ran(fixed) }).pass).toBe(true);
    expect(evalInv(4, fixed, { breaks: 1, looped: true, lastRun: ran(fixed + '\n# edited') }).pass).toBe(false);
    expect(isBugPairLine('anything')).toBe(false);
  });
});

// ─── Modify ──────────────────────────────────────────────────────────────────

const modRun = (key, prog, choice = 'warden', set = MOD_TESTS[key]) => {
  const tests = fillCode(set, AIRLOCK_CODES[choice]);
  return evalMod(key, '', outputsFor(tests, prog), choice, tests);
};

describe('codeIn / fillCode', () => {
  test('reads the code the loop waits for', () => {
    expect(codeIn(code(...STARTER))).toBe('4271');
    expect(codeIn("code = input()\nwhile code != '0000':\n    pass")).toBe('0000');
    expect(fillCode([['CODE'], ['1', 'CODE']], '9013')).toEqual([['9013'], ['1', '9013']]);
  });
});

describe('evalMod mod1 — the airlock code (the choice)', () => {
  test('each choice passes with its own code', () => {
    for (const c of ['warden', 'override']) {
      const r = modRun('mod1', keypad({ secret: AIRLOCK_CODES[c] }), c);
      expect(r.pass).toBe(true);
    }
  });
  test('the old code fails, naming the new one', () => {
    const r = modRun('mod1', keypad(), 'override');
    expect(r.pass).toBe(false);
    expect(r.msg).toMatch(/"0000"/);
  });
  test('the other option\'s code fails', () => {
    expect(modRun('mod1', keypad({ secret: '0000' }), 'warden').pass).toBe(false);
  });
});

describe('evalMod mod2 — the attempts counter', () => {
  test('counting from 1 passes', () => {
    expect(modRun('mod2', keypad({ secret: '9013', attempts: true })).pass).toBe(true);
  });
  test('counting from 0 is one short, and the hint says so', () => {
    const r = modRun('mod2', keypad({ secret: '9013', attempts: true, startAt: 0 }));
    expect(r.results[0]).toBe(false);
    expect(r.msg).toMatch(/starts at 1/);
  });
  test('no count line at all asks for the print line', () => {
    expect(modRun('mod2', keypad({ secret: '9013' })).msg).toMatch(/str\(attempts\)/);
  });
  test('every set in the bank works', () => {
    for (const set of MOD_TEST_BANK.mod2) expect(modRun('mod2', keypad({ secret: '9013', attempts: true }), 'warden', set).pass).toBe(true);
  });
});

describe('evalMod mod3 — numbered ACCESS DENIED', () => {
  test('try 1, try 2, try 3 passes', () => {
    expect(modRun('mod3', keypad({ secret: '9013', attempts: true, numbered: true })).pass).toBe(true);
  });
  test('plain ACCESS DENIED fails', () => {
    const r = modRun('mod3', keypad({ secret: '9013', attempts: true }));
    expect(r.results[0]).toBe(false);
    expect(r.msg).toMatch(/try 1, try 2 and try 3/);
  });
  test('numbered from 0 fails', () => {
    expect(modRun('mod3', keypad({ secret: '9013', attempts: true, numbered: true, startAt: 0 })).pass).toBe(false);
  });
});

describe('evalMod mod4 — the pressure loop', () => {
  const RAW = code(...STARTER, 'p = int(input("Pressure (kPa): "))', 'while p < 100:', '    p = int(input("Pressure (kPa): "))');
  const pass = (prog, set) => {
    const tests = fillCode(set || MOD_TESTS.mod4, '9013');
    return evalMod('mod4', RAW, outputsFor(tests, prog), 'warden', tests);
  };
  test('under 100 is too low, 100 is enough', () => {
    expect(pass(keypad({ secret: '9013', attempts: true, pressure: true })).pass).toBe(true);
  });
  test('< 99 (so 99 passes) fails the boundary', () => {
    const r = pass(keypad({ secret: '9013', attempts: true, pressure: true, lowAt: 99 }));
    expect(r.pass).toBe(false);
    expect(r.msg).toMatch(/99/);
  });
  test('<= 100 (so 100 is too low) runs out of answers', () => {
    const r = pass(keypad({ secret: '9013', attempts: true, pressure: true, lowAt: 101 }));
    expect(r.pass).toBe(false);
  });
  test('without int() and input() it fails the first bullet', () => {
    const tests = fillCode(MOD_TESTS.mod4, '9013');
    expect(evalMod('mod4', code(...STARTER), outputsFor(tests, keypad({ secret: '9013' })), 'warden', tests).results[0]).toBe(false);
  });
  test('every set in the bank works', () => {
    for (const set of MOD_TEST_BANK.mod4) expect(pass(keypad({ secret: '9013', pressure: true }), set).pass).toBe(true);
  });
});

// ─── Make — the backup lock ──────────────────────────────────────────────────

const LOCK_SRC = code('guess = int(input("Lock number: "))', 'while guess != 62:', '    guess = int(input("Lock number: "))', 'print("Unlocked")');
function lock({ count = true, seals = 'warden', unlockInside = false, askOnce = false, hints = false, sealsInside = false } = {}) {
  return (ask, say) => {
    let n = 1;
    let g = Number(ask('Lock number: '));
    while (g !== 62 && !askOnce) {
      if (hints) say(g > 62 ? 'Too high' : 'Too low');
      else say('Wrong');
      if (unlockInside) say('Unlocked?');
      if (sealsInside && seals) say(SEALS_CHOICES[seals]);
      g = Number(ask('Lock number: '));
      n++;
    }
    say(count ? `Unlocked in ${n} guesses` : 'Unlocked');
    if (seals && !sealsInside) say(SEALS_CHOICES[seals]);
  };
}
const make = (prog, choice = 'warden', tests = MAKE_TESTS, raw = LOCK_SRC) => evalMake(raw, outputsFor(tests, prog), choice, tests);

describe('evalMake — crack the backup lock', () => {
  test('a loop that counts, plus the seals line, passes for each choice', () => {
    expect(make(lock()).pass).toBe(true);
    expect(make(lock({ seals: 'override' }), 'override').pass).toBe(true);
  });
  test('no int() or no while fails those bullets', () => {
    expect(make(lock(), 'warden', MAKE_TESTS, 'guess = input()\nprint("Unlocked")').results.slice(0, 2)).toEqual([false, false]);
  });
  test('asking only once is caught', () => {
    const r = make(lock({ askOnce: true }));
    expect(r.results[2]).toBe(false);
    expect(r.msg).toMatch(/stopped asking/);
  });
  test('Unlocked inside the loop is caught', () => {
    expect(make(lock({ unlockInside: true })).msg).toMatch(/more than once/);
  });
  test('no count fails the count bullet', () => {
    const r = make(lock({ count: false }));
    expect(r.results[4]).toBe(false);
    expect(r.msg).toMatch(/Unlocked in 3 guesses/);
  });
  test('the other choice\'s line, or the line inside the loop, fails the last bullet', () => {
    expect(make(lock({ seals: 'override' }), 'warden').results[5]).toBe(false);
    expect(make(lock({ sealsInside: true })).results[5]).toBe(false);
  });
  test('every set in the bank works', () => {
    for (const set of MAKE_TEST_BANK) expect(make(lock(), 'warden', set).pass).toBe(true);
  });
});

describe('evalExt — Too high / Too low', () => {
  const ext = (prog, tests = EXT_TESTS) => evalExt(LOCK_SRC, outputsFor(tests, prog), tests);
  test('one hint per wrong guess, the right way round, passes', () => {
    expect(ext(lock({ hints: true })).pass).toBe(true);
  });
  test('no hints, or hints the wrong way round, fail', () => {
    expect(ext(lock()).pass).toBe(false);
    const backwards = (ask, say) => { let n = 1; let g = Number(ask('? ')); while (g !== 62) { say(g < 62 ? 'Too high' : 'Too low'); g = Number(ask('? ')); n++; } say(`Unlocked in ${n} guesses`); };
    expect(ext(backwards).pass).toBe(false);
  });
  test('every set in the bank works', () => {
    for (const set of EXT_TEST_BANK) expect(ext(lock({ hints: true }), set).pass).toBe(true);
  });
});
