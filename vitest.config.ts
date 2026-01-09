/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      'astro:content': path.resolve(process.cwd(), './tests/mocks/astro-content.ts'),
    },
  },
  test: {
    // Only include unit and safety tests
    include: ['tests/**/*.{test,unit}.{ts,mts,mjs,js}', 'src/**/*.{test,unit}.{ts,mts,mjs,js}'],
    // Explicitly exclude Playwright specs and other non-unit patterns
    exclude: [
      '**/node_modules/**', 
      '**/dist/**', 
      '**/*.spec.mjs', 
      '**/*.spec.ts',
      '**/e2e/**'
    ],
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html', 'json-summary'],
      // Use specific extensions to automatically ignore .astro, .md, .json, etc.
      include: [
        'src/**/*.{js,mjs,ts,mts,tsx,jsx}',
        'scripts/**/*.{js,mjs,ts,mts}'
      ],
      exclude: [
        '**/*.d.ts', // Ignore type declaration files
        '**/*.json', // Explicitly ignore JSON files
        'tests/artifacts.test.ts',
        'tests/sitemap-integrity.test.ts',
        'tests/mocks/**'
      ]
    }
  }
});
