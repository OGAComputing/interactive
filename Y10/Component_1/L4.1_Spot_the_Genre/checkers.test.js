import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  TASKS, TASK_COUNT, SORTS, CHOICES, WRITING, SPOTS, REVEALS, HOTSPOTS, markSort, markChoices, markWriting, markReveal,
  markSpot, markSpotFlags, markHotspot, zoneAt, hotspotBlocker, hotspotDataProblems, allCorrect, calcScore,
  GLOSSARY, glossaryDef, UNLOCK, unlockedBy, partOf, cooldownSeconds,
} from './checkers.js';

const html = readFileSync(new URL('./1_Spot_the_Genre.html', import.meta.url), 'utf8');
const optLen = (opts, k) => opts.find(o => o[0] === k)[1].length;
const rightIsLongest = (opts, a) => opts.every(([k]) => k === a || optLen(opts, a) >= optLen(opts, k));
const idx = key => TASKS.findIndex(t => t.key === key);

// Product images still to be supplied (the page hides their frames until they're inlined).
// Remove each key from here once it is inlined with Y10/inline_images.py.
const PENDING_IMAGES = new Set([]);

describe('page identity and tabs', () => {
  test('title matches ACTIVITY_TITLE, the page opens on the warm-up, and every task has a tab and panel', () => {
    expect(html).toContain('title:  Spot the Genre');
    expect(html).toContain("const ACTIVITY_TITLE = 'Spot the Genre';");
    expect(html).toContain("const STORAGE_KEY    = 'y10_l4_1_spot_the_genre';");
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
      .concat(REVEALS.conv.rounds.map(r => r.img))
      .concat(HOTSPOTS.icon.pics.map(p => p.img)));
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
    expect(unlockedBy('MastHead')).toBe(2);
    expect(unlockedBy('outwood')).toBe(2);
    expect(unlockedBy('iconography')).toBe(0);
    for (const p of [1, 2]) expect(TASKS.some((t, i) => partOf(i) === p && t.level === 'challenge'), `part ${p}`).toBe(true);
    // Conventions are taught in Part 2.
    for (const k of ['conv', 'mine', 'break']) expect(partOf(idx(k)), k).toBe(2);
    for (const k of ['trail', 'icon', 'warm', 'slip']) expect(partOf(idx(k)), k).toBe(1);
  });
});

describe('warm-up sort', () => {
  const s = SORTS.warm, right = Object.fromEntries(s.items.map(it => [it.id, it.bin]));
  test('two iconography examples per genre; right answers pass, a wrong card fails', () => {
    for (const [bin] of s.bins) expect(s.items.filter(it => it.bin === bin)).toHaveLength(2);
    expect(allCorrect(markSort('warm', right))).toBe(true);
    expect(markSort('warm', { ...right, w_dragon: 'scifi' }).w_dragon).toBe(false);
  });
  test('the cards are examples, not the genre names or definitions', () => {
    for (const it of s.items) expect(it.label).not.toMatch(/horror|science|superhero|fantasy|made to scare|magic/i);
  });
});

describe('Task 1: three trailers', () => {
  const qs = Object.entries(CHOICES.trail);
  test('two questions per clip; every answer is an option; right answers pass and a wrong one fails', () => {
    expect(qs).toHaveLength(6);
    for (const [, c] of qs) expect(c.opts.map(o => o[0])).toContain(c.a);
    const right = Object.fromEntries(qs.map(([id, c]) => [id, c.a]));
    expect(allCorrect(markChoices('trail', right))).toBe(true);
    expect(markChoices('trail', { ...right, sup_i: 'bat' }).sup_i).toBe(false);
  });
  test('the three clips are three different genres, and no question shows a poster that would give the clip away', () => {
    const genre = qs.filter(([id]) => id.endsWith('_g'));
    expect(new Set(genre.map(([, c]) => c.a)).size).toBe(3);
    for (const [id, c] of qs) expect(c.img, id).toBeUndefined();
  });
  test('the right answer is the longest option in under half the questions', () => {
    expect(qs.filter(([, c]) => rightIsLongest(c.opts, c.a)).length).toBeLessThan(qs.length / 2);
  });
  test('the page embeds three clips, each with its Open in Drive link', () => {
    expect([...html.matchAll(/drive\.google\.com\/file\/d\/[^/]+\/preview/g)]).toHaveLength(3);
    expect([...html.matchAll(/drive\.google\.com\/file\/d\/[^/]+\/view/g)]).toHaveLength(3);
  });
});

describe('Task 2: find the iconography (hotspot)', () => {
  const hs = HOTSPOTS.icon, finds = hs.pics.flatMap(p => p.finds);
  const centre = (p, z) => { const [x, y, w, h] = p.zones[z].box; return [x + w / 2, y + h / 2]; };
  test('the data is sound: every answer is a zone, every box is on its picture', () => {
    expect(hotspotDataProblems(hs)).toEqual([]);
    for (const p of hs.pics) expect(p.img && p.credit && p.alt, p.id).toBeTruthy();
  });
  test('a pin in the middle of each right zone is right; a miss and a wrong zone are wrong', () => {
    const given = {};
    for (const p of hs.pics) for (const f of p.finds) given[f.id] = zoneAt(p, ...centre(p, f.ok[f.ok.length - 1]));   // the last right zone's centre is in no smaller zone
    expect(allCorrect(markHotspot('icon', given))).toBe(true);
    const p = hs.pics[0];
    expect(markHotspot('icon', { ...given, [p.finds[0].id]: 'miss' })[p.finds[0].id]).toBe(false);
    expect(markHotspot('icon', { ...given, [p.finds[0].id]: zoneAt(p, ...centre(p, 'back')) })[p.finds[0].id]).toBe(false);
  });
  test('every picture has at least three pins, and a click in the middle of any right zone counts as right', () => {
    for (const p of hs.pics) {
      expect(p.finds.length, p.id).toBeGreaterThanOrEqual(3);
      for (const f of p.finds) for (const z of f.ok) expect(f.ok, `${f.id} ${z}`).toContain(zoneAt(p, ...centre(p, z)));
    }
  });
  test('the clicks Nick tried on 24 Nov count: the doorway-style misses are gone', () => {
    const mando = hs.pics.find(p => p.id === 'p_mando'), fnaf = hs.pics.find(p => p.id === 'p_fnaf');
    const ok = (p, id, x, y) => p.finds.find(f => f.id === id).ok.includes(zoneAt(p, x, y));
    expect(ok(mando, 'h_cost', 55, 28), 'his chest is armour').toBe(true);
    expect(ok(mando, 'h_cost', 62, 32), 'lower chest is armour').toBe(true);
    expect(ok(mando, 'h_jet', 72, 41), 'the bottom of the jetpack').toBe(true);
    expect(ok(mando, 'h_jet', 73, 52), 'the flame').toBe(true);
    expect(ok(mando, 'h_weap', 80, 36), 'the rifle').toBe(true);
    expect(ok(mando, 'h_alien', 80, 22), 'Grogu').toBe(true);
    expect(ok(mando, 'h_jet', 91, 22), 'the jetpack on his back').toBe(true);
    expect(ok(fnaf, 'h_set', 52, 45), 'balls between Chica and Bonnie').toBe(true);
    expect(ok(fnaf, 'h_eyes', 23, 43), "Freddy's eyes").toBe(true);
    expect(ok(fnaf, 'h_char', 23, 43), "Freddy's eyes are also part of a scary character").toBe(true);
  });
  test('no two finds accept the same zones, and Check waits for every pin', () => {
    // No two finds on a picture accept exactly the same zones (eyes count as 'a scary character' too, but a head isn't 'eyes').
    for (const p of hs.pics) {
      const sets = p.finds.map(f => [...f.ok].sort().join());
      expect(new Set(sets).size, p.id).toBe(sets.length);
    }
    expect(hotspotBlocker(hs, { [finds[0].id]: 'freddy' })).toMatch(/every pin/);
  });
});

describe('Task 3: name it from its conventions (reveal)', () => {
  const g = REVEALS.conv;
  test('six rounds, six different genres from more than one sector, three clues each, each with a picture and source', () => {
    expect(g.rounds).toHaveLength(6);
    expect(new Set(g.rounds.map(r => r.a)).size).toBe(6);
    for (const r of g.rounds) {
      expect(r.clues.length, r.id).toBeGreaterThanOrEqual(3);
      expect(r.img && r.credit && r.note && r.label, r.id).toBeTruthy();
      expect(g.opts.map(o => o[0])).toContain(r.a);
    }
    expect(g.opts.length).toBeGreaterThan(g.rounds.length);   // some options are never right, so the last round isn't free
  });
  test('no clue names its product or its genre', () => {
    for (const r of g.rounds) {
      const genre = g.opts.find(o => o[0] === r.a)[1].toLowerCase();
      for (const c of r.clues) {
        expect(c.toLowerCase(), r.id).not.toContain(r.label.toLowerCase().split(' ')[0] === 'the' ? r.label.toLowerCase() : r.label.toLowerCase().split(' ')[0]);
        expect(c.toLowerCase(), r.id).not.toContain(genre);
      }
    }
  });
  test('clues come by themselves, faster than the wait after a wrong guess', () => {
    expect(g.auto).toBeGreaterThan(3);
    expect(g.auto).toBeLessThan(cooldownSeconds());
  });
  test('right answers pass and a wrong one fails', () => {
    const right = Object.fromEntries(g.rounds.map(r => [r.id, r.a]));
    expect(allCorrect(markReveal('conv', right))).toBe(true);
    expect(markReveal('conv', { ...right, r_ee: 'sitcom' }).r_ee).toBe(false);
  });
});

describe('writing', () => {
  const mine = {
    m_prod: 'Superman',
    m_genre: 'Its genre is superhero. I can tell straight away because a man in a red cape flies over a city.',
    m_icon: 'The iconography includes the red cape, the S logo and the snowy fortress, which shows a hero with powers.',
    m_conv: 'One convention of superhero films is a hero who saves people, and the trailer shows Superman rescuing a crowd.',
  };
  test('full answers using each box\'s spec word pass', () => {
    expect(allCorrect(markWriting('mine', mine))).toBe(true);
  });
  test('an answer without its spec word, or copied from the starter, fails', () => {
    expect(markWriting('mine', { ...mine, m_icon: 'It has a red cape, the S logo and a snowy fortress, which shows he has powers.' }).m_icon).toBe(false);
    expect(markWriting('mine', { ...mine, m_genre: 'Its genre is … I can tell straight away because…' }).m_genre).toBe(false);
  });
  test('the challenge needs both words', () => {
    const ok = { b_prod: 'Beetlejuice Beetlejuice', b_how: 'A convention of the horror genre is scary ghosts, but this film makes its ghosts silly so we laugh.' };
    expect(allCorrect(markWriting('break', ok))).toBe(true);
    expect(markWriting('break', { ...ok, b_how: 'A convention of horror is scary ghosts, but this film makes its ghosts silly so we laugh.' }).b_how).toBe(false);
  });
});

describe('★ spot the slip', () => {
  const sp = SPOTS.slip, slips = sp.parts.filter(p => p.fix);
  test('three slips; flagging exactly them, then the right fixes, passes', () => {
    expect(slips).toHaveLength(3);
    const flags = Object.fromEntries(slips.map(p => [p.id, 'flag']));
    expect(allCorrect(markSpotFlags('slip', flags))).toBe(true);
    expect(markSpotFlags('slip', { ...flags, s1: 'flag' }).s1).toBe(false);
    const fixes = { ...flags, ...Object.fromEntries(slips.map(p => [p.id + '_fix', p.fix.a])) };
    expect(allCorrect(markSpot('slip', fixes))).toBe(true);
  });
  test('the right fix is never the longest, and the right letter varies', () => {
    for (const p of slips) expect(p.fix.opts.map(o => o[0])).toContain(p.fix.a);
    expect(slips.filter(p => rightIsLongest(p.fix.opts, p.fix.a)).length).toBeLessThan(slips.length / 2 + 1);
    expect(new Set(slips.map(p => p.fix.a)).size).toBe(3);
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
    expect(glossaryDef('genre')).toMatch(/^A type of product/);
    expect(glossaryDef('iconography')).toMatch(/^Objects, costumes, settings/);
    expect(glossaryDef('conventions')).toMatch(/^What we expect/);
    for (const [p, d] of GLOSSARY) {
      expect(d.length, p).toBeLessThanOrEqual(80);
      expect(() => new RegExp(p), p).not.toThrow();
      expect(p, 'no capturing groups').not.toMatch(/\((?!\?)/);
    }
  });
});
