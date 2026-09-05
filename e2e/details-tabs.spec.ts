/**
 * Covers the Details redesign: tabbed content addressed by `?tab=`, the
 * scroll-linked banner, and the sidebar rail.
 *
 * Details is a public route, so none of this needs a signed-in session. AniList
 * stays mocked via the extended `test`.
 */
import { test, expect } from './anilist-mock';

/**
 * Navigations use `domcontentloaded` rather than Playwright's default `load`.
 * Only GraphQL is mocked — poster images still come from AniList's CDN, and
 * waiting for every one of them made these time out under parallel load. Each
 * test waits on the specific element it asserts against instead.
 */

const DETAILS = '/anime/1/cowboy-bebop';

/** The element that scrolls — .app__body is a fixed-height overflow-y:auto box. */
const scrollBody = (page: import('@playwright/test').Page, to: number) =>
  page.evaluate((y) => document.querySelector('.app__body')?.scrollTo(0, y), to);

test.describe('details tabs', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('clicking a tab updates the URL', async ({ page }) => {
    await page.goto(DETAILS);
    await expect(page.locator('.details__hero')).toBeVisible({ timeout: 20_000 });

    await page.getByRole('tab', { name: 'Relations' }).click();
    await expect(page).toHaveURL(/tab=relations/);
  });

  test('a direct link opens the requested tab', async ({ page }) => {
    await page.goto(`${DETAILS}?tab=relations`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('tab', { name: 'Relations' })).toHaveAttribute(
      'aria-selected',
      'true',
      { timeout: 20_000 },
    );
  });

  test('an unknown tab falls back to Overview', async ({ page }) => {
    await page.goto(`${DETAILS}?tab=nonsense`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('tab', { name: 'Overview' })).toHaveAttribute(
      'aria-selected',
      'true',
      { timeout: 20_000 },
    );
  });

  test('switching tabs does not stack history entries', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.hero')).toBeVisible({ timeout: 20_000 });
    await page.goto(DETAILS);
    await expect(page.locator('.details__hero')).toBeVisible({ timeout: 20_000 });

    await page.getByRole('tab', { name: 'Relations' }).click();
    await page.getByRole('tab', { name: 'More like this' }).click();

    // Tab changes replace rather than push, so one back leaves the page
    // entirely instead of walking back through each tab.
    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
  });
});

test.describe('details hero', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('the banner parallaxes without exposing its top edge', async ({ page }) => {
    await page.goto(DETAILS);
    await expect(page.locator('.details__hero')).toBeVisible({ timeout: 20_000 });

    const translate = () =>
      page
        .locator('.details__bannerImage')
        .evaluate((el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).m42);

    expect(await translate()).toBe(0);

    await scrollBody(page, 400);
    await page.waitForTimeout(500);
    const moved = await translate();
    expect(moved).toBeGreaterThan(50);

    // The image is over-extended above the banner so the translation can never
    // drag its edge into view. Negative means its top is still above the
    // banner's, which is the whole point of the over-extension.
    const gap = await page.evaluate(() => {
      const img = document.querySelector('.details__bannerImage') as HTMLElement;
      const banner = document.querySelector('.details__banner') as HTMLElement;
      return img.getBoundingClientRect().top - banner.getBoundingClientRect().top;
    });
    expect(gap).toBeLessThan(0);
  });

  test('the title reappears in the tab bar once the hero scrolls away', async ({ page }) => {
    await page.goto(DETAILS);
    await expect(page.locator('.details__hero')).toBeVisible({ timeout: 20_000 });

    const compact = page.locator('.detailsTabs__title');
    await expect(compact).toHaveCSS('opacity', '0');

    await scrollBody(page, 600);
    await page.waitForTimeout(600);
    await expect(compact).toHaveCSS('opacity', '1');
  });

  test('the favorite button is unavailable when signed out', async ({ page }) => {
    // Actions renders nothing without a user, so the hero must not offer it.
    await page.goto(DETAILS);
    await expect(page.locator('.details__hero')).toBeVisible({ timeout: 20_000 });

    await expect(page.getByRole('button', { name: /favorites/i })).toHaveCount(0);
  });
});

test.describe('details hero with reduced motion', () => {
  test.use({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });

  test('nothing translates and the compact title is simply present', async ({ page }) => {
    await page.goto(DETAILS);
    await expect(page.locator('.details__hero')).toBeVisible({ timeout: 20_000 });

    await scrollBody(page, 600);
    await page.waitForTimeout(600);

    const moved = await page
      .locator('.details__bannerImage')
      .evaluate((el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).m42);
    expect(moved).toBe(0);
    await expect(page.locator('.details__hero')).toHaveCSS('opacity', '1');
    await expect(page.locator('.detailsTabs__title')).toHaveCSS('opacity', '1');
  });
});

test.describe('details loading', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('shows a skeleton that does not impersonate the loaded page', async ({ page }) => {
    // Registered after the fixture's handler, so this runs first and falls back
    // to it — delaying the response without replacing the mock.
    await page.route('https://graphql.anilist.co/**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1_500));
      await route.fallback();
    });

    await page.goto(DETAILS);
    await expect(page.locator('.detailsSkeleton')).toBeVisible({ timeout: 20_000 });
    // Critical: the suite waits on .details__hero to know data has arrived. A
    // skeleton wearing that class would satisfy every such wait prematurely.
    await expect(page.locator('.details__hero')).toHaveCount(0);

    await expect(page.locator('.details__hero')).toBeVisible({ timeout: 20_000 });
    await expect(page.locator('.detailsSkeleton')).toHaveCount(0);
  });
});

test.describe('sidebar rail', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('expands on hover without shifting the content', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.navigation')).toBeVisible({ timeout: 20_000 });

    const before = await page.locator('.app__body').boundingBox();
    await page.locator('.navigation').hover();
    await page.waitForTimeout(400);
    const railWidth = (await page.locator('.navigation').boundingBox())?.width ?? 0;
    const after = await page.locator('.app__body').boundingBox();

    expect(railWidth).toBeGreaterThan(200);
    // The rail overlays rather than pushes: content must not move.
    expect(after?.x).toBe(before?.x);
  });

  test('collapsed rail links still have accessible names', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('link', { name: 'Discover' })).toHaveCount(1, { timeout: 20_000 });
  });
});
