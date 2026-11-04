import { describe, expect, test } from 'vitest';
import { existsSync, readdirSync, readFileSync } from 'node:fs';

// _presentations/lesson-slides.json maps lesson folders to the Google Slides deck the hub
// attaches to their Classroom post. A renamed or mistyped folder would silently drop the deck.
const decks = Object.entries(JSON.parse(readFileSync('_presentations/lesson-slides.json', 'utf8')))
  .filter(([key]) => !key.startsWith('_'));

describe('lesson-slides.json', () => {
  test.each(decks)('%s is a lesson folder with a page', (folder, deck) => {
    expect(existsSync(folder), `${folder} does not exist`).toBe(true);
    expect(folder.split('/')[2]).toMatch(/^[Ll]\d+/);
    expect(readdirSync(folder).some(f => f.endsWith('.html') && !f.startsWith('_'))).toBe(true);
    expect(deck.id).toMatch(/^[\w-]{25,}$/);
  });
});
