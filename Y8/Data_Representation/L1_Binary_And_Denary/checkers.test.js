import { describe, it, expect } from 'vitest';
import {
  HEADINGS, seededRandom, shuffled, cooldownSeconds,
  toBinary, toDenary, headingsUsed, b2dWhy, d2bWhy,
  checkDenary, checkBinaryText, binaryTextProblem,
  CIPHER_WORDS, encodeWord, checkCipher,
  KEYWORDS, checkKeywords,
  GIVEN_HEADINGS, checkHeadings,
  B2D_LEVELS, B2D_LENGTH, b2dQuestion,
  GUIDED_POOLS, guidedNumber, fitSteps, fitWhy,
  D2B_LENGTH, D2B_RANGES, d2bQuestion, checkBits,
  FINAL_LENGTH, finalQuestion, checkFinal,
} from './checkers.js';

describe('conversions', () => {
  it('headings double from right to left', () => {
    expect(HEADINGS).toEqual([128, 64, 32, 16, 8, 4, 2, 1]);
    for (let i = 0; i < 7; i++) expect(HEADINGS[i]).toBe(HEADINGS[i + 1] * 2);
  });
  it('matches the slide examples', () => {
    expect(toDenary('1101')).toBe(13);
    expect(toDenary('1001')).toBe(9);
    expect(toBinary(22)).toBe('00010110');
    expect(['0100', '1001', '1011', '1111'].map(toDenary)).toEqual([4, 9, 11, 15]);
    expect([7, 12, 9, 25].map(n => toBinary(n))).toEqual(['00000111', '00001100', '00001001', '00011001']);
  });
  it('round-trips every byte', () => {
    for (let n = 0; n < 256; n++) expect(toDenary(toBinary(n))).toBe(n);
  });
  it('lists the headings used, biggest first', () => {
    expect(headingsUsed('1011')).toEqual([8, 2, 1]);
    expect(headingsUsed('00010110')).toEqual([16, 4, 2]);
  });
  it('explains both directions', () => {
    expect(b2dWhy('1011')).toBe('Add the headings with a 1 under them: 8 + 2 + 1 = 11');
    expect(b2dWhy('1000')).toMatch(/Only the 8 heading/);
    expect(d2bWhy(22)).toBe('22 = 16 + 4 + 2, so 22 in binary is 00010110');
  });
});

describe('typed answers', () => {
  it('denary accepts digits only', () => {
    expect(checkDenary(' 13 ', 13)).toBe(true);
    expect(checkDenary('013', 13)).toBe(true);
    expect(checkDenary('13.0', 13)).toBe(false);
    expect(checkDenary('', 0)).toBe(false);
    expect(checkDenary('1101', 13)).toBe(false);
  });
  it('binary accepts any number of leading zeros and spaces', () => {
    expect(checkBinaryText('1101', 13)).toBe(true);
    expect(checkBinaryText('00001101', 13)).toBe(true);
    expect(checkBinaryText('0000 1101', 13)).toBe(true);
    expect(checkBinaryText('13', 13)).toBe(false);
    expect(checkBinaryText('1011', 13)).toBe(false);
    expect(checkBinaryText('000001101', 13)).toBe(false);
  });
  it('binaryTextProblem catches the malformed answers', () => {
    expect(binaryTextProblem('')).toMatch(/Type/);
    expect(binaryTextProblem('102')).toMatch(/0 and 1/);
    expect(binaryTextProblem('101010101')).toMatch(/8 bits/);
    expect(binaryTextProblem('1010')).toBe('');
  });
});

describe('helpers', () => {
  it('seededRandom is deterministic per seed', () => {
    const a = seededRandom('abc'), b = seededRandom('abc');
    expect([a(), a()]).toEqual([b(), b()]);
  });
  it('shuffled keeps every item', () => {
    expect(shuffled([1, 2, 3, 4], seededRandom('x')).sort()).toEqual([1, 2, 3, 4]);
  });
  it('cooldown escalates and caps', () => {
    expect([1, 2, 3, 7].map(cooldownSeconds)).toEqual([10, 20, 30, 30]);
  });
});

describe('starter cipher', () => {
  it('encodes A=1 … Z=26 to match the slide', () => {
    expect(encodeWord('there')).toEqual([20, 8, 5, 18, 5]);
    expect(encodeWord('binary')).toEqual([2, 9, 14, 1, 18, 25]);
  });
  it('marks each word, ignoring case and spaces', () => {
    const answers = Object.fromEntries(CIPHER_WORDS.map((w, i) => ['w' + i, ` ${w.toUpperCase()} `]));
    expect(checkCipher(answers).ok).toBe(true);
    answers.w2 = '10';
    const r = checkCipher(answers);
    expect(r.ok).toBe(false);
    expect(r.results.w2).toBe(false);
    expect(r.results.w0).toBe(true);
  });
});

describe('keywords', () => {
  it('needs every word on its own definition', () => {
    const right = Object.fromEntries(KEYWORDS.map(k => ['kw-' + k.id, k.id]));
    expect(checkKeywords(right).ok).toBe(true);
    const swapped = { ...right, 'kw-nibble': 'byte', 'kw-byte': 'nibble' };
    const r = checkKeywords(swapped);
    expect(r.ok).toBe(false);
    expect(r.results['kw-bit']).toBe(true);
    expect(r.results['kw-byte']).toBe(false);
  });
});

describe('headings', () => {
  it('checks only the six missing headings', () => {
    const values = { h0: '128', h1: '64', h2: '32', h3: '16', h4: '8', h5: '4' };
    const r = checkHeadings(values);
    expect(r.ok).toBe(true);
    expect(Object.keys(r.results)).toHaveLength(8 - GIVEN_HEADINGS.length);
    expect(checkHeadings({ ...values, h1: '60' }).results.h1).toBe(false);
  });
});

describe('binary → denary chain', () => {
  it('each question uses its level width, the top bit, and is never all 1s', () => {
    for (const seed of ['a', 'b', 'c', 'd']) {
      for (let pos = 0; pos < B2D_LENGTH; pos++) {
        const q = b2dQuestion(seed, 0, pos);
        expect(q.bits).toHaveLength(B2D_LEVELS[pos].width);
        expect(q.bits[0]).toBe('1');
        expect(q.bits).toMatch(/0/);
        expect(toDenary(q.bits)).toBe(q.value);
      }
    }
  });
  it('support fades: glow, then grid, then plain', () => {
    expect(B2D_LEVELS.map(l => l.mode)).toEqual(['glow', 'glow', 'grid', 'grid', 'plain', 'plain']);
  });
  it('a retry gives a different number at the same level', () => {
    const vals = new Set([0, 1, 2, 3, 4].map(r => b2dQuestion('s', 0, 3, r).value));
    expect(vals.size).toBeGreaterThan(1);
  });
});

describe('does it fit?', () => {
  it('walks the slide example 22', () => {
    const steps = fitSteps(22);
    expect(steps.map(s => (s.fits ? 1 : 0)).join('')).toBe('00010110');
    expect(steps[3]).toEqual({ heading: 16, before: 22, fits: true, after: 6 });
    expect(steps.at(-1).after).toBe(0);
    expect(fitWhy(steps[3])).toMatch(/22 − 16 = 6/);
    expect(fitWhy(steps[0])).toMatch(/does not fit/);
  });
  it('fitSteps gives the right bits for every pooled number', () => {
    for (const n of GUIDED_POOLS.flat()) {
      expect(fitSteps(n).map(s => (s.fits ? '1' : '0')).join('')).toBe(toBinary(n));
    }
  });
  it('guided numbers come from their pool', () => {
    expect(GUIDED_POOLS[0]).toContain(guidedNumber('s', 0, 0));
    expect(GUIDED_POOLS[1]).toContain(guidedNumber('s', 0, 1));
  });
});

describe('denary → binary chain', () => {
  it('numbers stay in each range', () => {
    for (let pos = 0; pos < D2B_LENGTH; pos++) {
      const { value } = d2bQuestion('z', 2, pos);
      expect(value).toBeGreaterThanOrEqual(D2B_RANGES[pos][0]);
      expect(value).toBeLessThanOrEqual(D2B_RANGES[pos][1]);
    }
  });
  it('checkBits needs all 8 bits to make the number', () => {
    expect(checkBits([...'00010110'], 22)).toBe(true);
    expect(checkBits([...'00010111'], 22)).toBe(false);
    expect(checkBits([...'0001011'], 22)).toBe(false);
  });
});

describe('final challenge', () => {
  it('alternates directions and accepts either answer form', () => {
    for (let pos = 0; pos < FINAL_LENGTH; pos++) {
      const q = finalQuestion('f', 0, pos);
      expect(q.type).toBe(pos % 2 ? 'd2b' : 'b2d');
      const answer = q.type === 'b2d' ? String(q.value) : toBinary(q.value);
      expect(checkFinal(q, answer)).toBe(true);
      if (q.type === 'd2b') expect(checkFinal(q, q.value.toString(2))).toBe(true);
      expect(checkFinal(q, q.type === 'b2d' ? String(q.value + 1) : toBinary(q.value + 1))).toBe(false);
    }
  });
});
