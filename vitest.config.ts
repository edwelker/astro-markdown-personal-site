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
      include: ['scripts/**/*.mjs'],
      exclude: []
    }
  }
});
