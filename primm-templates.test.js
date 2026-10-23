import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';

// The Y8 and Y9 PRIMM templates share one PRIMM engine: only their <style> (and a little
// markup) differ. CLAUDE.md asks for every logic change to be made in both, so this fails
// as soon as their module scripts drift apart. The Station Zero template adds the story
// hooks, so it can't be compared line for line and is kept in step by hand.
const moduleScript = file => {
  const html = readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  const match = html.match(/<script type="module">([\s\S]*?)<\/script>/);
  if (!match) throw new Error(`${file}: no <script type="module">`);
  return match[1];
};

describe('PRIMM templates', () => {
  test('Y8 and Y9 templates have the same module script', () => {
    const y8 = moduleScript('_templates/PRIMM_Python_Y8.html').split('\n');
    const y9 = moduleScript('_templates/PRIMM_Python_Y9.html').split('\n');
    const first = y8.findIndex((line, i) => line !== y9[i]);
    expect(first, first < 0 ? '' :
      `First difference at module line ${first + 1}:\n  Y8: ${y8[first]}\n  Y9: ${y9[first]}`).toBe(-1);
    expect(y8.length).toBe(y9.length);
  });
});
