import { describe, test, expect } from 'vitest';
import {
  ITEMS, LIVE_ITEMS, SECTIONS, itemById, itemMax, summarise, variantOf, evalCode,
  branchChoices, branchAnswer, checkTraceValue, checkTraceOutput,
  usesElif, usesWhile, usesFor, definedFunctions, calledAfterDef, drewOnly,
  cleanChoices, mergeChoices, stationState, inventoryRows, breachTools, VERSION, bonusBlockers,
} from './checkers.js';

// A run as runPython() reports it: each input() echoes "prompt + answer" on its own line.
const ok = (inputs, lines, drawing) => ({ inputs, ok: true, output: lines.join('\n') + (lines.length ? '\n' : ''), drawing });
const fail = (inputs, msg) => ({ inputs, ok: false, output: msg });
const mcqs = ITEMS.filter(i => i.kind === 'mcq');
const mark = (id, raw, runs) => evalCode(itemById(id), raw, runs);

// A turtle drawing of a regular n-sided shape (side 100), as turtle-canvas.js records it.
function polygon(n, len = 100) {
  const segs = [];
  let x = 0, y = 0, h = 0;
  for (let i = 0; i < n; i++) {
    const nx = x + len * Math.cos(h * Math.PI / 180), ny = y + len * Math.sin(h * Math.PI / 180);
    segs.push([x, y, nx, ny, 'black', 1, i]);
    x = nx; y = ny; h += 360 / n;
  }
  return { used: true, segs, fills: [], dots: [], texts: [], poses: [], bg: 'white' };
}
const line = { used: true, segs: [[0, 0, 100, 0, 'black', 1, 0], [100, 0, 200, 0, 'black', 1, 1], [200, 0, 300, 0, 'black', 1, 2], [300, 0, 400, 0, 'black', 1, 3]], fills: [], dots: [], texts: [], poses: [], bg: 'white' };

describe('question bank', () => {
  test('every item belongs to a section, ids are unique and prefixed by section', () => {
    const ids = SECTIONS.map(s => s.id);
    const PREFIX = { errors: 'e_', sequence: 'v_', selection: 's_', while: 'w_', for: 'f_', functions: 'd_', ext: ['x_', 'p_'] };   // p_till became a bonus in v2
    for (const it of ITEMS) {
      expect(ids).toContain(it.section);
      expect([PREFIX[it.section]].flat().some(p => it.id.startsWith(p)), it.id).toBe(true);
    }
    expect(new Set(ITEMS.map(i => i.id)).size).toBe(ITEMS.length);
  });

  test('every section has a room and one line of story', () => {
    for (const s of SECTIONS) { expect(s.room).toBeTruthy(); expect(s.story.length).toBeLessThan(90); }
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
    for (const seed of [0, 1, 2]) {
      const longest = mcqs.filter(q => {
        const o = variantOf(q, seed).opts;
        return o[0].length > Math.max(...o.slice(1).map(x => x.length));
      });
      expect(longest.length).toBeLessThan(mcqs.length / 2);
    }
  });

  test('49 marks across 6 sections (v2), and the bonus (cinema till + guessing game) is outside them', () => {
    for (const seed of [0, 1, 2, 3]) {
      const s = summarise({}, seed);
      expect(s.max).toBe(49);
      expect(s.sections.ext.max).toBe(8);
    }
  });

  test('each section opens with something to click and has a guided or worked code task', () => {
    for (const s of SECTIONS.filter(x => !x.bonus)) {
      const items = LIVE_ITEMS.filter(i => i.section === s.id);
      expect(['mcq', 'trace', 'branch']).toContain(items[0].kind);
      expect(items.some(i => i.howto)).toBe(true);
    }
  });

  test('every code task that starts from code has a worked example (how-to)', () => {
    for (const it of ITEMS.filter(i => (i.kind === 'fix' || i.resettable) && !i.bonus && !i.retired)) {
      expect(it.howto, it.id).toBeTruthy();
    }
  });

  test('summarise adds the best marks per section', () => {
    const s = summarise({ e_line: 1, e_fix: 1, v_trace: 4, x_guess: 3 });
    expect(s.sections.errors.earned).toBe(2);
    expect(s.earned).toBe(6);
    expect(s.bonus).toBe(3);
    expect(s.pct).toBe(Math.round(6 / 49 * 100));
  });
});

// Version 2: the changes made after the first sitting (MTP, Lesson 6, "Version 2").
describe('version 2', () => {
  test('is saved as version 3, and the trap and duplicate items are retired but kept for L7', () => {
    expect(VERSION).toBe(3);
    for (const id of ['s_order', 's_fix', 'd_fix', 'e_kind', 's_pick', 'f_range', 's_guide', 'w_fix']) {
      expect(itemById(id).retired, id).toBe(true);
      expect(LIVE_ITEMS.map(i => i.id)).not.toContain(id);
    }
  });

  test('the cinema till is a bonus and does not count in the %', () => {
    expect(itemById('p_till').bonus).toBe(true);
    const s = summarise({ p_till: 5, x_guess: 3 });
    expect(s.earned).toBe(0);
    expect(s.bonus).toBe(8);
  });

  test('the reassignment and functions traces have a short worked example from a different program', () => {
    for (const id of ['v_change', 'd_trace']) {
      const it = itemById(id);
      expect(it.example?.code, id).toBeTruthy();
      expect(it.example.text.replace(/<[^>]+>/g, '').length, id).toBeLessThan(70);
      for (const v of it.variants) expect(v.lines.join('\n')).not.toBe(it.example.code);
    }
  });

  test('v_trace builds confidence: no variable changes value, and no worked example', () => {
    const it = itemById('v_trace');
    expect(it.example).toBeUndefined();
    for (const v of it.variants) {
      const assigned = v.lines.map(l => l.match(/^(\w+) =/)?.[1]).filter(Boolean);
      expect(new Set(assigned).size).toBe(assigned.length);
    }
  });

  test('each section opens with a basic question: if (not elif), how many times a for loop runs, the call', () => {
    const first = sec => LIVE_ITEMS.find(i => i.section === sec).id;
    expect(first('selection')).toBe('s_if');
    expect(itemById('s_if').opts[0]).toBe('if');
    expect(first('for')).toBe('f_times');
    expect(first('functions')).toBe('d_call');
    expect(first('errors')).toBe('e_line');
  });

  test('the first code task in each section is a one-line change', () => {
    const firstCode = sec => LIVE_ITEMS.find(i => i.section === sec && ['fix', 'reqs'].includes(i.kind));
    const expected = { errors: 'e_fix', sequence: 'v_str', selection: 's_easy', while: 'w_guide', for: 'f_guide', functions: 'd_guide' };
    for (const [sec, id] of Object.entries(expected)) {
      const it = firstCode(sec);
      expect(it.id, sec).toBe(id);
      expect(it.reqs, id).toHaveLength(1);
    }
  });

  test('the bonus is locked until every core code question has full marks', () => {
    const core = LIVE_ITEMS.filter(i => !i.bonus && ['fix', 'reqs'].includes(i.kind));
    const full = Object.fromEntries(core.map(i => [i.id, itemMax(i)]));
    expect(bonusBlockers({})).toEqual(core.map(i => i.id));
    expect(bonusBlockers(full)).toEqual([]);
    expect(bonusBlockers({ ...full, w_write: 1 })).toEqual(['w_write']);
    // Click questions don't hold it back
    expect(bonusBlockers({ ...full, e_line: 0 })).toEqual([]);
  });

  test('v_total casts round the input, as taught', () => {
    const it = itemById('v_total');
    expect(it.code).toMatch(/= int\(input\(/);
    for (const v of it.variants) expect(v.opts.join()).not.toMatch(/\bint\(a/);
  });

  test('code examples are just code; the colon fix is a one-line reminder about for', () => {
    for (const it of LIVE_ITEMS.filter(i => i.howto)) {
      if (it.howto.code) expect(it.howto.text, it.id).toBeUndefined();
      else expect(it.howto.text, it.id).toMatch(/colon/);
    }
    expect(itemById('e_colon').howto.text).toMatch(/for.*colon/);
  });

  test('f_which: only the right answer names a while loop', () => {
    expect(itemById('f_which').opts.filter(o => o.startsWith('while'))).toHaveLength(1);
  });

  test('versions are the same shape: w_runs all <=, s_branch all >= with top, boundary, just under', () => {
    for (const v of itemById('w_runs').variants) expect(v.code).toMatch(/count = 1\nwhile count <= \d/);
    for (const v of itemById('s_branch').variants) {
      expect(v.code).not.toMatch(/ > /);
      const [, [bound], [under]] = v.rows;
      expect(+bound - +under).toBe(1);
    }
  });

  test('v_pick and f_angle no longer offer the distractors that caught strong students', () => {
    expect(itemById('v_pick').opts.join()).not.toMatch(/\* 2/);
    const angle = itemById('f_angle');
    angle.variants.forEach((v, k) => { if (k) expect(v.opts).not.toContain('45'); });
  });
});

describe('trace and branch marking', () => {
  test('trace boxes forgive capitals and quotes; numbers in quotes are wrong', () => {
    expect(checkTraceValue({ type: 'str', value: 'Fly' }, '"fly"').ok).toBe(true);
    expect(checkTraceValue({ type: 'int', value: 0 }, '0').ok).toBe(true);
    expect(checkTraceValue({ type: 'int', value: 0 }, '"0"').ok).toBe(false);
    expect(checkTraceOutput('Game over', 'game over').ok).toBe(true);
  });

  test('the loop trace has one box and three printed lines in every version', () => {
    for (const seed of [0, 1, 2]) expect(itemMax(itemById('w_trace'), seed)).toBe(4);
  });

  test('elif branch rows: four choices, the 4th is two messages', () => {
    const v = variantOf(itemById('s_branch'), 0);
    const ch = branchChoices(v);
    expect(ch).toHaveLength(4);
    expect(ch[3]).toMatch(/ and /);
    expect(v.rows.map(branchAnswer)).toEqual([0, 1, 2]);
  });
});

describe('structure helpers', () => {
  test('loops, elif and functions are found outside strings and comments', () => {
    expect(usesElif('if a:\n    x\nelif b:\n    y')).toBe(true);
    expect(usesElif('print("elif x:")')).toBe(false);
    expect(usesWhile('# while x:\nprint(1)')).toBe(false);
    expect(usesFor('for i in range(5):\n    print(i)')).toBe(true);
    expect(definedFunctions('def a():\n    pass\ndef b():\n    pass')).toEqual(['a', 'b']);
    expect(calledAfterDef('a()\ndef a():\n    print(1)', 'a')).toBe(false);
    expect(calledAfterDef('def a():\n    print(1)\na()', 'a')).toBe(true);
  });

  test('drewOnly finds one regular shape of any size, and nothing else', () => {
    expect(drewOnly({ drawing: polygon(4) }, 4)).toBe(true);
    expect(drewOnly({ drawing: polygon(5, 60) }, 5)).toBe(true);
    expect(drewOnly({ drawing: line }, 4)).toBe(false);
    const twice = polygon(4); twice.segs = twice.segs.concat(polygon(4).segs);
    expect(drewOnly({ drawing: twice }, 4)).toBe(false);
  });
});

describe('code tasks', () => {
  test('e_fix: fixing the capital N passes; the starter crashes', () => {
    const good = ins => ins.map(n => ok([n], [`What is your name? ${n}`, `Welcome aboard, ${n}`]));
    expect(mark('e_fix', 'x', good(['Sam', 'Priya'])).pts).toBe(1);
    const r = mark('e_fix', 'x', [fail(['Sam'], 'NameError: name \'Name\' is not defined'), fail(['Priya'], 'NameError')]);
    expect(r.pts).toBe(0);
    expect(r.msg).toMatch(/NameError/);
  });

  test('e_colon: four lines exactly', () => {
    expect(mark('e_colon', 'x', [ok([], ['Starting the scan', 'Scanning...', 'Scanning...', 'Scan complete'])]).pts).toBe(1);
    expect(mark('e_colon', 'x', [fail([], 'SyntaxError: expected \':\'')]).pts).toBe(0);
  });

  test('v_str: str(tries) passes; typing the text in does not', () => {
    expect(mark('v_str', 'tries = 3\nprint("Tries: " + str(tries))', [ok([], ['Tries: 3'])]).pts).toBe(1);
    expect(mark('v_str', 'tries = 3\nprint("Tries: 3")', [ok([], ['Tries: 3'])]).pts).toBe(0);
  });

  test('v_write: any message with the right number', () => {
    const raw = 'age = int(input("How old are you? "))\nprint("Next year:", age + 1)';
    const runs = [ok(['13'], ['How old are you? 13', 'Next year: 14']), ok(['8'], ['How old are you? 8', 'Next year: 9'])];
    expect(mark('v_write', raw, runs).pts).toBe(2);
    // The answer typed into the code: the same whatever is typed.
    const same = [ok(['13'], ['How old are you? 13', '14']), ok(['8'], ['How old are you? 8', '14'])];
    const r = mark('v_write', raw, same);
    expect(r.pts).toBe(1);
    expect(r.msg).toMatch(/same thing whatever was typed/);
  });

  const scoreRuns = msg => ['70', '50', '45', '40', '39'].map(n => ok([n], [`Score? ${n}`, msg(+n)]));
  test('s_guide: an elif for 40–49 with any message passes', () => {
    const raw = 'score = int(input())\nif score >= 50:\n    print("Pass")\nelif score >= 40:\n    print("So close")\nelse:\n    print("Try again")';
    expect(mark('s_guide', raw, scoreRuns(n => n >= 50 ? 'Pass' : n >= 40 ? 'So close' : 'Try again')).pts).toBe(1);
    // Without an elif (a second if), or the band wrong at 40, no mark.
    expect(mark('s_guide', raw.replace('elif', 'if'), scoreRuns(n => n >= 50 ? 'Pass' : n >= 40 ? 'So close' : 'Try again')).pts).toBe(0);
    expect(mark('s_guide', raw, scoreRuns(n => n >= 50 ? 'Pass' : n > 40 ? 'So close' : 'Try again')).pts).toBe(0);
  });

  test('s_fix: elif fixes it; the starter prints Hot and Warm', () => {
    const want = t => t >= 30 ? ['Hot'] : t >= 15 ? ['Warm'] : ['Cold'];
    const runs = f => ['35', '30', '20', '15', '5'].map(t => ok([t], [`Temperature? ${t}`, ...f(+t)]));
    expect(mark('s_fix', 'x', runs(want)).pts).toBe(1);
    expect(mark('s_fix', 'x', runs(t => t >= 30 ? ['Hot', 'Warm'] : want(t))).pts).toBe(0);
  });

  test('s_write: elif structure + the right medal (case and punctuation forgiven)', () => {
    const raw = 'points = int(input())\nif points >= 100:\n    print("Gold")\nelif points >= 50:\n    print("Silver")\nelse:\n    print("Bronze")';
    const runs = ['120', '100', '99', '50', '49'].map(p => ok([p], [`Points? ${p}`, +p >= 100 ? 'gold!' : +p >= 50 ? 'Silver' : 'Bronze']));
    expect(mark('s_write', raw, runs).pts).toBe(2);
    // Nested ifs instead of elif: the medals are right, the structure mark is not.
    expect(mark('s_write', 'if points >= 100:\n    print("Gold")\nelse:\n    if points >= 50:\n        print("Silver")', runs).pts).toBe(1);
  });

  test('w_fix: asking again inside the loop; an infinite loop gets the error named', () => {
    const runs = [ok(['1111', '2222', '1234'], ['PIN? 1111', 'Wrong PIN', 'PIN? 2222', 'Wrong PIN', 'PIN? 1234', 'Unlocked']), ok(['1234'], ['PIN? 1234', 'Unlocked'])];
    expect(mark('w_fix', 'x', runs).pts).toBe(1);
    const r = mark('w_fix', 'x', [fail(['1111', '2222', '1234'], 'Wrong PIN\nInfiniteLoopError: the loop never stopped'), runs[1]]);
    expect(r.pts).toBe(0);
    expect(r.msg).toMatch(/InfiniteLoopError/);
  });

  test('w_write: a while countdown from any number', () => {
    const raw = 'start = int(input())\nwhile start > 0:\n    print(start)\n    start = start - 1\nprint("Lift off!")';
    const runs = ['3', '5', '1'].map(s => ok([s], [`Count down from? ${s}`, ...[...Array(+s).keys()].map(i => String(+s - i)), 'Lift off!']));
    expect(mark('w_write', raw, runs).pts).toBe(2);
    // The same output with a for loop gets the output mark only.
    expect(mark('w_write', 'for i in range(start, 0, -1):\n    print(i)', runs).pts).toBe(1);
  });

  test('f_guide: range(5) passes; five prints do not', () => {
    const five = [ok([], Array(5).fill('Ping'))];
    expect(mark('f_guide', 'for i in range(5):\n    print("Ping")', five).pts).toBe(1);
    expect(mark('f_guide', 'for i in range(1):\n    print("Ping")\nprint("Ping")\nprint("Ping")\nprint("Ping")\nprint("Ping")', five).pts).toBe(0);
  });

  test('f_fix and f_write are judged on the drawing', () => {
    expect(mark('f_fix', 'x', [ok([], [], polygon(4))]).pts).toBe(1);
    expect(mark('f_fix', 'x', [ok([], [], line)]).pts).toBe(0);
    const raw = 'import turtle\nt = turtle.Turtle()\nfor i in range(5):\n    t.forward(50)\n    t.right(72)';
    expect(mark('f_write', raw, [ok([], [], polygon(5, 50))]).pts).toBe(2);
    expect(mark('f_write', raw, [ok([], [], polygon(6))]).pts).toBe(1);
  });

  test('d_fix: the call moved below the def passes; deleting it does not', () => {
    const two = [ok([], ['Hello there', 'Nice to meet you'])];
    expect(mark('d_fix', 'def say_hello():\n    print("a")\n    print("b")\nsay_hello()', two).pts).toBe(1);
    expect(mark('d_fix', 'def say_hello():\n    print("a")\n    print("b")', [ok([], [])]).pts).toBe(0);
  });

  test('d_guide: two calls (or a call in a loop) pass; extra prints do not', () => {
    const two = [ok([], ['Hip hip hooray!', 'Hip hip hooray!'])];
    expect(mark('d_guide', 'def cheer():\n    print("Hip hip hooray!")\ncheer()\ncheer()', two).pts).toBe(1);
    expect(mark('d_guide', 'def cheer():\n    print("Hip hip hooray!")\nfor i in range(2):\n    cheer()', two).pts).toBe(1);
    expect(mark('d_guide', 'def cheer():\n    print("Hip hip hooray!")\nprint("Hip hip hooray!")\ncheer()', two).pts).toBe(0);
  });

  test('d_write: def goodbye + a call', () => {
    const raw = 'def goodbye():\n    print("See you soon")\ngoodbye()';
    expect(mark('d_write', raw, [ok([], ['See you soon'])]).pts).toBe(2);
    expect(mark('d_write', 'def goodbye():\n    print("See you soon")', [ok([], [])]).pts).toBe(1);
  });

  test('p_till: one mark per step', () => {
    const raw = 'def welcome():\n    print("Welcome to the cinema!")\nwelcome()\nn = int(input("How many tickets? "))\nfor i in range(n):\n    print("Ticket")\nif n >= 5:\n    print("Group discount!")';
    const run = n => ok([String(n)], ['Welcome to the cinema!', `How many tickets? ${n}`, ...Array(n).fill('Ticket'), ...(n >= 5 ? ['Group discount!'] : [])]);
    const runs = [2, 5, 1, 6].map(run);
    expect(mark('p_till', raw, runs).pts).toBe(5);
    // No function, discount at > 5: steps 2–4 only.
    const noFn = 'print("Hi")\nn = int(input())\nfor i in range(n):\n    print("Ticket")\nif n > 5:\n    print("Group discount!")';
    const runs2 = [2, 5, 1, 6].map(n => ok([String(n)], ['Hi', `How many tickets? ${n}`, ...Array(n).fill('Ticket'), ...(n > 5 ? ['Group discount!'] : [])]));
    expect(mark('p_till', noFn, runs2).results).toEqual([false, true, true, true, false]);
  });

  test('x_guess: word for word', () => {
    const raw = 'g = int(input("Guess: "))\nn = 1\nwhile g != 7:\n    ...';
    const run = gs => ok(gs, gs.flatMap((g, i) => [`Guess: ${g}`, ...(i < gs.length - 1 ? [+g < 7 ? 'Too low' : 'Too high'] : [`Correct! You took ${gs.length} guesses`])]));
    expect(mark('x_guess', raw, [['3', '9', '7'], ['8', '1', '2', '7'], ['6', '7']].map(run)).pts).toBe(3);
  });
});

describe('Station Zero closing report', () => {
  test('cleanChoices drops anything that is not a choice', () => {
    expect(cleanChoices({ door: 'open', bad: 'DROP TABLE', n: 3, _at: { door: 5 } })).toEqual({ door: 'open', _at: { door: 5 } });
  });

  test('mergeChoices keeps the most recent of each choice', () => {
    const m = mergeChoices({ drone: 'scout', _at: { drone: 10 } }, { drone: 'guard', wake: 'under', _at: { drone: 20, wake: 1 } });
    expect(m.drone).toBe('guard');
    expect(m.wake).toBe('under');
  });

  test('an absent student: everyone alive, all three tools', () => {
    const st = stationState({});
    expect(st.alive).toBe(4);
    expect(breachTools(st).every(t => t.ready)).toBe(true);
    expect(inventoryRows(st)[0]).toEqual({ label: 'Crew alive', value: '4 of 5', level: 'ok' });
  });

  test('Proximity lost Chen (X): no medic for the breach', () => {
    const st = stationState({ shield: 'pod5', lockdown: 'sensors', power: 'sensors' });
    expect(st.crew.chen).toBe('dead');
    const tools = breachTools(st);
    expect(tools.find(t => t.who === 'chen').ready).toBe(false);
    expect(tools.find(t => t.who === 'patel').ready).toBe(true);
  });

  test('Distress Signal lost the saved crew member: Okafor can only be injured (one death at a time)', () => {
    // Shielded Patel in L2 (kept him), slow ship + held orbit in L4 → Patel dies; L5 danger → Okafor injured.
    const st = stationState({ shield: 'pod5', lockdown: 'cryo', fuel: 'orbit', signal: 'quarantine', flare: 'warning', wake: 'under', priority: 'camera' });
    expect(st.crew.patel).toBe('dead');
    expect(st.crew.okafor).toBe('injured');
    expect(breachTools(st).find(t => t.who === 'okafor').ready).toBe(true);   // injured can still help
  });

  test('L5 danger left standing kills Okafor', () => {
    const st = stationState({ wake: 'awake', drone: 'scout', priority: 'camera' });
    expect(st.crew.okafor).toBe('dead');
    expect(st.alive).toBe(3);
  });
});
