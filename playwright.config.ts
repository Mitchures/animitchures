import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end config for the responsive suite.
 *
 * Specs live in `e2e/`, outside `src/`, and use `.spec.ts`. CRA's jest
 * testMatch only scans `src/**`, so `yarn test` will not try to run these —
 * it would fail confusingly if it did.
 *
 * Browser binaries are not installed by `yarn install`. Run once:
 *   npx playwright install chromium
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'list' : [['list']],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'yarn start',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120_000,
    env: { BROWSER: 'none' },
  },
});
