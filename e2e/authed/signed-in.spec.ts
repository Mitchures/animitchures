/**
 * Covers the half of the app that requires authentication — previously
 * unreachable, because the suite could not sign in.
 *
 * Runs in the `authed` project, which supplies a saved signed-in session.
 * AniList is mocked from captured fixtures.
 *
 * Private routes are reached by clicking through the UI, not by page.goto():
 * direct navigation redirects to '/' because `user` is null on first render and
 * the '*' catch-all matches first. That bug is documented by its own test below.
 */
import { test, expect } from '../anilist-mock';

const DISPLAY_NAME = process.env.E2E_DISPLAY_NAME ?? 'E2E Test User';

/**
 * Waits for the signed-in shell, which only settles once Firebase resolves.
 *
 * Waits on the sidebar's Logout link being *attached*, not visible: below 960px
 * the sidebar is display:none and the avatar moves into the overlay, so neither
 * is a width-agnostic signal. The link is in the DOM at every width, and it only
 * exists at all when `user` is set — which is exactly the condition to wait for.
 */
async function gotoSignedInHome(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page
    .locator('.navigation a:has-text("Logout")')
    .waitFor({ state: 'attached', timeout: 20_000 });
}

/** Clicks a sidebar link. Desktop width only — the sidebar is hidden below 960px. */
async function navigateVia(page: import('@playwright/test').Page, label: string) {
  await page.locator('.navigation a', { hasText: label }).click();
}

test.describe('signed-in shell', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('header shows the avatar and display name', async ({ page }) => {
    await gotoSignedInHome(page);
    await expect(page.locator('.header__avatar')).toBeVisible();
    await expect(page.locator('.header__right').getByText(DISPLAY_NAME)).toBeVisible();
  });

  test('sidebar offers the signed-in destinations, not Login', async ({ page }) => {
    await gotoSignedInHome(page);
    const nav = page.locator('.navigation');

    // Asserts accessible names rather than visible text: the rail is collapsed to
    // icons by default, so the labels are not rendered until it is hovered. The
    // accessible name is what matters here anyway — it is the only thing a screen
    // reader gets in the collapsed state.
    for (const name of ['Discover', 'Favorites', 'Watchlist', 'Settings', 'Logout']) {
      await expect(nav.getByRole('link', { name })).toHaveCount(1);
    }
    await expect(nav.getByRole('link', { name: 'Login' })).toHaveCount(0);
  });

  test('logout returns the app to its signed-out state', async ({ page }) => {
    await gotoSignedInHome(page);
    await navigateVia(page, 'Logout');

    // Signed out: the avatar goes and Login reappears in the sidebar.
    await expect(page.locator('.header__avatar')).toHaveCount(0, { timeout: 20_000 });
    await expect(page.locator('.navigation').getByText('Login')).toBeVisible();
  });
});

test.describe('mobile overlay when signed in', () => {
  test.use({ viewport: { width: 500, height: 900 } });

  test('overlay lists the signed-in destinations', async ({ page }) => {
    await gotoSignedInHome(page);
    await page.locator('.header__menuButton').click();

    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('Favorites')).toBeVisible();
    await expect(dialog.getByText('Settings')).toBeVisible();
    await expect(dialog.getByText('Watchlist')).toBeVisible();
    await expect(dialog.getByText('Logout')).toBeVisible();
    await expect(dialog.getByText('Login')).toHaveCount(0);
  });

  test('overlay footer identifies the signed-in user', async ({ page }) => {
    await gotoSignedInHome(page);
    await page.locator('.header__menuButton').click();

    await expect(page.locator('.mobileMenu__user')).toContainText(DISPLAY_NAME);
  });
});

test.describe('signed-in views', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('favorites renders the seeded items', async ({ page }) => {
    await gotoSignedInHome(page);
    await navigateVia(page, 'Favorites');

    await expect(page).toHaveURL(/\/favorites$/);
    // The seed writes exactly three media ids.
    await expect(page.locator('.favorites__grid .card')).toHaveCount(3, { timeout: 20_000 });
  });

  test('settings renders', async ({ page }) => {
    await gotoSignedInHome(page);
    await navigateVia(page, 'Settings');

    await expect(page).toHaveURL(/\/settings$/);
    await expect(page.locator('.settings')).toBeVisible({ timeout: 20_000 });
  });

  test('watchlist renders when the AniList profile is unavailable', async ({ page }) => {
    // The seeded AniList id is fabricated, so AniList genuinely answers
    // "User not found". This asserts the view degrades rather than crashing —
    // weaker than asserting content, but it is real error-path coverage and
    // requires nobody's personal AniList data.
    await gotoSignedInHome(page);
    await navigateVia(page, 'Watchlist');

    await expect(page).toHaveURL(/\/anilist-watchlist$/);
    await expect(page.locator('.watchlist')).toBeVisible({ timeout: 20_000 });
  });

  test('profile renders when the AniList profile is unavailable', async ({ page }) => {
    await gotoSignedInHome(page);
    await page.locator('.header__right a[href="/profile"]').click();

    await expect(page).toHaveURL(/\/profile$/);
    await expect(page.locator('.profile')).toBeVisible({ timeout: 20_000 });
    await expect(page.locator('.profile')).toContainText(DISPLAY_NAME);
  });
});

test.describe('SplitButton', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('dropdown opens on a details page', async ({ page }) => {
    // /anime/:id/:title is public, so direct navigation is fine here.
    await page.goto('/anime/1/cowboy-bebop');
    await expect(page.locator('.details__container')).toBeVisible({ timeout: 20_000 });

    // Only rendered when anilist_user is set, which the seeded state provides.
    // Opening the dropdown does not fire SaveMediaListEntry — that happens only
    // from handleMenuItemClick — so nothing is written to any AniList account.
    const splitButton = page.locator('.splitButton');
    await expect(splitButton).toBeVisible({ timeout: 20_000 });
    await splitButton.locator('button').last().click();

    await expect(page.locator('#split-button-menu')).toBeVisible();
  });
});

test.describe('known bugs', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  // Documents the private-route auth-timing bug. `user` is null on first render,
  // so the '*' catch-all matches before Firebase resolves the session and the
  // app redirects to '/'.
  //
  // test.fail() means Playwright expects this to fail and will complain if it
  // ever passes — so this is the regression signal for the eventual fix. Do not
  // delete it, and do not rewrite it to assert the redirect as correct.
  test.fail();
  test('direct navigation to a private route should work when signed in', async ({ page }) => {
    await page.goto('/favorites');
    await expect(page).toHaveURL(/\/favorites$/, { timeout: 15_000 });
  });
});
