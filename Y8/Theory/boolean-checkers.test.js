import { describe, it, expect } from 'vitest';
import {
  gateOutput, seededRandom, shuffled, cooldownSeconds,
  PREDICT_POOL, PREDICT_LENGTH, drawPredict, predictQuestion, predictWhy,
  RULES, checkMatch, TT_CELLS, checkTables, SCENARIOS, checkScenarios,
  QUIZ_POOL, QUIZ_LENGTH, drawQuiz, quizOptionOrder, quizQuestion,
} from './boolean-checkers.js';

describe('gateOutput', () => {
  it('AND is 1 only for 1,1', () => {
    expect([[0, 0], [0, 1], [1, 0], [1, 1]].map(([a, b]) => gateOutput('AND', a, b))).toEqual([0, 0, 0, 1]);
  });
  it('OR is 0 only for 0,0', () => {
    expect([[0, 0], [0, 1], [1, 0], [1, 1]].map(([a, b]) => gateOutput('OR', a, b))).toEqual([0, 1, 1, 1]);
  });
  it('NOT flips its one input', () => {
    expect(gateOutput('NOT', 0)).toBe(1);
    expect(gateOutput('NOT', 1)).toBe(0);
  });
  it('rejects unknown gates', () => {
    expect(() => gateOutput('XOR', 1, 1)).toThrow();
  });
});

describe('seeded helpers', () => {
  it('seededRandom is deterministic per seed', () => {
    const a = seededRandom('abc'), b = seededRandom('abc'), c = seededRandom('abd');
    const sa = [a(), a(), a()];
    expect([b(), b(), b()]).toEqual(sa);
    expect([c(), c(), c()]).not.toEqual(sa);
  });
  it('shuffled keeps every item and leaves the input alone', () => {
    const src = [1, 2, 3, 4, 5, 6];
    const out = shuffled(src, seededRandom('x'));
    expect(out.slice().sort()).toEqual(src);
    expect(src).toEqual([1, 2, 3, 4, 5, 6]);
  });
  it('cooldown escalates 10 → 20 → 30 and caps', () => {
    expect([1, 2, 3, 4, 9].map(cooldownSeconds)).toEqual([10, 20, 30, 30, 30]);
  });
});

describe('Task 1 — predict the bulb', () => {
  it('pool covers every gate/input combination once', () => {
    expect(PREDICT_POOL).toHaveLength(10);
    expect(new Set(PREDICT_POOL.map(q => q.id)).size).toBe(10);
  });
  it('a draw is stable for one attempt and changes on restart', () => {
    const d0 = drawPredict('seed1', 0);
    expect(d0).toHaveLength(PREDICT_LENGTH);
    expect(drawPredict('seed1', 0)).toEqual(d0);
    expect(new Set(d0).size).toBe(PREDICT_LENGTH);
    const others = [1, 2, 3, 4].map(n => drawPredict('seed1', n).join());
    expect(others.some(o => o !== d0.join())).toBe(true);
  });
  it('every explanation states the right output', () => {
    for (const q of PREDICT_POOL) {
      const why = predictWhy(q);
      expect(why).toMatch(new RegExp(`output(s| is)? ${gateOutput(q.gate, q.a, q.b)}`));
    }
    expect(predictQuestion('NOT1')).toMatchObject({ gate: 'NOT', a: 1 });
  });
});

describe('Task 2 — match symbols', () => {
  const perfect = { 'name-AND': 'AND', 'rule-AND': 'AND', 'name-OR': 'OR', 'rule-OR': 'OR', 'name-NOT': 'NOT', 'rule-NOT': 'NOT' };
  it('passes when every name and rule matches', () => {
    expect(checkMatch(perfect).ok).toBe(true);
  });
  it('marks each wrong slot and blanks individually', () => {
    const r = checkMatch({ ...perfect, 'rule-AND': 'OR', 'rule-OR': 'AND', 'name-NOT': undefined });
    expect(r.ok).toBe(false);
    expect(r.results).toMatchObject({ 'rule-AND': false, 'rule-OR': false, 'name-NOT': false, 'name-AND': true });
  });
  it('rule texts are similar lengths (no longest-answer giveaway)', () => {
    const lens = Object.values(RULES).map(r => r.length);
    expect(Math.max(...lens) - Math.min(...lens)).toBeLessThan(8);
  });
});

describe('Task 3 — truth tables', () => {
  const right = Object.fromEntries(TT_CELLS.map(c => [c.id, String(gateOutput(c.gate, c.a, c.b))]));
  it('has 10 cells and accepts the correct outputs', () => {
    expect(TT_CELLS).toHaveLength(10);
    expect(checkTables(right).ok).toBe(true);
  });
  it('rejects a blank and a flipped cell, marking only those', () => {
    const r = checkTables({ ...right, 'and-11': '0', 'not-0': '' });
    expect(r.ok).toBe(false);
    expect(Object.entries(r.results).filter(([, v]) => !v).map(([k]) => k).sort()).toEqual(['and-11', 'not-0']);
  });
});

describe('Task 4 — scenarios', () => {
  it('uses every gate as an answer at least twice', () => {
    for (const g of ['AND', 'OR', 'NOT']) expect(SCENARIOS.filter(s => s.answer === g).length).toBeGreaterThanOrEqual(2);
  });
  it('checks each blank', () => {
    const right = Object.fromEntries(SCENARIOS.map(s => ['sc-' + s.id, s.answer]));
    expect(checkScenarios(right).ok).toBe(true);
    const r = checkScenarios({ ...right, 'sc-fridge': 'AND' });
    expect(r.ok).toBe(false);
    expect(r.results['sc-fridge']).toBe(false);
    expect(r.results['sc-street']).toBe(true);
  });
});

describe('Task 5 — quiz checkpoint', () => {
  it('every question has its answer among its options', () => {
    for (const q of QUIZ_POOL) expect(q.opts.map(o => o[0])).toContain(q.a);
  });
  it('draws QUIZ_LENGTH distinct questions, stable per attempt', () => {
    const d = drawQuiz('s', 0);
    expect(d).toHaveLength(QUIZ_LENGTH);
    expect(new Set(d).size).toBe(QUIZ_LENGTH);
    expect(drawQuiz('s', 0)).toEqual(d);
  });
  it('option order is a permutation of the options', () => {
    for (const q of QUIZ_POOL) {
      expect(quizOptionOrder(q.id, 's', 0).slice().sort()).toEqual(q.opts.map(o => o[0]).sort());
    }
  });
  it('the correct answer is not the longest option in half or more of the questions', () => {
    const longest = QUIZ_POOL.filter(q => {
      const right = q.opts.find(o => o[0] === q.a)[1].length;
      return q.opts.every(o => o[0] === q.a || o[1].length < right);
    });
    expect(longest.length).toBeLessThan(QUIZ_POOL.length / 2);
    expect(quizQuestion('q9').a).toBe('c');
  });
});

import { XP, BADGES, TASK_BADGE, RANKS, MAX_XP, rankFor, taskXpGain } from './boolean-checkers.js';

describe('XP, ranks and badges', () => {
  it('the top rank is reachable', () => {
    expect(MAX_XP).toBe(505);
    expect(RANKS[RANKS.length - 1][0]).toBeLessThanOrEqual(MAX_XP);
  });
  it('rankFor picks the highest rank reached and the next threshold', () => {
    expect(rankFor(0)).toMatchObject({ index: 0, next: 100 });
    expect(rankFor(99).index).toBe(0);
    expect(rankFor(100)).toMatchObject({ index: 1, min: 100, next: 200 });
    expect(rankFor(999)).toMatchObject({ index: RANKS.length - 1, next: null });
  });
  it('a task pays once per tier: green, then the gold top-up, then nothing', () => {
    expect(taskXpGain(0, false)).toBe(XP.taskGreen);
    expect(taskXpGain(XP.taskGreen, true)).toBe(XP.taskGold - XP.taskGreen);
    expect(taskXpGain(XP.taskGold, true)).toBe(0);
    expect(taskXpGain(XP.taskGold, false)).toBe(0);
  });
  it('every task badge exists and badge ids are unique', () => {
    const ids = BADGES.map(b => b.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of TASK_BADGE) expect(ids).toContain(id);
  });
});

import { predictCircuit } from './boolean-checkers.js';

describe('predictCircuit — retry with new inputs', () => {
  it('retry 0 is the drawn question', () => {
    expect(predictCircuit('s', 0, 2, 0)).toEqual(predictQuestion(drawPredict('s', 0)[2]));
  });
  it('each retry keeps the gate but changes the inputs', () => {
    for (let pos = 0; pos < PREDICT_LENGTH; pos++) {
      let prev = predictCircuit('seedZ', 0, pos, 0);
      for (let r = 1; r <= 6; r++) {
        const q = predictCircuit('seedZ', 0, pos, r);
        expect(q.gate).toBe(prev.gate);
        expect(q.id).not.toBe(prev.id);
        expect(predictCircuit('seedZ', 0, pos, r)).toEqual(q);   // stable on reload
        prev = q;
      }
    }
  });
});
