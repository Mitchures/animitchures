/**
 * The drift check. Deliberately imports the UNMOCKED `test` from
 * @playwright/test, so this is the only spec that reaches the real AniList API.
 *
 * Excluded from default runs — invoke with `yarn e2e:live`. Worth running after
 * any AniList-facing change, and whenever a real bug appears that the mocked
 * suite did not catch, since fixture drift is the price of mocking everything.
 */
import { test, expect } from '@playwright/test';

test('@live real AniList still satisfies the Discover query', async ({ page }) => {
  await page.goto('/');

  // If AniList changed its schema or the query broke, the hero never renders —
  // the fixtures would still be green, which is exactly the blind spot this
  // covers.
  await expect(page.locator('.hero__banner')).toBeVisible({ timeout: 30_000 });
  await expect(page.locator('.features__body .card').first()).toBeVisible();
});
