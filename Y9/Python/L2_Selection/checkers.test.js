import { describe, test, expect } from 'vitest';
import { evalInv, evalMod, evalMake, evalExt, breakCode, hasBugLine, hasFixedLine, isBugFixed, isBugPairLine,
         ownOutput, typedNumber, IBUG_LINE, IBUG_FIXED_LINE, MOD_TESTS, MAKE_TESTS, EXT_TESTS,
         MOD_TEST_BANK, MAKE_TEST_BANK, EXT_TEST_BANK, LOCKDOWN_CHOICES, POWER_CHOICES } from './checkers.js';

const code = (...lines) => lines.join('\n');
const ran = (src, ok = true) => ({ code: src, ok });

// The plain if/else students start from (elif first appears in Modification 2).
const STARTER = [
  'distance = int(input("Distance to target in metres: "))',
  'if distance >= 50:',
  '    print("All clear")',
  'else:',
  '    print("IT\'S RIGHT BEHIND YOU")',
  'print("Scan complete")',
];
const withLine = (i, line) => STARTER.map((l, k) => (k === i ? line : l));

// Fake runs: each "program" is a function from the typed answers to the lines it prints. The
// runner echoes "prompt + answer" for every input(), so the fake does too.
const PROMPT = 'Distance to target in metres: ';
const outputsFor = (tests, prog, prompts = [PROMPT, 'Send alert to the crew? (y/n) ']) =>
  tests.map(t => [...t.map((v, i) => (prompts[i] || '? ') + v), ...prog(...t)].join('\n') + '\n');

// The sensor program with options for each Modify step. middle = Modification 2's elif band
// (distance >= middleAt prints Movement detected); without it, it's the plain if/else.
function sensor({ top = 50, middle = true, middleAt = 20, lock = null, lockEverywhere = false, lockInMiddle = false,
                  alertBand = false, alertFirst = false, alert = false } = {}) {
  return (d, answer) => {
    d = Number(d);
    const out = [];
    const band = () => {
      if (d >= top) return out.push('All clear');
      if (alertBand && alertFirst && d >= 10) return out.push('Proximity alert');
      if (middle && d >= middleAt) { out.push('Movement detected'); if (lock && lockInMiddle) out.push(lock); return; }
      if (alertBand && !alertFirst && d >= 10) return out.push('Proximity alert');
      out.push("IT'S RIGHT BEHIND YOU");
      if (lock && !lockEverywhere) out.push(lock);
    };
    band();
    if (lock && lockEverywhere) out.push(lock);
    out.push('Scan complete');
    if (alert) out.push(answer === 'y' ? 'Alert sent' : 'Alert cancelled');
    return out;
  };
}

test('the test answers cover every boundary', () => {
  expect(MOD_TESTS.mod1.map(t => t[0])).toEqual(['5', '85']);
  expect(MOD_TESTS.mod2.flat()).toEqual(expect.arrayContaining(['50', '49', '20', '19']));
  expect(MOD_TESTS.mod3.flat()).toEqual(expect.arrayContaining(['10', '9', '20']));
  expect(MAKE_TESTS.flat()).toEqual(['350', '200', '199', '100', '99', '50', '49', '0']);
  expect(EXT_TESTS.flat()).toEqual(expect.arrayContaining(['-5', '0', '500', '499']));
});

describe('ownOutput / typedNumber', () => {
  test('drops the echoed prompt line, even when the prompt contains a band word', () => {
    const out = 'Is this room safe? Enter the dose: 120\nWARNING: 5 minutes only\n';
    expect(ownOutput(out, ['120'])).toBe('WARNING: 5 minutes only');
  });
  test('drops one echo per answer, in order', () => {
    const out = 'Distance: 5\nIT\'S RIGHT BEHIND YOU\nSend alert? y\nAlert sent\n';
    expect(ownOutput(out, ['5', 'y'])).toBe("IT'S RIGHT BEHIND YOU\nAlert sent");
  });
  test('typedNumber reads the distance off the echoed prompt', () => {
    expect(typedNumber('Distance to target in metres: 20\nMovement detected\n')).toBe(20);
    expect(typedNumber('All clear\n')).toBe(null);
  });
});

// ─── Investigate ─────────────────────────────────────────────────────────────

describe('evalInv step 1 — change the threshold', () => {
  test('if distance >= 20 passes; the starter does not', () => {
    expect(evalInv(1, code(...STARTER)).results).toEqual([false]);
    expect(evalInv(1, code(...withLine(1, 'if distance >= 20:'))).pass).toBe(true);
  });
  test('spacing is flexible', () => {
    expect(evalInv(1, code(...withLine(1, 'if distance>=20 :'))).pass).toBe(true);
  });
});

describe('evalInv step 2 — press Tab → lines up with line 5', () => {
  const step1 = withLine(1, 'if distance >= 20:');
  const scanAt = lead => step1.map((l, i) => (i === 5 ? lead + l : l));

  test('step 1 code alone: nothing ticked, nothing red, coach says press Tab', () => {
    const r = evalInv(2, code(...step1));
    expect(r.results).toEqual([false, false]);
    expect(r.wrongs).toEqual([false, false]);
    expect(r.msg).toMatch(/press Tab/);
  });
  test('4 spaces, lined up with line 5, passes', () => {
    expect(evalInv(2, code(...scanAt('    '))).pass).toBe(true);
  });
  test('2 spaces or 8 spaces: bullet 2 red, and the hint counts the spaces', () => {
    const two = evalInv(2, code(...scanAt('  ')));
    expect(two.results).toEqual([true, false]);
    expect(two.wrongs).toEqual([false, true]);
    expect(two.wrongMsg).toMatch(/2 spaces.*line 5 has 4/);
    expect(evalInv(2, code(...scanAt('        '))).wrongMsg).toMatch(/8 spaces.*Shift\+Tab/);
  });
  test('a pasted Tab character next to 4 spaces is red (Python would raise TabError)', () => {
    const r = evalInv(2, code(...scanAt('\t')));
    expect(r.wrongs[1]).toBe(true);
    expect(r.wrongMsg).toMatch(/Tab character/);
  });
  test('a deleted line is told to reset', () => {
    expect(evalInv(2, code(...step1.slice(0, 5))).msg).toMatch(/Reset/);
  });
  test('Scan complete moved above the else is not accepted', () => {
    const moved = [step1[0], step1[1], step1[2], '    print("Scan complete")', step1[3], step1[4]];
    const r = evalInv(2, code(...moved));
    expect(r.pass).toBe(false);
    expect(r.wrongs).toEqual([false, false]);
  });
});

describe('evalInv step 3 — back to the left edge, >= becomes >', () => {
  const step1 = withLine(1, 'if distance >= 20:');
  test('if distance > 20 with Scan complete at the left edge passes', () => {
    expect(evalInv(3, code(...withLine(1, 'if distance > 20:'))).pass).toBe(true);
    const r = evalInv(3, code(...step1));
    expect(r.results).toEqual([true, false]);
    expect(r.msg).toMatch(/change >= to >/);
  });
  test('Scan complete still indented fails the first bullet', () => {
    const s = withLine(1, 'if distance > 20:').map((l, i) => (i === 5 ? '    ' + l : l));
    expect(evalInv(3, code(...s)).results).toEqual([false, true]);
  });
});

describe('Break it / fix it (step 4)', () => {
  test('breakCode takes int() off line 1 in place, and is safe to mash', () => {
    const once = breakCode(code(...STARTER));
    expect(once.lineNo).toBe(1);
    expect(once.code.split('\n')[0]).toBe(IBUG_LINE);
    expect(breakCode(once.code).code).toBe(once.code);
    expect(hasBugLine(once.code)).toBe(true);
  });
  test('breakCode keeps the student\'s own prompt and removes a later cast', () => {
    const src = code('distance = int(input("How far? "))', 'distance = int(distance)', ...STARTER.slice(1));
    const r = breakCode(src);
    expect(r.code.split('\n')[0]).toBe('distance = input("How far? ")');
    expect(r.code).not.toMatch(/int\(distance\)/);
  });
  test('breakCode puts the line back on top if it was deleted', () => {
    const r = breakCode(code(...STARTER.slice(1)));
    expect(r.lineNo).toBe(1);
    expect(r.code.split('\n')[0]).toBe(IBUG_LINE);
  });
  test('isBugFixed: cast on line 1, or cast on the next line', () => {
    expect(isBugFixed(code(...STARTER))).toBe(true);
    expect(isBugFixed(code(IBUG_LINE, ...STARTER.slice(1)))).toBe(false);
    expect(isBugFixed(code(IBUG_LINE, 'distance = int(distance)', ...STARTER.slice(1)))).toBe(true);
    expect(isBugFixed(code(...STARTER.slice(1)))).toBe(false);   // deleted, not fixed
    expect(hasFixedLine(code('# ' + IBUG_FIXED_LINE, ...STARTER.slice(1)))).toBe(false);
    expect(isBugPairLine(IBUG_LINE)).toBe(false);   // nothing is planted, so nothing is stripped
  });
  test('needs a Break it press, then a fixed version that has been run', () => {
    const broken = code(IBUG_LINE, ...STARTER.slice(1));
    const fixed = code(...STARTER);
    expect(evalInv(4, fixed).results).toEqual([false, false]);
    expect(evalInv(4, broken, { breaks: 1, lastRun: ran(broken, false) }).results).toEqual([true, false]);
    expect(evalInv(4, fixed, { breaks: 1, lastRun: ran(broken, false) }).msg).toMatch(/Run code/);
    expect(evalInv(4, fixed, { breaks: 1, lastRun: ran(fixed) }).pass).toBe(true);
  });
  test('casting in the comparisons instead gets a "Nearly!" hint', () => {
    const src = code(IBUG_LINE, 'if int(distance) >= 50:', ...STARTER.slice(2));
    const r = evalInv(4, src, { breaks: 1, lastRun: ran(src) });
    expect(r.pass).toBe(false);
    expect(r.msg).toMatch(/^Nearly!/);
  });
  test('deleting the line gets told to bring it back', () => {
    const src = code(...STARTER.slice(1));
    expect(evalInv(4, src, { breaks: 1, lastRun: ran(src, false) }).msg).toMatch(/has gone/);
  });
});

// ─── Modify ──────────────────────────────────────────────────────────────────

describe('evalMod mod1 — the lockdown choice (plain if/else)', () => {
  const tests = MOD_TESTS.mod1;
  const binary = opts => sensor({ middle: false, ...opts });
  test('the chosen line inside the else passes, for either choice', () => {
    for (const c of ['cryo', 'sensors']) {
      const r = evalMod('mod1', '', outputsFor(tests, binary({ lock: LOCKDOWN_CHOICES[c] })), c);
      expect(r.pass).toBe(true);
    }
  });
  test('the other room\'s line fails the first bullet', () => {
    const r = evalMod('mod1', '', outputsFor(tests, binary({ lock: LOCKDOWN_CHOICES.sensors })), 'cryo');
    expect(r.results).toEqual([false, true]);
    expect(r.msg).toMatch(/LOCKDOWN: CRYO BAY/);
  });
  test('a lockdown line outside the else fails the second bullet and shows the 85 run', () => {
    const r = evalMod('mod1', '', outputsFor(tests, binary({ lock: 'LOCKDOWN: CRYO BAY', lockEverywhere: true })), 'cryo');
    expect(r.results).toEqual([true, false]);
    expect(r.show).toBe(1);
    expect(r.msg).toMatch(/With 85 typed/);
  });
});

describe('evalMod mod2 — the first elif: a middle band', () => {
  const tests = MOD_TESTS.mod2;
  const lock = 'LOCKDOWN: CRYO BAY';
  test('elif distance >= 20 in the right place passes (the lockdown stays in the else)', () => {
    expect(evalMod('mod2', '', outputsFor(tests, sensor({ lock }))).pass).toBe(true);
  });
  test('no elif yet: 49 is still "behind you", and the hint says where the lines go', () => {
    const r = evalMod('mod2', '', outputsFor(tests, sensor({ middle: false, lock })));
    expect(r.results).toEqual([false, true, true]);
    expect(r.show).toBe(2);
    expect(r.msg).toMatch(/between the All clear block and else/);
  });
  test('the lockdown moved under the elif as well', () => {
    const r = evalMod('mod2', '', outputsFor(tests, sensor({ lock, lockInMiddle: true })));
    expect(r.results[0]).toBe(false);
    expect(r.msg).toMatch(/locked down too/);
  });
  test('the elif above the if: 50 and over say Movement detected', () => {
    const r = evalMod('mod2', '', outputsFor(tests, sensor({ top: Infinity })));
    expect(r.results[1]).toBe(false);
    expect(r.msg).toMatch(/still say All clear/);
  });
  test('>= 19 by mistake: 19 is caught by the new band', () => {
    const r = evalMod('mod2', '', outputsFor(tests, sensor({ middleAt: 19 })));
    expect(r.results).toEqual([true, true, false]);
    expect(r.show).toBe(5);
  });
});

describe('evalMod mod3 — a new band', () => {
  const tests = MOD_TESTS.mod3;
  test('the band after Movement detected passes', () => {
    expect(evalMod('mod3', '', outputsFor(tests, sensor({ alertBand: true }))).pass).toBe(true);
  });
  test('the band before Movement detected catches 25 and 20, with an order hint', () => {
    const r = evalMod('mod3', '', outputsFor(tests, sensor({ alertBand: true, alertFirst: true })));
    expect(r.results).toEqual([true, false, true]);
    expect(r.show).toBe(2);
    expect(r.msg).toMatch(/first True condition/);
  });
  test('no band yet: 15 is not a proximity alert', () => {
    const r = evalMod('mod3', '', outputsFor(tests, sensor()));
    expect(r.results[0]).toBe(false);
    expect(r.msg).toMatch(/With 15 typed/);
  });
  test('the lockdown line in the else doesn\'t get in the way', () => {
    expect(evalMod('mod3', '', outputsFor(tests, sensor({ alertBand: true, lock: 'LOCKDOWN: CRYO BAY' }))).pass).toBe(true);
  });
});

describe('evalMod mod4 — == "y"', () => {
  const tests = MOD_TESTS.mod4;
  const src = code(...STARTER, 'alert = input("Send alert to the crew? (y/n) ")', 'if alert == "y":', '    print("Alert sent")', 'else:', '    print("Alert cancelled")');
  test('y sends, n cancels', () => {
    expect(evalMod('mod4', src, outputsFor(tests, sensor({ alert: true }))).pass).toBe(true);
  });
  test('no second question', () => {
    expect(evalMod('mod4', code(...STARTER), outputsFor(tests, sensor())).results).toEqual([false, false, false]);
  });
  test('always sending fails the n test', () => {
    const always = (d, a) => [...sensor()(d), 'Alert sent'];
    const r = evalMod('mod4', src, outputsFor(tests, always));
    expect(r.results).toEqual([true, true, false]);
    expect(r.show).toBe(1);
  });
});

// ─── Make ────────────────────────────────────────────────────────────────────

const DOSE_PROMPT = ['Radiation dose: '];
function scanner({ dangerAt = 200, order = 'down', power = 'POWER: SENSORS', powerOnlySafe = false, words } = {}) {
  const W = { danger: 'DANGER: do not enter', warning: 'WARNING: 5 minutes only', caution: 'CAUTION: suit required', safe: 'SAFE', ...words };
  return dose => {
    const d = Number(dose);
    let msg;
    if (order === 'down') msg = d >= dangerAt ? W.danger : d >= 100 ? W.warning : d >= 50 ? W.caution : W.safe;
    else msg = d < 50 ? W.safe : d < 100 ? W.caution : d < dangerAt ? W.warning : W.danger;
    const out = [msg];
    if (power && (!powerOnlySafe || msg === W.safe)) out.push(power);
    return out;
  };
}
const SCANNER_SRC = code(
  'dose = int(input("Radiation dose: "))',
  'if dose >= 200:', '    print("DANGER: do not enter")',
  'elif dose >= 100:', '    print("WARNING: 5 minutes only")',
  'elif dose >= 50:', '    print("CAUTION: suit required")',
  'else:', '    print("SAFE")',
  'print("POWER: SENSORS")');
const makeOut = opts => outputsFor(MAKE_TESTS, scanner(opts), DOSE_PROMPT);

describe('evalMake — radiation scanner', () => {
  test('a correct scanner passes, in either order', () => {
    expect(evalMake(SCANNER_SRC, makeOut(), 'sensors').pass).toBe(true);
    expect(evalMake(SCANNER_SRC, makeOut({ order: 'up' }), 'sensors').pass).toBe(true);
  });
  test('the pods line for the pods call', () => {
    expect(evalMake(SCANNER_SRC, makeOut({ power: POWER_CHOICES.pods }), 'pods').pass).toBe(true);
    expect(evalMake(SCANNER_SRC, makeOut(), 'pods').results.at(-1)).toBe(false);
  });
  test('> 200 instead of >= 200: the 200 boundary fails and its run is shown', () => {
    const r = evalMake(SCANNER_SRC, makeOut({ dangerAt: 201 }), 'sensors');
    expect(r.results).toEqual([true, true, false, true, true, true, true]);
    expect(r.show).toBe(1);
    expect(r.msg).toMatch(/A dose of 200/);
  });
  test('a message with two band words does not count', () => {
    const r = evalMake(SCANNER_SRC, makeOut({ words: { warning: 'WARNING: danger zone' } }), 'sensors');
    expect(r.results[3]).toBe(false);
  });
  test('code checks: needs int(input()) and if / elif / else', () => {
    expect(evalMake('print("SAFE")', makeOut(), 'sensors').results.slice(0, 2)).toEqual([false, false]);
    const noElif = code('dose = int(input("? "))', 'if dose >= 50:', '    print("x")', 'else:', '    print("y")');
    expect(evalMake(noElif, makeOut(), 'sensors').results[1]).toBe(false);
  });
  test('a power line that only prints for some doses is not at the end', () => {
    const r = evalMake(SCANNER_SRC, makeOut({ powerOnlySafe: true }), 'sensors');
    expect(r.results.at(-1)).toBe(false);
    expect(r.show).toBe(0);
    expect(r.msg).toMatch(/not indented/);
  });
  test('no choice made', () => {
    expect(evalMake(SCANNER_SRC, makeOut(), undefined).msg).toMatch(/Make your call/);
  });
});

describe('evalExt — faults and evacuation', () => {
  const ext = ({ faultAtZero = false, evacFirst = true } = {}) => dose => {
    const d = Number(dose);
    if (faultAtZero ? d <= 0 : d < 0) return ['SCANNER FAULT'];
    if (evacFirst && d >= 500) return ['EVACUATE NOW'];
    if (d >= 200) return ['DANGER'];
    if (!evacFirst && d >= 500) return ['EVACUATE NOW'];
    return d >= 100 ? ['WARNING'] : d >= 50 ? ['CAUTION'] : ['SAFE'];
  };
  test('a full scanner passes', () => {
    expect(evalExt('', outputsFor(EXT_TESTS, ext(), DOSE_PROMPT)).pass).toBe(true);
  });
  test('0 counted as a fault', () => {
    const r = evalExt('', outputsFor(EXT_TESTS, ext({ faultAtZero: true }), DOSE_PROMPT));
    expect(r.results[0]).toBe(false);
    expect(r.show).toBe(1);
    expect(r.msg).toMatch(/0 should still print SAFE/);
  });
  test('the evacuate check below the danger check never runs', () => {
    const r = evalExt('', outputsFor(EXT_TESTS, ext({ evacFirst: false }), DOSE_PROMPT));
    expect(r.results).toEqual([true, false]);
    expect(r.show).toBe(2);
    expect(r.msg).toMatch(/first True condition/);
  });
});

// ─── Test banks ("typed for you" changes each check) ─────────────────────────

describe('test banks — every set works, and the boundaries are in every set', () => {
  const firsts = sets => sets.map(t => t[0]);
  test('the first set of each bank is the default', () => {
    for (const k of Object.keys(MOD_TEST_BANK)) expect(MOD_TESTS[k]).toEqual(MOD_TEST_BANK[k][0]);
    expect(MAKE_TESTS).toEqual(MAKE_TEST_BANK[0]);
    expect(EXT_TESTS).toEqual(EXT_TEST_BANK[0]);
  });
  test('mod1: every set has a close and a far distance; hints name the typed numbers', () => {
    for (const tests of MOD_TEST_BANK.mod1) {
      const [close, far] = firsts(tests).map(Number);
      expect(close < 20 && far >= 50).toBe(true);
      const binary = opts => sensor({ middle: false, ...opts });
      for (const c of Object.keys(LOCKDOWN_CHOICES))
        expect(evalMod('mod1', '', outputsFor(tests, binary({ lock: LOCKDOWN_CHOICES[c] })), c, tests).pass).toBe(true);
      expect(evalMod('mod1', '', outputsFor(tests, binary()), 'cryo', tests).msg).toContain(`With ${close} typed`);
      const r = evalMod('mod1', '', outputsFor(tests, binary({ lock: 'LOCKDOWN: CRYO BAY', lockEverywhere: true })), 'cryo', tests);
      expect(r.msg).toContain(`With ${far} typed`);
    }
  });
  test('mod2: 50, 49, 20 and 19 every time, and the changing distances sit inside their bands', () => {
    for (const tests of MOD_TEST_BANK.mod2) {
      const [far, fifty, fortyNine, mid, twenty, nineteen] = firsts(tests).map(Number);
      expect([fifty, fortyNine, twenty, nineteen]).toEqual([50, 49, 20, 19]);
      expect(far > 50 && mid > 20 && mid < 49).toBe(true);
      expect(evalMod('mod2', '', outputsFor(tests, sensor({ lock: 'LOCKDOWN: CRYO BAY' })), undefined, tests).pass).toBe(true);
      expect(evalMod('mod2', '', outputsFor(tests, sensor({ middle: false })), undefined, tests).pass).toBe(false);
    }
  });
  test('mod3: 10, 20 and 9 every time, and the changing distances sit inside their bands', () => {
    for (const tests of MOD_TEST_BANK.mod3) {
      const [inBand, ten, mid, twenty, nine] = firsts(tests).map(Number);
      expect([ten, twenty, nine]).toEqual([10, 20, 9]);
      expect(inBand > 10 && inBand < 20 && mid > 20 && mid < 50).toBe(true);
      expect(evalMod('mod3', '', outputsFor(tests, sensor({ alertBand: true })), undefined, tests).pass).toBe(true);
      const r = evalMod('mod3', '', outputsFor(tests, sensor({ alertBand: true, alertFirst: true })), undefined, tests);
      expect(r.pass).toBe(false);
      expect(r.msg).toContain(`With ${mid} typed`);
    }
  });
  test('mod4: a distance under 10, with y then n', () => {
    const src = code(...STARTER, 'alert = input("Send alert to the crew? (y/n) ")', 'if alert == "y":', '    print("Alert sent")', 'else:', '    print("Alert cancelled")');
    for (const tests of MOD_TEST_BANK.mod4) {
      expect(Number(tests[0][0])).toBeLessThan(10);
      expect(tests.map(t => t[1])).toEqual(['y', 'n']);
      expect(evalMod('mod4', src, outputsFor(tests, sensor({ alertBand: true, alert: true })), undefined, tests).pass).toBe(true);
    }
  });
  test('Make: every boundary in every set; a correct scanner passes and an off-by-one fails', () => {
    for (const tests of MAKE_TEST_BANK) {
      const doses = firsts(tests).map(Number);
      expect(doses.slice(1, 7)).toEqual([200, 199, 100, 99, 50, 49]);
      expect(doses[0] > 200 && doses[7] >= 0 && doses[7] < 49).toBe(true);
      expect(evalMake(SCANNER_SRC, outputsFor(tests, scanner(), DOSE_PROMPT), 'sensors', tests).pass).toBe(true);
      expect(evalMake(SCANNER_SRC, outputsFor(tests, scanner({ dangerAt: 201 }), DOSE_PROMPT), 'sensors', tests).pass).toBe(false);
    }
  });
  test('Extension: 0, 500 and 499 every time; the hints name the typed doses', () => {
    const ext = (faultAtZero = false) => dose => {
      const d = Number(dose);
      if (faultAtZero ? d <= 0 : d < 0) return ['SCANNER FAULT'];
      if (d >= 500) return ['EVACUATE NOW'];
      return d >= 200 ? ['DANGER'] : d >= 100 ? ['WARNING'] : d >= 50 ? ['CAUTION'] : ['SAFE'];
    };
    for (const tests of EXT_TEST_BANK) {
      const [neg, zero, fiveHundred, big, justUnder] = firsts(tests).map(Number);
      expect([zero, fiveHundred, justUnder]).toEqual([0, 500, 499]);
      expect(neg < 0 && big > 500).toBe(true);
      expect(evalExt('', outputsFor(tests, ext(), DOSE_PROMPT), tests).pass).toBe(true);
      const noFault = d => (Number(d) < 0 ? ['SAFE'] : ext()(d));
      expect(evalExt('', outputsFor(tests, noFault, DOSE_PROMPT), tests).msg).toContain(`with ${neg} typed`);
    }
  });
});
