import { test as setup, expect } from '@playwright/test';
import { mockAniList } from './anilist-mock';

const AUTH_FILE = 'e2e/.auth/user.json';

/**
 * Signs in once through the real UI and saves the session for the `authed`
 * project to reuse. Runs as a Playwright project dependency, not a test of the
 * app — its only job is producing e2e/.auth/user.json.
 */
setup('authenticate', async ({ page }) => {
  const email = process.env.E2E_EMAIL;
  const password = process.env.E2E_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'E2E_EMAIL and E2E_PASSWORD must be set. They belong in .env.test.local, which ' +
        'playwright.config.ts loads and .gitignore excludes — so a fresh clone will not ' +
        'have it. Create it with the credentials of a Firebase account that exists in ' +
        'this project, then run `yarn e2e:seed` to populate that account\'s Firestore ' +
        'documents.',
    );
  }

  // Signing in lands on '/', which fires the Featured query. Mock it so the
  // setup makes zero live AniList requests, same as every other spec.
  await mockAniList(page);

  await page.goto('/login');
  await page.fill('#login-username', email);
  await page.fill('#login-password', password);
  await page.click('button[type="submit"]');

  // Signing in navigates to '/', but the avatar only renders once App.tsx's
  // onAuthStateChanged effect has resolved the Firestore user document. Waiting
  // for it means we save genuinely signed-in state, not just a URL change.
  await page.waitForURL('http://localhost:3000/');
  await expect(page.locator('.header__avatar')).toBeVisible({ timeout: 20_000 });

  // indexedDB is required: Firebase Auth persists its session there, not in
  // localStorage. Without this flag the saved state looks fine and silently
  // produces a signed-out run.
  await page.context().storageState({ path: AUTH_FILE, indexedDB: true });
});
