import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  // Includes both .mjs and .ts test files
  testMatch: '**/*.spec.{mjs,ts}',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 1,
  workers: '50%',
  // List reporter shows names even when parallel
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run build && npm run preview',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 180 * 1000,
  },
});
