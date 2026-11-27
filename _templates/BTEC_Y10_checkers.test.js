// Tests for the template's own engine helpers that don't depend on a page's data (fix the slip).
// Pages copy BTEC_Y10_checkers.js as checkers.js; their own checkers.test.js tests their data.
import { describe, it, expect } from 'vitest';
import { markFixLines, fixLeftLines, fixDataProblems } from './BTEC_Y10_checkers.js';

const LINES = [
  { id: 's1', text: 'Warner Bros. is an independent producer.', a: 'cong', opts: [
    ['cong', 'Warner Bros. is a media conglomerate.'], ['psb', 'Warner Bros. is a public service broadcaster.'], ['comm', 'Warner Bros. is a community producer.']] },
  { id: 's2', text: 'It entertains families with jokes.', a: 'keep', opts: [
    ['inf', 'It informs families with facts.'], ['prof', 'It makes a profit for families.'], ['aw', 'It raises awareness among families.']] },
  { id: 's3', text: 'It is paid for by the TV licence.', a: 'tix', opts: [
    ['tix', 'It is paid for by tickets and streaming.'], ['vol', 'It is paid for by volunteers.'], ['don', 'It is paid for by donations.']] },
];

describe('fix the slip', () => {
  it('marks nothing and counts every slip when nothing is changed', () => {
    expect(markFixLines(LINES, {})).toEqual({});
    expect(fixLeftLines(LINES, {})).toBe(2);
  });
  it('marks only changed lines: the right fix, the wrong fix, and a right line changed', () => {
    expect(markFixLines(LINES, { s1: 'cong', s2: 'inf', s3: 'vol' })).toEqual({ s1: true, s2: false, s3: false });
  });
  it('a slip left alone is not marked but still counts as hiding', () => {
    const given = { s1: 'cong' };
    expect(markFixLines(LINES, given)).toEqual({ s1: true });
    expect(fixLeftLines(LINES, given)).toBe(1);
  });
  it('every slip fixed and nothing else changed is all correct with none left', () => {
    const given = { s1: 'cong', s3: 'tix' };
    expect(Object.values(markFixLines(LINES, given)).every(Boolean)).toBe(true);
    expect(fixLeftLines(LINES, given)).toBe(0);
  });
  it('a slip with the wrong fix is no longer hiding, but is wrong', () => {
    expect(fixLeftLines(LINES, { s1: 'psb', s3: 'tix' })).toBe(0);
    expect(markFixLines(LINES, { s1: 'psb', s3: 'tix' }).s1).toBe(false);
  });
  it('fixDataProblems passes good data and catches each kind of mistake', () => {
    expect(fixDataProblems(LINES)).toEqual([]);
    const two = { ...LINES[0], opts: LINES[0].opts.slice(0, 2) };
    expect(fixDataProblems([two])[0]).toMatch(/exactly 3 opts/);
    expect(fixDataProblems([{ ...LINES[0], a: 'nope' }])[0]).toMatch(/isn't one of its opts/);
    expect(fixDataProblems([{ ...LINES[1], opts: [['keep', 'x'], ...LINES[1].opts.slice(1)] }]).join()).toMatch(/not 'keep'/);
    expect(fixDataProblems([{ ...LINES[0], opts: [['cong', LINES[0].text], ...LINES[0].opts.slice(1)] }])[0]).toMatch(/same as the line/);
    expect(fixDataProblems([LINES[1]])).toContain('no line is a slip');
  });
});

// Guards against gaming a check (Nick, 2026-11-17).
import { binCounts, sortBlocker, unansweredBlocker, overBlocker, tooManyWrong, ownWords, pastedTwice } from './BTEC_Y10_checkers.js';

const SORT = { bins: [['a', 'A'], ['b', 'B'], ['c', 'C']],
  items: [{ id: 'x1', bin: 'a' }, { id: 'x2', bin: 'a' }, { id: 'x3', bin: 'b' }, { id: 'x4', bin: 'b' }, { id: 'x5', bin: 'c' }, { id: 'x6', bin: 'c' }] };

describe('guards: a check needs a real attempt', () => {
  it('counts how many cards each box takes', () => {
    expect(binCounts(SORT.items)).toEqual({ a: 2, b: 2, c: 2 });
  });
  it('a sort with cards left over, or every card in one box, cannot be checked', () => {
    expect(sortBlocker(SORT, { x1: 'a' })).toMatch(/every card/);
    const allInA = Object.fromEntries(SORT.items.map(it => [it.id, 'a']));
    expect(sortBlocker(SORT, allInA)).toMatch(/number of cards shown/);
  });
  it('a sort with each box holding its share can be checked, right or wrong', () => {
    expect(sortBlocker(SORT, { x1: 'b', x2: 'c', x3: 'a', x4: 'c', x5: 'a', x6: 'b' })).toBe('');
  });
  it('a spectrum only needs every card placed (its zones take any number)', () => {
    const sp = { zones: [['z1', 'One'], ['z2', 'Two']], items: [{ id: 'p', ok: ['z1'] }, { id: 'q', ok: ['z2'] }] };
    expect(sortBlocker(sp, { p: 'z1' })).toMatch(/on the line/);
    expect(sortBlocker(sp, { p: 'z1', q: 'z1' })).toBe('');
  });
  it('questions must all be answered', () => {
    expect(unansweredBlocker(['q1', 'q2'], { q1: 'a', q2: ' ' })).toMatch(/every question/);
    expect(unansweredBlocker(['q1', 'q2'], { q1: 'a', q2: 'b' })).toBe('');
  });
  it('flagging (or changing) more than there are slips is refused', () => {
    expect(overBlocker(3, 3, 'slip')).toBe('');
    expect(overBlocker(9, 3, 'slip')).toMatch(/flagged 9, but there are only 3 slips/);
    expect(overBlocker(2, 1, 'slip', 'changed', ' lines', 'Put back.')).toMatch(/changed 2 lines, but there is only 1 slip\. Put back\./);
  });
});

describe('guards: a mostly wrong check says how many, not which', () => {
  it('more than half wrong hides; half or fewer shows', () => {
    const ids = ['a', 'b', 'c', 'd'];
    expect(tooManyWrong({ a: false, b: false, c: false, d: true }, ids)).toBe(true);
    expect(tooManyWrong({ a: false, b: false, c: true, d: true }, ids)).toBe(false);
    expect(tooManyWrong({}, [])).toBe(false);
  });
});

describe('guards: writing must be the student\'s own words', () => {
  const W = { id: 'w', prompt: 'How did the Walkman change where people listened to music, and who with?', starter: 'Before the Walkman, … After it, …', minWords: 12 };
  it('pasting the question back in fails; reusing its key words passes', () => {
    expect(ownWords(W, 'How did the Walkman change where people listened to music, and who with? It did.')).toBe(false);
    expect(ownWords(W, 'Before the Walkman, people listened to music at home with their family. After it, they listened alone on the bus.')).toBe(true);
  });
  it('a name box is never checked for copying', () => {
    expect(ownWords({ id: 'n', prompt: 'Name the product', short: true }, 'Name the product')).toBe(true);
  });
  it('the same answer in two boxes: only the later one is caught', () => {
    const list = [{ id: 'a' }, { id: 'b' }, { id: 'c', short: true }];
    expect([...pastedTwice(list, { a: 'It was fun to play.', b: 'it was FUN to play', c: 'x' })]).toEqual(['b']);
    expect(pastedTwice(list, { a: 'One answer here.', b: 'A different one.' }).size).toBe(0);
  });
});

describe('hotspot', async () => {
  const { zoneAt, hotspotBlocker, hotspotDataProblems } = await import('./BTEC_Y10_checkers.js');
  const PIC = { id: 'p', zones: {
    poster: { box: [0, 0, 100, 100], label: 'The rest of the poster' },
    mask: { box: [40, 10, 20, 30], label: 'The mask' },
    eye: { box: [45, 15, 5, 5], label: 'An eye' },
  }, finds: [{ id: 'f1', q: 'Click the mask', ok: ['mask', 'eye'] }, { id: 'f2', q: 'Click the eye', ok: ['eye'] }] };
  it('finds the smallest zone under a point, or a miss outside them all', () => {
    expect(zoneAt(PIC, 47, 17)).toBe('eye');
    expect(zoneAt(PIC, 55, 35)).toBe('mask');
    expect(zoneAt(PIC, 5, 90)).toBe('poster');
    expect(zoneAt({ zones: { a: { box: [10, 10, 10, 10] } } }, 50, 50)).toBe('miss');
  });
  it('blocks a check until every pin is placed', () => {
    expect(hotspotBlocker({ pics: [PIC] }, { f1: 'mask' })).toMatch(/every pin/);
    expect(hotspotBlocker({ pics: [PIC] }, { f1: 'mask', f2: 'miss' })).toBe('');
  });
  it('hotspotDataProblems passes good data and catches a missing zone or a box off the picture', () => {
    expect(hotspotDataProblems({ pics: [PIC] })).toEqual([]);
    const bad = { ...PIC, zones: { ...PIC.zones, wide: { box: [80, 0, 30, 10], label: 'Too wide' } }, finds: [{ id: 'f3', q: 'x', ok: ['nope'] }] };
    expect(hotspotDataProblems({ pics: [bad] })).toEqual(['p.wide: box off the picture', "f3: 'nope' isn't a zone of p"]);
  });
});

describe('order', async () => {
  const { markOrderList, orderAnswer, orderStart, orderBlocker, orderDataProblems, orderHints, seededRandom } = await import('./BTEC_Y10_checkers.js');
  // A news story: the lead first, two details that may swap, then the background.
  const NEWS = { id: 'n', ends: ['Top', 'Bottom'], items: [
    { id: 'lead', label: 'What happened', at: 1 },
    { id: 'd1', label: 'A detail', at: [2, 3] },
    { id: 'd2', label: 'Another detail', at: [2, 3] },
    { id: 'bg', label: 'Background', at: 4 },
  ] };
  it('marks each card by its place, and accepts a fair swap', () => {
    expect(markOrderList(NEWS, ['lead', 'd1', 'd2', 'bg'])).toEqual({ lead: true, d1: true, d2: true, bg: true });
    expect(markOrderList(NEWS, ['lead', 'd2', 'd1', 'bg'])).toEqual({ lead: true, d1: true, d2: true, bg: true });
    expect(markOrderList(NEWS, ['bg', 'd1', 'd2', 'lead'])).toEqual({ lead: false, d1: true, d2: true, bg: false });
    expect(Object.values(markOrderList(NEWS, undefined)).some(Boolean)).toBe(false);
  });
  it('tells each misplaced card which way to go, towards its nearest right place, and leaves right ones out', () => {
    expect(orderHints(NEWS, ['lead', 'd1', 'd2', 'bg'])).toEqual({});
    expect(orderHints(NEWS, ['bg', 'd1', 'd2', 'lead'])).toEqual({ bg: 'down', lead: 'up' });
    expect(orderHints(NEWS, ['d1', 'lead', 'd2', 'bg'])).toEqual({ d1: 'down', lead: 'up' });
    expect(orderHints(NEWS, ['lead', 'bg', 'd1', 'd2'])).toEqual({ bg: 'down', d2: 'up' });
  });
  it('a shuffled start has fewer than half in a right place, and is the same for the same seed', () => {
    for (const seed of ['a', 'b', 'c', 'zz9', 'q1']) {
      const ids = orderStart(NEWS, seededRandom(seed));
      expect([...ids].sort()).toEqual(NEWS.items.map(it => it.id).sort());
      expect(Object.values(markOrderList(NEWS, ids)).filter(Boolean).length * 2).toBeLessThan(4);
      expect(orderStart(NEWS, seededRandom(seed))).toEqual(ids);
    }
    expect(orderStart({ ...NEWS, keep: true })).toEqual(['lead', 'd1', 'd2', 'bg']);
  });
  it('blocks a check until a card has moved in every list', () => {
    expect(orderBlocker({ lists: [NEWS] }, {})).toMatch(/in order first/);
    expect(orderBlocker({ lists: [NEWS] }, { n_moved: 1 })).toBe('');
  });
  it('orderDataProblems passes good data and catches bad places, no right order and a kept start already right', () => {
    expect(orderAnswer(NEWS)).toEqual(['lead', 'd1', 'd2', 'bg']);
    expect(orderDataProblems({ lists: [NEWS] })).toEqual([]);
    const clash = { ...NEWS, items: NEWS.items.map(it => (it.id === 'bg' ? { ...it, at: 1 } : it)) };
    expect(orderDataProblems({ lists: [clash] })).toEqual(["n: the places don't make one right order"]);
    const off = { ...NEWS, items: NEWS.items.map(it => (it.id === 'bg' ? { ...it, at: 9 } : it)) };
    expect(orderDataProblems({ lists: [off] })[0]).toMatch(/bg: at must be places 1–4/);
    expect(orderDataProblems({ lists: [{ ...NEWS, keep: true }] })).toEqual(['n: keep starts it already in order']);
  });
});
