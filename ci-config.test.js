import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

// The E2E job runs inside Playwright's Docker image, whose browsers belong to one
// Playwright version. If @playwright/test moves on without the image, every spec
// fails with "Executable doesn't exist", so catch the mismatch here instead.
describe('CI config', () => {
  it('the Playwright image tag in test.yml matches the locked @playwright/test version', () => {
    const lock = JSON.parse(readFileSync('package-lock.json', 'utf8'));
    const locked = lock.packages['node_modules/@playwright/test'].version;
    const yml = readFileSync('.github/workflows/test.yml', 'utf8');
    const tag = yml.match(/mcr\.microsoft\.com\/playwright:v([\d.]+)-/)?.[1];
    expect(tag, 'no mcr.microsoft.com/playwright image in test.yml').toBeTruthy();
    expect(tag).toBe(locked);
  });

  // .nvmrc is the one place the Node version lives (CI's setup-node reads it, and so do
  // nvm/fnm/volta locally). A hard-coded node-version would let CI drift from it.
  it('every workflow takes its Node version from .nvmrc', () => {
    for (const f of ['test.yml', 'build-manifest.yml']) {
      const yml = readFileSync(`.github/workflows/${f}`, 'utf8');
      expect(yml, f).not.toMatch(/node-version:/);
      const setups = yml.match(/actions\/setup-node@/g) ?? [];
      const files = yml.match(/node-version-file: \.nvmrc/g) ?? [];
      expect(files.length, f).toBe(setups.length);
    }
    expect(readFileSync('.nvmrc', 'utf8').trim()).toMatch(/^\d+$/);
  });
});
