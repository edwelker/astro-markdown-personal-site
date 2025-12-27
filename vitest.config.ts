import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // reporters: ['default', 'html'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['scripts/**/*.mjs'],
      exclude: [
        'scripts/run-all.mjs' // This is an orchestrator, no logic to test.
      ]
    }
  }
});
