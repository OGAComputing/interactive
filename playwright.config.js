import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // CI also writes the HTML report, so the workflow has something to upload when a shard fails.
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'html',
  timeout: 60_000,
  use: {
    baseURL: 'http://127.0.0.1:3001',
    trace: 'on-first-retry',
    // The suite is CPU-bound (every Python page boots Pyodide), so stop idle animations
    // (heart lines, blinking lights, typing text) eating CPU. Specs that test an animation
    // opt back in with test.use({ contextOptions: { reducedMotion: 'no-preference' } }).
    contextOptions: { reducedMotion: 'reduce' },
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'node test-server.mjs',
    env: { PORT: '3001' },
    url: 'http://127.0.0.1:3001',
    reuseExistingServer: true,
    timeout: 30_000,
  },
});
