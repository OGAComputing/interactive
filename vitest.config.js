import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['**/*.test.js'],
    exclude: ['node_modules/**', 'tests/**', 'test-results/**'],
    // Worker threads that share one module context: ~1.5 s instead of ~14 s, which went on
    // starting a fresh process per file. Safe because the tests are pure checker functions
    // with no vi.mock / vi.stubGlobal / global state. If a test ever needs mocks or globals,
    // drop `isolate: false` (or give that file its own project with isolate: true).
    pool: 'threads',
    isolate: false,
  },
});
