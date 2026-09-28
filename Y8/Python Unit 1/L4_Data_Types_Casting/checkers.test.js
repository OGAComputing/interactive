import { describe, test, expect } from 'vitest';
import { evalMod, evalMake, evalExt, evalInv, hasBugLine, hasFixedLine, isBugPairLine, IBUG_LINE, IBUG_FIXED_LINE,
         MOD_INPUTS, MAKE_INPUTS, EXT_STEP_COUNT } from './checkers.js';

const code = (lines) => lines.join('\n');

// The Investigate stage leaves the student with this — Modify builds on it.
const INVESTIGATE_END = [
  'a = int(input("Enter first number: "))',
  'b = int(input("Enter second number: "))',
  'print(a + b)',
  '',
  'c = 5',
  'd = 5',
  'print(c + d)',
];
// What that program prints with the Modify test numbers (prompts echo the typed value).
const BASE_OUT = ['Enter first number: 9', 'Enter second number: 5', '14', '10'];
const out = (...lines) => lines.join('\n') + '\n';

test('test numbers match the values the checkers expect', () => {
  expect(MOD_INPUTS.mod1).toEqual(['9', '5', '7', '2.5']);
  expect(MAKE_INPUTS).toEqual(['8', '2']);
  expect(EXT_STEP_COUNT).toBe(5);
});

// ─── Investigate ─────────────────────────────────────────────────────────────

const STARTER = ['a = "5"', 'b = "5"', 'print(a + b)', '', 'c = 5', 'd = 5', 'print(c + d)'];
const withLines = (base, ...extra) => code([...base, ...extra]);
const ran = (src, ok = true) => ({ code: src, ok });

describe('evalInv step 1 — a from input()', () => {
  test('untouched starter code is not accepted', () => {
    const r = evalInv(1, code(STARTER));
    expect(r.pass).toBe(false);
    expect(r.results).toEqual([false]);
  });

  test('a = input(...) passes, any prompt text', () => {
    expect(evalInv(1, code(['a = input("Enter first number: ")', ...STARTER.slice(1)])).pass).toBe(true);
    expect(evalInv(1, code(["a = input('First? ')", ...STARTER.slice(1)])).pass).toBe(true);
  });

  test('deleting line 1 or casting early is not accepted, with a specific hint for casting', () => {
    expect(evalInv(1, code(STARTER.slice(1))).pass).toBe(false);
    const early = evalInv(1, code(['a = int(input("Enter first number: "))', ...STARTER.slice(1)]));
    expect(early.pass).toBe(false);
    expect(early.msg).toMatch(/no int\(\) yet/);
  });

  test('a commented-out input line does not count', () => {
    expect(evalInv(1, code(['# a = input("x")', ...STARTER])).pass).toBe(false);
  });
});

describe('evalInv step 2 — b from input(), both cast', () => {
  const step1 = ['a = input("Enter first number: ")', ...STARTER.slice(1)];

  test('step 1 code alone ticks nothing', () => {
    expect(evalInv(2, code(step1)).results).toEqual([false, false, false]);
  });

  test('b = input() only ticks the first bullet', () => {
    const src = code(['a = input("Enter first number: ")', 'b = input("Enter second number: ")', ...STARTER.slice(2)]);
    expect(evalInv(2, src).results).toEqual([true, false, false]);
  });

  test('both wrapped in int(input()) passes', () => {
    expect(evalInv(2, code(INVESTIGATE_END)).pass).toBe(true);
  });

  test('casting on a later line, or with float(), also passes', () => {
    expect(evalInv(2, code(['a = input("A: ")', 'b = input("B: ")', 'a = int(a)', 'b = int(b)', 'print(a + b)'])).pass).toBe(true);
    expect(evalInv(2, code(['a = float(input("A: "))', 'b = float(input("B: "))', 'print(a + b)'])).pass).toBe(true);
  });

  test('a skipped step 1 (a still "5") is caught by the a bullet', () => {
    const r = evalInv(2, code(['a = int("5")', 'b = int(input("B: "))', 'print(a + b)']));
    expect(r.results).toEqual([true, false, true]);
  });
});

describe('evalInv step 3 — guided Break it', () => {
  const base = INVESTIGATE_END;
  const fixed = withLines(base, IBUG_FIXED_LINE);
  const broken = withLines(base, IBUG_LINE);

  test('nothing ticks before Break it is pressed', () => {
    expect(evalInv(3, code(base)).results).toEqual([false, false]);
    expect(evalInv(3, fixed, { lastRun: ran(fixed) }).results).toEqual([false, false]);
  });

  test('broken line still present: Break it ticks, fix does not', () => {
    const r = evalInv(3, broken, { breaks: 1, lastRun: ran(broken, false) });
    expect(r.results).toEqual([true, false]);
    expect(r.msg).toMatch(/wrap the 5 in str\(\)/);
  });

  test('fixed and run passes', () => {
    expect(evalInv(3, fixed, { breaks: 1, lastRun: ran(fixed) }).pass).toBe(true);
  });

  test('fixed but not yet run does not pass', () => {
    const r = evalInv(3, fixed, { breaks: 1, lastRun: ran(broken, false) });
    expect(r.pass).toBe(false);
    expect(r.msg).toMatch(/Run code/);
  });

  test('deleting the broken line instead of fixing it does not pass, and says so', () => {
    const r = evalInv(3, code(base), { breaks: 1, lastRun: ran(code(base)) });
    expect(r.pass).toBe(false);
    expect(r.msg).toMatch(/don't delete it/);
  });

  test('loose spacing / single quotes in the fix still count', () => {
    const src = withLines(base, "print('Total: ' + str( 5 ))");
    expect(evalInv(3, src, { breaks: 1, lastRun: ran(src) }).pass).toBe(true);
  });
});

describe('evalInv step 4 — self-practice cycles', () => {
  const fixed = withLines(INVESTIGATE_END, IBUG_FIXED_LINE);
  const broken = withLines(INVESTIGATE_END, IBUG_LINE);

  test('one cycle ticks only the first bullet', () => {
    expect(evalInv(4, fixed, { breaks: 1, fixes: 1, lastRun: ran(fixed) }).results).toEqual([true, false]);
  });

  test('two cycles, left fixed and run, passes', () => {
    expect(evalInv(4, fixed, { breaks: 2, fixes: 2, lastRun: ran(fixed) }).pass).toBe(true);
  });

  test('broken again after two cycles must be fixed before checking', () => {
    const r = evalInv(4, broken, { breaks: 3, fixes: 2, lastRun: ran(broken, false) });
    expect(r.results).toEqual([true, false]);
    expect(r.msg).toMatch(/Fix the broken line/);
  });
});

test('bug line matchers', () => {
  expect(hasBugLine(IBUG_LINE)).toBe(true);
  expect(hasFixedLine(IBUG_LINE)).toBe(false);
  expect(hasFixedLine(IBUG_FIXED_LINE)).toBe(true);
  expect(hasBugLine('# ' + IBUG_LINE)).toBe(false);
  expect(isBugPairLine('  ' + IBUG_FIXED_LINE)).toBe(true);
  expect(isBugPairLine('print(a + b)')).toBe(false);
});

// ─── Modify ──────────────────────────────────────────────────────────────────

describe('evalMod', () => {
  test('mod1 passes print(a - b)', () => {
    const r = evalMod('mod1', code([...INVESTIGATE_END, 'print(a - b)']), out(...BASE_OUT, '4'));
    expect(r.pass).toBe(true);
  });

  test('mod1 passes b - a and a stored difference (any valid shape)', () => {
    expect(evalMod('mod1', code([...INVESTIGATE_END, 'print(b - a)']), out(...BASE_OUT, '-4')).pass).toBe(true);
    expect(evalMod('mod1', code([...INVESTIGATE_END, 'diff = a - b', 'print("Difference: " + str(diff))']),
      out(...BASE_OUT, 'Difference: 4')).pass).toBe(true);
  });

  test('mod1 fails when nothing is subtracted', () => {
    expect(evalMod('mod1', code([...INVESTIGATE_END, 'print(4)']), out(...BASE_OUT, '4')).pass).toBe(false);
  });

  test('mod2 accepts casting on a separate line and a stored total', () => {
    const r = evalMod('mod2', code([...INVESTIGATE_END,
      'e = input("Third? ")', 'e = int(e)', 'total = a + b + e', 'print(total)']),
      out(...BASE_OUT, 'Third? 7', '21'));
    expect(r.results).toEqual([true, true]);
  });

  test('mod2 fails when the third number is never cast', () => {
    const r = evalMod('mod2', code([...INVESTIGATE_END, 'e = input("Third? ")', 'print(e)']),
      out(...BASE_OUT, 'Third? 7', '7'));
    expect(r.results).toEqual([false, false]);
  });

  test('mod3 passes the bracketed average, fails the precedence mistake', () => {
    const base = [...INVESTIGATE_END, 'e = int(input("Third? "))', 'print(a + b + e)'];
    expect(evalMod('mod3', code([...base, 'print((a + b + e) / 3)']),
      out(...BASE_OUT, 'Third? 7', '21', '7.0')).pass).toBe(true);
    expect(evalMod('mod3', code([...base, 'print(a + b + e / 3)']),
      out(...BASE_OUT, 'Third? 7', '21', '16.333333333333332')).pass).toBe(false);
  });

  test('mod3 does not mistake the typed test number 7 for the average', () => {
    const base = [...INVESTIGATE_END, 'e = int(input("Third? "))', 'print(a + b + e)', 'print(21 / 3)'];
    expect(evalMod('mod3', code(base), out(...BASE_OUT, 'Third? 7', '21')).pass).toBe(false);
  });

  test('mod4 needs a genuinely new float() question, not a re-cast third number', () => {
    const base = [...INVESTIGATE_END, 'e = int(input("Third? "))'];
    const good = evalMod('mod4', code([...base, 'f = float(input("Decimal? "))', 'print(a + b + e + f)']),
      out(...BASE_OUT, 'Third? 7', 'Decimal? 2.5', '23.5'));
    expect(good.pass).toBe(true);
    // Kept the c = 5 / d = 5 demo lines and added them into the total too — also valid.
    const withCD = evalMod('mod4', code([...base, 'f = float(input("Decimal? "))', 'print(a + b + c + d + e + f)']),
      out(...BASE_OUT, 'Third? 7', 'Decimal? 2.5', '33.5'));
    expect(withCD.pass).toBe(true);
    const recast = evalMod('mod4', code([...INVESTIGATE_END, 'e = float(input("Third? "))', 'print(a + b + e)']),
      out(...BASE_OUT, 'Third? 7', '21.0'));
    expect(recast.results[0]).toBe(false);
  });
});

// ─── Make ────────────────────────────────────────────────────────────────────

describe('evalMake', () => {
  const makeOut = (...lines) => out('First? 8', 'Second? 2', ...lines);

  test('passes the one-line cast style', () => {
    const r = evalMake(code([
      'x = int(input("First? "))', 'y = int(input("Second? "))',
      'print(x + y)', 'print(x * y)',
    ]), makeOut('10', '16'));
    expect(r.results).toEqual([true, true, true, true]);
  });

  test('passes casting on later lines, float(), and sentences', () => {
    const r = evalMake(code([
      'x = input("First? ")', 'y = input("Second? ")', 'x = float(x)', 'y = float(y)',
      'print("Sum: " + str(x + y))', 'print("Divided: " + str(x / y))',
    ]), makeOut('Sum: 10.0', 'Divided: 4.0'));
    expect(r.pass).toBe(true);
  });

  test('fails when the numbers are joined as text (82) instead of added', () => {
    const r = evalMake(code([
      'x = input("First? ")', 'y = input("Second? ")', 'print(x + y)', 'print(int(x) - int(y))',
    ]), makeOut('82', '6'));
    expect(r.results[2]).toBe(false);
  });

  test('fails with only a sum', () => {
    const r = evalMake(code(['x = int(input("First? "))', 'y = int(input("Second? "))', 'print(x + y)']), makeOut('10'));
    expect(r.results[3]).toBe(false);
  });
});

// ─── Extension challenges ────────────────────────────────────────────────────

const CALC = [
  'pizzas = int(input("How many pizzas? "))',
  'slices = int(input("Slices per pizza? "))',
  'people = int(input("How many people? "))',
  'each = pizzas * slices / people',
];

describe('evalExt', () => {
  test('ext1 passes a three-number calculator using two operators', () => {
    expect(evalExt('ext1', code([...CALC, 'print(each)'])).pass).toBe(true);
  });

  test('ext1 fails with only two numbers', () => {
    const r = evalExt('ext1', code(['a = int(input("A? "))', 'b = int(input("B? "))', 'print(a * b - a)']));
    expect(r.results[0]).toBe(false);
  });

  test('ext2 needs a stored result printed with str() in a sentence', () => {
    expect(evalExt('ext2', code([...CALC, 'print("Everyone gets " + str(each) + " slices")'])).pass).toBe(true);
    expect(evalExt('ext2', code([...CALC, 'print(each)'])).results).toEqual([true, false]);
  });

  test('ext3 needs a printed comparison and an ==', () => {
    expect(evalExt('ext3', code([...CALC, 'print(each > 2)', 'print(pizzas == people)'])).pass).toBe(true);
    expect(evalExt('ext3', code([...CALC, 'print(each > 2)'])).results).toEqual([true, false]);
  });

  test('ext4 needs an if with a comparison and an indented print', () => {
    expect(evalExt('ext4', code([...CALC, 'if each > 3:', '    print("Lots of pizza!")'])).pass).toBe(true);
    expect(evalExt('ext4', code([...CALC, 'if each > 3:', 'print("Lots of pizza!")'])).results).toEqual([true, false]);
    expect(evalExt('ext4', code([...CALC, 'if each > 3', '    print("x")'])).results[0]).toBe(false);
  });

  test('ext4 accepts tab indentation', () => {
    expect(evalExt('ext4', code([...CALC, 'if each >= 3:', '\tprint("Lots!")'])).pass).toBe(true);
  });

  test('ext5 needs else lined up with if, with its own indented print', () => {
    const good = [...CALC, 'if each > 3:', '    print("Lots!")', 'else:', '    print("Order more!")'];
    expect(evalExt('ext5', code(good)).pass).toBe(true);
    const badIndent = [...CALC, 'if each > 3:', '    print("Lots!")', '    else:', '    print("Order more!")'];
    expect(evalExt('ext5', code(badIndent)).results[0]).toBe(false);
    const noBody = [...CALC, 'if each > 3:', '    print("Lots!")', 'else:', 'print("Order more!")'];
    expect(evalExt('ext5', code(noBody)).results).toEqual([true, false]);
  });

  test('comparisons inside strings do not count', () => {
    expect(evalExt('ext3', code([...CALC, 'print("each > 2 == True")'])).pass).toBe(false);
  });
});
