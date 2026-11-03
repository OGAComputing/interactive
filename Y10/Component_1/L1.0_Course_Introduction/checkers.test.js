import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { TASKS, WRITING, markWriting, allCorrect, calcScore } from './checkers.js';

const html = readFileSync(new URL('./1_Course_Introduction.html', import.meta.url), 'utf8');

describe('baseline page', () => {
  test('every task is writing, so finishing scores 100%', () => {
    expect(TASKS.every(t => t.kind === 'write')).toBe(true);
    expect(calcScore(TASKS.map(() => true), TASKS.map(() => true))).toBe(100);
  });

  test('real answers pass', () => {
    expect(allCorrect(markWriting('me', {
      fav_watch: 'Inside Out 2', fav_read: 'The Beano', fav_play: 'EA FC 26',
      hope: 'I would like to make a music video because I love editing clips',
    }))).toBe(true);
    expect(allCorrect(markWriting('baseline', {
      b_what: 'This is a film poster that you would see at the cinema',
      b_who: 'It is made for children and teenagers who play Minecraft because it has blocks and a creeper',
      b_detail: 'The bright blue sky makes me think the film will be fun and happy',
      b_why: 'They made it to get people to go and watch the film',
    }))).toBe(true);
  });

  test('blank or one-word answers are sent back', () => {
    const res = markWriting('baseline', { b_what: 'poster', b_who: '', b_detail: 'idk', b_why: 'money' });
    expect(Object.values(res).some(Boolean)).toBe(false);
  });

  test('the poster is inlined', () => {
    expect(html).toContain(`'minecraft': 'data:image/jpeg;base64,`);
    expect(WRITING.baseline).toHaveLength(4);
  });
});
