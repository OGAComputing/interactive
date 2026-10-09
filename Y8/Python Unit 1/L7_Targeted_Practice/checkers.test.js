import { describe, test, expect } from 'vitest';
import {
  ITEMS, itemById, itemMax, TARGETS, targetById, CHAIN, targetScores, choosePlan, readSnapshot,
  drawCheckpoint, poolQuestion, cpOptionOrder, markCheckpoint, rightAnswer, applyFor, evalApply,
  writeItemFor, REQ_HINTS, inputPrompts, inputCount, evalMake, MAKE_REQS, MAKE_STRETCH, IDEAS,
  lessonScore, targetDone, realSentence, questionNumber,
} from './checkers.js';

// A fake runPython result: each input() is echoed as "prompt + answer" on its own line,
// then whatever the program printed.
const run = (inputs, printed, ok = true) => ({
  inputs, ok,
  output: [...inputs.map(a => 'Q? ' + a), ...printed].join('\n') + '\n',
});
const crash = (inputs, err) => ({ inputs, ok: false, output: `Traceback (most recent call last):\n  File "main.py", line 2\n${err}` });
const full = Object.fromEntries(ITEMS.filter(i => !i.bonus).map(i => [i.id, itemMax(i)]));
const FORBIDDEN = /\b(elif|while|for|def|import|return)\b|\[/;
const codeOnly = s => s.replace(/"[^"\n]*"/g, '""');   // words inside strings don't count

// ── The targets cover the assessment exactly ─────────────────────────────────

describe('targets', () => {
  test('every core assessment item is in exactly one target; the bonus is in none', () => {
    const seen = TARGETS.flatMap(t => t.items);
    expect(new Set(seen).size).toBe(seen.length);
    for (const it of ITEMS) expect(seen.includes(it.id), it.id).toBe(!it.bonus);
  });

  test('target marks add up to the assessment total (49)', () => {
    expect(targetScores({}).reduce((s, t) => s + t.max, 0)).toBe(49);
  });

  test('every target has a rule, an example, a pool of at least 2 × CHAIN and (except write) a code task', () => {
    for (const t of TARGETS) {
      expect(t.rule.length, t.id).toBeGreaterThanOrEqual(2);
      expect(t.example.code, t.id).toBeTruthy();
      expect(t.pool.length, t.id).toBeGreaterThanOrEqual(CHAIN * 2);
      expect(new Set(t.pool.map(q => q.id)).size, t.id).toBe(t.pool.length);
      if (t.id !== 'write') expect(t.apply.starter, t.id).toBeTruthy();
    }
  });

  test('pool questions are well formed: 4 different options, or a typed answer', () => {
    for (const t of TARGETS) for (const q of t.pool) {
      if (q.kind === 'mcq') {
        expect(q.opts.length, q.id).toBe(4);
        expect(new Set(q.opts).size, q.id).toBe(4);
      } else {
        expect(['output', 'value', 'number'], q.id).toContain(q.as);
        expect(q.answer, q.id).toBeDefined();
      }
      expect(q.why, q.id).toBeTruthy();
    }
  });

  test('the right answer is not the longest option on half the questions or more', () => {
    const mcqs = TARGETS.flatMap(t => t.pool).filter(q => q.kind === 'mcq');
    const longest = mcqs.filter(q => q.opts[0].length > Math.max(...q.opts.slice(1).map(o => o.length)));
    expect(longest.length / mcqs.length).toBeLessThan(0.5);
  });

  test('nothing beyond Lesson 5 appears (no loops, elif, functions, imports or lists)', () => {
    for (const t of TARGETS) {
      for (const q of t.pool) if (q.code) expect(codeOnly(q.code), q.id).not.toMatch(FORBIDDEN);
      if (t.apply) expect(codeOnly(t.apply.starter), t.id).not.toMatch(FORBIDDEN);
      expect(codeOnly(t.example.code), t.id).not.toMatch(FORBIDDEN);
    }
    for (const i of IDEAS) if (i.sample) expect(JSON.stringify(i.sample)).not.toMatch(/\[\s*\]/);
  });

  test('question numbers match the assessment', () => {
    expect(questionNumber('o_print')).toBe('1.1');
    expect(questionNumber('v_order')).toBe('2.3');
    expect(questionNumber('w_make')).toBe('6.2');
    expect(questionNumber('x_speed')).toBe('★1');
  });
});

// ── Routing ──────────────────────────────────────────────────────────────────

describe('choosePlan', () => {
  test('full marks → nothing to fix', () => {
    expect(choosePlan(full)).toEqual([]);
  });

  test('nothing right → the foundations first (lowest share ties go to the earlier lesson)', () => {
    expect(choosePlan({})).toEqual(['print', 'errors', 'variables']);
  });

  test('picks the lowest share, then shows the plan in lesson order', () => {
    const pts = { ...full, w_make: 1, w_warm: 0, c_fix: 0, c_join: 0, s_boundary: 0 };
    // write 1/8, cast_int 1/4, conditions 1/2
    expect(choosePlan(pts)).toEqual(['cast_int', 'conditions', 'write']);
  });

  test('only targets with marks lost, never more than 3', () => {
    expect(choosePlan({ ...full, i_trace: 0 })).toEqual(['input']);
    expect(choosePlan({ ...full, o_print: 0, v_quotes: 0, i_store: 0, c_int: 0, s_equals: 0 })).toHaveLength(3);
  });

  test('a mark above the maximum is capped', () => {
    expect(targetScores({ ...full, o_print: 99 }).find(s => s.id === 'print').earned).toBe(5);
  });
});

describe('readSnapshot', () => {
  test('reads the assessment\'s own saved state', () => {
    const s = readSnapshot({ seed: 5, pts: { o_print: 1, v_trace: 3 }, sel: { o_print: 2 }, code: { ed_o_fix: 'x' } }, 'local');
    expect(s).toMatchObject({ source: 'local', seed: 5, points: { o_print: 1, v_trace: 3 }, sel: { o_print: 2 } });
  });

  test('reads the Drive results payload (old payloads without answers too)', () => {
    expect(readSnapshot({ points: { c_fix: 1 }, sections: {}, pct: 10 }, 'drive')).toMatchObject({ points: { c_fix: 1 }, seed: null, sel: {} });
  });

  test('rejects missing or empty data and ignores unknown ids', () => {
    expect(readSnapshot(null)).toBeNull();
    expect(readSnapshot({ pts: {} })).toBeNull();
    expect(readSnapshot({ pts: { nope: 3 } })).toBeNull();
    expect(readSnapshot({ pts: { o_print: 5, nope: 1 } }).points).toEqual({ o_print: 1 });
  });
});

// ── Checkpoints ──────────────────────────────────────────────────────────────

describe('checkpoints', () => {
  test('a draw is CHAIN different questions, the same on reload, new on a restart', () => {
    const a = drawCheckpoint('print', 42, 0);
    expect(a).toHaveLength(CHAIN);
    expect(new Set(a).size).toBe(CHAIN);
    expect(drawCheckpoint('print', 42, 0)).toEqual(a);
    const draws = [0, 1, 2, 3, 4].map(n => drawCheckpoint('print', 42, n).join());
    expect(new Set(draws).size).toBeGreaterThan(1);
  });

  test('option order is a permutation', () => {
    expect([...cpOptionOrder('errors', 'e1', 7, 0)].sort()).toEqual([0, 1, 2, 3]);
  });

  test('multiple choice: only option 0 is right', () => {
    const q = poolQuestion('print', 'p1');
    expect(markCheckpoint(q, 0).ok).toBe(true);
    expect(markCheckpoint(q, 2).ok).toBe(false);
  });

  test('typed numbers', () => {
    const q = poolQuestion('print', 'p2');
    expect(markCheckpoint(q, ' 3 ').ok).toBe(true);
    expect(markCheckpoint(q, '2').ok).toBe(false);
    expect(markCheckpoint(q, '').ok).toBe(false);
  });

  test('typed values: text in quotes, numbers without', () => {
    const txt = poolQuestion('variables', 'v1'), num = poolQuestion('variables', 'v5');
    expect(markCheckpoint(txt, '"blue"').ok).toBe(true);
    expect(markCheckpoint(txt, "'blue'").ok).toBe(true);
    expect(markCheckpoint(txt, 'blue')).toMatchObject({ ok: false, msg: expect.stringMatching(/quotes/) });
    expect(markCheckpoint(num, '8').ok).toBe(true);
    expect(markCheckpoint(num, '"8"')).toMatchObject({ ok: false, msg: expect.stringMatching(/no quotes/) });
    expect(rightAnswer(txt)).toBe('"blue"');
    expect(rightAnswer(num)).toBe('8');
  });

  test('typed output: case and extra spaces forgiven, a missing space is not', () => {
    const q = poolQuestion('input', 'n3');   // Hi Ali!
    expect(markCheckpoint(q, 'hi  ali!').ok).toBe(true);
    expect(markCheckpoint(q, 'HiAli!')).toMatchObject({ ok: false, msg: expect.stringMatching(/spaces/) });
    expect(markCheckpoint(q, '"Hi Ali!"')).toMatchObject({ ok: false, msg: expect.stringMatching(/quotes/) });
    expect(markCheckpoint(poolQuestion('input', 'n2'), 'HiAli').ok).toBe(true);
  });
});

// ── Use it ───────────────────────────────────────────────────────────────────

describe('code tasks (fake runs; tests/unit1-targeted-practice.spec.js runs them in real Python)', () => {
  const task = id => applyFor(id);

  test('print: the blank line is required and named', () => {
    const t = task('print');
    expect(evalApply(t, '', [crash([], 'SyntaxError: \'(\' was never closed')])).toMatchObject({ ok: false, msg: expect.stringMatching(/SyntaxError/) });
    const noBlank = evalApply(t, '', [run([], ['SCHOOL DISCO', 'Friday at 7pm', 'Tickets cost £2', 'Bring a friend!'])]);
    expect(noBlank).toMatchObject({ ok: false, msg: expect.stringMatching(/add a print\(\) line/) });
    expect(evalApply(t, '', [run([], ['SCHOOL DISCO', '', 'Friday at 7pm', 'Tickets cost £2', 'Bring a friend!'])]).ok).toBe(true);
  });

  test('errors: typing the word Rovers in instead of using the variable is not a fix', () => {
    const t = task('errors');
    const out = [run([], ['Your team is Rovers', 'Come on Rovers!'])];
    expect(evalApply(t, 'team = "Rovers"\nprint("Your team is " + team)\nprint("Come on " + team + "!")', out).ok).toBe(true);
    expect(evalApply(t, 'team = "Rovers"\nprint("Your team is Rovers")\nprint("Come on " + team + "!")', out))
      .toMatchObject({ ok: false, msg: expect.stringMatching(/variable team/) });
  });

  test('variables: the print lines must stay; the new line goes between them', () => {
    const t = task('variables');
    const good = 'pet = "cat"\nprint("I have a " + pet)\npet = "dog"\nprint("Now I have a " + pet)';
    expect(evalApply(t, good, [run([], ['I have a cat', 'Now I have a dog'])]).ok).toBe(true);
    expect(evalApply(t, 'pet = "cat"\nprint("I have a " + pet)\nprint("Now I have a dog")', [run([], ['I have a cat', 'Now I have a dog'])]))
      .toMatchObject({ ok: false, msg: expect.stringMatching(/stay exactly/) });
    expect(evalApply(t, '', [run([], ['I have a dog', 'Now I have a dog'])])).toMatchObject({ ok: false, msg: expect.stringMatching(/after the first print/) });
  });

  test('input: both bugs, with the missing space named', () => {
    const t = task('input');
    expect(evalApply(t, '', [run(['red'], ['Your favourite colour isred']), run(['blue'], ['Your favourite colour isblue'])]))
      .toMatchObject({ ok: false, msg: expect.stringMatching(/does not add a space/) });
    expect(evalApply(t, '', [run(['red'], ['Your favourite colour is red']), run(['blue'], ['Your favourite colour is blue'])]).ok).toBe(true);
  });

  test('cast_int: still joining is spotted; adding passes', () => {
    const t = task('cast_int');
    expect(evalApply(t, '', [run(['7', '5'], ['Total points: 75']), run(['10', '20'], ['Total points: 1020'])]))
      .toMatchObject({ ok: false, msg: expect.stringMatching(/still joins/) });
    expect(evalApply(t, '', [run(['7', '5'], ['Total points: 12']), run(['10', '20'], ['Total points: 30'])]).ok).toBe(true);
  });

  test('cast_str: str(age) + str(1) → "121" is spotted', () => {
    const t = task('cast_str');
    expect(evalApply(t, '', [run(['12'], ['Next year you will be 121']), run(['9'], ['Next year you will be 91'])]))
      .toMatchObject({ ok: false, msg: expect.stringMatching(/Do the maths first/) });
    expect(evalApply(t, '', [run(['12'], ['Next year you will be 13']), run(['9'], ['Next year you will be 10'])]).ok).toBe(true);
  });

  test('branches: Thanks must print for everyone', () => {
    const t = task('branches');
    const half = [run(['5'], ['Book now!']), run(['0'], ['Sold out', 'Thanks for visiting']), run(['1'], ['Book now!'])];
    expect(evalApply(t, '', half)).toMatchObject({ ok: false, msg: expect.stringMatching(/Take away its indent/) });
    const ok = [run(['5'], ['Book now!', 'Thanks for visiting']), run(['0'], ['Sold out', 'Thanks for visiting']), run(['1'], ['Book now!', 'Thanks for visiting'])];
    expect(evalApply(t, '', ok).ok).toBe(true);
  });

  test('conditions: == 60 and > 60 each get their own pointer', () => {
    const t = task('conditions');
    const r = (a, b, c) => [run(['60'], [a]), run(['59'], [b]), run(['75'], [c])];
    expect(evalApply(t, '', r('Free bus pass', 'Full fare', 'Full fare'))).toMatchObject({ ok: false, msg: expect.stringMatching(/only matches exactly 60/) });
    expect(evalApply(t, '', r('Full fare', 'Full fare', 'Free bus pass'))).toMatchObject({ ok: false, msg: expect.stringMatching(/includes 60/) });
    expect(evalApply(t, '', r('Free bus pass', 'Full fare', 'Free bus pass')).ok).toBe(true);
  });

  test('extra lines are wrong (it must print exactly the lines)', () => {
    expect(evalApply(task('input'), '', [run(['red'], ['Your favourite colour is red', 'Hi']), run(['blue'], ['Your favourite colour is blue'])]).ok).toBe(false);
  });
});

describe('the write target improves the student\'s own assessment program', () => {
  test('w_make when it lost marks, w_warm only when the game shop was full marks', () => {
    expect(writeItemFor({})).toBe('w_make');
    expect(writeItemFor({ w_make: 6, w_warm: 1 })).toBe('w_warm');
    expect(writeItemFor({ w_make: 6, w_warm: 2 })).toBe('w_make');
  });

  test('starts from the student\'s own code when there is any', () => {
    const mine = 'name = input("Name? ")\nprint(name)';
    expect(applyFor('write', { w_make: 2 }, { ed_w_make: mine })).toMatchObject({ kind: 'reqs', starter: mine, own: true });
    expect(applyFor('write', { w_make: 2 }, {})).toMatchObject({ own: false, starter: itemById('w_make').starter });
    expect(applyFor('write', { w_make: 2 }, { ed_w_make: itemById('w_make').starter }).own).toBe(false);
  });

  test('requirement hints line up with the requirements', () => {
    for (const id of ['w_warm', 'w_make', 'x_speed']) expect(REQ_HINTS[id]).toHaveLength(itemById(id).reqs.length);
  });

  test('a partial game shop names the requirement and gives a tip', () => {
    const t = applyFor('write');
    const code = 'name = input("Name? ")\nage = int(input("Age? "))\nif age > 12:\n    print("Yes " + name)\nelse:\n    print("No " + name)';
    const runs = [['Ava', '15', 'Yes Ava'], ['Ben', '12', 'No Ben'], ['Leo', '9', 'No Leo'], ['Mia', '11', 'No Mia']]
      .map(([n, a, out]) => run([n, a], [out]));
    const r = evalApply(t, code, runs);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/Requirement 4.*Tip: 12 itself/);
  });
});

// ── 🎨 Make it ───────────────────────────────────────────────────────────────

describe('make it', () => {
  const RIDE = 'height = int(input("How tall are you in cm? "))\nif height >= 140:\n    print("In you get!")\nelse:\n    print("Sorry, you need " + str(140 - height) + " more cm")\nprint("Thanks for visiting")';

  test('the test plan is labelled with each input() prompt', () => {
    expect(inputPrompts(RIDE)).toEqual(['How tall are you in cm? ']);
    expect(inputPrompts('a = input()\n# b = input("no")\nb = input(\'Name? \')')).toEqual(['', 'Name? ']);
    expect(inputCount('x = input("input(")')).toBe(1);
  });

  test('a ride checker with a good test plan meets everything', () => {
    const runs = [run(['150'], ['In you get!', 'Thanks for visiting']), run(['135'], ['Sorry, you need 5 more cm', 'Thanks for visiting'])];
    const r = evalMake(RIDE, [['150'], ['135']], runs);
    expect(r.core).toEqual([true, true, true, false]);    // no answer in a message
    expect(r.stretch).toEqual([false, true, true]);
  });

  test('a quiz with == on text and the answer in the message', () => {
    const code = 'answer = input("Capital of France? ")\nif answer == "Paris":\n    print("Yes! " + answer + " is right")\nelse:\n    print("No, not " + answer)';
    const runs = [run(['Paris'], ['Yes! Paris is right']), run(['Rome'], ['No, not Rome'])];
    expect(evalMake(code, [['Paris'], ['Rome']], runs).core).toEqual([true, true, true, true]);
  });

  test('two tests down the same path fail requirement 3, even when the answer is in the message', () => {
    const code = 'name = input("Name? ")\nif name == "x":\n    print("Hello " + name)\nelse:\n    print("Hello " + name)';
    const runs = [run(['Ann'], ['Hello Ann']), run(['Bob'], ['Hello Bob'])];
    const r = evalMake(code, [['Ann'], ['Bob']], runs);
    expect(r.core).toEqual([true, true, false, true]);
    expect(r.msg).toMatch(/Requirement 3/);
  });

  test('the same answers twice, unfilled boxes and crashes each get their own message', () => {
    const code = 'n = int(input("N? "))\nif n > 5:\n    print("Big")\nelse:\n    print("Small")';
    expect(evalMake(code, [['3'], ['3']], [run(['3'], ['Small']), run(['3'], ['Small'])]).msg).toMatch(/same answers/);
    expect(evalMake(code, [['3'], ['']], [run(['3'], ['Small']), run([''], [])]).msg).toMatch(/Fill in every answer/);
    expect(evalMake(code, [['x'], ['9']], [crash(['x'], 'ValueError: invalid literal'), run(['9'], ['Big'])]).msg).toMatch(/ValueError/);
  });

  test('no input, no if/else → requirements 1 and 2 fail', () => {
    const r = evalMake('print("Hi")', [[], []], [run([], ['Hi']), run([], ['Hi'])]);
    expect(r.core.slice(0, 2)).toEqual([false, false]);
    expect(r.msg).toMatch(/Requirement 1/);
  });

  test('a number in the message is not mistaken for the answer inside another number', () => {
    const code = 'n = int(input("N? "))\nif n > 5:\n    print("Level 15")\nelse:\n    print("Level 3")';
    const runs = [run(['5'], ['Level 3']), run(['6'], ['Level 15'])];
    expect(evalMake(code, [['5'], ['6']], runs).core[3]).toBe(false);
  });

  test('requirements and stretches have text and hints', () => {
    for (const r of [...MAKE_REQS, ...MAKE_STRETCH]) { expect(r.text).toBeTruthy(); expect(r.hint).toBeTruthy(); }
    expect(IDEAS.some(i => i.id === 'own')).toBe(true);
  });
});

// ── Score ────────────────────────────────────────────────────────────────────

describe('lessonScore', () => {
  test('targets count 2 each, the Make 4; first-time checkpoints give the last 20%', () => {
    const plan = ['print', 'input', 'write'];
    expect(lessonScore({ plan })).toMatchObject({ total: 10, done: 0, pct: 0 });
    const all = { plan, cp: { print: { done: true, attempt: 0 }, input: { done: true, attempt: 2 }, write: { done: true, attempt: 0 } },
                  applied: { print: true, input: true, write: true }, make: { core: 4, stretch: 1 } };
    expect(lessonScore(all)).toMatchObject({ done: 10, mastered: 9, pct: 98, complete: true, gold: false, bonus: 1 });
    all.cp.input.attempt = 0;
    expect(lessonScore(all)).toMatchObject({ pct: 100, gold: true });
  });

  test('full marks in the assessment → just the Make', () => {
    expect(lessonScore({ plan: [], make: { core: 2 } })).toMatchObject({ total: 4, pct: 50 });
  });

  test('extra targets and the challenge are bonus', () => {
    const s = { plan: [], extra: ['print'], cp: { print: { done: true } }, applied: { print: true, challenge: true } };
    expect(lessonScore(s)).toMatchObject({ pct: 0, bonus: 2 });
    expect(targetDone(s, 'print')).toBe(true);
    expect(targetDone(s, 'input')).toBe(false);
  });
});

describe('realSentence', () => {
  test.each([
    ['Next time I will put a space inside the quotes', true],
    ['I will check the spaces', true],
    ['idk', false],
    ['asdf asdf asdf asdf', false],
    ['aaaaaaaaaaaaaaaaaaaa', false],
    ['the the the the the the', false],
  ])('%s → %s', (t, want) => expect(realSentence(t)).toBe(want));
});

describe('targetById', () => {
  test('finds every target', () => { for (const t of TARGETS) expect(targetById(t.id)).toBe(t); });
});
