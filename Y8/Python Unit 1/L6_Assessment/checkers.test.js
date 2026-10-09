import { describe, test, expect } from 'vitest';
import {
  printedLines, mulberry32, shuffle, variantOf, optionOrder,
  ITEMS, SECTIONS, itemById, itemMax, summarise,
  checkTraceValue, checkTraceOutput, markSort,
  evalCode, ifElseLines, branchChoices, branchAnswer,
} from './checkers.js';

// A run as runPython() reports it: each input() echoes "prompt + answer" on its own line.
const ok = (inputs, lines) => ({ inputs, ok: true, output: lines.join('\n') + '\n' });
const fail = (inputs, msg) => ({ inputs, ok: false, output: msg });
const mcqs = ITEMS.filter(i => i.kind === 'mcq');

describe('question bank', () => {
  test('every item belongs to a section, ids are unique', () => {
    const ids = SECTIONS.map(s => s.id);
    for (const it of ITEMS) expect(ids).toContain(it.section);
    expect(new Set(ITEMS.map(i => i.id)).size).toBe(ITEMS.length);
  });

  test('every multiple-choice question (and version) has 4 distinct options and a reason', () => {
    for (const q of mcqs) {
      for (const v of q.variants || [q]) {
        const opts = v.opts || q.opts;
        expect(opts).toHaveLength(4);
        expect(new Set(opts).size).toBe(4);
      }
      expect(q.why.length).toBeGreaterThan(20);
    }
  });

  test('the right answer is not the longest option on half the questions or more', () => {
    const longest = mcqs.filter(q => {
      const o = variantOf(q, 0).opts;
      return o[0].length > Math.max(...o.slice(1).map(x => x.length));
    });
    expect(longest.length).toBeLessThan(mcqs.length / 2);
  });

  test('nothing beyond Lessons 1–5 appears (no loops, elif, functions or lists)', () => {
    const text = JSON.stringify(ITEMS.map(i => [i.code, i.starter, i.variants, i.opts]));
    expect(text).not.toMatch(/\b(while|for|elif|def|import)\b|\[\s*\d/);
  });

  test('every version of an item is worth the same marks', () => {
    for (const it of ITEMS.filter(i => i.variants)) {
      const maxes = it.variants.map((_, k) => itemMax(it, k));
      expect(new Set(maxes).size).toBe(1);
    }
  });

  test('marks: 49 in the grade, 4 bonus; writing is no more than a quarter', () => {
    const s = summarise({}, 0);
    expect(s.max).toBe(49);
    expect(s.sections.ext.max).toBe(4);
    expect(s.sections.write.max / s.max).toBeLessThanOrEqual(0.25);
  });

  test('summarise keeps the bonus out of the percentage', () => {
    const all = Object.fromEntries(ITEMS.filter(i => !i.bonus).map(i => [i.id, itemMax(i, 0)]));
    expect(summarise(all, 0).pct).toBe(100);
    expect(summarise({ ...all, x_speed: 3 }, 0)).toMatchObject({ pct: 100, bonus: 3 });
  });
});

describe('per-student randomness', () => {
  test('same seed → same order; shuffle keeps every item', () => {
    const a = shuffle([1, 2, 3, 4, 5, 6], mulberry32(42));
    expect(shuffle([1, 2, 3, 4, 5, 6], mulberry32(42))).toEqual(a);
    expect([...a].sort()).toEqual([1, 2, 3, 4, 5, 6]);
  });
  test('option orders differ between items for one seed and are stable', () => {
    expect(optionOrder('o_print', 4, 5)).toEqual(optionOrder('o_print', 4, 5));
    const orders = mcqs.map(q => optionOrder(q.id, 4, 5).join(''));
    expect(new Set(orders).size).toBeGreaterThan(3);
  });
  test('different seeds give different versions', () => {
    const it = itemById('v_trace');
    const seen = new Set([0, 1, 2, 3, 4, 5].map(s => variantOf(it, s).output[0]));
    expect(seen.size).toBe(3);
  });
});

describe('trace marking', () => {
  const str = v => ({ type: 'str', value: v });
  test('text is right with or without quotes (either kind); a quoted number is not', () => {
    expect(checkTraceValue(str('Tommy'), '"Tommy"').ok).toBe(true);
    expect(checkTraceValue(str('Tommy'), "'Tommy'").ok).toBe(true);
    expect(checkTraceValue(str('Tommy'), 'Tommy').ok).toBe(true);
    expect(checkTraceValue(str('Tommy'), '"Tom"').ok).toBe(false);
    expect(checkTraceValue({ type: 'int', value: 8 }, '8').ok).toBe(true);
    expect(checkTraceValue({ type: 'int', value: 8 }, '"8"').msg).toMatch(/quotes/);
  });
  test('output: case and extra spaces forgiven; a missing space is not', () => {
    expect(checkTraceOutput('HelloSam!', 'hellosam!').ok).toBe(true);
    expect(checkTraceOutput('Tom has a cat', 'Tom  has a cat ').ok).toBe(true);
    const r = checkTraceOutput('HelloSam!', 'Hello Sam!');
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/spaces/);
    expect(checkTraceOutput('HelloSam!', '"HelloSam!"').msg).toMatch(/quotes/);
  });
});

describe('selection rows', () => {
  test('each row answer points at the right printed outcome', () => {
    const v = variantOf(itemById('s_branch'), 0);
    const c = branchChoices(v);
    expect(c[branchAnswer(['72', 'a'])]).toBe(`${v.a}, then ${v.after}`);
    expect(c[branchAnswer(['49', 'b'])]).toBe(`${v.b}, then ${v.after}`);
  });
  test('every version tests the boundary value itself', () => {
    for (const v of itemById('s_branch').variants) {
      const n = Number(v.code.match(/[<>]=?\s*(\d+)/)[1]);
      expect(v.rows.some(([typed]) => Number(typed) === n)).toBe(true);
    }
  });
});

describe('sort', () => {
  const item = itemById('c_sort');
  const right = Object.fromEntries(item.cards.map(c => [c.id, c.bin]));
  test('all right = 3 marks; one mark per two cards', () => {
    expect(markSort(item, right).pts).toBe(3);
    expect(markSort(item, { ...right, k1: 'maths' }).pts).toBe(2);
    expect(markSort(item, { ...right, k1: 'maths', k2: 'join' }).pts).toBe(2);
    expect(markSort(item, { ...right, k1: 'maths', k2: 'join', k3: 'join' }).pts).toBe(1);
  });
  test('reports unplaced cards', () => {
    const { k6, ...rest } = right;
    expect(markSort(item, rest).placed).toBe(false);
  });
});

describe('fix-it items', () => {
  test('o_fix: the starter fails, the fixed program passes', () => {
    const it = itemById('o_fix');
    expect(evalCode(it, it.starter, [fail([], 'SyntaxError: unterminated string literal')]).pts).toBe(0);
    const fixed = ok([], ['Welcome to the quiz!', 'Good luck', 'Question 1 is coming up']);
    expect(evalCode(it, '', [fixed]).pts).toBe(1);
    expect(evalCode(it, '', [ok([], ['Welcome to the quiz!', 'Question 1 is coming up'])]).pts).toBe(0);
  });

  test('i_fix: must use the typed animal (two different answers)', () => {
    const it = itemById('i_fix');
    const runs = [ok(['cat'], ['What is your favourite animal? cat', 'I like cats too!']),
                  ok(['owl'], ['What is your favourite animal? owl', 'I like owls too!'])];
    expect(evalCode(it, '', runs).pts).toBe(1);
    const faked = [runs[0], ok(['owl'], ['What is your favourite animal? owl', 'I like cats too!'])];
    expect(evalCode(it, '', faked).pts).toBe(0);
  });

  test('c_fix: 2 for the exact sentence, 1 for adding, 0 for still joining', () => {
    const it = itemById('c_fix');
    const run = (a, b, line) => ok([a, b], [`How many apples? ${a}`, `How many pears? ${b}`, line]);
    expect(evalCode(it, '', [run('5', '3', 'Fruit in the bowl: 8'), run('12', '30', 'Fruit in the bowl: 42')]).pts).toBe(2);
    expect(evalCode(it, '', [run('5', '3', '8'), run('12', '30', '42')])).toMatchObject({ pts: 1, results: [true, false] });
    expect(evalCode(it, '', [run('5', '3', 'Fruit in the bowl: 53'), run('12', '30', 'Fruit in the bowl: 1230')]).pts).toBe(0);
    const r = evalCode(it, '', [fail(['5', '3'], 'TypeError: can only concatenate str (not "int") to str')]);
    expect(r.pts).toBe(0);
    expect(r.msg).toMatch(/TypeError/);
    // The starter prints with a comma, so casting both answers with int() is the whole fix.
    expect(it.starter).toContain('print("Fruit in the bowl:", total)');
  });

  test('s_fix: each mark gets only its own message', () => {
    const it = itemById('s_fix');
    const run = (m, line) => ok([m], [`What was your mark? ${m}`, line]);
    const good = [run('60', 'Merit!'), run('59', 'Keep practising'), run('85', 'Merit!')];
    expect(evalCode(it, '', good).pts).toBe(1);
    const both = [ok(['60'], ['What was your mark? 60', 'Merit!', 'Keep practising']), good[1], good[2]];
    expect(evalCode(it, '', both).pts).toBe(0);
  });
});

describe('warm-up: change the threshold', () => {
  const it = itemById('w_warm');
  const run = (t, ...lines) => ok([t], [`What is the temperature? ${t}`, ...lines]);
  const hot = 'T-shirt weather!', cold = 'Take a coat.', bye = 'Have a good day!';

  test('both changes → 2 marks', () => {
    const runs = [run('25', hot, bye), run('24', cold, bye), run('31', hot, bye), run('10', cold, bye)];
    expect(evalCode(it, '', runs)).toMatchObject({ pts: 2, results: [true, true] });
  });
  test('unchanged threshold (24 is still hot) → only the bye mark', () => {
    const runs = [run('25', hot, bye), run('24', hot, bye), run('31', hot, bye), run('10', cold, bye)];
    expect(evalCode(it, '', runs)).toMatchObject({ pts: 1, results: [false, true] });
  });
  test('bye inside one branch only → no bye mark', () => {
    const runs = [run('25', hot, bye), run('24', cold), run('31', hot, bye), run('10', cold)];
    expect(evalCode(it, '', runs).results[1]).toBe(false);
  });
});

describe('write it: the game shop', () => {
  const it = itemById('w_make');
  const model = [
    'name = input("What is your name? ")',
    'age = int(input("How old are you? "))',
    'if age >= 12:',
    '    print(name + ", you can buy this game")',
    'else:',
    '    print("Sorry " + name + ", come back in " + str(12 - age) + " years")',
  ].join('\n');
  const yes = n => `${n}, you can buy this game`;
  const no = (n, a) => `Sorry ${n}, come back in ${12 - a} years`;
  const run = (n, a, line) => ok([n, a], [`What is your name? ${n}`, `How old are you? ${a}`, line]);
  const modelRuns = [run('Ava', '15', yes('Ava')), run('Ben', '12', yes('Ben')), run('Leo', '9', no('Leo', 9)), run('Mia', '11', no('Mia', 11))];

  test('the model answer gets all 6 marks', () => {
    expect(evalCode(it, model, modelRuns)).toMatchObject({ pts: 6 });
  });

  test('a different but valid shape also gets 6 (> 11, under-12 branch first, print with commas)', () => {
    const alt = 'n = input("Name: ")\na = int(input("Age: "))\nif a < 12:\n    print("Sorry", n, "- wait", 12 - a, "more years")\nelse:\n    print("Enjoy it,", n)';
    const runs = [
      ok(['Ava', '15'], ['Name: Ava', 'Age: 15', 'Enjoy it, Ava']),
      ok(['Ben', '12'], ['Name: Ben', 'Age: 12', 'Enjoy it, Ben']),
      ok(['Leo', '9'], ['Name: Leo', 'Age: 9', 'Sorry Leo - wait 3 more years']),
      ok(['Mia', '11'], ['Name: Mia', 'Age: 11', 'Sorry Mia - wait 1 more years']),
    ];
    expect(evalCode(it, alt, runs).pts).toBe(6);
  });

  test('> 12 instead of >= 12 loses only the boundary mark', () => {
    const runs = [modelRuns[0], run('Ben', '12', no('Ben', 12)), modelRuns[2], modelRuns[3]];
    const r = evalCode(it, model.replace('>=', '>'), runs);
    expect(r.results).toEqual([true, true, true, false, true, true]);
  });

  test('no years worked out → 5 marks', () => {
    const runs = modelRuns.map(r => r.inputs[1] < 12 ? run(r.inputs[0], r.inputs[1], `Sorry ${r.inputs[0]}, too young`) : r);
    expect(evalCode(it, model, runs).results).toEqual([true, true, true, true, true, false]);
  });

  test('no cast → it crashes, so only the shape marks count and the error is named', () => {
    const noCast = model.replace('int(input("How old are you? "))', 'input("How old are you? ")');
    const runs = WRITE_FAIL('TypeError: \'>=\' not supported between instances of \'str\' and \'int\'');
    const r = evalCode(it, noCast, runs);
    expect(r.results).toEqual([true, false, true, false, false, false]);
    expect(r.msg).toMatch(/TypeError/);
  });

  test('questions asked in the wrong order → ValueError, first mark lost and explained', () => {
    const runs = WRITE_FAIL('ValueError: invalid literal for int() with base 10: \'Ava\'');
    const r = evalCode(it, model, runs);
    expect(r.results[0]).toBe(false);
    expect(r.msg).toMatch(/Requirement 1/);
  });

  test('an empty program gets nothing', () => {
    expect(evalCode(it, '# Game shop till\n', [ok(['Ava', '15'], []), ok(['Ben', '12'], []), ok(['Leo', '9'], []), ok(['Mia', '11'], [])]).pts).toBe(0);
  });

  function WRITE_FAIL(msg) {
    return [['Ava', '15'], ['Ben', '12'], ['Leo', '9'], ['Mia', '11']].map(i => fail(i, msg));
  }
});

describe('extension: the speed camera', () => {
  const it = itemById('x_speed');
  const code = 'limit = int(input("What is the speed limit? "))\nspeed = int(input("How fast were you going? "))\n'
    + 'if speed > limit:\n    print("You were " + str(speed - limit) + " mph over the limit")';
  const commas = code.replace('print("You were " + str(speed - limit) + " mph over the limit")', 'print("You were", speed - limit, "mph over the limit")');
  const run = (l, s, ...lines) => ok([l, s], [`What is the speed limit? ${l}`, `How fast were you going? ${s}`, ...lines]);
  const good = [
    run('30', '36', 'You were 6 mph over the limit', 'Drive safely'),
    run('30', '30', 'Within the limit, thank you', 'Drive safely'),
    run('50', '72', 'You were 22 mph over the limit', 'Drive safely'),
    run('20', '15', 'Within the limit, thank you', 'Drive safely'),
  ];
  test('an exact copy built with + and str() gets all 4 bonus marks', () => {
    expect(evalCode(it, code, good).pts).toBe(4);
  });
  test('>= instead of > (30 at 30 counted as over) loses the third mark', () => {
    const runs = [good[0], run('30', '30', 'You were 0 mph over the limit', 'Drive safely'), good[2], good[3]];
    expect(evalCode(it, code, runs).results).toEqual([true, true, false, true]);
  });
  test('the same output printed with commas (no str()) loses only the str() mark', () => {
    expect(evalCode(it, commas, good).results).toEqual([true, true, true, false]);
  });
});

describe('short write-it tasks (one per lesson section)', () => {
  test('o_write: both lines exactly, and nothing else', () => {
    const it = itemById('o_write');
    expect(evalCode(it, '', [ok([], ['I am learning Python', 'It is fun'])]).pts).toBe(2);
    expect(evalCode(it, '', [ok([], ['I am learning Python'])]).results).toEqual([true, false]);
    expect(evalCode(it, '', [ok([], ['I am learning Python', 'It is fun', 'Bye'])]).results).toEqual([true, false]);
    expect(evalCode(it, it.starter, [ok([], [])]).pts).toBe(0);
  });

  test('v_write: the variable must be made AND used in the print()', () => {
    const it = itemById('v_write');
    const run = [ok([], ['blue'])];
    expect(evalCode(it, 'colour = "blue"\nprint(colour)', run).pts).toBe(2);
    expect(evalCode(it, "colour = 'Blue'\nprint(colour)", [ok([], ['Blue'])]).pts).toBe(2);
    expect(evalCode(it, 'colour = "blue"\nprint("blue")', run).results).toEqual([true, false]);
    expect(evalCode(it, 'colour = "blue"\nprint("colour")', [ok([], ['colour'])]).results).toEqual([true, false]);
    expect(evalCode(it, 'x = "blue"\nprint(x)', run).results).toEqual([false, false]);
    expect(evalCode(it, it.starter, [ok([], [])]).pts).toBe(0);
  });

  test('i_write: stores input() and says hello with the typed name', () => {
    const it = itemById('i_write');
    const code = 'name = input("What is your name? ")\nprint("Hello " + name)';
    const runs = n => [ok(['Sam'], ['What is your name? Sam', n('Sam')]), ok(['Priya'], ['What is your name? Priya', n('Priya')])];
    expect(evalCode(it, code, runs(x => `Hello ${x}`)).pts).toBe(2);
    expect(evalCode(it, code, runs(x => `Hi ${x}!`)).pts).toBe(2);
    expect(evalCode(it, code, runs(() => 'Hello Sam')).results).toEqual([true, false]);   // name typed in, not joined
    expect(evalCode(it, 'input("Name? ")\nprint("Hello")', runs(() => 'Hello')).pts).toBe(0);
  });

  test('c_write: int() and the age next year; the starter alone gets nothing', () => {
    const it = itemById('c_write');
    const run = (a, line) => ok([a], [`How old are you? ${a}`, line]);
    const model = 'age = int(input("How old are you? "))\nprint("Next year you will be", age + 1)';
    expect(evalCode(it, model, [run('12', 'Next year you will be 13'), run('7', 'Next year you will be 8')]).pts).toBe(2);
    expect(evalCode(it, model, [run('12', '13'), run('7', '8')]).pts).toBe(2);
    expect(evalCode(it, it.starter, [fail(['12'], 'TypeError: can only concatenate str (not "int") to str')]).pts).toBe(0);
  });

  test('s_write: if/else with ==, and the right message either side of 1234', () => {
    const it = itemById('s_write');
    const model = 'pin = int(input("Enter your PIN: "))\nif pin == 1234:\n    print("Unlocked")\nelse:\n    print("Wrong PIN")';
    const run = (p, line) => ok([p], [`Enter your PIN: ${p}`, line]);
    expect(evalCode(it, model, [run('1234', 'Unlocked'), run('1233', 'Wrong PIN'), run('1235', 'Wrong PIN')]).pts).toBe(2);
    const ge = [run('1234', 'Unlocked'), run('1233', 'Wrong PIN'), run('1235', 'Unlocked')];   // >= 1234
    expect(evalCode(it, model.replace('==', '>='), ge).results).toEqual([true, false]);
    expect(evalCode(it, it.starter, [run('1234', ''), run('1233', ''), run('1235', '')]).pts).toBe(0);
  });
});

describe('helpers', () => {
  test('printedLines drops input echoes and blank lines', () => {
    expect(printedLines(ok(['Ava'], ['Name? Ava', '', 'Hi Ava']))).toEqual(['Hi Ava']);
  });
  test('ifElseLines finds an if with an else lined up underneath', () => {
    expect(ifElseLines('if a > 1:\n    print("x")\nelse:\n    print("y")')).toHaveLength(1);
    expect(ifElseLines('if a > 1:\n    print("x")\nprint("y")')).toHaveLength(0);
  });
});
