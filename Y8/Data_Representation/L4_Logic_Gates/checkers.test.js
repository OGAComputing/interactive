import { describe, it, expect } from 'vitest';
import {
  TASK_COUNT, GATE_NAMES, gate, arity, inputRows, gateColumn, gateFromColumn,
  LAYOUTS, slotIds, pinKeys, fits, evalCircuit, circuitColumn, slotColumn, exprString, allBuilds, outWithP,
  SCENARIOS, scenario, gapText, scenarioGate, BUILDS, buildItem,
  LADDERS, STEP_COUNT, ladderQuestion, checkLadder, shapeHint, workingFor, cooldownSeconds,
  PLENARY_POOL, PLENARY_LENGTH, drawPlenary, tcolAnswer, optionOrder,
  itemAnswer, itemShown, itemWorking, itemRows, checkTyped, formatHint, sumValue, sumText,
  GAME_LEVELS, TYPE_TIME, gameQuestion, gameLevel, gameTime, gamePoints, multiplier, rankFor, runBadges, cleanCode, isLogic,
  GLOSSARY, glossaryDef, NO_GLOSS,
} from './checkers.js';

const SEEDS = ['a1', 'k3j9x', 'zz9', 'q', 'logic'];

// The draft a student who answers q correctly would have.
function rightDraft(q) {
  const bits = {}, slots = {};
  if (q.kind === 'situ' || q.kind === 'table') q.answers.forEach((a, k) => { bits['q' + k] = String(a); });
  if (['gap', 'name3', 'whichGate'].includes(q.kind)) q.answers.forEach((a, k) => { slots['s' + k] = a; });
  if (q.kind === 'nameCircuit') Object.assign(slots, q.build);
  if (q.kind === 'trace') for (let k = 0; k < q.Q.length; k++) { bits['P' + k] = q.P[k]; bits['Q' + k] = q.Q[k]; }
  if (q.kind === 'build') Object.assign(slots, buildItem(q.layout, q.item).build);
  return { bits, slots };
}
const allQuestions = () => SEEDS.flatMap(seed => Object.keys(LADDERS).flatMap(t =>
  Array.from({ length: STEP_COUNT[t] }, (_, st) => [0, 1, 2].map(r => ladderQuestion(t, st, seed, r))).flat()));

describe('gates', () => {
  it('follow their rules', () => {
    expect(gateColumn('AND')).toBe('0001');
    expect(gateColumn('OR')).toBe('0111');
    expect(gateColumn('NOT')).toBe('10');
    expect(gate('NOT', 0)).toBe(1);
    expect(arity('NOT')).toBe(1);
    expect(arity('AND')).toBe(2);
    for (const g of GATE_NAMES) expect(gateFromColumn(gateColumn(g))).toBe(g);
    expect(gateFromColumn('0110')).toBeNull();
  });
  it('rows count up in binary, A on the left', () => {
    expect(inputRows(2)).toEqual([[0, 0], [0, 1], [1, 0], [1, 1]]);
    expect(inputRows(1)).toEqual([[0], [1]]);
    expect(inputRows(3)).toHaveLength(8);
    expect(inputRows(3)[5]).toEqual([1, 0, 1]);
  });
});

describe('circuits', () => {
  it('evaluate gate by gate', () => {
    const b = { g1: 'NOT', g2: 'AND' };
    expect(circuitColumn('notIn', b)).toBe('0100');   // (NOT A) AND B
    expect(slotColumn('notIn', b, 'g1')).toBe('1100');
    expect(circuitColumn('notOut', { g1: 'AND', g2: 'NOT' })).toBe('1110');
    expect(circuitColumn('three', { g1: 'OR', g2: 'AND' })).toBe('00010101');
    expect(circuitColumn('threeNot', { g1: 'AND', g2: 'NOT', g3: 'OR' })).toBe('10101011');
  });
  it('are unfinished while a gate or pin is missing, or a gate does not fit', () => {
    expect(circuitColumn('notIn', { g1: 'NOT' })).toBeNull();
    expect(circuitColumn('notIn', { g1: 'AND', g2: 'AND' })).toBeNull();
    expect(circuitColumn('notIn', { g1: 'NOT', g2: 'AND', 'g1.0': 'A' }, true)).toBeNull();
    expect(evalCircuit('notIn', { g1: 'NOT' }, { A: 0, B: 1 }).vals.g1).toBe(1);
    expect(fits('notIn', 'g1', 'NOT')).toBe(true);
    expect(fits('notIn', 'g2', 'NOT')).toBe(false);
  });
  it('pins: the student chooses which input goes where', () => {
    const b = { g1: 'NOT', g2: 'AND', 'g1.0': 'B', 'g2.1': 'A' };
    expect(circuitColumn('notIn', b, true)).toBe('0010');   // A AND NOT B
    expect(pinKeys('notIn')).toEqual(['g1.0', 'g2.1']);
    expect(pinKeys('threeNot')).toEqual(['g1.0', 'g1.1', 'g2.0']);
    expect(slotIds('threeNot')).toEqual(['g1', 'g2', 'g3']);
  });
  it('write out with brackets round inner gates', () => {
    expect(exprString('notIn', { g1: 'NOT', g2: 'OR' })).toBe('(NOT A) OR B');
    expect(exprString('threeNot', { g1: 'AND', g2: 'NOT', g3: 'OR' })).toBe('(A AND B) OR (NOT C)');
    expect(outWithP('notOut', { g1: 'AND', g2: 'NOT' })).toBe('NOT P');
    expect(outWithP('three', { g1: 'AND', g2: 'OR' })).toBe('P OR C');
  });
  it('every layout has its fitting builds', () => {
    expect(allBuilds('one')).toHaveLength(2);
    expect(allBuilds('threeNot')).toHaveLength(4);
    for (const id of Object.keys(LAYOUTS)) for (const b of allBuilds(id)) expect(circuitColumn(id, b)).not.toBeNull();
  });
});

describe('scenarios and build items', () => {
  it('each sentence has its gate word once, in capitals', () => {
    for (const [g, list] of Object.entries(SCENARIOS)) {
      expect(list.length).toBeGreaterThanOrEqual(4);
      for (const s of list) {
        expect(s.text.match(/\b(AND|OR|NOT)\b/g)).toEqual([g]);
        expect(gapText(s)).toContain('___');
        expect(scenarioGate(s.id)).toBe(g);
        expect(scenario(s.id)).toBe(s);
      }
    }
  });
  it('every build item works, fits its layout and differs from the others in its pool where it must', () => {
    for (const [id, list] of Object.entries(BUILDS)) {
      expect(list.length).toBeGreaterThanOrEqual(3);
      for (const it of list) {
        for (const g of slotIds(id)) expect(fits(id, g, it.build[g])).toBe(true);
        expect(circuitColumn(id, it.build, id !== 'one')).toMatch(/^[01]+$/);
        if (it.text) {
          // The story names every input and uses the gates in the build.
          for (const x of LAYOUTS[id].inputs) expect(it.ins[x]).toBeTruthy();
          for (const g of new Set(slotIds(id).map(s => it.build[s]))) expect(it.text).toContain(g);
        }
      }
    }
    // The table-only steps never give the same target twice in a row.
    for (const id of ['notOut']) {
      const cols = BUILDS[id].map(it => circuitColumn(id, it.build, true));
      expect(new Set(cols).size).toBe(cols.length);
    }
  });
});

describe('ladders', () => {
  it('step counts', () => {
    expect(STEP_COUNT).toEqual({ 0: 4, 1: 4, 2: 5, 3: 4, 4: 4 });
    expect(TASK_COUNT).toBe(6);
    // No three-gate build from a table: too hard for Year 8 (Nick, 2026-11-25).
    expect(LADDERS[4].map(s => s.layout)).toEqual(['one', 'notIn', 'notOut', 'three']);
  });
  it('the same seed gives the same question; a retry gives a different one where it can', () => {
    for (const seed of SEEDS) for (const t of Object.keys(LADDERS)) for (let st = 0; st < STEP_COUNT[t]; st++) {
      expect(ladderQuestion(t, st, seed, 1)).toEqual(ladderQuestion(t, st, seed, 1));
      const a = ladderQuestion(t, st, seed, 0), b = ladderQuestion(t, st, seed, 1);
      const fixed = LADDERS[t][st].kind === 'table' && LADDERS[t][st].gate !== 'pick';
      if (!fixed) expect(b.key).not.toBe(a.key);
    }
  });
  it('a right draft passes and an empty one gets a hint, not a mark', () => {
    for (const q of allQuestions()) {
      const d = rightDraft(q);
      expect(shapeHint(q, d)).toBe('');
      expect(checkLadder(q, d).ok).toBe(true);
      expect(shapeHint(q, { bits: {}, slots: {} })).not.toBe('');
      expect(workingFor(q).length).toBeGreaterThan(10);
    }
  });
  it('a wrong answer marks just that part', () => {
    const q = ladderQuestion(2, 0, 'a1');   // AND table
    const d = rightDraft(q);
    d.bits.q1 = '1';
    const { ok, results } = checkLadder(q, d);
    expect(ok).toBe(false);
    expect(results).toEqual({ q0: true, q1: false, q2: true, q3: true });
  });
  it('situations: 3 different rows for AND/OR, both rows for NOT', () => {
    for (const seed of SEEDS) {
      const and = ladderQuestion(0, 0, seed);
      expect(new Set(and.rows.map(String)).size).toBe(3);
      expect(and.answers).toEqual(and.rows.map(([a, b]) => a & b));
      const not = ladderQuestion(0, 2, seed);
      expect(not.rows).toHaveLength(2);
    }
  });
  it('the gap step uses one sentence per gate, with evidence that tells AND from OR', () => {
    for (const seed of SEEDS) for (let r = 0; r < 4; r++) {
      const q = ladderQuestion(0, 3, seed, r);
      expect([...q.answers].sort()).toEqual(['AND', 'NOT', 'OR']);
      q.ids.forEach((id, k) => {
        const g = scenarioGate(id), ev = q.evidence[k];
        if (g === 'NOT') return expect(ev).toHaveLength(2);
        const other = g === 'AND' ? 'OR' : 'AND';
        // At least one row where the other gate would give a different result.
        expect(ev.some(({ r: row, out }) => gate(other, ...row) !== out)).toBe(true);
        for (const { r: row, out } of ev) expect(gate(g, ...row)).toBe(out);
      });
    }
  });
  it('naming: three symbols in a shuffled order; circuits name every gate', () => {
    const orders = new Set(SEEDS.map(s => ladderQuestion(1, 0, s).order.join()));
    expect(orders.size).toBeGreaterThan(1);
    const q = ladderQuestion(1, 3, 'a1');
    expect(q.layout).toBe('threeNot');
    expect(q.answers).toHaveLength(3);
    expect(q.answers[1]).toBe('NOT');
  });
  it('trace: P is the first gate, Q the whole circuit', () => {
    for (const seed of SEEDS) {
      const q = ladderQuestion(3, 3, seed);
      expect(q.P).toHaveLength(8);
      expect(q.Q).toBe(circuitColumn('three', q.build));
    }
  });
  it('build: any circuit with the right table is accepted, and a wrong one marks the wrong rows', () => {
    const q = { ...LADDERS[4][1], task: 4, step: 1, item: 'heat', target: circuitColumn('notIn', buildItem('notIn', 'heat').build, true) };
    expect(q.target).toBe('0100');
    expect(checkLadder(q, { slots: { g1: 'NOT', g2: 'AND', 'g1.0': 'A', 'g2.1': 'B' } }).ok).toBe(true);
    const wrong = checkLadder(q, { slots: { g1: 'NOT', g2: 'AND', 'g1.0': 'B', 'g2.1': 'A' } });   // A AND NOT B: 0010
    expect(wrong.ok).toBe(false);
    expect(wrong.results).toEqual({ r0: true, r1: false, r2: false, r3: true });
    // The ride story: (A AND B) OR C, written the other way round, still passes.
    const ride = { ...LADDERS[4][3], task: 4, step: 3, item: 'ride', target: circuitColumn('three', buildItem('three', 'ride').build, true) };
    expect(checkLadder(ride, { slots: { g1: 'AND', g2: 'OR', 'g1.0': 'B', 'g1.1': 'A', 'g2.1': 'C' } }).ok).toBe(true);
    expect(shapeHint(ride, { slots: { g1: 'AND', g2: 'OR' } })).toContain('input');
  });
  it('cooldowns grow 5, 10, 15', () => {
    expect([1, 2, 3, 7].map(cooldownSeconds)).toEqual([5, 10, 15, 15]);
  });
});

describe('plenary', () => {
  it('MCQs: four options, the right one is never systematically longest', () => {
    for (const q of PLENARY_POOL) {
      expect(q.opts).toHaveLength(4);
      expect(q.opts.map(o => o[0])).toContain(q.a);
      const right = q.opts.find(o => o[0] === q.a)[1].length;
      const longest = Math.max(...q.opts.map(o => o[1].length));
      expect(right).toBeLessThanOrEqual(longest);
    }
    const longestRight = PLENARY_POOL.filter(q => {
      const lens = q.opts.map(o => o[1].length);
      return q.opts.find(o => o[0] === q.a)[1].length === Math.max(...lens) && new Set(lens).size > 1;
    });
    expect(longestRight.length).toBeLessThan(PLENARY_POOL.length / 2);
  });
  it('draws 3 MCQs and 2 tables', () => {
    for (const seed of SEEDS) for (let a = 0; a < 3; a++) {
      const items = drawPlenary(seed, a);
      expect(items).toHaveLength(PLENARY_LENGTH);
      expect(items.filter(i => i.type === 'mcq')).toHaveLength(3);
      for (const t of items.filter(i => i.type === 'tcol')) expect(tcolAnswer(t)).toMatch(/^[01]{4}$/);
    }
    expect(optionOrder(PLENARY_POOL[0], 'a1', 0)).toEqual(optionOrder(PLENARY_POOL[0], 'a1', 0));
  });
});

describe('typed questions', () => {
  it('logic sums', () => {
    expect(sumValue({ f: 'notOf', g: 'AND', a: 1, b: 1 })).toBe(0);
    expect(sumValue({ f: 'notIn', g: 'OR', a: 1, b: 0 })).toBe(0);
    expect(sumValue({ f: 'two', g: 'AND', g2: 'OR', a: 1, b: 0, c: 1 })).toBe(1);
    expect(sumText({ f: 'notIn', g: 'OR', a: 1, b: 0 })).toBe('(NOT 1) OR 0');
    const trio = { type: 'trio', sums: [{ f: 'g', g: 'AND', a: 1, b: 0 }, { f: 'g', g: 'OR', a: 1, b: 0 }, { f: 'g', g: 'NOT', a: 1 }] };
    expect(itemAnswer(trio)).toBe('010');
    expect(itemShown(trio)).toBe('1 AND 0  ·  1 OR 0  ·  NOT 1');
    expect(checkTyped(trio, '0 1 0')).toBe('ok');
    expect(checkTyped(trio, '011')).toBe('wrong');
    expect(checkTyped(trio, '01')).toBe('format');
  });
  it('columns and names', () => {
    expect(itemAnswer({ type: 'col', g: 'OR' })).toBe('0111');
    expect(itemRows({ type: 'col', g: 'NOT' })).toHaveLength(2);
    expect(checkTyped({ type: 'col', g: 'NOT' }, '1010')).toBe('format');
    expect(checkTyped({ type: 'name', g: 'OR' }, ' or ')).toBe('ok');
    expect(checkTyped({ type: 'name', g: 'OR' }, 'and')).toBe('wrong');
    expect(checkTyped({ type: 'name', g: 'OR' }, 'XOR')).toBe('format');
    const c2 = { type: 'col2', layout: 'notOut', build: { g1: 'OR', g2: 'NOT' } };
    expect(itemAnswer(c2)).toBe('1000');
    expect(itemShown(c2)).toBe('NOT (A OR B)');
    expect(itemWorking(c2)).toContain('NOT P');
  });
  it('the Lesson 1–3 types still work', () => {
    expect(itemAnswer({ type: 'b2h', n: 0xB5 })).toBe('B5');
    expect(checkTyped({ type: 'add4', a: 7, b: 9, n: 16 }, '10000')).toBe('ok');
    expect(checkTyped({ type: 'add4', a: 7, b: 9, n: 16 }, '0000')).toBe('wrong');
    expect(checkTyped({ type: 'b2d4', n: 11 }, '11')).toBe('ok');
    expect(checkTyped({ type: 'd2b8', n: 77 }, '1001101')).toBe('format');
  });
  it('every question in a run has an answer, a hint and working', () => {
    for (const seed of SEEDS) for (let i = 0; i < 60; i++) {
      const q = gameQuestion(seed, i);
      expect(TYPE_TIME[q.type]).toBeTruthy();
      expect(checkTyped(q, itemAnswer(q))).toBe('ok');
      expect(formatHint(q).length).toBeGreaterThan(5);
      expect(itemWorking(q).length).toBeGreaterThan(5);
    }
  });
});

describe('Logic Rush builds over the unit', () => {
  const kinds = (seed, from, to) => Array.from({ length: to - from }, (_, k) => gameQuestion(seed, from + k).type);
  it('opens with one of each logic kind, and the first 12 are logic only (about two minutes)', () => {
    for (const seed of SEEDS) {
      expect(kinds(seed, 0, 3)).toEqual(['trio', 'col', 'name']);
      expect(kinds(seed, 0, GAME_LEVELS[1].from).every(isLogic)).toBe(true);
      const firstTwoMinutes = kinds(seed, 0, GAME_LEVELS[1].from).reduce((s, t) => s + TYPE_TIME[t], 0);
      expect(firstTwoMinutes).toBeGreaterThanOrEqual(120);
    }
  });
  it('hex joins at Level 2, adding at Level 3, denary at Level 4, newest lesson first', () => {
    const lv = n => GAME_LEVELS[n].mix.map(m => m.split(':')[0]);
    expect(lv(1).some(t => /nib2h|h2nib/.test(t))).toBe(true);
    expect(lv(1).some(t => t.startsWith('add') || /b2d|d2b/.test(t))).toBe(false);
    expect(lv(2).some(t => t.startsWith('add'))).toBe(true);
    expect(lv(2).some(t => /b2d|d2b/.test(t))).toBe(false);
    expect(lv(3).some(t => /b2d|d2b/.test(t))).toBe(true);
    // Logic stays in every level.
    for (let n = 0; n < GAME_LEVELS.length; n++) expect(lv(n).some(isLogic)).toBe(true);
  });
  it('a class code gives the same run, and two in a row are never the same kind', () => {
    for (let i = 0; i < 40; i++) {
      expect(gameQuestion('CLASS1', i)).toEqual(gameQuestion('CLASS1', i));
      if (i) expect(gameQuestion('CLASS1', i).type).not.toBe(gameQuestion('CLASS1', i - 1).type);
    }
  });
  it('trios never have all three answers the same', () => {
    for (const seed of SEEDS) for (let i = 0; i < 60; i++) {
      const q = gameQuestion(seed, i);
      if (q.type.startsWith('trio')) expect(new Set(itemAnswer(q)).size).toBe(2);
    }
  });
  it('scoring, speed-up, ranks and badges', () => {
    expect(gameLevel(0).name).toBe('Level 1');
    expect(gameLevel(36).name).toBe('Level 5');
    expect(gameTime(36, 'col2')).toBe(35);
    expect(gameTime(36 + 50, 'col2')).toBe(21);
    expect([0, 3, 6, 10].map(multiplier)).toEqual([1, 2, 3, 4]);
    expect(gamePoints(0, 20, 20, 0)).toBe(200);
    expect(gamePoints(0, 0, 20, 3)).toBe(200);
    expect(rankFor(0)).toBe('Trainee');
    expect(rankFor(6500)).toBe('Logic Hacker');
    const b = runBadges({ played: 21, maxStreak: 6, fast: 5, perfect: true, score: 12000 });
    expect(b).toMatchObject({ first: true, streak5: true, streak10: false, hex: true, adder: true, unit: false, speed: true, perfect: true, score10k: true });
    expect(cleanCode(' lg-4a!')).toBe('LG4A');
  });
});

describe('glossary', () => {
  it('short plain meanings, and none for AND/OR/NOT', () => {
    for (const [, def] of GLOSSARY) expect(def.length).toBeLessThanOrEqual(80);
    expect(glossaryDef('Truth table')).toMatch(/output for every input/);
    expect(glossaryDef('gates')).toBeTruthy();
    for (const g of GATE_NAMES) expect(glossaryDef(g)).toBeUndefined();
    for (const id of NO_GLOSS) expect(PLENARY_POOL.some(q => q.id === id)).toBe(true);
  });
});
