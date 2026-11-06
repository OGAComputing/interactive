import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  TASKS, TASK_COUNT, SORTS, CHOICES, WRITING, SPOTS, SPECTRUMS, HUNTS, markSort, markChoices, markWriting, markSpot, markSpotFlags,
  markSpectrum, markHunt, softIds, factMatches, isRealUrl, isSearchLink, allCorrect, calcScore, GLOSSARY, glossaryDef,
  UNLOCK, unlockedBy, partOf,
} from './checkers.js';

const html = readFileSync(new URL('./1_Research_Like_a_Pro.html', import.meta.url), 'utf8');
const optLen = (opts, k) => opts.find(o => o[0] === k)[1].length;

describe('warm-up: primary or secondary?', () => {
  test('four research jobs in each box, and right answers pass', () => {
    for (const [bin] of SORTS.warm.bins) expect(SORTS.warm.items.filter(it => it.bin === bin)).toHaveLength(4);
    expect(allCorrect(markSort('warm', Object.fromEntries(SORTS.warm.items.map(it => [it.id, it.bin]))))).toBe(true);
  });
});

describe('1 · which research?', () => {
  const qs = Object.entries(CHOICES.which);
  const right = Object.fromEntries(qs.map(([id, c]) => [id, c.a]));

  test('every technique is the answer at least once, and right answers pass', () => {
    for (const k of ['srv', 'int', 'obs', 'dis', 'sec']) expect(qs.some(([, c]) => c.a === k), k).toBe(true);
    for (const [, c] of qs) expect(c.opts.map(o => o[0])).toContain(c.a);
    expect(allCorrect(markChoices('which', right))).toBe(true);
    expect(markChoices('which', { ...right, totp: 'srv' }).totp).toBe(false);
  });

  test('the right answer is not the longest option in half or more of the questions', () => {
    const longest = qs.filter(([, c]) => c.opts.every(([k]) => k === c.a || optLen(c.opts, c.a) >= optLen(c.opts, k)));
    expect(longest.length).toBeLessThan(qs.length / 2);
  });

  test('no warm-up card turns up again as a question', () => {
    for (const [, c] of qs) for (const it of SORTS.warm.items) expect(c.q).not.toContain(it.label);
  });
});

describe('2 · trust it? (spectrum)', () => {
  const sp = SPECTRUMS.rely, zones = sp.zones.map(z => z[0]);
  const place = Object.fromEntries(sp.items.map(it => [it.id, it.ok[0]]));
  const why = {
    why_trust: 'I can trust the official website because Mojang made the game and can count its own sales',
    why_doubt: 'I can\'t trust the Reddit post because it is anonymous and nobody can check where the number came from',
  };

  test('cards run from clear "trust" cases to clear "don\'t trust" ones, each accepting next-door zones only', () => {
    for (const it of sp.items) {
      const idx = it.ok.map(z => zones.indexOf(z));
      expect(Math.min(...idx), it.id).toBeGreaterThanOrEqual(0);
      expect(Math.max(...idx) - Math.min(...idx), it.id).toBeLessThanOrEqual(2);   // a range, never "anywhere"
      expect(idx.every((x, n) => !n || x === idx[n - 1] + 1), it.id).toBe(true);  // zones are next to each other
      expect(it.note, it.id).toBeTruthy();
    }
    expect(sp.items.some(it => it.ok.includes('z1'))).toBe(true);
    expect(sp.items.some(it => it.ok.includes('z5'))).toBe(true);
    expect(sp.items.some(it => it.ok.includes('z3'))).toBe(true);
  });

  test('good places and real reasons pass; a card at the wrong end fails only that card', () => {
    expect(allCorrect(markSpectrum('rely', { ...place, ...why }))).toBe(true);
    const res = markSpectrum('rely', { ...place, ...why, r_reddit: 'z1' });
    expect(res.r_reddit).toBe(false);
    expect(Object.values(res).filter(v => !v)).toHaveLength(1);
    expect(markSpectrum('rely', { ...place, ...why, r_2011: 'z3' }).r_2011).toBe(true);   // a middle case takes a range
    expect(markSpectrum('rely', { ...place, ...why, r_2011: 'z1' }).r_2011).toBe(false);
  });

  test('a why box needs a sentence with a reliability word; it is never penalised', () => {
    expect(markSpectrum('rely', { ...place, ...why, why_trust: 'because it is good and I like it a lot' }).why_trust).toBe(false);
    expect(markSpectrum('rely', { ...place, ...why, why_doubt: 'yes' }).why_doubt).toBe(false);
    expect([...softIds(TASKS[1])].sort()).toEqual(['why_doubt', 'why_trust']);
  });
});

describe('3 · spot the slip', () => {
  const parts = SPOTS.slip.parts, slips = parts.filter(p => p.fix);
  const flags = Object.fromEntries(slips.map(p => [p.id, 'flag']));
  const fixes = Object.fromEntries(slips.map(p => [p.id + '_fix', p.fix.a]));

  test('five slips among ten log lines: plagiarism, primary/secondary, an unchecked claim, screen recording, out of date', () => {
    expect(parts).toHaveLength(10);
    expect(slips).toHaveLength(5);
    expect(SPOTS.slip.lines).toBe(true);
    const fixText = slips.map(p => p.fix.opts.find(o => o[0] === p.fix.a)[1]).join(' ');
    for (const w of [/plagiarism/i, /primary/i, /reliable/i, /screen recording/i, /out of date/i]) expect(fixText).toMatch(w);
  });

  test('stage 1 and stage 2 mark as expected', () => {
    expect(allCorrect(markSpotFlags('slip', flags))).toBe(true);
    expect(markSpotFlags('slip', { ...flags, s7: 'flag' }).s7).toBe(false);
    expect(allCorrect(markSpot('slip', { ...flags, ...fixes }))).toBe(true);
    expect(markSpot('slip', { ...flags, ...fixes, s5_fix: 'web' }).s5_fix).toBe(false);
  });

  test('the right fix is never the longest option', () => {
    for (const p of slips) expect(p.fix.opts.some(([k]) => k !== p.fix.a && optLen(p.fix.opts, k) > optLen(p.fix.opts, p.fix.a)), p.id).toBe(true);
  });
});

describe('links and facts', () => {
  test('a real link passes; a search page, a made-up word or text with spaces fails', () => {
    expect(isRealUrl('https://www.bbc.co.uk/news/entertainment-arts-123')).toBe(true);
    expect(isRealUrl('beano.com/about')).toBe(true);
    expect(isRealUrl('https://www.google.com/search?q=beano+first+issue')).toBe(false);
    expect(isSearchLink('https://www.google.co.uk/search?q=beano')).toBe(true);
    expect(isSearchLink('https://www.bing.com/search?q=fortnite')).toBe(true);
    expect(isSearchLink('https://blog.google/products/')).toBe(false);
    expect(isRealUrl('website')).toBe(false);
    expect(isRealUrl('the bbc website')).toBe(false);
    expect(isRealUrl('')).toBe(false);
  });

  test('a fact matches anywhere, ignoring case and punctuation', () => {
    expect(factMatches('Hawkins, Indiana', ['Hawkins'])).toBe(true);
    expect(factMatches('it was 1938!', ['1938'])).toBe(true);
    expect(factMatches('one hundred players', ['100', 'hundred'])).toBe(true);
    expect(factMatches('1983', ['1938'])).toBe(false);
    expect(factMatches('', ['1938'])).toBe(false);
  });
});

describe('4 · start your research log (hunt)', () => {
  const good = {
    h_st_fact: 'Hawkins, Indiana', h_st_url: 'https://en.wikipedia.org/wiki/Stranger_Things', h_st_who: 'Wikipedia',
    h_st_note: 'This is secondary research. I can trust it because every fact links to its source and I checked it',
    h_beano_fact: '1938', h_beano_url: 'https://www.beano.com/history', h_beano_who: 'Beano.com',
    h_beano_note: 'This is secondary research. I can trust it because it is the official Beano website',
    h_fn_fact: '100 players', h_fn_url: 'https://www.epicgames.com/fortnite/en-US/battle-royale', h_fn_who: 'Epic Games',
    h_fn_note: 'This is secondary research. I can trust it because Epic Games is official, they make the game',
    h_pri_fact: 'They have watched Stranger Things and thought the first season was the scariest',
    h_pri_who: 'the person next to me',
    h_pri_note: 'This is primary research: an interview because I asked one person questions myself',
  };

  test('one product per sector plus a primary entry, each with an image and source', () => {
    const rows = HUNTS.log.rows;
    expect(rows.filter(r => r.accept).map(r => r.sector)).toEqual(['Audio/moving image', 'Print', 'Interactive']);
    expect(rows.filter(r => r.primary)).toHaveLength(1);
    for (const r of rows.filter(r => r.accept)) expect(r.img && r.credit, r.id).toBeTruthy();
  });

  test('a full log passes', () => {
    expect(allCorrect(markHunt('log', good))).toBe(true);
  });

  test('a wrong fact fails; the same link twice, a search link, or a missing name fails only that box', () => {
    expect(markHunt('log', { ...good, h_beano_fact: '1983' }).h_beano_fact).toBe(false);
    expect(markHunt('log', { ...good, h_fn_url: good.h_st_url.replace('https://', 'http://') }).h_fn_url).toBe(false);
    expect(markHunt('log', { ...good, h_st_url: 'https://www.google.com/search?q=stranger+things+town' }).h_st_url).toBe(false);
    const res = markHunt('log', { ...good, h_beano_who: '' });
    expect(res.h_beano_who).toBe(false);
    expect(Object.values(res).filter(v => !v)).toHaveLength(1);
  });

  test('notes need the research type and a reason word', () => {
    expect(markHunt('log', { ...good, h_st_note: 'I can trust it because it is official and lots of people use it' }).h_st_note).toBe(false);
    expect(markHunt('log', { ...good, h_pri_note: 'This is primary research because I asked them myself in class today' }).h_pri_note).toBe(false);
    expect(markHunt('log', { ...good, h_pri_note: 'This is primary research: a discussion because we talked about it together' }).h_pri_note).toBe(true);
  });

  test('only the facts cost gold: links, names and notes are soft', () => {
    const soft = softIds(TASKS[3]);
    for (const id of ['h_st_url', 'h_st_who', 'h_st_note', 'h_pri_fact']) expect(soft.has(id), id).toBe(true);
    for (const id of ['h_st_fact', 'h_beano_fact', 'h_fn_fact']) expect(soft.has(id), id).toBe(false);
  });

  test('★ one more: the student names their own products', () => {
    const more = {
      m_old_prod: 'Pac-Man', m_old_fact: 'Pac-Man came out in 1980 and it was made by Namco in Japan',
      m_old_url: 'https://en.wikipedia.org/wiki/Pac-Man', m_old_who: 'Wikipedia',
      m_old_note: 'This is secondary research. I can trust it because the date links to a source I checked',
      m_own_prod: 'Match of the Day', m_own_fact: 'Match of the Day was first shown on BBC Two in 1964',
      m_own_url: 'https://www.bbc.co.uk/sport/football/motd-history', m_own_who: 'BBC Sport',
      m_own_note: 'This is secondary research. I can trust it because it is the official BBC website',
    };
    expect(allCorrect(markHunt('more', more))).toBe(true);
    expect(markHunt('more', { ...more, m_own_prod: '' }).m_own_prod).toBe(false);
  });
});

describe('★ writing challenges', () => {
  test('real answers pass and one-liners fail', () => {
    const depends = {
      ch_react: 'Watching the YouTuber is secondary research because someone else filmed and posted it. Filming my friend is primary research because I collect the reaction myself',
      ch_cinema: 'It is primary research because I asked my aunt myself. One cinema isn\'t enough because people in other towns might like it more or less',
    };
    expect(allCorrect(markWriting('depends', depends))).toBe(true);
    expect(markWriting('depends', { ...depends, ch_react: 'Watching the YouTuber is research because someone filmed it, and filming my friend is research because I did it myself' }).ch_react).toBe(false);
    const behind = {
      ch_poster: 'The quote was chosen by the film company. It might be biased because they only pick the nicest reviews to sell more tickets, so I would not trust it',
      ch_wiki: 'Teachers say that because anyone can edit it, but Wikipedia can still help because the links at the bottom take you to the real sources',
    };
    expect(allCorrect(markWriting('behind', behind))).toBe(true);
    expect(markWriting('behind', { ...behind, ch_wiki: 'anyone can edit' }).ch_wiki).toBe(false);
  });
});

describe('glossary', () => {
  const studentText = [
    JSON.stringify([SPECTRUMS, SPOTS, CHOICES, WRITING, SORTS, HUNTS]),
    html.slice(html.indexOf('<body>'), html.indexOf('<!-- IMG-DATA')),
  ].join(' ');

  test('every word is used on the page and has a short, plain meaning', () => {
    for (const [p, def] of GLOSSARY) {
      expect(new RegExp(`\\b(?:${p})\\b`, 'i').test(studentText), p).toBe(true);
      expect(def.length, p).toBeLessThanOrEqual(80);
      expect(p, 'use (?:…), not capture groups').not.toMatch(/\((?!\?:)/);
    }
  });

  test('each matched form finds its meaning; "reliable" is not matched inside "unreliable"', () => {
    for (const w of ['Primary research', 'surveys', 'Interview', 'sources', 'fact-check', 'research log', 'References', 'plagiarism'])
      expect(glossaryDef(w), w).toBeTruthy();
    expect(glossaryDef('unreliable')).toMatch(/can't/);
    expect(glossaryDef('reliable')).not.toMatch(/can't/);
  });
});

describe('page wiring', () => {
  test('three parts, each locked behind its word, each with a challenge to wait with', () => {
    expect(TASKS.filter(t => !t.level).map(t => t.part || 1)).toEqual([1, 2, 3, 3]);
    for (const p of [1, 2, 3]) expect(TASKS.some(t => (t.part || 1) === p && t.level === 'challenge'), `part ${p}`).toBe(true);
    expect(unlockedBy('Detective')).toBe(2);
    expect(unlockedBy(' credit! ')).toBe(3);
    expect(unlockedBy('outwood')).toBe(3);
    expect(unlockedBy('trust')).toBe(0);
    expect(partOf(1)).toBe(2);
    expect(partOf(3)).toBe(3);
    // The unlock words must not be visible before their part opens: not in any tab name or Part 1 text.
    const tabs = html.slice(html.indexOf('<nav'), html.indexOf('</nav>'));
    for (const w of Object.values(UNLOCK)) expect(tabs.toLowerCase()).not.toContain(w);
  });

  test('no two core tabs in a row use the same kind, and at most one core sort', () => {
    const core = TASKS.filter(t => !t.level).map(t => t.kind);
    expect(core.every((k, n) => !n || k !== core[n - 1])).toBe(true);
    expect(core.filter(k => k === 'sort').length).toBeLessThanOrEqual(1);
  });

  test('tasks line up with the data and the tabs', () => {
    expect(TASK_COUNT).toBe(8);
    const data = { sort: SORTS, choice: CHOICES, write: WRITING, spot: SPOTS, spectrum: SPECTRUMS, hunt: HUNTS };
    const attr = { sort: 'sort', choice: 'choices', write: 'write', spot: 'spot', spectrum: 'spectrum', hunt: 'hunt' };
    TASKS.forEach((t, i) => {
      expect(data[t.kind][t.key], t.key).toBeTruthy();
      expect(html).toContain(`data-${attr[t.kind]}="${t.key}"`);
      expect(html).toContain(`data-idx="${i}"`);
      expect(html).toContain(`id="feedback-${i}"`);
    });
  });

  test('the page opens on the warm-up', () => {
    expect(html).toMatch(/<button class="tab support active" data-idx="4">/);
    expect(html).toContain('<section class="panel active" id="panel-4">');
  });

  test('optional tabs never change the score', () => {
    expect(calcScore([true, true, true, true, false, false, false, false], new Array(8).fill(true))).toBe(100);
  });

  test('every image the page uses is inlined', () => {
    const keys = [...html.matchAll(/<img data-img="([^"]+)"/g)].map(m => m[1]).concat(Object.values(HUNTS).flatMap(h => h.rows).filter(r => r.img).map(r => r.img));
    expect(keys.length).toBe(5);
    for (const k of keys) expect(html, k).toContain(`'${k}': 'data:image/jpeg;base64,`);
  });

  test('the page stays under about 1 MB', () => {
    expect(html.length).toBeLessThan(1_000_000);
  });
});
