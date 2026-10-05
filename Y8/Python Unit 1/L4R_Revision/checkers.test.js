import { describe, test, expect } from 'vitest';
import {
  printedLines, errorName, mulberry32, shuffle,
  QUIZ_POOL, CHAIN_LENGTH, drawChain,
  TRACE_VARIANTS, checkTraceValue, checkTraceOutput,
  SORT_CARDS, SORT_BINS, checkSort,
  BUGS, evalBug, BUILD_CHECK, BUILD_TESTS, evalBuild,
  EXT1_TESTS, evalExt1, EXT2_TESTS, evalExt2,
  BADGES, evalBadges, badgeInputs,
} from './checkers.js';

// A run as runPython() reports it: each input() echoes "prompt + answer" on its own line.
const ok = (inputs, lines) => ({ inputs, ok: true, output: lines.join('\n') + '\n' });
const fail = (inputs, msg) => ({ inputs, ok: false, output: msg });

describe('printedLines', () => {
  test('drops the input() echo lines, keeps printed ones', () => {
    const run = ok(['Ava', '3'], ['Name? Ava', 'Hi Ava', 'Tickets? 3', 'Total 21']);
    expect(printedLines(run)).toEqual(['Hi Ava', 'Total 21']);
  });
  test('errorName reads the Python error type', () => {
    expect(errorName(fail([], 'NameError: name \'color\' is not defined'))).toBe('NameError');
  });
});

describe('seeded randomness', () => {
  test('same seed → same order; shuffle keeps every item', () => {
    const a = shuffle([1, 2, 3, 4, 5, 6], mulberry32(42));
    expect(shuffle([1, 2, 3, 4, 5, 6], mulberry32(42))).toEqual(a);
    expect([...a].sort()).toEqual([1, 2, 3, 4, 5, 6]);
  });
});

describe('quiz pool', () => {
  test('every question has 4 distinct options and a reason', () => {
    for (const q of QUIZ_POOL) {
      expect(q.opts).toHaveLength(4);
      expect(new Set(q.opts).size).toBe(4);
      expect(q.why.length).toBeGreaterThan(10);
    }
  });
  test('ids are unique and a chain draws distinct questions', () => {
    expect(new Set(QUIZ_POOL.map(q => q.id)).size).toBe(QUIZ_POOL.length);
    const draw = drawChain(mulberry32(7));
    expect(draw).toHaveLength(CHAIN_LENGTH);
    expect(new Set(draw).size).toBe(CHAIN_LENGTH);
  });
  test('the correct answer is not the longest option on half the questions or more', () => {
    const longest = QUIZ_POOL.filter(q => q.opts[0].length > Math.max(...q.opts.slice(1).map(o => o.length)));
    expect(longest.length).toBeLessThan(QUIZ_POOL.length / 2);
  });
  test('nothing beyond Lessons 1–4 appears (no if/else, loops or comparisons)', () => {
    for (const q of QUIZ_POOL) {
      const text = [q.code || '', ...q.opts.filter(o => /[()"=]/.test(o))].join('\n');
      expect(text).not.toMatch(/\b(if|else|elif|while|for)\b|==|>=|<=/);
    }
  });
});

describe('trace the boxes', () => {
  const str = v => ({ type: 'str', value: v });
  test('text needs quotes (either kind)', () => {
    expect(checkTraceValue(str('Mo'), '"Mo"').ok).toBe(true);
    expect(checkTraceValue(str('Mo'), "'Mo'").ok).toBe(true);
    const r = checkTraceValue(str('Mo'), 'Mo');
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/quotes/);
  });
  test('"120" is text: the number 120 is wrong', () => {
    expect(checkTraceValue(str('120'), '120').ok).toBe(false);
    expect(checkTraceValue(str('120'), '"120"').ok).toBe(true);
  });
  test('numbers have no quotes; a float may be written 6 or 6.0', () => {
    expect(checkTraceValue({ type: 'int', value: 13 }, '13').ok).toBe(true);
    expect(checkTraceValue({ type: 'int', value: 13 }, '"13"').msg).toMatch(/no quotes/);
    expect(checkTraceValue({ type: 'float', value: 6 }, '6.0').ok).toBe(true);
    expect(checkTraceValue({ type: 'float', value: 6 }, '6').ok).toBe(true);
    expect(checkTraceValue({ type: 'int', value: 13 }, '12').ok).toBe(false);
  });
  test('output: spacing and case are forgiven, quotes and missing .0 are explained', () => {
    expect(checkTraceOutput('Mo will be 13', '  mo  will be 13 ').ok).toBe(true);
    expect(checkTraceOutput('Mo will be 13', '"Mo will be 13"').msg).toMatch(/quotes/);
    expect(checkTraceOutput('6.0', '6').msg).toMatch(/\.0/);
    expect(checkTraceOutput('120', '13').ok).toBe(false);
  });
  test('every variant is answerable: its own answers pass', () => {
    for (const v of TRACE_VARIANTS) {
      for (const x of v.vars) {
        const typed = x.type === 'str' ? `"${x.value}"` : String(x.value);
        expect(checkTraceValue(x, typed).ok).toBe(true);
      }
      for (const line of v.output) expect(checkTraceOutput(line, line).ok).toBe(true);
    }
  });
});

describe('sort it', () => {
  test('all correct passes; one misplaced card fails and is reported', () => {
    const right = Object.fromEntries(SORT_CARDS.map(c => [c.id, c.bin]));
    expect(checkSort(right).pass).toBe(true);
    const r = checkSort({ ...right, s6: 'join' });
    expect(r.pass).toBe(false);
    expect(r.results.s6).toBe(false);
    expect(r.wrong).toBe(1);
  });
  test('unplaced cards do not pass', () => {
    expect(checkSort({}).placed).toBe(false);
  });
  test('every card belongs to a real bin', () => {
    const bins = SORT_BINS.map(b => b.id);
    for (const c of SORT_CARDS) expect(bins).toContain(c.bin);
  });
});

describe('bug hunt', () => {
  const runsFor = (bug, outFor) => bug.tests.map(inp => outFor(inp));
  const bug = id => BUGS.find(b => b.id === id);

  test('b1: the starter (SyntaxError) fails; the fixed lines pass', () => {
    expect(evalBug('b1', bug('b1').starter, [fail([], 'SyntaxError: unterminated string literal')]).pass).toBe(false);
    expect(evalBug('b1', '', [ok([], ['Welcome to the Python club!', 'Today we revise everything.'])]).pass).toBe(true);
  });

  test('b2: fixed program must echo each colour typed', () => {
    const good = runsFor(bug('b2'), ([c]) => ok([c], [`What is your favourite colour? ${c}`, `Great choice: ${c}`]));
    expect(evalBug('b2', '', good).pass).toBe(true);
    const hardcoded = runsFor(bug('b2'), ([c]) => ok([c], [`What is your favourite colour? ${c}`, 'Great choice: green']));
    expect(evalBug('b2', '', hardcoded).pass).toBe(false);
  });

  test('b3: swapping the lines passes; typing the name into the text does not', () => {
    const run = [ok([], ['Your team is Tigers'])];
    expect(evalBug('b3', 'team = "Tigers"\nprint("Your team is " + team)', run).pass).toBe(true);
    const r = evalBug('b3', 'print("Your team is Tigers")', run);
    expect(r.pass).toBe(false);
    expect(r.msg).toMatch(/team/);
  });

  test('b4: str(age + 1) passes; a comma also passes', () => {
    const good = runsFor(bug('b4'), ([a]) => ok([a], [`How old are you? ${a}`, `Next year you will be ${+a + 1}`]));
    expect(evalBug('b4', '', good).pass).toBe(true);
    const comma = runsFor(bug('b4'), ([a]) => ok([a], [`How old are you? ${a}`, `Next year you will be  ${+a + 1}`]));
    expect(evalBug('b4', '', comma).pass).toBe(true);
    expect(evalBug('b4', '', [fail(['12'], 'TypeError: can only concatenate str (not "int") to str')]).msg).toMatch(/TypeError/);
  });

  test('b5: joined answers (53) fail; added answers (8, 8.0) pass', () => {
    const joined = runsFor(bug('b5'), ([a, b]) => ok([a, b], [`First number: ${a}`, `Second number: ${b}`, a + b]));
    expect(evalBug('b5', '', joined).msg).toMatch(/joined/);
    const added = runsFor(bug('b5'), ([a, b]) => ok([a, b], [`First number: ${a}`, `Second number: ${b}`, String(+a + +b)]));
    expect(evalBug('b5', '', added).pass).toBe(true);
    const floats = runsFor(bug('b5'), ([a, b]) => ok([a, b], [`First number: ${a}`, `Second number: ${b}`, (+a + +b).toFixed(1)]));
    expect(evalBug('b5', '', floats).pass).toBe(true);
  });
});

describe('build it: cinema ticket machine', () => {
  const CODE = [
    'name = input("Name? ")',
    'tickets = int(input("How many tickets? "))',
    'price = 7',
    'total = tickets * price',
    'print(name + ", your " + str(tickets) + " tickets cost £" + str(total))',
  ].join('\n');
  const runs = BUILD_TESTS.map(([n, t]) => ok([n, t], [`Name? ${n}`, `How many tickets? ${t}`, `${n}, your ${t} tickets cost £${t * 7}`]));

  test('a model answer ticks every requirement', () => {
    const r = evalBuild(CODE, runs);
    expect(r.results).toEqual(BUILD_CHECK.reqs.map(() => true));
    expect(r.pass).toBe(true);
  });

  test('an f-string or commas are fine too (shape, not one exact way)', () => {
    const fcode = CODE.replace(/print\(.*\)/, 'print(f"{name}, that is £{total} please")');
    const fruns = BUILD_TESTS.map(([n, t]) => ok([n, t], [`Name? ${n}`, `How many tickets? ${t}`, `${n}, that is £${t * 7} please`]));
    expect(evalBuild(fcode, fruns).pass).toBe(true);
  });

  test('hard-coding 7 in the sum (no price variable) fails only that requirement', () => {
    const r = evalBuild(CODE.replace('price = 7\n', '').replace('* price', '* 7'), runs);
    expect(r.results).toEqual([true, true, false, true, true]);
    expect(r.msg).toMatch(/price/);
  });

  test('printing the total on its own line (no sentence) fails the last requirement', () => {
    const bare = BUILD_TESTS.map(([n, t]) => ok([n, t], [`Name? ${n}`, `How many tickets? ${t}`, String(t * 7)]));
    const r = evalBuild(CODE, bare);
    expect(r.results[4]).toBe(false);
  });

  test('asking for tickets first (ValueError) explains the order', () => {
    const crashed = BUILD_TESTS.map(i => fail(i, "ValueError: invalid literal for int() with base 10: 'Ava'"));
    expect(evalBuild(CODE, crashed).msg).toMatch(/name FIRST/);
  });
});

describe('extension 1: copy the machine', () => {
  const CODE = 'money = int(input("How much pocket money do you get each week? "))\nweeks = int(input("How many weeks will you save for? "))\nprint("In " + str(weeks) + " weeks you will have £" + str(money * weeks))';
  const runFor = ([m, w]) => ok([m, w], [`How much pocket money do you get each week? ${m}`, `How many weeks will you save for? ${w}`, `In ${w} weeks you will have £${m * w}`]);
  test('matching every test run passes', () => {
    expect(evalExt1(CODE, EXT1_TESTS.map(runFor)).pass).toBe(true);
  });
  test('a hard-coded sentence fails on the second test', () => {
    const runs = EXT1_TESTS.map(([m, w]) => ok([m, w], ['q? ' + m, 'q? ' + w, 'In 6 weeks you will have £30']));
    expect(evalExt1(CODE, runs).pass).toBe(false);
  });
  test('only one input() is caught before running', () => {
    expect(evalExt1('print("In 6 weeks you will have £30")', []).msg).toMatch(/twice/);
  });
});

describe('extension 2: pizza planner', () => {
  const runFor = ([p]) => ok([p], ['=== Pizza Party Planner ===', `How many people are coming? ${p}`, `You need ${p * 3} slices`, `Order ${(p * 3 / 8).toFixed(1).replace(/(\.\d)0$/, '$1')} pizzas`]);
  test('the fully fixed planner passes', () => {
    expect(evalExt2('', EXT2_TESTS.map(runFor)).pass).toBe(true);
  });
  test('the uncast version (888 slices) is caught', () => {
    const runs = EXT2_TESTS.map(([p]) => ok([p], ['=== Pizza Party Planner ===', `q ${p}`, `You need ${p.repeat(3)} slices`, 'Order 3.0 pizzas']));
    expect(evalExt2('', runs).msg).toMatch(/You need 24 slices/);
  });
  test('a crash names the next error to fix', () => {
    expect(evalExt2('', [fail(['8'], "NameError: name 'pizza' is not defined")]).msg).toMatch(/NameError/);
  });
});

describe('design studio badges', () => {
  const CODE = [
    'print("==========")',
    'name = input("Name? ")',
    'age = int(input("Age? "))',
    'height = float(input("Height in m? "))',
    'months = age * 12',
    'print(name + " is " + str(months) + " months old")',
    'print()',
    'age = age - 1',
    'half = height / 2',
    'print(half + 1)',
  ].join('\n');
  const run = ok(badgeInputs(CODE), ['==========', 'Name? 7', 'Age? 7', 'Height in m? 7', '7 is 84 months old', '', '4.5']);

  test('badgeInputs gives one answer per input()', () => {
    expect(badgeInputs(CODE)).toEqual(['7', '7', '7']);
  });

  test('earns the badges its shape deserves, and not the others', () => {
    const { earned } = evalBadges(CODE, run);
    expect(earned).toEqual(expect.arrayContaining(['chatter', 'cruncher', 'decimal', 'stitcher', 'maths', 'keeper', 'swapper', 'namer', 'space', 'banner']));
    expect(earned).not.toContain('interview');
    expect(earned).not.toContain('story');
    expect(earned).not.toContain('all');
  });

  test('a crashed run earns nothing', () => {
    expect(evalBadges(CODE, fail([], 'NameError')).earned).toEqual([]);
  });

  test('+ inside a text join does not count towards Maths master', () => {
    const code = 'a = 5\nb = a - 1\nc = a * b\nd = c / 2\nprint("x" + str(d))';
    expect(evalBadges(code, ok([], ['x10.0'])).earned).not.toContain('maths');
  });

  test('short names (x, y) miss Good names', () => {
    expect(evalBadges('x = 1\ny = 2\nzed = 3\nprint(x)', ok([], ['1'])).earned).not.toContain('namer');
  });

  test('every badge has an icon, name and description', () => {
    for (const b of BADGES) expect(b.icon && b.name && b.desc).toBeTruthy();
  });
});
