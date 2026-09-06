/**
 * Browse and search — one page, one query, filters carried in the URL.
 *
 * Public route, AniList mocked. The mock answers every Search with the same
 * fixture regardless of variables, so these assert what the page *asks for*
 * and how it reflects that back, not that AniList filters correctly.
 */
import { test, expect } from './anilist-mock';

/**
 * Navigations use `domcontentloaded` rather than Playwright's default `load`.
 * Only GraphQL is mocked — poster images still come from AniList's CDN.
 */
const BROWSE = '/search/anime';

test.describe('browse', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('a genre link lands on browse with that filter applied', async ({ page }) => {
    await page.goto(`${BROWSE}?genre=Action`, { waitUntil: 'domcontentloaded' });

    await expect(page.locator('.results__header h3')).toHaveText('Action');
    await expect(page.locator('.results__container .card').first()).toBeVisible({
      timeout: 20_000,
    });
    // Exactly one pill is lit, and it is the genre.
    await expect(page.locator('.filterBar__field--on')).toHaveCount(1);
    await expect(page.getByLabel('Any genre')).toHaveValue('Action');
  });

  test('a search shows what was searched for', async ({ page }) => {
    await page.goto(`${BROWSE}?search=frieren`, { waitUntil: 'domcontentloaded' });
    // The old page showed no heading at all for a search.
    await expect(page.locator('.results__header h3')).toContainText('frieren');
    await expect(page.locator('.results__container .card').first()).toBeVisible({
      timeout: 20_000,
    });
  });

  test('changing a filter updates the URL and the query', async ({ page }) => {
    const asked: Record<string, unknown>[] = [];
    await page.route('https://graphql.anilist.co/**', async (route) => {
      const body = JSON.parse(route.request().postData() ?? '{}') as {
        operationName?: string;
        variables?: Record<string, unknown>;
      };
      if (body.operationName === 'Search' && body.variables) asked.push(body.variables);
      // fallback, not fulfil: the fixture handler registered by the extended
      // `test` is still the one that answers.
      await route.fallback();
    });

    await page.goto(`${BROWSE}?genre=Action`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.results__container .card').first()).toBeVisible({
      timeout: 20_000,
    });

    await page.getByLabel('Any format').selectOption('MOVIE');

    // Carried in the URL, so a filtered view is shareable and back works.
    await expect(page).toHaveURL(/genre=Action/);
    await expect(page).toHaveURL(/format=MOVIE/);
    await expect(page.locator('.filterBar__field--on')).toHaveCount(2);

    await expect.poll(() => asked.at(-1)?.format, { timeout: 10_000 }).toEqual(['MOVIE']);
  });

  test('clearing filters keeps the search term', async ({ page }) => {
    await page.goto(`${BROWSE}?search=frieren&genre=Action`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.results__container .card').first()).toBeVisible({
      timeout: 20_000,
    });

    await page.locator('.filterBar__clear').click();

    // Clearing filters should narrow nothing — not throw away what you typed.
    await expect(page).toHaveURL(/search=frieren/);
    await expect(page).not.toHaveURL(/genre=/);
    await expect(page.locator('.filterBar__field--on')).toHaveCount(0);
  });

  test('with no criteria it invites you to pick one instead of looking broken', async ({
    page,
  }) => {
    await page.goto(BROWSE, { waitUntil: 'domcontentloaded' });

    await expect(page.locator('.results__header h3')).toHaveText('Browse anime');
    await expect(page.locator('.results__header p')).toContainText('Pick a filter');
    await expect(page.locator('.results__container .card')).toHaveCount(0);
  });

  test('the heading lines up with the grid', async ({ page }) => {
    await page.goto(`${BROWSE}?genre=Action`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.results__container .card').first()).toBeVisible({
      timeout: 20_000,
    });

    // The page pads horizontally and the heading used to pad again on top,
    // leaving it indented further than the results below it.
    const heading = await page.locator('.results__header').boundingBox();
    const grid = await page.locator('.results__container').boundingBox();
    expect(Math.round(heading!.x)).toBe(Math.round(grid!.x));
  });
});
