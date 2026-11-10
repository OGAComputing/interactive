import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  TASKS, TASK_COUNT, SORTS, CHOICES, WRITING, REVEALS, PROFILES, markSort, markChoices, markWriting, markReveal, markProfile,
  softIds, allCorrect, calcScore, GLOSSARY, glossaryDef, UNLOCK, unlockedBy, partOf,
} from './checkers.js';

const html = readFileSync(new URL('./1_Who_Is_It_For.html', import.meta.url), 'utf8');
const optLen = (opts, k) => opts.find(o => o[0] === k)[1].length;
const rightOf = (data, key) => Object.fromEntries(data[key].items.map(it => [it.id, it.bin]));

describe('warm-up: age, gender or socio-economic group?', () => {
  test('two facts in each box, and right answers pass', () => {
    for (const [bin] of SORTS.warm.bins) expect(SORTS.warm.items.filter(it => it.bin === bin)).toHaveLength(2);
    expect(allCorrect(markSort('warm', rightOf(SORTS, 'warm')))).toBe(true);
  });
});

describe('1 · who\'s in the audience?', () => {
  const qs = Object.entries(CHOICES.who);
  const right = Object.fromEntries(qs.map(([id, c]) => [id, c.a]));

  test('every answer is an option, every socio-economic group is an answer once, and right answers pass', () => {
    for (const [, c] of qs) expect(c.opts.map(o => o[0])).toContain(c.a);
    for (const g of ['ab', 'c1', 'c2', 'de']) expect(qs.filter(([, c]) => c.a === g), g).toHaveLength(1);
    expect(allCorrect(markChoices('who', right))).toBe(true);
    expect(markChoices('who', { ...right, bluey: 'pri' }).bluey).toBe(false);
  });

  test('the right answer is not the longest option in half or more of the questions', () => {
    const longest = qs.filter(([, c]) => c.opts.every(([k]) => k === c.a || optLen(c.opts, c.a) >= optLen(c.opts, k)));
    expect(longest.length).toBeLessThan(qs.length / 2);
  });

  test('no warm-up card turns up again as an option', () => {
    for (const [, c] of qs) for (const it of SORTS.warm.items) expect(c.opts.map(o => o[1])).not.toContain(it.label);
  });
});

describe('2 · who\'s it for? (reveal)', () => {
  const game = REVEALS.guess, keys = game.opts.map(o => o[0]);

  test('each round has three or more clues, a picture, a source and its own answer; two options are never right', () => {
    for (const r of game.rounds) {
      expect(r.clues.length, r.id).toBeGreaterThanOrEqual(3);
      expect(r.img && r.credit && r.who && r.note, r.id).toBeTruthy();
      expect(keys).toContain(r.a);
    }
    expect(new Set(game.rounds.map(r => r.a)).size).toBe(game.rounds.length);
    expect(keys.length).toBeGreaterThan(game.rounds.length + 1);   // the last round is never a free guess
    expect(game.showFirst).toBe(true);
  });

  test('every option says age, gender and socio-economic group', () => {
    for (const [, t] of game.opts) expect(t.split(' · '), t).toHaveLength(3);
  });

  test('right guesses solve every round; a wrong one does not', () => {
    const right = Object.fromEntries(game.rounds.map(r => [r.id, r.a]));
    expect(allCorrect(markReveal('guess', right))).toBe(true);
    expect(markReveal('guess', { ...right, g_vogue: 'old' }).g_vogue).toBe(false);
  });
});

describe('3 · a football fan (sort)', () => {
  test('two facts for each part of the lifestyle profile, none copied from the worked-model examples', () => {
    for (const [bin] of SORTS.fans.bins) expect(SORTS.fans.items.filter(it => it.bin === bin)).toHaveLength(2);
    const terms = html.slice(html.indexOf('id="panel-2"'), html.indexOf('data-sort="fans"'));
    for (const it of SORTS.fans.items) expect(terms).not.toContain(it.label);
    expect(allCorrect(markSort('fans', rightOf(SORTS, 'fans')))).toBe(true);
    expect(markSort('fans', { ...rightOf(SORTS, 'fans'), f_var: 'val' }).f_var).toBe(false);
  });
});

describe('4 · profile the audience, and ★ Stranger Things', () => {
  const fields = key => PROFILES[key].cards.flatMap(c => c.fields);
  const right = key => Object.fromEntries(fields(key).map(f => [f.id, f.ok[0]]));

  test('every card has a picture, a source, an evidence file and all eight fields', () => {
    for (const c of Object.values(PROFILES).flatMap(p => p.cards)) {
      expect(c.img && c.credit, c.id).toBeTruthy();
      expect(c.evidence.length, c.id).toBeGreaterThanOrEqual(5);
      expect(c.fields.map(f => f.id.split('_')[1])).toEqual(['age', 'gen', 'seg', 'sec', 'int', 'att', 'val', 'beh']);
    }
    expect(PROFILES.card.cards.map(c => c.sector.split(' ')[0])).toEqual(['Audio', 'Interactive']);
  });

  test('every accepted answer is an option, and no field accepts every option', () => {
    for (const f of [...fields('card'), ...fields('st')]) {
      const ks = f.opts.map(o => o[0]);
      for (const k of f.ok) expect(ks, f.id).toContain(k);
      expect(f.ok.length, f.id).toBeLessThan(ks.length);
      expect(new Set(ks).size, f.id).toBe(ks.length);
    }
  });

  test('each lifestyle statement is right in exactly one field on its card', () => {
    for (const c of Object.values(PROFILES).flatMap(p => p.cards)) {
      const life = c.fields.filter(f => ['int', 'att', 'val', 'beh'].includes(f.id.split('_')[1]));
      const rightTexts = life.map(f => f.opts.find(o => o[0] === f.ok[0])[1]);
      expect(new Set(rightTexts).size, c.id).toBe(4);
      for (const f of life) for (const t of rightTexts) expect(f.opts.map(o => o[1]), f.id).toContain(t);
    }
  });

  test('a right option is the longest in under half the fields', () => {
    const all = [...fields('card'), ...fields('st')];
    const longest = all.filter(f => {
      const r = Math.max(...f.ok.map(k => optLen(f.opts, k)));
      return f.opts.every(([k, t]) => f.ok.includes(k) || t.length <= r);
    });
    expect(longest.length).toBeLessThan(all.length / 2);
  });

  test('the secondary audience is never the primary audience', () => {
    for (const f of [...fields('card'), ...fields('st')].filter(f => f.id.endsWith('_sec'))) expect(f.ok).not.toContain('pri');
  });

  test('a full profile passes; a wrong field fails only that field', () => {
    expect(allCorrect(markProfile('card', right('card')))).toBe(true);
    const res = markProfile('card', { ...right('card'), f_gen: 'mix' });
    expect(res.f_gen).toBe(false);
    expect(Object.values(res).filter(v => !v)).toHaveLength(1);
    expect(markProfile('card', { ...right('card'), f_sec: 'watch' }).f_sec).toBe(true);   // either secondary audience
  });

  test('the Stranger Things "why" box is writing: soft, and needs the spec word', () => {
    const r = right('st');
    expect(softIds(TASKS.find(t => t.key === 'st'))).toEqual(new Set(['st_why']));
    expect(markProfile('st', { ...r, st_why: 'Parents who were teenagers in the 1980s enjoy the songs and fashion they remember' }).st_why).toBe(false);
    expect(allCorrect(markProfile('st', { ...r, st_why: 'The secondary audience grew up in the 1980s so they enjoy the songs and fashion they remember' }))).toBe(true);
  });
});

describe('writing', () => {
  const meet = {
    m_prod: 'Fortnite',
    m_who: 'A typical member of the primary audience is Kai, aged 15, a boy whose family is in socio-economic group C1',
    m_int: 'In his free time he is interested in gaming, streamers and new skins',
    m_att: 'His attitude to games is that they are more fun with friends',
    m_val: 'He values teamwork because his squad relies on him to win',
    m_beh: 'His behaviour: every evening he plays online with his friends on headsets',
  };
  test('a full lifestyle profile passes; a box without its spec word fails', () => {
    expect(allCorrect(markWriting('meet', meet))).toBe(true);
    expect(markWriting('meet', { ...meet, m_val: 'Teamwork matters to him because his squad relies on him to win' }).m_val).toBe(false);
    expect(markWriting('meet', { ...meet, m_who: 'Kai is fifteen and plays every single day after school' }).m_who).toBe(false);
  });
  test('every writing box has a prompt, and every long one a starter', () => {
    for (const w of [...WRITING.two, ...WRITING.meet]) {
      expect(w.prompt, w.id).toBeTruthy();
      if (!w.short) expect(w.starter && w.words, w.id).toBeTruthy();
    }
  });
});

describe('glossary', () => {
  const studentText = [
    JSON.stringify([CHOICES, WRITING, SORTS, REVEALS, PROFILES]),
    html.slice(html.indexOf('<body>'), html.indexOf('<!-- IMG-DATA')),
  ].join(' ');

  test('every word is used on the page and has a short, plain meaning', () => {
    for (const [p, def] of GLOSSARY) {
      expect(new RegExp(`\\b(?:${p})\\b`, 'i').test(studentText), p).toBe(true);
      expect(def.length, p).toBeLessThanOrEqual(80);
      expect(p, 'use (?:…), not capture groups').not.toMatch(/\((?!\?:)/);
    }
  });

  test('the lesson\'s spec terms all have meanings', () => {
    for (const w of ['primary audience', 'secondary audience', 'socio-economic group', 'lifestyle', 'interests', 'attitude', 'values', 'behaviour', 'ABC1', 'C2DE'])
      expect(glossaryDef(w), w).toBeTruthy();
  });
});

describe('page wiring', () => {
  test('two parts, Part 2 locked behind its word, each part with a challenge to wait with', () => {
    expect(TASKS.filter(t => !t.level).map(t => t.part || 1)).toEqual([1, 1, 2, 2, 2]);
    for (const p of [1, 2]) expect(TASKS.some(t => (t.part || 1) === p && t.level === 'challenge'), `part ${p}`).toBe(true);
    expect(unlockedBy(' SuperFan! ')).toBe(2);
    expect(unlockedBy('outwood')).toBe(2);
    expect(unlockedBy('football')).toBe(0);
    expect(partOf(2)).toBe(2);
    const tabs = html.slice(html.indexOf('<nav'), html.indexOf('</nav>'));
    for (const w of Object.values(UNLOCK)) expect(tabs.toLowerCase()).not.toContain(w);
  });

  test('no two core tabs in a row use the same kind, and at most one core sort', () => {
    const core = TASKS.filter(t => !t.level).map(t => t.kind);
    expect(core.every((k, n) => !n || k !== core[n - 1])).toBe(true);
    expect(core.filter(k => k === 'sort').length).toBeLessThanOrEqual(1);
  });

  test('tasks line up with the data and the tabs; the page opens on the Warm-up', () => {
    expect(TASK_COUNT).toBe(8);
    const attr = { choice: 'data-choices', sort: 'data-sort', write: 'data-write', reveal: 'data-reveal', profile: 'data-profile' };
    TASKS.forEach((t, i) => {
      const panel = html.slice(html.indexOf(`id="panel-${i}"`));
      expect(panel.slice(0, panel.indexOf('</section>')), t.key).toContain(`${attr[t.kind]}="${t.key}"`);
      expect(html, t.key).toMatch(new RegExp(`class="tab[^"]*" data-idx="${i}"`));
    });
    expect(html).toContain('class="tab support active" data-idx="5"');
    expect(html).toContain('class="panel active" id="panel-5"');
  });

  test('optional tabs never change the score', () => {
    expect(calcScore([true, true, true, true, true, false, false, false], new Array(8).fill(true))).toBe(100);
  });

  test('every image the page uses is inlined', () => {
    const keys = [
      ...[...html.matchAll(/<img data-img="([^"]+)"/g)].map(m => m[1]),
      ...REVEALS.guess.rounds.map(r => r.img),
      ...Object.values(PROFILES).flatMap(p => p.cards).map(c => c.img),
    ];
    expect(keys.length).toBe(8);
    for (const k of keys) expect(html, k).toContain(`'${k}': 'data:image/jpeg;base64,`);
  });

  test('the page stays under about 1 MB', () => {
    expect(html.length).toBeLessThan(1_000_000);
  });
});
