/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      'astro:content': path.resolve(process.cwd(), './tests/mocks/astro-content.ts'),
      'astro:schema': 'astro/zod',
    },
  },
  test: {
    include: ['tests/**/*.{test,unit}.{ts,mts,mjs,js}', 'src/**/*.{test,unit}.{ts,mts,mjs,js}'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/*.spec.mjs', '**/*.spec.ts', '**/e2e/**'],
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'lcov', 'html', 'json-summary'],
      include: ['src/**/*.{js,mjs,ts,mts,tsx,jsx}', 'scripts/**/*.{js,mjs,ts,mts}'],
      exclude: [
        '**/*.d.ts',
        '**/*.json',
        'tests/artifacts.test.ts',
        'tests/sitemap-integrity.test.ts',
        'tests/mocks/**',
      ],
      all: true,
    },
  },
});
