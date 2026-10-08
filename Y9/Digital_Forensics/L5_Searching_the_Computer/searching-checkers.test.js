import { describe, test, expect } from 'vitest';
import {
  journalGuesses, JOURNAL_PASSWORD, isDictionaryLike, crackSeconds, beatsHundredYears, formatDuration,
  ATTACK_TARGETS, fallsWithinHour, ANSWERS, TASK_COUNT, mark, allCorrect,
  DELETED_FILES, recoveryStatus, protectReady, justificationOk, personalDetails, weaknesses, checkJournalGuess,
  CHECKPOINTS, drawCheckpoint, optionOrder, GATES, CARVE_BLOCKS, CARVE_TARGET, isHistoryBlock, DEMO_PREDICT, cooldownSeconds,
  THREATS, DEFENCES, timeLimit, multiplier, scorePlay, rankFor, buildDeck, handFor, seededRandom,
  THREAT_LEVELS, threatLevel,
} from './searching-checkers.js';

describe('journal dictionary attack', () => {
  test('clues cut the search to the two word-number-word orders, in capitals', () => {
    expect(journalGuesses(true)).toEqual(['IBIZA23MARIA', 'MARIA23IBIZA']);
  });
  test('without clues every order and case is tried, password last', () => {
    const g = journalGuesses(false);
    expect(g.length).toBe(54); // 6 orders × 3 cases × 3 cases
    expect(new Set(g).size).toBe(54);
    expect(g[g.length - 1]).toBe(JOURNAL_PASSWORD);
  });
});

describe('password strength', () => {
  test.each(['letMeIn', 'password1', 'Bob123', 'ManCity2020', 'P@ssw0rd', '12345678', 'Liverpool2024!', 'HELLO($)'])(
    '%s is dictionary-like', pw => expect(isDictionaryLike(pw)).toBe(true));

  test.each(['kettle tiger purple moon', 'xq7#Lp2!', 'kettletigerpurplemoon'])(
    '%s is not dictionary-like', pw => expect(isDictionaryLike(pw)).toBe(false));

  test('long random digit strings are brute-forced, not dictionary', () => {
    expect(isDictionaryLike('83920174563812')).toBe(false);
  });

  test('three or four random words beat 100 years; short ones do not', () => {
    expect(beatsHundredYears('kettle tiger purple moon')).toBe(true);
    expect(beatsHundredYears('kettletigerpurple')).toBe(true);
    expect(beatsHundredYears('xq7#Lp2!')).toBe(false);
    expect(beatsHundredYears('ManCity2020')).toBe(false);
    expect(beatsHundredYears('')).toBe(false);
  });

  test('which attack targets fall within an hour', () => {
    expect(ATTACK_TARGETS.filter(fallsWithinHour)).toEqual(['letMeIn', 'password1', 'Bob123', 'ManCity2020', 'HELLO($)']);
  });

  test('formatDuration reads naturally', () => {
    expect(formatDuration(0.001)).toBe('instantly');
    expect(formatDuration(1)).toBe('1 second');
    expect(formatDuration(7200)).toBe('2 hours');
    expect(formatDuration(crackSeconds('kettle tiger purple moon'))).toBe('millions of years+');
  });
});

describe('answer marking', () => {
  test('ten scored tasks', () => expect(TASK_COUNT).toBe(10));

  test('the answer key marks itself fully correct', () => {
    for (const id of Object.keys(ANSWERS)) expect(allCorrect(mark(id, ANSWERS[id]))).toBe(true);
  });

  test('each question is marked individually', () => {
    const r = mark('t6', { pt_open: ['wifispy', 'picbomb', 'lockslip'], pt_tool: 'picbomb' });
    expect(r).toEqual({ pt_open: true, pt_tool: false, pt_fix: false });
    expect(allCorrect(r)).toBe(false);
  });

  test('missing answers count as wrong', () => {
    expect(allCorrect(mark('t6', {}))).toBe(false);
    expect(allCorrect(mark('t6', null))).toBe(false);
  });
});

describe('disk recovery', () => {
  test('answer key matches the disk map', () => {
    for (const f of DELETED_FILES) expect(recoveryStatus(f)).toBe(ANSWERS.t4[f.id]);
  });
  test('recoveryStatus counts overwritten blocks', () => {
    const f = { blocks: [1, 2] };
    expect(recoveryStatus(f, [])).toBe('full');
    expect(recoveryStatus(f, [2])).toBe('part');
    expect(recoveryStatus(f, [1, 2])).toBe('gone');
  });
});

describe('personal details in passwords', () => {
  test('journal words make a password weak however they are dressed up', () => {
    for (const pw of ['Maria23Ibiza', 'maria23ibiza!', 'M@ria2009sunset', 'mariaibizaholiday23', 'Ashley5AlbertTerrace']) {
      expect(weaknesses(pw)).toContain('personal');
      expect(beatsHundredYears(pw)).toBe(false);
    }
  });
  test('personalDetails names what it found, in the original case', () => {
    expect(personalDetails('Maria23Ibiza')).toEqual(['Maria', 'Ibiza']);
    expect(personalDetails('kettle tiger 2009')).toEqual(['2009']);
    expect(personalDetails('kettle tiger purple moon')).toEqual([]);
  });
  test('the student builds the journal password exactly', () => {
    expect(checkJournalGuess('MARIA23IBIZA')).toBe(true);
    expect(checkJournalGuess('IBIZA23MARIA')).toBe(false);
    expect(checkJournalGuess('Maria23Ibiza')).toBe(false);
  });
});

describe('checkpoints', () => {
  test('every question has four options, one correct key and an explanation', () => {
    for (const cp of Object.values(CHECKPOINTS)) {
      expect(cp.pool.length).toBeGreaterThan(cp.length);
      for (const q of cp.pool) {
        expect(q.opts.length).toBe(4);
        expect(q.opts.map(o => o[0])).toContain(q.a);
        expect(q.why.length).toBeGreaterThan(10);
      }
    }
  });
  test('the correct option is never the single longest one', () => {
    for (const cp of Object.values(CHECKPOINTS)) {
      for (const q of cp.pool) {
        const lens = q.opts.map(o => o[1].length);
        const right = q.opts.find(o => o[0] === q.a)[1].length;
        const longest = Math.max(...lens);
        expect(right === longest && lens.filter(l => l === longest).length === 1).toBe(false);
      }
    }
  });
  test('a draw is stable for one attempt and changes after a restart', () => {
    const a = drawCheckpoint('t1', 'seedA', 0);
    expect(a.length).toBe(4);
    expect(new Set(a).size).toBe(4);
    expect(drawCheckpoint('t1', 'seedA', 0)).toEqual(a);
    const later = [1, 2, 3, 4].map(n => drawCheckpoint('t1', 'seedA', n).join());
    expect(later.some(d => d !== a.join())).toBe(true);
  });
  test('different students get different orders', () => {
    const orders = ['s1', 's2', 's3', 's4', 's5'].map(s => drawCheckpoint('t3', s, 0).join());
    expect(new Set(orders).size).toBeGreaterThan(1);
    expect(optionOrder('t3', 'ck1', 's1', 0).sort()).toEqual(['a', 'b', 'c', 'd']);
  });
  test('cooldown is always 10 seconds', () => {
    expect([1, 2, 3, 9].map(cooldownSeconds)).toEqual([10, 10, 10, 10]);
  });
});

describe('evidence logs', () => {
  test('checkbox answers need exactly the right set', () => {
    const accs = GATES.cookies.ck_acc;
    expect(mark('cookies', { ck_acc: [...accs].reverse(), ck_trk: 'trackr' })).toEqual({ ck_acc: true, ck_trk: true });
    expect(mark('cookies', { ck_acc: [...accs, 'netball_queen_liv'], ck_trk: 'trackr' }).ck_acc).toBe(false);
    expect(mark('cookies', { ck_acc: accs.slice(0, 2) }).ck_acc).toBe(false);
  });
  test('gate keys mark themselves correct', () => {
    for (const g of Object.keys(GATES)) expect(allCorrect(mark(g, GATES[g]))).toBe(true);
  });
});

describe('history carving', () => {
  test('eight history blocks; near-misses and other file types are not history', () => {
    expect(CARVE_TARGET).toBe(8);
    expect(CARVE_BLOCKS.filter(b => b.kind === 'near').every(b => !isHistoryBlock(b))).toBe(true);
    expect(new Set(CARVE_BLOCKS.filter(isHistoryBlock).map(b => b.entry)).size).toBe(8);
  });
  test('demo predictions have a valid key', () => {
    for (const p of Object.values(DEMO_PREDICT)) expect(p.opts.map(o => o[0])).toContain(p.a);
  });
});

describe('written answers', () => {
  test.each(['aaaaaaaaaaaaaaaaaaaa', 'asdfghjkl asdfghjkl', 'it is it is it is', 'idk', 'dfgh jklm qwrt zxcv'])(
    '%s is not a real sentence', t => expect(justificationOk(t)).toBe(false));
  test('a real sentence passes', () => {
    expect(justificationOk('It stops people getting into my accounts')).toBe(true);
  });
});

describe('protect yourself', () => {
  test('needs three justified choices', () => {
    const long = 'Because it stops people guessing';
    expect(protectReady([{ text: long }, { text: long }])).toBe(false);
    expect(protectReady([{ text: long }, { text: long }, { text: 'idk' }])).toBe(false);
    expect(protectReady([{ text: long }, { text: long }, { text: long }])).toBe(true);
    expect(protectReady(undefined)).toBe(false);
  });
});

describe('Breach Defence game', () => {
  test('every threat points at real defences', () => {
    for (const t of THREATS) {
      expect(DEFENCES[t.best]).toBeTruthy();
      t.ok.forEach(d => { expect(DEFENCES[d]).toBeTruthy(); expect(d).not.toBe(t.best); });
    }
  });

  test('every defence is the best answer to at least one threat', () => {
    for (const d of Object.keys(DEFENCES)) expect(THREATS.some(t => t.best === d)).toBe(true);
  });

  test('timer shrinks but never drops below 4 seconds', () => {
    expect(timeLimit(0)).toBe(20);
    expect(timeLimit(5)).toBe(17);
    expect(timeLimit(100)).toBe(8);
  });

  test('streak multiplier steps', () => {
    expect([0, 2, 3, 5, 6, 9, 10, 30].map(multiplier)).toEqual([1, 1, 2, 2, 3, 3, 4, 4]);
  });

  test('scoring best / partial / wrong', () => {
    const t = THREATS.find(x => x.id === 'phone'); // best lock, ok wipe
    expect(scorePlay(t, 'lock', 10, 10, 0)).toEqual({ result: 'best', points: 200, streak: 1, lifeLost: false });
    expect(scorePlay(t, 'lock', 0, 10, 2).points).toBe(200); // 3rd in a row → x2, no speed bonus
    expect(scorePlay(t, 'wipe', 5, 10, 4)).toEqual({ result: 'ok', points: 30, streak: 0, lifeLost: false });
    expect(scorePlay(t, 'vpn', 5, 10, 4)).toEqual({ result: 'wrong', points: 0, streak: 0, lifeLost: true });
  });

  test('ranks', () => {
    expect(rankFor(0)).toBe('Trainee');
    expect(rankFor(2500)).toBe('Forensic Technician');
    expect(rankFor(24999)).toBe('Head of Cyber Unit');
    expect(rankFor(25000)).toBe('Threat Hunter');
    expect(rankFor(99999)).toBe('National Cyber Chief');
    expect(rankFor(250000)).toBe('Cyber Legend');
  });

  test('a challenge code gives everyone the same deck', () => {
    const a = buildDeck('9X2', 40).map(t => t.id);
    const b = buildDeck('9x2', 40).map(t => t.id);
    expect(a).toEqual(b);
    expect(buildDeck('OTHER', 40).map(t => t.id)).not.toEqual(a);
  });

  test('deck never repeats a card back-to-back', () => {
    const d = buildDeck('ABC', 120);
    expect(d.length).toBe(120);
    for (let i = 1; i < d.length; i++) expect(d[i].id).not.toBe(d[i - 1].id);
  });

  test('hand always has four distinct cards including the best one', () => {
    const rnd = seededRandom('hand');
    for (const t of THREATS) {
      const h = handFor(t, rnd);
      expect(h.length).toBe(4);
      expect(new Set(h).size).toBe(4);
      expect(h).toContain(t.best);
    }
  });

  test('threat level rises at 25k and 50k', () => {
    expect(threatLevel(0).name).toBe('GUARDED');
    expect(threatLevel(24999).name).toBe('GUARDED');
    expect(threatLevel(25000).name).toBe('ELEVATED');
    expect(threatLevel(75000).name).toBe('SEVERE');
  });

  test('higher threat levels deal bigger hands with every partly-right decoy', () => {
    const rnd = seededRandom('decoys');
    for (const lvl of THREAT_LEVELS) {
      for (const t of THREATS) {
        const h = handFor(t, rnd, lvl);
        expect(h.length).toBe(lvl.cards);
        expect(new Set(h).size).toBe(lvl.cards);
        expect(h).toContain(t.best);
        if (lvl.decoys) t.ok.forEach(d => expect(h).toContain(d));
      }
    }
  });

  test('at SEVERE a partly-right defence costs a life', () => {
    const t = THREATS.find(x => x.id === 'phone'); // best lock, ok wipe
    expect(scorePlay(t, 'wipe', 5, 10, 4, true)).toEqual({ result: 'ok', points: 0, streak: 0, lifeLost: true });
    expect(scorePlay(t, 'lock', 10, 10, 0, true).lifeLost).toBe(false);
  });

  test('an extended deck carries on without a back-to-back repeat', () => {
    const d = buildDeck('ABC', 120);
    for (let k = 0; k < 5; k++) {
      const more = buildDeck(`ABC#${d.length}`, 120, d[d.length - 1].id);
      expect(more[0].id).not.toBe(d[d.length - 1].id);
      d.push(...more);
    }
    for (let i = 1; i < d.length; i++) expect(d[i].id).not.toBe(d[i - 1].id);
    expect(buildDeck('ABC#120', 120, 'bf').map(t => t.id)).toEqual(buildDeck('abc#120', 120, 'bf').map(t => t.id));
  });
});
