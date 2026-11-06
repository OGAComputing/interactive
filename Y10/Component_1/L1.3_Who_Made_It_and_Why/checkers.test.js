import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  TASKS, TASK_COUNT, SORTS, CHOICES, WRITING, REVEALS, SPOTS, markSort, markChoices, markWriting, markReveal,
  markSpot, markSpotFlags, starsFor, allCorrect, calcScore, GLOSSARY, glossaryDef,
} from './checkers.js';

const html = readFileSync(new URL('./1_Who_Made_It_and_Why.html', import.meta.url), 'utf8');
const keyOf = items => Object.fromEntries(items.map(it => [it.id, it.bin]));

const typeWords = /conglomerate|public service|independent|community/i;

describe('1 · mystery producer', () => {
  const { opts, rounds } = REVEALS.who;

  test('every producer type has a round; every round has 3+ clues, a picture and a source', () => {
    for (const [k] of opts) expect(rounds.some(r => r.a === k), k).toBe(true);
    for (const r of rounds) {
      expect(r.clues.length, r.id).toBeGreaterThanOrEqual(3);
      expect(r.img && r.credit && r.note && r.who, r.id).toBeTruthy();
      expect(r.label, r.id).toContain(r.who.replace(/^the /, ''));   // the named producer is the one in the label
      expect(opts.map(o => o[0])).toContain(r.a);
    }
    expect(new Set(rounds.map(r => r.id)).size).toBe(rounds.length);
  });

  test('the first clues never give the answer away with the type\'s own words', () => {
    for (const r of rounds) for (const c of r.clues.slice(0, -1)) expect(c, r.id).not.toMatch(typeWords);
  });

  test('all rounds right passes; one wrong round fails only that round', () => {
    const right = Object.fromEntries(rounds.map(r => [r.id, r.a]));
    expect(allCorrect(markReveal('who', right))).toBe(true);
    const res = markReveal('who', { ...right, r_c4: 'cong' });
    expect(res.r_c4).toBe(false);
    expect(Object.values(res).filter(Boolean)).toHaveLength(rounds.length - 1);
  });

  test('stars: 3 on the first clue, 2 on the second, then 1', () => {
    expect([1, 2, 3, 4].map(starsFor)).toEqual([3, 2, 1, 1]);
  });
});

describe('2 · spot the slip', () => {
  const parts = SPOTS.slip.parts, slips = parts.filter(p => p.fix);
  const flags = Object.fromEntries(slips.map(p => [p.id, 'flag']));
  const fixes = Object.fromEntries(slips.map(p => [p.id + '_fix', p.fix.a]));

  test('four slips among eight sentences, covering profit-as-purpose', () => {
    expect(parts).toHaveLength(8);
    expect(slips).toHaveLength(4);
    expect(slips.some(p => /purpose.*profit/i.test(p.text))).toBe(true);
    for (const p of slips) expect(p.fix.opts.map(o => o[0])).toContain(p.fix.a);
  });

  test('stage 1: flagging exactly the slips passes; a missed or extra flag fails that sentence', () => {
    expect(allCorrect(markSpotFlags('slip', flags))).toBe(true);
    const { s3, ...missed } = flags;
    expect(markSpotFlags('slip', missed).s3).toBe(false);
    expect(markSpotFlags('slip', { ...flags, s7: 'flag' }).s7).toBe(false);
  });

  test('stage 2: the right fixes pass; a wrong fix fails only that fix', () => {
    expect(allCorrect(markSpot('slip', { ...flags, ...fixes }))).toBe(true);
    const res = markSpot('slip', { ...flags, ...fixes, s3_fix: 'aware' });
    expect(res.s3_fix).toBe(false);
    expect(res.s1_fix).toBe(true);
  });

  test('the right fix is never the longest option', () => {
    for (const p of slips) {
      const len = k => p.fix.opts.find(o => o[0] === k)[1].length;
      expect(p.fix.opts.some(([k]) => k !== p.fix.a && len(k) > len(p.fix.a)), p.id).toBe(true);
    }
  });
});

describe('3 · name the reason', () => {
  const qs = Object.values(CHOICES.name);

  test('every answer is one of its options and right answers pass', () => {
    for (const c of qs) expect(c.opts.map(o => o[0])).toContain(c.a);
    const right = Object.fromEntries(Object.entries(CHOICES.name).map(([id, c]) => [id, c.a]));
    expect(allCorrect(markChoices('name', right))).toBe(true);
    expect(markChoices('name', { ...right, bite: 'profit' }).bite).toBe(false);
  });

  test('the right answer is not the longest option in half or more of the questions', () => {
    const longest = qs.filter(c => {
      const len = k => c.opts.find(o => o[0] === k)[1].length;
      return c.opts.every(([k]) => k === c.a || len(c.a) >= len(k));
    });
    expect(longest.length).toBeLessThan(qs.length / 2);
  });

  test('no question reuses a sentence from the spot-the-slip paragraph', () => {
    for (const c of qs) for (const p of SPOTS.slip.parts) expect(c.q).not.toContain(p.text);
  });
});

describe('4 · your turn', () => {
  const good = {
    ami_prod: 'Stranger Things, Netflix',
    ami_why: 'Stranger Things was made by Netflix, which is a media conglomerate. Its purpose is to entertain because it is scary and exciting',
    print_prod: 'The Beano, DC Thomson',
    print_why: 'The Beano was made by DC Thomson, which is an independent producer. Its purpose is to entertain children with jokes and comic strips',
    int_prod: 'Minecraft, Mojang',
    int_why: 'Minecraft was made by Mojang, which is owned by a media conglomerate. Its purpose is to entertain because you can build anything',
    one_mot: 'The motivation of Netflix is to generate profit because more people subscribe to watch new seasons',
    one_aim: 'One aim was to make it high quality. You can see this because the effects and sets look like a film',
  };

  test('three real products with reasons pass', () => {
    expect(allCorrect(markWriting('yours', good))).toBe(true);
  });

  test('the same product twice fails, and a one-word reason fails', () => {
    expect(markWriting('yours', { ...good, print_prod: 'stranger things netflix' }).print_prod).toBe(false);
    expect(markWriting('yours', { ...good, int_why: 'to entertain' }).int_why).toBe(false);
  });
});

describe('warm-up and challenge', () => {
  test('the warm-up has two examples (no meaning cards) for each kind of producer', () => {
    for (const [bin] of SORTS.kinds.bins) expect(SORTS.kinds.items.filter(it => it.bin === bin)).toHaveLength(2);
    expect(SORTS.kinds.items.every(it => /_ex2?$/.test(it.id))).toBe(true);
    expect(allCorrect(markSort('kinds', keyOf(SORTS.kinds.items)))).toBe(true);
  });

  test('the challenge needs extended writing', () => {
    const good = {
      ch_beast: 'Yes, because he started alone and still owns his own company and decides what to make. But no, because Amazon pays for Beast Games and a giant company now controls where it is shown. I think he is still independent but works with a conglomerate',
      ch_free: 'Metro makes money by selling adverts, because lots of commuters pick it up for free. The purpose of the front page is to inspire readers, but the motivation is to generate profit by getting more people to read it',
      ch_bbc: 'The BBC\'s motivation is its public service responsibilities because it has a duty to educate everyone, even when a product like Bitesize earns nothing. Warner Bros. wants to generate profit instead',
    };
    expect(allCorrect(markWriting('tricky', good))).toBe(true);
    expect(markWriting('tricky', { ...good, ch_bbc: 'Because they have to' }).ch_bbc).toBe(false);
  });
});

describe('glossary', () => {
  // Everything students read in the tasks: data text plus the page's goals and paragraphs.
  const studentText = [
    JSON.stringify([REVEALS, SPOTS, CHOICES, WRITING, SORTS]),
    html.slice(html.indexOf('<body>'), html.indexOf('<!-- IMG-DATA')),
  ].join(' ');

  test('every word is used on the page and has a short, plain meaning', () => {
    for (const [p, def] of GLOSSARY) {
      expect(new RegExp(`\\b(?:${p})\\b`, 'i').test(studentText), p).toBe(true);
      expect(def.length, p).toBeLessThanOrEqual(80);
      expect(p, 'use (?:…), not capture groups').not.toMatch(/\((?!\?:)/);
    }
  });

  test('each matched form finds its meaning', () => {
    for (const w of ['Innovation', 'generate a profit', 'Generate profit', 'shareholders', 'TV licence', 'licence fee', 'conglomerate', 'broadcasters'])
      expect(glossaryDef(w), w).toBeTruthy();
    expect(glossaryDef('entertain')).toBeUndefined();
  });
});

describe('page wiring', () => {
  test('tasks line up with the data and the tabs', () => {
    expect(TASK_COUNT).toBe(6);
    expect(TASKS.filter(t => !t.level)).toHaveLength(4);
    for (const t of TASKS) expect({ sort: SORTS, choice: CHOICES, write: WRITING, reveal: REVEALS, spot: SPOTS }[t.kind][t.key], t.key).toBeTruthy();
    TASKS.forEach((t, i) => expect(html).toContain(`data-${{ sort: 'sort', choice: 'choices', write: 'write', reveal: 'reveal', spot: 'spot' }[t.kind]}="${t.key}"`));
  });

  test('the page opens on the warm-up', () => {
    expect(html).toMatch(/<button class="tab support active" data-idx="4">/);
    expect(html).toContain('<section class="panel active" id="panel-4">');
  });

  test('optional tabs never change the score', () => {
    expect(calcScore([true, true, true, true, false, false], new Array(6).fill(true))).toBe(100);
  });

  test('every image the page uses is inlined', () => {
    const keys = [...html.matchAll(/<img data-img="([^"]+)"/g)].map(m => m[1]).concat(REVEALS.who.rounds.map(r => r.img));
    expect(keys.length).toBeGreaterThan(10);
    for (const k of keys) expect(html, k).toContain(`'${k}': 'data:image/jpeg;base64,`);
  });

  test('the page stays under about 1 MB', () => {
    expect(html.length).toBeLessThan(1_000_000);
  });
});
