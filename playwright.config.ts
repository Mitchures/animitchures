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
  // One local retry, not zero: the authed specs are the only ones that touch a
  // real backend (Firebase Auth plus a Firestore read per test), and they
  // occasionally lose a race against the rest of the suite for the dev server.
  // Everything else is fixture-mocked and deterministic — a retry there would
  // be masking a real failure, so keep an eye on which project consumes them.
  retries: process.env.CI ? 2 : 1,
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
      // Serial, unlike every other project. These specs share one real Firebase
      // account and each one waits on Auth plus a Firestore read; running five
      // at once made them time out waiting for the signed-in shell — not a
      // product failure, just contention against a real backend. The public
      // specs are fully mocked and stay parallel.
      fullyParallel: false,
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
