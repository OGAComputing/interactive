import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  TASKS, TASK_COUNT, CHOICES, WRITING, EVIDENCE, markChoices, markWriting, allCorrect, calcScore, onceShare,
  GLOSSARY, glossaryDef, coreDone,
} from './checkers_unit_a_check.js';

const html = readFileSync(new URL('./1_Unit_A_Check.html', import.meta.url), 'utf8');
const qs = Object.entries(CHOICES.terms);
const optLen = (opts, k) => opts.find(o => o[0] === k)[1].length;
const rightIsLongest = (opts, a) => opts.every(([k]) => k === a || optLen(opts, a) >= optLen(opts, k));
const right = Object.fromEntries(qs.map(([id, c]) => [id, c.a]));
const wrongFor = c => c.opts.find(o => o[0] !== c.a)[0];
const answerText = c => c.opts.find(o => o[0] === c.a)[1].replace(/^(The|An?) /, '');

// Product images still to be supplied (the page hides their frames until they're inlined).
// Remove each key from here once it is inlined with Y10/inline_images.py.
const PENDING_IMAGES = new Set([]);

describe('page identity and tabs', () => {
  test('title matches ACTIVITY_TITLE, the page opens on Task 1 (no warm-up: it is a check), every task has a tab and panel', () => {
    expect(html).toContain('title:  Unit A Check');
    expect(html).toContain("const ACTIVITY_TITLE = 'Unit A Check';");
    expect(html).toContain("const STORAGE_KEY    = 'y10_c1_l3_3_unit_a_check';");
    expect(html).toMatch(/class="tab active" data-idx="0"/);
    expect(html).toMatch(/class="panel active" id="panel-0"/);
    expect(TASKS.some(t => t.level === 'support')).toBe(false);
    for (let i = 0; i < TASK_COUNT; i++) {
      expect(html, `tab ${i}`).toContain(`data-idx="${i}"`);
      expect(html, `panel ${i}`).toContain(`id="panel-${i}"`);
    }
    expect(html).not.toMatch(/FILL IN|TODO/);
  });

  test('the engine supports one-attempt tasks: hand in twice, no Try for Gold, the score sees the answers', () => {
    expect(html).toContain('if (TASKS[i].once) return handIn(i, res, fb);');
    expect(html).toContain("reset.style.display = gold || TASKS[i].once ? 'none' : ''");
    expect(html.match(/calcScore\(state\.completed, state\.firstAttempt, state\.answers\)/g)).toHaveLength(3);
  });

  test('every image the page uses is inlined, or still on the pending list', () => {
    const keys = new Set([...html.matchAll(/data-img="([^"]+)"/g)].map(m => m[1])
      .concat(qs.filter(([, c]) => c.img).map(([, c]) => c.img)));
    for (const k of keys) {
      if (PENDING_IMAGES.has(k)) continue;
      expect(html, k).toMatch(new RegExp(`['"]${k}['"]:\\s*['"]data:image/(jpeg|png);base64,`));
    }
    for (const k of PENDING_IMAGES) expect(keys.has(k), `${k} is pending but not used`).toBe(true);
    for (const [id, c] of qs) if (c.img) expect(c.alt && c.credit, id).toBeTruthy();
    expect(html.length).toBeLessThan(1_000_000);
  });

  test('the evidence file on the page matches EVIDENCE', () => {
    for (const e of EVIDENCE) expect(html, e.slice(0, 30)).toContain(e);
  });
});

describe('Task 1: the terms', () => {
  test('15 questions covering every Learning Aim A lesson from 1.1 to 3.2', () => {
    expect(qs).toHaveLength(15);
    expect(new Set(qs.map(([, c]) => c.lesson))).toEqual(new Set(['1.1', '1.2', '1.3', '2.1', '2.2', '2.3', '3.1', '3.2']));
  });
  test('four options each, the answer among them; right answers pass and a wrong one fails', () => {
    for (const [id, c] of qs) {
      expect(c.opts, id).toHaveLength(4);
      expect(c.opts.map(o => o[0]), id).toContain(c.a);
    }
    expect(allCorrect(markChoices('terms', right))).toBe(true);
    expect(markChoices('terms', { ...right, q_aim: 'acc' }).q_aim).toBe(false);
  });
  test('no question contains its own answer', () => {
    for (const [id, c] of qs) expect(c.q.toLowerCase(), id).not.toContain(answerText(c).toLowerCase());
  });
  test('the right answer is the longest option in under half the questions', () => {
    expect(qs.filter(([, c]) => rightIsLongest(c.opts, c.a)).length).toBeLessThan(qs.length / 2);
  });
});

describe('scoring: the terms count twice and score the share right; the writing counts once', () => {
  const done = TASKS.map(t => !t.level), first = TASKS.map(() => true);
  test('all right and the writing saved is 100; optional tabs never change it', () => {
    expect(calcScore(done, first, right)).toBe(100);
    expect(calcScore(TASKS.map(() => true), first, right)).toBe(100);
  });
  test('12 of 15 right is 80% of the terms: two thirds of 80 plus the writing', () => {
    const three = Object.fromEntries(qs.map(([id, c], n) => [id, n < 3 ? wrongFor(c) : c.a]));
    expect(onceShare('terms', three)).toBeCloseTo(0.8);
    expect(calcScore(done, first, three)).toBe(Math.round((2 * 80 + 100) / 3));
  });
  test('the terms alone, before any writing, count for two thirds', () => {
    expect(calcScore([true, false, false], first, right)).toBe(67);
    expect(coreDone([true, false, false])).toBe(false);
  });
});

describe('Task 2 and the challenge: writing', () => {
  const good = {
    a_who: 'Channel 4 is a public service broadcaster. The purpose of Bake Off is to entertain, and the motivation is to generate profit from the adverts shown in the breaks.',
    a_aud: 'The primary audience is families and adults aged 25 to 60 who like baking. A secondary audience is students, who watch it for the jokes and the memes online.',
    a_use: 'Families watch it together on a Tuesday night in the living room, which meets a need for social interaction. Keen bakers watch on their own and try the recipes later, so it meets a need for information.',
  };
  test('a full answer passes', () => {
    expect(allCorrect(markWriting('apply', good))).toBe(true);
  });
  test('missing a word bank fails (no producer type; no secondary audience; no need)', () => {
    expect(markWriting('apply', { ...good, a_who: 'Channel 4 makes it. The purpose of Bake Off is to entertain, and the motivation is to generate profit from the adverts in the breaks.' }).a_who).toBe(false);
    expect(markWriting('apply', { ...good, a_aud: 'The primary audience is families and adults aged 25 to 60 who like baking, and they watch it every single Tuesday at home.' }).a_aud).toBe(false);
    expect(markWriting('apply', { ...good, a_use: 'Families watch it together on a Tuesday night in the living room, and keen bakers watch on their own and then try the recipes later in the week.' }).a_use).toBe(false);
  });
  test('the same text in two boxes fails the second', () => {
    expect(markWriting('apply', { ...good, a_aud: good.a_use }).a_aud).toBe(false);
  });
  test('no sentence starters (the real assessment has none), but every box has a prompt, a question to ask and word banks', () => {
    for (const w of [...WRITING.apply, ...WRITING.then]) {
      expect(w.starter, w.id).toBeUndefined();
      expect(w.prompt && w.ask && w.words?.length, w.id).toBeTruthy();
    }
  });
  test('★ then and now: a motivation and an aim pass', () => {
    const t = { c_move: 'On Channel 4 the motivation is more about generating profit, because the adverts pay for it. One aim stays high quality, because viewers would switch off if the bakes and the tent looked cheap.' };
    expect(allCorrect(markWriting('then', t))).toBe(true);
  });
});

describe('glossary', () => {
  test('meanings are short, and none of the spec terms being tested has one (it would give the answer away)', () => {
    for (const [, m] of GLOSSARY) expect(m.length).toBeLessThanOrEqual(80);
    for (const [, c] of qs) expect(glossaryDef(answerText(c)), answerText(c)).toBeUndefined();
    for (const w of ['amateur', 'licence fee', 'Ofcom', 'airtime']) expect(glossaryDef(w), w).toBeTruthy();
  });
});
