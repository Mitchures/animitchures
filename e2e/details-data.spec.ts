/**
 * The Details sections built from data AniList was already returning and the
 * app never rendered: rankings, streaming links, tags, community stats and
 * recommendations. Public route, AniList mocked from fixtures.
 */
import { test, expect } from './anilist-mock';

const DETAILS = '/anime/1/cowboy-bebop';

test.describe('details data sections', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test.beforeEach(async ({ page }) => {
    await page.goto(DETAILS);
    await expect(page.locator('.details__hero')).toBeVisible({ timeout: 20_000 });
  });

  test('the hero carries ranking badges', async ({ page }) => {
    const badges = page.locator('.heroRankings__badge');
    await expect(badges).toHaveCount(2);
    // Only a top-100 placing earns a badge, and it reads as a rank.
    await expect(badges.first()).toContainText('#');
  });

  test('where to watch separates streaming from other links', async ({ page }) => {
    const streaming = page.locator('.whereToWatch__link--stream');
    await expect(streaming.first()).toBeVisible();
    await expect(streaming.filter({ hasText: 'Crunchyroll' })).toHaveCount(1);

    // Links open away from the app, so they must not hand it the opener.
    await expect(streaming.first()).toHaveAttribute('target', '_blank');
    await expect(streaming.first()).toHaveAttribute('rel', /noopener/);

    // An official site is a link, not somewhere to watch.
    await expect(
      page.locator('.whereToWatch__link:not(.whereToWatch__link--stream)'),
    ).toContainText('Official Site');
  });

  test('spoiler tags stay hidden until asked for', async ({ page }) => {
    const before = await page.locator('.mediaTags__tag').count();
    expect(before).toBeGreaterThan(5);
    await expect(page.locator('.mediaTags__tag--spoiler')).toHaveCount(0);

    const reveal = page.locator('.mediaTags__reveal');
    await expect(reveal).toBeVisible();
    await reveal.click();

    // A spoiler you can already read is not hidden, so they are absent from the
    // DOM rather than dimmed — revealing must add them.
    await expect(page.locator('.mediaTags__tag--spoiler').first()).toBeVisible();
    expect(await page.locator('.mediaTags__tag').count()).toBeGreaterThan(before);
    await expect(reveal).toHaveCount(0);
  });

  test('community stats render both distributions', async ({ page }) => {
    await page.getByRole('tab', { name: 'Community' }).click();
    await expect(page.locator('.mediaStats__bar')).toHaveCount(10);
    await expect(page.locator('.mediaStats__segment')).toHaveCount(5);
    await expect(page.locator('.mediaStats__legend')).toContainText('Completed');

    // Bars are scaled against the tallest bucket, so the peak must be full
    // height — scaling against the total would leave every bar a sliver.
    const heights = await page
      .locator('.mediaStats__barFill')
      .evaluateAll((els) => els.map((el) => parseFloat((el as HTMLElement).style.height)));
    expect(Math.max(...heights)).toBe(100);
  });

  test('cast and crew render on Overview, uncapped', async ({ page }) => {
    // They used to be tabs, and before that both the UI and the query capped
    // them at six. The fixture predates the raised query cap and holds 8 staff,
    // which is still enough to prove the UI cap is gone.
    await expect(page.locator('.characters .castChip').first()).toBeVisible();
    expect(await page.locator('.staff .castChip').count()).toBeGreaterThan(6);
    // The voice actor is an inset on the character's portrait, not a second
    // equal-sized face facing it.
    await expect(page.locator('.characters .castChip__inset').first()).toBeVisible();
    await expect(page.locator('.staff .castChip__inset')).toHaveCount(0);
    await expect(page.getByRole('tab', { name: 'Characters' })).toHaveCount(0);
  });

  test('recommendations get their own tab', async ({ page }) => {
    await page.getByRole('tab', { name: 'More like this' }).click();
    await expect(page).toHaveURL(/tab=recommendations/);

    const cards = page.locator('.recommendations__container .card');
    await expect(cards.first()).toBeVisible();
    // Recommendations mix in manga, which nothing in this app can open.
    for (const href of await cards.evaluateAll((els) => els.map((el) => el.getAttribute('href')))) {
      expect(href).toMatch(/^\/anime\/\d+\//);
    }
  });
});
