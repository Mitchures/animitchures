/**
 * Signing in from a genuinely empty browser.
 *
 * Every other signed-in spec starts from the saved session in
 * `e2e/.auth/user.json`, where the AniList token is already sitting in
 * localStorage before the first render — which hides the only window in which
 * the app has an AniList profile but no token yet. `hydrateSession` dispatches
 * the profile, then *awaits* a Firestore read for the token, and the reconnect
 * notice is derived from exactly that pair. So a real sign-in flashed — and then
 * kept showing — "Your AniList session has expired" for an account whose
 * connection was perfectly fine.
 *
 * Runs in `authed` for the serial execution, but deliberately throws the saved
 * session away: a clean context is the whole point.
 */
import { test, expect } from '../anilist-mock';

const email = process.env.E2E_EMAIL;
const password = process.env.E2E_PASSWORD;

test.describe('signing in from a clean browser', () => {
  test.use({
    storageState: { cookies: [], origins: [] },
    viewport: { width: 1280, height: 900 },
  });

  test('never claims the AniList session has expired', async ({ page }) => {
    test.skip(!email || !password, 'needs E2E_EMAIL / E2E_PASSWORD in .env.test.local');
    test.setTimeout(90_000);

    const seen: string[] = [];
    // Polling after the fact would miss a notice that appeared and went. This
    // records the banner the moment it is ever attached.
    const watcher = setInterval(async () => {
      try {
        if (await page.locator('.anilistReconnect--banner').count()) seen.push('banner');
      } catch {
        /* page closed */
      }
    }, 120);

    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.fill('#login-email', email as string);
    await page.fill('#login-password', password as string);
    await page.click('button[type="submit"]');

    await page.waitForURL('http://localhost:3000/');
    await page
      .locator('.navigation a:has-text("Logout")')
      .waitFor({ state: 'attached', timeout: 30_000 });

    // Well past the Firestore read that restores the token.
    await page.waitForTimeout(6000);
    clearInterval(watcher);

    // The token is seeded for this account, so there is nothing to reconnect.
    await expect(page.locator('.anilistReconnect--banner')).toHaveCount(0);
    expect(seen, 'the expiry banner was shown during sign-in').toEqual([]);
  });
});
