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

  // If AniList changed its schema or the query broke, the slide never renders —
  // the fixtures would still be green, which is exactly the blind spot this
  // covers.
  await expect(page.locator('.slideHero')).toBeVisible({ timeout: 30_000 });

  // The dashboard's figures are all derived from that one response, so a shape
  // change shows up as an empty stat row rather than a broken page.
  await expect(page.locator('.statRow__stat').first()).toBeVisible();
  await expect(page.locator('.posterEchoCard').first()).toBeVisible();

  // The frosted tiles seed their palette from `coverImage.color`. If AniList
  // stopped returning it the tiles would silently fall back to a fixed green,
  // which looks deliberate and would never be noticed.
  const body = await page
    .locator('.discover__widgets .frostedTile')
    .first()
    .evaluate((el) => getComputedStyle(el).getPropertyValue('--body').trim());
  expect(body, 'the top-rated tile fell back to its fixed palette').not.toBe('#b9d95e');
  expect(body).toMatch(/^(#|rgb|color-mix)/);

  // The closing sections are the only consumers of the `nextSeason` and
  // `popular` buckets. Both render nothing at all when their bucket comes back
  // empty, which is indistinguishable from a page that simply ends early — so
  // an enum rename or a dropped field would be invisible without this.
  await expect(page.locator('.comingLater__lead')).toBeVisible();
  await expect(page.locator('.popularRow')).toHaveCount(6);

  // `popularity` is what both sections rank and measure by. A null would render
  // as a real-looking zero rather than as an error.
  const members = await page
    .locator('.popularRow__count .dotNumber')
    .first()
    .getAttribute('aria-label');
  expect(members, 'AniList stopped returning popularity').toMatch(/^\d[\d.]*[KM]?$/);
  expect(members).not.toBe('0');
});
