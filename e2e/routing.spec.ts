/**
 * Route guarding. Runs in the `public` project, which has no saved session —
 * so "signed out" here is the project's natural state rather than something a
 * test has to dismantle.
 */
import { test, expect } from './anilist-mock';

test.describe('private routes when signed out', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  for (const route of ['/favorites', '/settings', '/profile', '/anilist-watchlist']) {
    test(`${route} redirects to the home page`, async ({ page }) => {
      await page.goto(route);
      // The '*' catch-all is held back until Firebase reports on the session,
      // which is what makes a signed-in refresh work. Once it reports nobody,
      // the redirect must still happen — otherwise that fix would have made
      // every private route reachable by anyone.
      await expect(page).toHaveURL(/localhost:3000\/$/, { timeout: 20_000 });
    });
  }

  test('an unknown route still redirects', async ({ page }) => {
    await page.goto('/no-such-page');
    await expect(page).toHaveURL(/localhost:3000\/$/, { timeout: 20_000 });
  });
});
