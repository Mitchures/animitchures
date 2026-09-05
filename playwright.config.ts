import { defineConfig, devices } from '@playwright/test';
import { config as loadEnv } from 'dotenv';

// Real test-account credentials. Gitignored; see the signed-in e2e design doc.
loadEnv({ path: '.env.test.local' });

/**
 * End-to-end config.
 *
 * Specs live in `e2e/`, outside `src/`, and use `.spec.ts`. Vitest is scoped to
 * `src/**`, so `yarn test` will not try to run these.
 *
 * Browser binaries are not installed by `yarn install`. Run once:
 *   npx playwright install chromium
 *
 * Projects:
 *   setup   signs in once and saves e2e/.auth/user.json
 *   public  signed-out specs — these assert signed-out behaviour, so they must
 *           NOT be given a storageState
 *   authed  signed-in specs, reusing the saved session
 *   live    the opt-in real-AniList drift check; never runs by default
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
  projects: [
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    {
      name: 'public',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: [/auth\.setup\.ts/, /authed\//, /live\.spec\.ts/],
    },
    {
      name: 'authed',
      use: { ...devices['Desktop Chrome'], storageState: 'e2e/.auth/user.json' },
      testMatch: /authed\/.*\.spec\.ts/,
      dependencies: ['setup'],
    },
    {
      // Opt-in only: `yarn e2e:live`. Excluded from `public` above so the two
      // mechanisms cannot disagree about whether it runs.
      name: 'live',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /live\.spec\.ts/,
    },
  ],
  webServer: {
    command: 'yarn start',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120_000,
    env: { BROWSER: 'none' },
  },
});
