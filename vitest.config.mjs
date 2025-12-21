import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Only run unit tests, ignore browser specs
    exclude: ['**/node_modules/**', '**/dist/**', '**/*.spec.mjs'],
    include: ['tests/*.test.mjs'],
    globals: true,
    environment: 'node',
  },
});
