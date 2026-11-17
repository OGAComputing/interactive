import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  TASKS, TASK_COUNT, SORTS, CHOICES, WRITING, SPOTS, SPECTRUMS, markSort, markChoices, markWriting, markSpectrum,
  markSpot, markSpotFlags, allCorrect, calcScore, GLOSSARY, glossaryDef, UNLOCK, unlockedBy, partOf,
} from './checkers.js';

const html = readFileSync(new URL('./1_Where_When_Who_With.html', import.meta.url), 'utf8');
const optLen = (opts, k) => opts.find(o => o[0] === k)[1].length;
const rightIsLongest = (opts, a) => opts.every(([k]) => k === a || optLen(opts, a) >= optLen(opts, k));

// Product images still to be supplied by the teacher (the page hides their frames until they're inlined).
// Remove each key from here once it is inlined with Y10/inline_images.py.
const PENDING_IMAGES = new Set([]);

describe('page identity and tabs', () => {
  test('title matches ACTIVITY_TITLE, the page opens on the warm-up, and every task has a tab and panel', () => {
    expect(html).toContain('title:  Where, When, Who With');
    expect(html).toContain("const ACTIVITY_TITLE = 'Where, When, Who With';");
    expect(html).toContain("const STORAGE_KEY    = 'y10_c1_l3_1_situation';");
    expect(html).toMatch(/class="tab support active" data-idx="5"/);
    expect(html).toMatch(/class="panel active" id="panel-5"/);
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
      .concat(Object.values(CHOICES.same).filter(c => c.img).map(c => c.img)));
    for (const k of keys) {
      if (PENDING_IMAGES.has(k)) continue;
      expect(html, k).toMatch(new RegExp(`['"]${k}['"]:\\s*['"]data:image/(jpeg|png);base64,`));
    }
    for (const k of PENDING_IMAGES) expect(keys.has(k), `${k} is pending but not used`).toBe(true);
    expect(html.length).toBeLessThan(1_000_000);
  });
});

describe('parts', () => {
  test('Part 2 opens with its word (any case), the teacher word opens everything, and both parts have a challenge', () => {
    expect(unlockedBy(UNLOCK[2])).toBe(2);
    expect(unlockedBy('INVOLVED')).toBe(2);
    expect(unlockedBy('outwood')).toBe(2);
    expect(unlockedBy('situation')).toBe(0);
    const inPart = p => TASKS.map((t, i) => i).filter(i => partOf(i) === p);
    expect(inPart(1).some(i => TASKS[i].level === 'challenge')).toBe(true);
    expect(inPart(2).some(i => TASKS[i].level === 'challenge')).toBe(true);
    // Involvement is taught in Part 2, so nothing in Part 1 marks it.
    for (const i of inPart(1)) expect(TASKS[i].key).not.toBe('kinds');
  });
});

describe('sorts: warm-up and Task 3', () => {
  for (const [key, per] of [['warm', 2], ['kinds', 3]]) {
    test(`${key}: ${per} cards in each box, right answers pass, a wrong card fails`, () => {
      const s = SORTS[key], right = Object.fromEntries(s.items.map(it => [it.id, it.bin]));
      for (const [bin] of s.bins) expect(s.items.filter(it => it.bin === bin)).toHaveLength(per);
      expect(allCorrect(markSort(key, right))).toBe(true);
      const it = s.items[0], other = s.bins.find(b => b[0] !== it.bin)[0];
      expect(markSort(key, { ...right, [it.id]: other })[it.id]).toBe(false);
    });
  }
  test('the warm-up sorts examples, not definitions', () => {
    for (const it of SORTS.warm.items) expect(it.label).not.toMatch(/^(the place|the time|on your own, with)/i);
  });
});

describe('Task 1: same product, new situation', () => {
  const qs = Object.entries(CHOICES.same);
  test('every answer is an option, right answers pass and a wrong one fails', () => {
    for (const [, c] of qs) expect(c.opts.map(o => o[0])).toContain(c.a);
    const right = Object.fromEntries(qs.map(([id, c]) => [id, c.a]));
    expect(allCorrect(markChoices('same', right))).toBe(true);
    const [id, c] = qs[0];
    expect(markChoices('same', { ...right, [id]: c.opts.find(o => o[0] !== c.a)[0] })[id]).toBe(false);
  });
  test('five questions show their product picture, each with a source', () => {
    const pics = qs.filter(([, c]) => c.img);
    expect(pics).toHaveLength(5);
    for (const [, c] of pics) { expect(c.alt).toBeTruthy(); expect(c.credit).toBeTruthy(); }
  });
  test('the right answer is the longest option in under half the questions', () => {
    expect(qs.filter(([, c]) => rightIsLongest(c.opts, c.a)).length).toBeLessThan(qs.length / 2);
  });
});

describe('Task 4: passive or active?', () => {
  const sp = SPECTRUMS.line;
  const zones = sp.zones.map(z => z[0]);
  const right = () => ({
    ...Object.fromEntries(sp.items.map(it => [it.id, it.ok[0]])),
    why_pas: 'The audience is passive because the music is just on in the background and nobody is really listening to it.',
    why_act: 'The audience is active because they build a level for other people to play. This is consumer-generated content.',
  });
  test('every accepted zone exists; a clear case accepts one end; right answers pass', () => {
    for (const it of sp.items) for (const z of it.ok) expect(zones).toContain(z);
    expect(sp.items.some(it => it.ok.includes('z1'))).toBe(true);
    expect(sp.items.some(it => it.ok.includes('z5'))).toBe(true);
    expect(allCorrect(markSpectrum('line', right()))).toBe(true);
  });
  test('passive cards at the active end fail, and the why box needs a spec word', () => {
    expect(markSpectrum('line', { ...right(), l_homework: 'z5' }).l_homework).toBe(false);
    expect(markSpectrum('line', { ...right(), l_maker: 'z2' }).l_maker).toBe(false);
    const noWord = 'The audience is active because they build a level for other people to play with online.';
    expect(markSpectrum('line', { ...right(), why_act: noWord }).why_act).toBe(false);
  });
});

describe('writing: diary, compare and the Part 1 challenge', () => {
  const diary = {
    e1_prod: 'The Traitors', e1_sit: 'I watched it on the sofa at home at 9 pm, with my mum and my sister.', e1_else: 'I was also eating my tea',
    e2_prod: 'Spotify', e2_sit: 'I listened on my headphones on the walk to school at 8 am, on my own.', e2_else: 'I was also walking to school',
    e3_prod: 'Mario Kart World', e3_sit: 'I played it in my bedroom after school at about 5 pm, online with two mates.', e3_else: 'I was also talking on a headset',
  };
  test('a full diary passes; the same product twice fails', () => {
    expect(allCorrect(markWriting('diary', diary))).toBe(true);
    expect(markWriting('diary', { ...diary, e2_prod: 'The Traitors' }).e2_prod).toBe(false);
  });
  test('compare needs the spec words in every box', () => {
    const c = {
      me_prod: 'The Traitors',
      me_sit: 'I used it at home on Wednesday night with my family. This situation meant we argued about who the traitor was.',
      me_inv: 'I was an active audience because we talked about it all the way through, but there was no voting.',
      pa_prod: 'Spotify',
      pa_sit: 'My partner used it on the bus on their own. This situation meant they only half listened to it.',
      pa_inv: 'They were a passive audience because it was on in the background, though Spotify Wrapped is an interactive feature.',
      cmp_diff: 'The biggest difference is that I was an active audience at home, whereas my partner was passive on the bus.',
    };
    expect(allCorrect(markWriting('compare', c))).toBe(true);
    expect(markWriting('compare', { ...c, me_sit: 'I watched it at home on Wednesday night with my mum and my sister, which was fun.' }).me_sit).toBe(false);
    expect(markWriting('compare', { ...c, pa_inv: 'They just listened to it in the background and did not really care about it much.' }).pa_inv).toBe(false);
  });
  test('every writing box has a prompt, and the challenge has three questions', () => {
    for (const ws of Object.values(WRITING)) for (const w of ws) expect(w.prompt, w.id).toBeTruthy();
    expect(WRITING.then).toHaveLength(3);
  });
});

describe('★ spot the slip', () => {
  const s = SPOTS.slip, slips = s.parts.filter(p => p.fix);
  test('three slips; flagging them all passes, flagging a right line fails', () => {
    expect(slips).toHaveLength(3);
    const flags = Object.fromEntries(slips.map(p => [p.id, true]));
    expect(allCorrect(markSpotFlags('slip', flags))).toBe(true);
    expect(markSpotFlags('slip', { ...flags, p1: true }).p1).toBe(false);
    const fixes = Object.fromEntries(slips.map(p => [p.id + '_fix', p.fix.a]));
    expect(allCorrect(markSpot('slip', { ...flags, ...fixes }))).toBe(true);
  });
  test('each fix\'s right option is not the longest every time', () => {
    expect(slips.filter(p => rightIsLongest(p.fix.opts, p.fix.a)).length).toBeLessThan(slips.length);
  });
});

describe('glossary and scoring', () => {
  test('every meaning is short, and the spec terms are covered', () => {
    for (const [, m] of GLOSSARY) expect(m.length).toBeLessThanOrEqual(80);
    for (const w of ['situation', 'passive', 'active', 'interactive features', 'online voting', 'consumer-generated content', 'involvement'])
      expect(glossaryDef(w), w).toBeTruthy();
  });
  test('optional tabs never change the score', () => {
    const done = TASKS.map(t => !t.level), first = TASKS.map(() => true);
    expect(calcScore(done, first)).toBe(100);
    expect(calcScore(TASKS.map(() => true), first)).toBe(100);
  });
});
