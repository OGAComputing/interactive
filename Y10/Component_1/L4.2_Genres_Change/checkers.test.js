import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  TASKS, TASK_COUNT, SORTS, CHOICES, WRITING, markSort, markChoices, markWriting, sortBlocker, allCorrect, calcScore,
  GLOSSARY, glossaryDef, UNLOCK, unlockedBy, partOf,
} from './checkers.js';

const html = readFileSync(new URL('./1_Genres_Change.html', import.meta.url), 'utf8');
const optLen = (opts, k) => opts.find(o => o[0] === k)[1].length;
const rightIsLongest = (opts, a) => opts.every(([k]) => k === a || optLen(opts, a) >= optLen(opts, k));
const idx = key => TASKS.findIndex(t => t.key === key);

// Product images still to be supplied (the page hides their frames until they're inlined).
// Remove each key from here once it is inlined with Y10/inline_images.py.
const PENDING_IMAGES = new Set([]);

describe('page identity and tabs', () => {
  test('title matches ACTIVITY_TITLE, the page opens on the warm-up, and every task has a tab and panel', () => {
    expect(html).toContain('title:  Genres Change');
    expect(html).toContain("const ACTIVITY_TITLE = 'Genres Change';");
    expect(html).toContain("const STORAGE_KEY    = 'y10_l4_2_genres_change';");
    expect(html).toMatch(/class="tab support active" data-idx="4"/);
    expect(html).toMatch(/class="panel active" id="panel-4"/);
    for (let i = 0; i < TASK_COUNT; i++) {
      expect(html, `tab ${i}`).toContain(`data-idx="${i}"`);
      expect(html, `panel ${i}`).toContain(`id="panel-${i}"`);
    }
    expect(html).not.toMatch(/FILL IN|TODO/);
  });

  test('no two core tabs in a row use the same kind, and at most one core sort', () => {
    const core = TASKS.filter(t => !t.level);
    for (let i = 1; i < core.length; i++) expect(core[i].kind, core[i].key).not.toBe(core[i - 1].kind);
    expect(core.filter(t => t.kind === 'sort').length).toBeLessThanOrEqual(1);
  });

  test('every image the page uses is inlined, or still on the pending list', () => {
    const keys = new Set([...html.matchAll(/data-img="([^"]+)"/g)].map(m => m[1])
      .concat(Object.values(CHOICES.fam).map(c => c.img)));
    for (const k of keys) {
      if (PENDING_IMAGES.has(k)) continue;
      expect(html, k).toMatch(new RegExp(`['"]${k}['"]:\\s*['"]data:image/(jpeg|png);base64,`));
    }
    for (const k of PENDING_IMAGES) expect(keys.has(k), `${k} is pending but not used`).toBe(true);
    expect(html.length).toBeLessThan(1_000_000);
  });
});

describe('parts', () => {
  test('Part 2 opens with its word (any case), the teacher word opens it, and both parts have a challenge', () => {
    expect(unlockedBy(UNLOCK[2])).toBe(2);
    expect(unlockedBy('ReMake')).toBe(2);
    expect(unlockedBy('outwood')).toBe(2);
    expect(unlockedBy('hybrid')).toBe(0);
    for (const p of [1, 2]) expect(TASKS.some((t, i) => partOf(i) === p && t.level === 'challenge'), `part ${p}`).toBe(true);
    // Subverting and repetition and difference are taught in Part 2.
    for (const k of ['rds', 'then', 'ps']) expect(partOf(idx(k)), k).toBe(2);
    for (const k of ['fam', 'use', 'warm', 'mix']) expect(partOf(idx(k)), k).toBe(1);
  });
});

describe('warm-up sort', () => {
  const s = SORTS.warm, right = Object.fromEntries(s.items.map(it => [it.id, it.bin]));
  test('four examples per box; right answers pass, a wrong card fails', () => {
    for (const [bin] of s.bins) expect(s.items.filter(it => it.bin === bin)).toHaveLength(4);
    expect(allCorrect(markSort('warm', right))).toBe(true);
    expect(markSort('warm', { ...right, w_vamp: 'sub' }).w_vamp).toBe(false);
  });
  test('the cards are made-up examples that never name the answer', () => {
    for (const it of s.items) expect(it.label).not.toMatch(/sub-genre|hybrid|mix|inside/i);
  });
});

describe('Task 1: sub-genre or hybrid (choice)', () => {
  const qs = Object.entries(CHOICES.fam);
  test('six products, three of each; every answer is an option; right answers pass and a wrong one fails', () => {
    expect(qs).toHaveLength(6);
    expect(qs.filter(([, c]) => c.opts.find(o => o[0] === c.a)[1].startsWith('A sub-genre'))).toHaveLength(3);
    expect(qs.filter(([, c]) => c.opts.find(o => o[0] === c.a)[1].startsWith('A hybrid'))).toHaveLength(3);
    const right = Object.fromEntries(qs.map(([id, c]) => [id, c.a]));
    expect(allCorrect(markChoices('fam', right))).toBe(true);
    expect(markChoices('fam', { ...right, ghosts: 'sub' }).ghosts).toBe(false);
  });
  test('every question has a picture with its source, and offers both a sub-genre and a hybrid', () => {
    for (const [id, c] of qs) {
      expect(c.img && c.alt && c.credit, id).toBeTruthy();
      expect(c.opts.some(o => o[1].startsWith('A sub-genre')), id).toBe(true);
      expect(c.opts.some(o => o[1].startsWith('A hybrid')), id).toBe(true);
    }
  });
  test('no question names its own answer, and the right answer is never the longest option', () => {
    for (const [id, c] of qs) expect(c.q, id).not.toMatch(/sub-genre|hybrid/i);
    expect(qs.filter(([, c]) => rightIsLongest(c.opts, c.a))).toHaveLength(0);
  });
});

describe('Task 3: repetition, difference or subverting (sort)', () => {
  const s = SORTS.rds, right = Object.fromEntries(s.items.map(it => [it.id, it.bin]));
  test('three cards per box, one of each kind per product; right answers pass, a wrong card fails', () => {
    for (const [bin] of s.bins) expect(s.items.filter(it => it.bin === bin)).toHaveLength(3);
    for (const prod of ['Encanto', 'Horrible Histories', 'Untitled Goose Game']) {
      expect(new Set(s.items.filter(it => it.label.startsWith(prod + ':')).map(it => it.bin)).size, prod).toBe(3);
    }
    expect(allCorrect(markSort('rds', right))).toBe(true);
    expect(markSort('rds', { ...right, h_sub: 'dif' }).h_sub).toBe(false);
    expect(sortBlocker(s, { ...right, h_sub: 'rep' })).toMatch(/number of cards/);
  });
  test('the cards never give their box away: no "not", "usually", "new" or "opposite"', () => {
    for (const it of s.items) {
      expect(it.label, it.id).not.toMatch(/\b(?:not|no|usually|new|opposite|convention|like every)\b|n't\b(?! see)/i);
      expect(it.note, it.id).toBeTruthy();
    }
  });
  test('the three products are on show as clips, each with its genre\'s conventions and an Open in Drive link', () => {
    expect([...html.matchAll(/class="prod"/g)]).toHaveLength(3);
    expect([...html.matchAll(/drive\.google\.com\/file\/d\/[^/]+\/preview/g)]).toHaveLength(3);
    expect([...html.matchAll(/drive\.google\.com\/file\/d\/[^/]+\/view/g)]).toHaveLength(3);
    for (const t of ['Encanto', 'Horrible Histories', 'Untitled Goose Game']) expect(html).toContain(`<div class="convs"><b>${t}`);
  });
});

describe('writing', () => {
  const use = {
    u_sub: 'Sonic Racing: CrossWorlds',
    u_subw: 'Sonic Racing is a sub-genre of racing games because you race to the finish line, but only in karts with items.',
    u_hyb: 'Plants vs. Zombies',
    u_hybw: 'Plants vs. Zombies is a hybrid of strategy and horror because you plan where your plants go and zombies attack.',
  };
  test('full answers using each box\'s spec word pass', () => {
    expect(allCorrect(markWriting('use', use))).toBe(true);
  });
  test('an answer without its spec word, the same product twice, or the starter copied, fails', () => {
    expect(markWriting('use', { ...use, u_hybw: 'Plants vs. Zombies mixes strategy and horror because you plan where plants go and zombies attack.' }).u_hybw).toBe(false);
    expect(markWriting('use', { ...use, u_hyb: 'Sonic Racing: CrossWorlds' }).u_hyb).toBe(false);
    expect(markWriting('use', { ...use, u_subw: '… is a sub-genre of … because…' }).u_subw).toBe(false);
  });
  const then = {
    t_pair: 'Godzilla',
    t_rep: 'Both are monster films. The new one repeats conventions such as a giant monster rising from the sea and roaring.',
    t_dif: 'The biggest difference is the CGI, which makes Godzilla look real and taller than a skyscraper, so it feels new.',
    t_sub: 'The old one makes Godzilla a monster that destroys Tokyo, but the new one subverts this by making him the hero.',
  };
  test('Task 4 needs repetition (or repeats) and convention, difference (or different), and subvert', () => {
    expect(allCorrect(markWriting('then', then))).toBe(true);
    expect(markWriting('then', { ...then, t_rep: 'Both are monster films. The new one has a giant monster rising from the sea and roaring like a convention.' }).t_rep).toBe(false);
    expect(markWriting('then', { ...then, t_dif: 'The new one is in colour and made with CGI, which makes Godzilla look real and taller than buildings.' }).t_dif).toBe(false);
    expect(markWriting('then', { ...then, t_sub: 'The old one makes Godzilla a monster that destroys Tokyo, but the new one makes him the hero who saves us.' }).t_sub).toBe(false);
    expect(markWriting('then', { ...then, t_dif: 'This one is different: it uses CGI and Godzilla is taller than a skyscraper, so he looks real.' }).t_dif).toBe(true);
  });
  test('the challenges need their spec words', () => {
    const mix = {
      x_name: 'Bake or Die (a TV show)',
      x_mix: 'It is a hybrid of a cooking show and a horror film.',
      x_icon: 'The iconography from cooking is ovens and aprons, and from horror it is a dark haunted kitchen at midnight.',
      x_why: 'The audience would enjoy it because they get scared and hungry at the same time, which is funny.',
    };
    expect(allCorrect(markWriting('mix', mix))).toBe(true);
    expect(markWriting('mix', { ...mix, x_mix: 'It mixes a cooking show and a scary horror film together.' }).x_mix).toBe(false);
    const ps = {
      p_old: 'Godzilla (1954)',
      p_add: 'I added a phone and a drone on their own layers, which is iconography that tells you it is set today.',
      p_keep: 'I kept the giant monster and the burning city because they are conventions of monster films.',
    };
    expect(allCorrect(markWriting('ps', ps))).toBe(true);
  });
});

describe('scoring and glossary', () => {
  test('optional tabs never change the score; 80 for finishing, 100 for first time', () => {
    const core = TASKS.map(t => !t.level);
    expect(calcScore(core, core.map(() => true))).toBe(100);
    expect(calcScore(core, core.map(() => false))).toBe(80);
    expect(calcScore(TASKS.map(() => false), TASKS.map(() => true))).toBe(0);
  });
  test('the spec terms are in the glossary, worded as the ISYS facts, and every meaning is short', () => {
    expect(glossaryDef('sub-genre')).toMatch(/^Part of a genre/);
    expect(glossaryDef('hybrids')).toMatch(/^Two genres mixed/);
    expect(glossaryDef('subverts')).toMatch(/^Do the opposite/);
    expect(glossaryDef('repetition')).toBeTruthy();
    expect(glossaryDef('difference')).toBeTruthy();
    for (const [p, d] of GLOSSARY) {
      expect(d.length, p).toBeLessThanOrEqual(80);
      expect(() => new RegExp(p), p).not.toThrow();
      expect(p, 'no capturing groups').not.toMatch(/\((?!\?)/);
    }
  });
});
