/**
 * The spotlight replaced the desktop header, which was 116px of translucent bar
 * holding one input. Public route, so no session needed; AniList is mocked.
 */
import { test, expect } from './anilist-mock';

/**
 * Navigations use `domcontentloaded` rather than Playwright's default `load`.
 * Only GraphQL is mocked — poster images still come from AniList's CDN, and
 * waiting for every one of them made these time out under parallel load. Each
 * test waits on the specific element it asserts against instead.
 */

/**
 * The spotlight's trigger, whichever chrome is on screen: the page's top bar
 * above 960px, the mobile header below it. The floating action button it
 * replaced is gone — search is an action with one home at each width.
 */
const searchButton = (page: import('@playwright/test').Page) =>
  page
    .locator('.app__topbar, .mobileHeader')
    .getByRole('button', { name: /Search anime/ })
    .first();

test.describe('search spotlight', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('desktop has no header and the banner starts at the top', async ({ page }) => {
    await page.goto('/anime/1/cowboy-bebop', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.details__hero')).toBeVisible({ timeout: 20_000 });

    await expect(page.locator('.mobileHeader')).toBeHidden();
    // --header-height is 0 on desktop, so nothing offsets the banner down.
    const banner = await page.locator('.details__banner').boundingBox();
    expect(Math.round(banner?.y ?? -1)).toBe(0);

    // The trigger sits in the page's own top bar, top-right of the content.
    const trigger = searchButton(page);
    await expect(trigger).toBeVisible();
    const box = (await trigger.boundingBox())!;
    const viewport = page.viewportSize()!;
    expect(box.x).toBeGreaterThan(viewport.width / 2);
    expect(box.y).toBeLessThan(viewport.height / 2);
  });

  test('opens with the keyboard and closes with escape', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.slideHero')).toBeVisible({ timeout: 20_000 });

    await page.keyboard.press('ControlOrMeta+k');
    await expect(page.getByRole('dialog', { name: 'Search anime' })).toBeVisible();
    // The field takes focus on open, so you can type immediately.
    await expect(page.locator('.spotlight__field input')).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: 'Search anime' })).toHaveCount(0);
  });

  test('"/" opens it, but not while typing in a field', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.slideHero')).toBeVisible({ timeout: 20_000 });

    await page.keyboard.press('/');
    await expect(page.getByRole('dialog', { name: 'Search anime' })).toBeVisible();

    // Inside the field "/" must be a literal slash, not a second open.
    await page.keyboard.type('a/b');
    await expect(page.locator('.spotlight__field input')).toHaveValue('a/b');
  });

  test('typing shows poster results and enter opens one', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.slideHero')).toBeVisible({ timeout: 20_000 });

    await searchButton(page).click();
    await page.locator('.spotlight__field input').fill('frieren');

    const results = page.locator('.spotlight__result');
    await expect(results.first()).toBeVisible({ timeout: 20_000 });
    await expect(await results.count()).toBeGreaterThan(1);
    // Results are cover art, not a list of strings.
    await expect(results.first().locator('img')).toBeVisible();

    // First result is highlighted by default, so enter is meaningful immediately.
    await expect(page.locator('.spotlight__result--active')).toHaveCount(1);
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Enter');

    await expect(page).toHaveURL(/\/anime\/\d+\//, { timeout: 20_000 });
    await expect(page.getByRole('dialog', { name: 'Search anime' })).toHaveCount(0);
  });

  test('reopening does not show the previous search', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.slideHero')).toBeVisible({ timeout: 20_000 });

    await searchButton(page).click();
    await page.locator('.spotlight__field input').fill('frieren');
    await expect(page.locator('.spotlight__result').first()).toBeVisible({ timeout: 20_000 });
    await page.keyboard.press('Escape');

    await searchButton(page).click();
    // Apollo keeps the last response, so results have to be gated on the
    // current term or the previous search's posters are still sitting there.
    await expect(page.locator('.spotlight__result')).toHaveCount(0);
    await expect(page.locator('.spotlight__field input')).toHaveValue('');
  });

  test('see-all goes to the full results page', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.slideHero')).toBeVisible({ timeout: 20_000 });

    await searchButton(page).click();
    await page.locator('.spotlight__field input').fill('frieren');
    await expect(page.locator('.spotlight__result').first()).toBeVisible({ timeout: 20_000 });

    await page.locator('.spotlight__all').click();
    await expect(page).toHaveURL(/\/search\/anime\?search=frieren/);
  });
});

test.describe('search on mobile', () => {
  test.use({ viewport: { width: 500, height: 900 } });

  test('the header carries the logo and the one search button', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.mobileHeader')).toBeVisible({ timeout: 20_000 });
    await expect(page.locator('.pillNav')).toBeHidden();

    await expect(searchButton(page)).toBeVisible();
    // No inline field: it was a second, worse search — no live results, and it
    // only navigated on submit.
    await expect(page.locator('.mobileHeader input')).toHaveCount(0);
    await expect(page.locator('.mobileHeader__brand img')).toBeVisible();
  });

  test('the header button opens the spotlight at phone width', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.mobileHeader')).toBeVisible({ timeout: 20_000 });

    await searchButton(page).click();
    await expect(page.locator('.spotlight__field input')).toBeFocused();
  });
});
