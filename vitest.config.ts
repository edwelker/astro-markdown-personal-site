import { defineConfig } from 'vitest/config';

export default defineConfig({
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
      reporter: ['text', 'json', 'html'],
      // Use specific extensions to automatically ignore .astro, .md, .json, etc.
      include: [
        'src/**/*.{js,mjs,ts,mts,tsx,jsx}',
        'scripts/**/*.{js,mjs,ts,mts}'
      ],
      exclude: [
        '**/*.d.ts', // Ignore type declaration files
        '**/*.json' // Explicitly ignore JSON files
      ]
    }
  }
});
