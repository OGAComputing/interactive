import { describe, test, expect } from 'vitest';
import { evalMod, evalMake, evalExt, evalInv, breakCode, hasBugLine, hasFixedLine, isBugFixed, isBugPairLine,
         IBUG_LINE, IBUG_FIXED_LINE, MOD_TESTS, MAKE_TESTS } from './checkers.js';

const code = (lines) => lines.join('\n');
const out = (...lines) => lines.join('\n') + '\n';
const ran = (src, ok = true) => ({ code: src, ok });

const STARTER = [
  'score = int(input("Enter your score: "))',
  'if score >= 50:',
  '    print("Pass")',
  'else:',
  '    print("Fail")',
  'print("Thanks for playing!")',
];

test('test answers match the values the checkers expect', () => {
  expect(MOD_TESTS.mod1).toEqual([['40'], ['39']]);
  expect(MOD_TESTS.mod4).toEqual([['40', 'yes'], ['40', 'no']]);
  expect(MAKE_TESTS).toEqual([['120'], ['119'], ['200']]);
});

// ─── Investigate ─────────────────────────────────────────────────────────────

const STEP1 = STARTER.map(l => l.replace('50', '70'));
const STEP2 = [...STEP1.slice(0, 3), '    print("Well done!")', ...STEP1.slice(3)];
const STEP3 = STEP2.map(l => l.replace('>=', '=='));

describe('evalInv step 1 — pass mark 70', () => {
  test('untouched starter code is not accepted', () => {
    expect(evalInv(1, code(STARTER)).pass).toBe(false);
  });
  test('if score >= 70: passes, and so does > 69', () => {
    expect(evalInv(1, code(STEP1)).pass).toBe(true);
    expect(evalInv(1, code(STARTER.map(l => l.replace('>= 50', '>70')))).pass).toBe(true);
  });
  test('70 inside a string or comment does not count', () => {
    expect(evalInv(1, code([...STARTER, '# if score >= 70:'])).pass).toBe(false);
    expect(evalInv(1, code([STARTER[0], 'if score >= 50:', '    print("70")', ...STARTER.slice(3)])).pass).toBe(false);
  });
});

describe('evalInv step 2 — a second line inside the if', () => {
  test('step 1 code alone is not accepted', () => {
    expect(evalInv(2, code(STEP1)).pass).toBe(false);
  });
  test('an indented second print() inside the if passes — any message', () => {
    expect(evalInv(2, code(STEP2)).pass).toBe(true);
    const other = [...STEP1.slice(0, 3), '    print("Nice one")', ...STEP1.slice(3)];
    expect(evalInv(2, code(other)).pass).toBe(true);
  });
  test('an unindented print() is not inside the if, and the hint says so', () => {
    const flat = [...STEP1, 'print("Well done!")'];
    const r = evalInv(2, code(flat));
    expect(r.pass).toBe(false);
    expect(r.msg).toMatch(/not inside the if/);
  });
  test('an extra print() in the else block does not count', () => {
    expect(evalInv(2, code([...STEP1.slice(0, 5), '    print("Well done!")', STEP1[5]])).pass).toBe(false);
  });
});

describe('evalInv step 3 — == instead of >=', () => {
  test('>= is not accepted', () => {
    expect(evalInv(3, code(STEP2)).pass).toBe(false);
  });
  test('a single = gets the "store vs compare" hint', () => {
    const r = evalInv(3, code(STEP2.map(l => l.replace('>=', '='))));
    expect(r.pass).toBe(false);
    expect(r.msg).toMatch(/TWO equals signs/);
  });
  test('== passes', () => {
    expect(evalInv(3, code(STEP3)).pass).toBe(true);
  });
});

describe('evalInv step 4 — guided Break it (indentation)', () => {
  const fixed = code([...STEP3, IBUG_FIXED_LINE]);
  const broken = code([...STEP3, IBUG_LINE]);

  test('nothing ticks before Break it is pressed', () => {
    expect(evalInv(4, code(STEP3)).results).toEqual([false, false]);
    expect(evalInv(4, fixed, { lastRun: ran(fixed) }).results).toEqual([false, false]);
  });
  test('broken line still present: Break it ticks, fix does not', () => {
    const r = evalInv(4, broken, { breaks: 1, lastRun: ran(broken, false) });
    expect(r.results).toEqual([true, false]);
    expect(r.msg).toMatch(/take away the spaces/);
  });
  test('fixed and run passes; fixed but not yet run does not', () => {
    expect(evalInv(4, fixed, { breaks: 1, lastRun: ran(fixed) }).pass).toBe(true);
    const r = evalInv(4, fixed, { breaks: 1, lastRun: ran(broken, false) });
    expect(r.pass).toBe(false);
    expect(r.msg).toMatch(/Run code/);
  });
  test('deleting the line instead of fixing it does not pass, and says so', () => {
    const r = evalInv(4, code(STEP3), { breaks: 1, lastRun: ran(code(STEP3)) });
    expect(r.pass).toBe(false);
    expect(r.msg).toMatch(/don't delete it/);
  });
  test('tucking the line inside the else runs, but is a "Nearly!" — not the fix', () => {
    const tucked = code([...STEP3.slice(0, 6), IBUG_LINE, STEP3[6]]);
    const r = evalInv(4, tucked, { breaks: 1, lastRun: ran(tucked) });
    expect(r.pass).toBe(false);
    expect(r.msg).toMatch(/Nearly!/);
  });
  test("single quotes and no ! in the fix still count", () => {
    const src = code([...STEP3, "print('Goodbye')"]);
    expect(evalInv(4, src, { breaks: 1, lastRun: ran(src) }).pass).toBe(true);
  });
});

describe('breakCode', () => {
  const n = STEP3.length;
  test('appends the broken line when there is none', () => {
    expect(breakCode(code(STEP3))).toEqual({ code: code([...STEP3, IBUG_LINE]) + '\n', lineNo: n + 1 });
  });
  test('re-indents a fixed line in place', () => {
    const r = breakCode(code([...STEP3, "print('Goodbye')"]));
    expect(r.code.split('\n')[n]).toBe(IBUG_LINE);
    expect(r.code.split('\n').filter(l => /goodbye/i.test(l)).length).toBe(1);
  });
  test('leaves an already-broken line alone (safe to mash)', () => {
    const broken = code([...STEP3, IBUG_LINE]) + '\n';
    expect(breakCode(broken).code).toBe(broken);
  });
});

test('bug line matchers', () => {
  expect(hasBugLine(IBUG_LINE)).toBe(true);
  expect(hasFixedLine(IBUG_LINE)).toBe(false);
  expect(hasFixedLine(IBUG_FIXED_LINE)).toBe(true);
  expect(isBugFixed(IBUG_FIXED_LINE)).toBe(true);
  expect(hasBugLine('# ' + IBUG_LINE)).toBe(false);
  expect(isBugPairLine(IBUG_LINE)).toBe(true);
  expect(isBugPairLine('    print("Pass")')).toBe(false);
});

// ─── Modify ──────────────────────────────────────────────────────────────────
// Outputs as the input() mock prints them: the prompt + typed answer, then the program's lines.

const runOut = (typed, ...lines) => out('Enter your score: ' + typed, ...lines, 'Thanks for playing!');
const PASS40 = [runOut('40', 'Pass'), runOut('39', 'Fail')];

describe('evalMod', () => {
  test('mod1 passes >= 40 and > 39 (behaviour only)', () => {
    const src = code(STARTER.map(l => l.replace('50', '40')));
    expect(evalMod('mod1', src, PASS40).pass).toBe(true);
  });
  test('mod1 fails when the pass mark is unchanged (both runs print Fail)', () => {
    const r = evalMod('mod1', code(STARTER), [runOut('40', 'Fail'), runOut('39', 'Fail')]);
    expect(r.pass).toBe(false);
    expect(r.msg).toMatch(/same thing/);
  });
  test('mod1 fails an off-by-one pass mark (> 40)', () => {
    expect(evalMod('mod1', code(STARTER), [runOut('40', 'Fail'), runOut('39', 'Fail')]).pass).toBe(false);
  });

  const FLIPPED = [STARTER[0], 'if score < 40:', '    print("Fail")', 'else:', '    print("Pass")', STARTER[5]];
  test('mod2 passes a flipped comparison with swapped messages', () => {
    expect(evalMod('mod2', code(FLIPPED), PASS40).pass).toBe(true);
    expect(evalMod('mod2', code(FLIPPED.map(l => l.replace('score < 40', '40 > score'))), PASS40).pass).toBe(true);
  });
  test('mod2: flipped but messages not swapped → specific hint', () => {
    const unswapped = [STARTER[0], 'if score < 40:', '    print("Pass")', 'else:', '    print("Fail")', STARTER[5]];
    const r = evalMod('mod2', code(unswapped), [runOut('40', 'Fail'), runOut('39', 'Pass')]);
    expect(r.results).toEqual([true, false]);
    expect(r.msg).toMatch(/40 prints Fail/);
  });
  test('mod2 fails when the comparison was not flipped', () => {
    const r = evalMod('mod2', code(STARTER.map(l => l.replace('50', '40'))), PASS40);
    expect(r.results).toEqual([false, true]);
  });

  test('mod3 passes any two new messages, including ones that repeat the score', () => {
    expect(evalMod('mod3', code(FLIPPED), [runOut('40', 'Well done, you passed!'), runOut('39', 'Unlucky — try again!')]).pass).toBe(true);
    expect(evalMod('mod3', code(FLIPPED), [runOut('40', 'You got 40 — pass!'), runOut('39', 'You got 39 — fail')]).pass).toBe(true);
  });
  test('mod3 flags whichever message is still the original', () => {
    expect(evalMod('mod3', code(FLIPPED), [runOut('40', 'Pass'), runOut('39', 'Unlucky!')]).results).toEqual([false, true]);
    expect(evalMod('mod3', code(FLIPPED), [runOut('40', 'Brilliant!'), runOut('39', 'Fail.')]).results).toEqual([true, false]);
  });

  const SECOND = [...FLIPPED, 'revised = input("Did you revise? ")', 'if revised == "yes":', '    print("Good plan!")', 'else:', '    print("Try revising next time.")'];
  const run4 = (ans, msg) => out('Enter your score: 40', 'Pass', 'Thanks for playing!', 'Did you revise? ' + ans, msg);
  test('mod4 passes a second if/else using ==', () => {
    expect(evalMod('mod4', code(SECOND), [run4('yes', 'Good plan!'), run4('no', 'Try revising next time.')]).pass).toBe(true);
  });
  test('mod4 catches a capitalised "Yes" comparison (both runs take the else)', () => {
    const r = evalMod('mod4', code(SECOND.map(l => l.replace('"yes"', '"Yes"'))),
      [run4('yes', 'Try revising next time.'), run4('no', 'Try revising next time.')]);
    expect(r.results).toEqual([true, true, false]);
    expect(r.msg).toMatch(/lowercase/);
  });
  test('mod4 needs == — a second comparison with != alone does not count', () => {
    const r = evalMod('mod4', code(SECOND.map(l => l.replace('==', '!='))), [run4('yes', 'x'), run4('no', 'y')]);
    expect(r.results[1]).toBe(false);
  });
});

// ─── Make ────────────────────────────────────────────────────────────────────

const RIDE = [
  'height = int(input("How tall are you in cm? "))',
  'if height >= 120:',
  '    print("You can ride!")',
  'else:',
  '    print("Sorry, you are too short.")',
  'print("Enjoy the park!")',
];
const rideOut = (h, msg, end = 'Enjoy the park!') => out('How tall are you in cm? ' + h, msg, ...(end ? [end] : []));
const RIDE_OUT = [rideOut('120', 'You can ride!'), rideOut('119', 'Sorry, you are too short.'), rideOut('200', 'You can ride!')];

describe('evalMake', () => {
  test('passes the model answer', () => {
    expect(evalMake(code(RIDE), RIDE_OUT).results).toEqual([true, true, true, true]);
  });
  test('passes a message that repeats the height', () => {
    const outs = [rideOut('120', '120cm — on you go!'), rideOut('119', '119cm — too short'), rideOut('200', '200cm — on you go!')];
    expect(evalMake(code(RIDE), outs).pass).toBe(true);
  });
  test('fails == 120 (200 gets the wrong message)', () => {
    const outs = [rideOut('120', 'You can ride!'), rideOut('119', 'Too short'), rideOut('200', 'Too short')];
    expect(evalMake(code(RIDE.map(l => l.replace('>=', '=='))), outs).results[2]).toBe(false);
  });
  test('fails > 120 with the edge-case hint', () => {
    const outs = [rideOut('120', 'Too short'), rideOut('119', 'Too short'), rideOut('200', 'You can ride!')];
    expect(evalMake(code(RIDE.map(l => l.replace('>=', '>'))), outs).results[2]).toBe(false);
  });
  test('fails without the everyone line after the if/else', () => {
    const src = code(RIDE.slice(0, 5));
    const outs = [rideOut('120', 'You can ride!', null), rideOut('119', 'Too short', null), rideOut('200', 'You can ride!', null)];
    expect(evalMake(src, outs).results).toEqual([true, true, true, false]);
  });
  test('fails without an else', () => {
    expect(evalMake(code(['height = int(input("cm? "))', 'if height >= 120:', '    print("Ride!")']), RIDE_OUT).results[1]).toBe(false);
  });
});

// ─── Extension ───────────────────────────────────────────────────────────────

describe('evalExt', () => {
  const QUIZ = [
    'name = input("Name? ")',
    'answer = input("Capital of France? ")',
    'if answer == "Paris":',
    '    print("Correct, " + name)',
    'else:',
    '    print("Not quite")',
    'age = int(input("Age? "))',
    'if age >= 12:',
    '    print("You can watch the film")',
    'else:',
    '    print("Too young")',
  ];
  test('passes two decisions, one with ==', () => {
    expect(evalExt(code(QUIZ)).pass).toBe(true);
  });
  test('fails with only one decision', () => {
    expect(evalExt(code(QUIZ.slice(0, 6))).results).toEqual([true, false, true]);
  });
  test('needs == in a real if, not inside a string', () => {
    const noEq = QUIZ.map(l => l.replace('answer == "Paris"', 'len(answer) > 3')).concat('print("a == b")');
    expect(evalExt(code(noEq)).results[2]).toBe(false);
  });
});
