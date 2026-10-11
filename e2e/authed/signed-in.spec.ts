/**
 * Covers the half of the app that requires authentication — previously
 * unreachable, because the suite could not sign in.
 *
 * Runs in the `authed` project, which supplies a saved signed-in session.
 * AniList is mocked from captured fixtures.
 *
 * Destinations are reached by clicking through the pill column rather than by
 * page.goto(), via the shared `navigateVia` — which also switches to the
 * Library tab for the AniList destinations that live under it.
 */
import { test, expect } from '../anilist-mock';
import { navigateVia, waitForSignedInShell } from '../nav';

const DISPLAY_NAME = process.env.E2E_DISPLAY_NAME ?? 'E2E Test User';

async function gotoSignedInHome(page: import('@playwright/test').Page) {
  // domcontentloaded, not the default `load`: only GraphQL is mocked, so
  // waiting for every poster image from AniList's CDN to finish is what made
  // these time out under parallel load.
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await waitForSignedInShell(page);
}

/** Opens the phone drawer, which carries what the tab bar does not. */
async function openDrawer(page: import('@playwright/test').Page) {
  await page.locator('.tabBar__more').click();
  await expect(page.getByRole('dialog', { name: 'More' })).toBeVisible();
}

test.describe('signed-in shell', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('the account row carries the identity, settings and log out', async ({ page }) => {
    await gotoSignedInHome(page);
    const account = page.locator('.pillNav__account');

    await expect(account).toBeVisible();
    await expect(account.getByRole('link', { name: 'Settings' })).toHaveCount(1);
    await expect(account.getByRole('link', { name: 'Profile' })).toHaveCount(1);
    await expect(account.getByRole('button', { name: 'Logout' })).toHaveCount(1);

    // The test account has no photoURL, so MUI's Avatar falls back to the first
    // letter of its alt rather than rendering an <img>.
    await expect(page.locator('.pillNav__avatar')).toHaveText(DISPLAY_NAME[0]);
    await expect(account).toContainText(DISPLAY_NAME);
  });

  test('search and notifications sit above the page, not in the navigation', async ({ page }) => {
    await gotoSignedInHome(page);
    const topbar = page.locator('.app__topbar');

    await expect(topbar.getByRole('button', { name: 'Notifications' })).toHaveCount(1);
    await expect(topbar.getByRole('button', { name: /Search anime/ })).toHaveCount(1);
    await expect(
      page.locator('.pillNav').getByRole('button', { name: 'Notifications' }),
    ).toHaveCount(0);
  });

  test('the column offers the signed-in destinations, not Login', async ({ page }) => {
    await gotoSignedInHome(page);
    const nav = page.locator('.pillNav');

    for (const name of ['Discover', 'Calendar', 'Browse', 'Favorites']) {
      await expect(nav.getByRole('link', { name })).toHaveCount(1);
    }
    await expect(nav.getByRole('link', { name: 'Login' })).toHaveCount(0);

    // The AniList destinations live under the second tab, so they are not in
    // the DOM until it is selected.
    await expect(nav.getByRole('link', { name: 'Watchlist' })).toHaveCount(0);
    await page.getByRole('tab', { name: 'Library' }).click();
    for (const name of ['Watchlist', 'Taste', 'Social']) {
      await expect(nav.getByRole('link', { name })).toHaveCount(1);
    }
    await expect(nav.getByRole('link', { name: 'Calendar' })).toHaveCount(0);
  });

  test('logout returns the app to its signed-out state', async ({ page }) => {
    await gotoSignedInHome(page);
    await page.locator('.pillNav__logout').click();

    // Signed out: the account row goes and Login reappears in the column.
    await expect(page.locator('.pillNav__account')).toHaveCount(0, { timeout: 20_000 });
    await expect(page.locator('.pillNav').getByRole('link', { name: 'Login' })).toBeVisible();
  });
});

test.describe('the More drawer when signed in', () => {
  test.use({ viewport: { width: 500, height: 900 } });

  test('holds what the tab bar does not, and names who is signed in', async ({ page }) => {
    await gotoSignedInHome(page);
    // Watchlist has a slot in the bar itself, so it is not in the drawer.
    await expect(page.locator('.tabBar').getByRole('link', { name: 'Watchlist' })).toBeVisible();

    await openDrawer(page);
    const dialog = page.getByRole('dialog');

    for (const name of ['Favorites', 'Taste', 'Social']) {
      await expect(dialog.getByRole('link', { name })).toBeVisible();
    }
    await expect(dialog.getByRole('link', { name: 'Discover' })).toHaveCount(0);
    await expect(page.locator('.drawer__account')).toContainText(DISPLAY_NAME);
    await expect(dialog.getByRole('link', { name: 'Settings' })).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Logout' })).toBeVisible();
  });

  test('closes on Escape, on the dim, on More again, and on navigating', async ({ page }) => {
    await gotoSignedInHome(page);

    await openDrawer(page);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toBeHidden();

    await openDrawer(page);
    await page.locator('.tabBar__more').click();
    await expect(page.getByRole('dialog')).toBeHidden();

    await openDrawer(page);
    await page.getByRole('dialog').getByRole('link', { name: 'Favorites' }).click();
    await expect(page.getByRole('dialog')).toBeHidden();
    await expect(page).toHaveURL(/\/favorites$/);
  });

  test('locks the page behind it and does not overflow', async ({ page }) => {
    await gotoSignedInHome(page);
    await openDrawer(page);

    await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(scrollWidth).toBe(clientWidth);
  });
});

test.describe('signed-in views', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('favorites renders the seeded items', async ({ page }) => {
    await gotoSignedInHome(page);
    await navigateVia(page, 'Favorites');

    await expect(page).toHaveURL(/\/favorites$/);
    // The seed writes exactly three media ids.
    await expect(page.locator('.favorites__shelf .posterEchoCard')).toHaveCount(3, { timeout: 20_000 });
  });

  test('settings is reachable from the account row', async ({ page }) => {
    await gotoSignedInHome(page);
    await page.locator('.pillNav__account').getByRole('link', { name: 'Settings' }).click();

    await expect(page).toHaveURL(/\/settings$/);
    await expect(page.locator('.settings')).toBeVisible({ timeout: 20_000 });
  });

  test('watchlist groups entries by status and shows progress', async ({ page }) => {
    // The fixture used to be a captured "User not found" 404, so this page had
    // never once been rendered with data by the suite — it only proved the
    // view did not crash. It now carries a synthesised collection covering all
    // three shapes the episode strip can take.
    await gotoSignedInHome(page);
    await navigateVia(page, 'Watchlist');

    await expect(page).toHaveURL(/\/anilist-watchlist$/);
    await expect(page.locator('.upNext').first()).toBeVisible({ timeout: 20_000 });

    // Sections are ordered, and the in-progress band comes first.
    await expect(page.locator('.wlSection__head h3').first()).toHaveText('Up next');
    await expect(page.locator('.wlSection__head h3')).toContainText([
      'Up next',
      'Completed',
      'Planning to watch',
      'Paused',
      'Dropped',
    ]);

    // Ticks for a short series, a bar for a long one, open-ended for a series
    // with no announced total.
    await expect(page.locator('.episodeStrip--bar').first()).toBeVisible();
    await expect(page.locator('.episodeStrip--open').first()).toBeVisible();

    // Long lists collapse to a preview until asked to open.
    const completed = page.locator('.wlSection').filter({ hasText: 'Completed' });
    await expect(completed.locator('.listRow')).toHaveCount(4);
    await completed.getByRole('button', { name: /Show all 8/ }).click();
    await expect(completed.locator('.listRow')).toHaveCount(8);
    await completed.getByRole('button', { name: 'Show fewer' }).click();
    await expect(completed.locator('.listRow')).toHaveCount(4);
  });

  test('taste renders the statistics the profile query threw away', async ({ page }) => {
    await gotoSignedInHome(page);
    await navigateVia(page, 'Taste');

    await expect(page).toHaveURL(/\/taste$/);
    await expect(page.locator('.ratingCurve')).toBeVisible({ timeout: 20_000 });

    // The lede states the finding; the curve is the evidence for it.
    await expect(page.locator('.taste__lede p')).toContainText('more generous');

    // One bar per score bucket, and the two means land where the data says.
    // The marks are placed by interpolating between bucket centres, not on a
    // flat 0-100 axis — that was wrong for every non-uniform distribution.
    const plot = (await page.locator('.ratingCurve__plot').boundingBox())!;
    const mine = (await page.locator('.ratingCurve__mark--mine').boundingBox())!;
    const site = (await page.locator('.ratingCurve__mark--site').boundingBox())!;
    const pct = (box: { x: number }) => Math.round(((box.x - plot.x) / plot.width) * 100);
    expect(pct(mine)).toBeGreaterThan(pct(site));
    expect(pct(mine)).toBeGreaterThan(65);
    expect(pct(mine)).toBeLessThan(78);

    // Studios and voice actors lead to the pages built for them.
    await expect(page.locator('.rankedBars__row a[href^="/studio/"]').first()).toBeVisible();
    await expect(page.locator('.taste__face[href^="/staff/"]').first()).toBeVisible();

    // The Formats heading used to land on top of the year histogram's labels.
    const years = (await page.locator('.yearHistogram').boundingBox())!;
    const formats = (await page
      .locator('.taste__body .sectionHeading')
      .filter({ hasText: 'Formats' })
      .boundingBox())!;
    expect(formats.y).toBeGreaterThan(years.y + years.height);
  });

  test('profile shows the watching record', async ({ page }) => {
    await gotoSignedInHome(page);
    await page.locator('.pillNav__who').click();

    await expect(page).toHaveURL(/\/profile$/);
    await expect(page.locator('.profile')).toContainText(DISPLAY_NAME, { timeout: 20_000 });

    // The page used to render an avatar and a name while the query behind it
    // already fetched all of this.
    await expect(page.locator('.profile__lede')).toContainText('days watched');
    await expect(page.locator('.profile__vitals div')).toHaveCount(4);
    await expect(page.locator('.genreOverview__chip').first()).toBeVisible();
    await expect(page.locator('.profile__favourites a').first()).toBeVisible();

    // 53 whole weeks, so the grid always ends on a complete column, and the
    // shading must actually differ — a theme rule once flattened every level.
    await expect(page.locator('.heatmap__grid .heatmap__day')).toHaveCount(371);
    const lit = await page
      .locator('.heatmap__day--1, .heatmap__day--2, .heatmap__day--3, .heatmap__day--4')
      .count();
    expect(lit).toBeGreaterThan(0);
  });
});

test.describe('SplitButton', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('dropdown opens on a details page', async ({ page }) => {
    // /anime/:id/:title is public, so direct navigation is fine here.
    await page.goto('/anime/1/cowboy-bebop', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.details__hero')).toBeVisible({ timeout: 20_000 });

    // Only rendered when anilist_user is set, which the seeded state provides.
    // Opening the dropdown does not fire SaveMediaListEntry — that happens only
    // from handleMenuItemClick — so nothing is written to any AniList account.
    const splitButton = page.locator('.splitButton');
    await expect(splitButton).toBeVisible({ timeout: 20_000 });
    await splitButton.locator('button').last().click();

    await expect(page.locator('#split-button-menu')).toBeVisible();
  });
});

test.describe('private routes', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  // Was a documented bug with test.fail(): `user` is null on first render, so
  // the '*' catch-all matched before Firebase resolved the session and the app
  // redirected to '/'. App.tsx now holds the catch-all back until auth settles.
  test('direct navigation to a private route works when signed in', async ({ page }) => {
    await page.goto('/favorites', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/favorites$/, { timeout: 20_000 });
    await expect(page.locator('.favorites__shelf .posterEchoCard')).toHaveCount(3, { timeout: 20_000 });
  });
});
