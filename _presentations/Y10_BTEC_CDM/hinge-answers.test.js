// Hinge questions (K.choice, lettered A/B/C/D on whiteboards) must not give their answer away by position.
// Students spotted that the answer was nearly always A (2026-11-19: 10 of 15). These checks keep the spread honest.
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const dir = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const decks = fs.readdirSync(dir).filter((f) => /^build_L[\d.]+\.cjs$/.test(f))
  .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));

const hinges = decks.flatMap((f) => {
  const src = fs.readFileSync(path.join(dir, f), 'utf8');
  return [...src.matchAll(/K\.choice\(\{([\s\S]*?)\}\);/g)].map(([, body]) => {
    const opts = /options:\s*\[([\s\S]*?)\]/.exec(body);
    return {
      deck: f,
      question: (/question:\s*(['"`])((?:\\.|(?!\1).)*)\1/.exec(body) || [])[2] || body.slice(0, 60),
      count: opts ? (opts[1].match(/(^|,)\s*(['"`])(?:\\.|(?!\2).)*\2/g) || []).length : 0,
      answer: (/answer:\s*'([A-D])'/.exec(body) || [])[1],
      said: (/\bAnswer ([A-D])\b/.exec(body) || [])[1],
    };
  });
});

describe('Y10 BTEC hinge questions', () => {
  it('finds the hinge questions', () => expect(hinges.length).toBeGreaterThan(5));

  it.each(hinges.map((h) => [h.deck, h.question, h]))('%s: "%s" names its answer, and the notes agree', (_d, _q, h) => {
    expect(h.answer, 'add answer: \'A\'–\'D\'').toBeDefined();
    expect('ABCD'.indexOf(h.answer)).toBeLessThan(h.count);
    if (h.said) expect(h.said).toBe(h.answer);
  });

  it('no letter is the answer to more than 40% of the course\'s hinge questions', () => {
    const tally = {};
    for (const h of hinges) tally[h.answer] = (tally[h.answer] || 0) + 1;
    for (const [letter, n] of Object.entries(tally)) expect(n / hinges.length, `${letter}: ${n} of ${hinges.length}`).toBeLessThanOrEqual(0.4);
  });

  it('no three hinge questions in a row (in teaching order) share an answer', () => {
    for (let i = 2; i < hinges.length; i++) {
      const run = hinges.slice(i - 2, i + 1);
      expect(new Set(run.map((h) => h.answer)).size, run.map((h) => `${h.deck} ${h.answer}`).join(', ')).toBeGreaterThan(1);
    }
  });
});
