import { test, expect } from '../anilist-mock';
import type { Page } from '@playwright/test';

/**
 * What happens when AniList stops accepting the saved token.
 *
 * Before this, nothing read `expires_in` or `refresh_token` — they were typed
 * and never used — so a dead token meant AniList refused every authenticated
 * query, Apollo's default errorPolicy discarded the response, and Watchlist,
 * Taste, Social and Profile rendered *empty*. Indistinguishable from having
 * watched nothing, and unfixable by the person reading it.
 *
 * The refusal shape is captured from the live API and is not what you would
 * guess: an expired or revoked token comes back **HTTP 400** with "Invalid
 * token". Only a request carrying no credentials at all gets a 401.
 */
const REFUSAL = {
  status: 400,
  contentType: 'application/json',
  body: JSON.stringify({ data: null, errors: [{ message: 'Invalid token', status: 400 }] }),
};

async function gotoSignedInHome(page: Page) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.locator('.navigation a:has-text("Logout")').waitFor({ state: 'attached', timeout: 20_000 });
}

/** Puts a token in place, so the app believes it has a working connection. */
async function withStoredToken(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem(
      'token',
      JSON.stringify({
        access_token: 'expired-token',
        token_type: 'Bearer',
        expires_in: 31536000,
        refresh_token: 'expired-refresh',
      }),
    );
  });
}

/** An empty but well-formed feed, for the retry after the token is cleared. */
const EMPTY_FEED = {
  status: 200,
  contentType: 'application/json',
  body: JSON.stringify({
    data: { feed: { pageInfo: { currentPage: 1, hasNextPage: false }, activities: [] } },
  }),
};

/**
 * Answers any request carrying credentials with AniList's refusal.
 *
 * Unauthenticated requests are let through, because a dead token is not an
 * outage — and that path matters: once the token is cleared, Apollo retries
 * without it. `SocialFeed` is answered here rather than falling through to the
 * fixture mock, which has no `SocialFeed.json` and throws on purpose.
 */
async function refuseAuthenticatedRequests(page: Page) {
  await page.route('https://graphql.anilist.co/**', async (route) => {
    if (route.request().headers()['authorization']) return route.fulfill(REFUSAL);
    const operation = JSON.parse(route.request().postData() ?? '{}').operationName;
    if (operation === 'SocialFeed') return route.fulfill(EMPTY_FEED);
    return route.fallback();
  });
}

test.describe('a refused AniList token', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('the shell warns that writes will not reach AniList', async ({ page }) => {
    await withStoredToken(page);
    await refuseAuthenticatedRequests(page);
    await gotoSignedInHome(page);

    // Details is the first authenticated read most people hit. Any of them will
    // do — the point is that the warning follows you rather than living on one
    // page you might never open.
    await page.locator('.navigation a', { hasText: 'Social' }).click();

    const banner = page.locator('.anilistReconnect--banner');
    await expect(banner).toBeVisible({ timeout: 20_000 });
    await expect(banner).toContainText('session has expired');
    await expect(banner).toContainText('will not be saved');
    await expect(banner.getByRole('link', { name: 'Reconnect' })).toBeVisible();
  });

  test('Social says so where its feed would be', async ({ page }) => {
    // Social is the only page that actually loses content: the following feed
    // is authenticated-only. Watchlist, Taste and Profile read public data by
    // user id and keep working, which is why they get no panel.
    await withStoredToken(page);
    await refuseAuthenticatedRequests(page);
    await gotoSignedInHome(page);
    await page.locator('.navigation a', { hasText: 'Social' }).click();

    const panel = page.locator('.anilistReconnect:not(.anilistReconnect--banner)');
    await expect(panel).toBeVisible({ timeout: 20_000 });
    await expect(panel).toContainText('the feed');
  });

  test('the refused token is cleared from the browser', async ({ page }) => {
    await withStoredToken(page);
    await refuseAuthenticatedRequests(page);
    await gotoSignedInHome(page);
    await page.locator('.navigation a', { hasText: 'Social' }).click();
    await expect(page.locator('.anilistReconnect--banner')).toBeVisible({ timeout: 20_000 });

    // Left in place it would be resent on every request, and read back out of
    // Firestore on the next sign-in. Clearing it also lets the authenticated
    // *reads* fall back to public mode, which is why only writes stay broken.
    expect(await page.evaluate(() => localStorage.getItem('token'))).toBeNull();
  });

  test('pages that never authenticate keep working', async ({ page }) => {
    await withStoredToken(page);
    await refuseAuthenticatedRequests(page);
    await gotoSignedInHome(page);

    // Watchlist reads the list publicly by user id, so a dead token is not its
    // problem and it must not be dressed up as one.
    await page.locator('.navigation a', { hasText: 'Watchlist' }).click();
    await expect(page.locator('.watchlist')).toBeVisible({ timeout: 20_000 });
    await expect(page.locator('.anilistReconnect:not(.anilistReconnect--banner)')).toHaveCount(0);
  });

  test('a working token shows no warning anywhere', async ({ page }) => {
    // The control. Without it, anything rendered unconditionally would pass
    // every test above.
    await withStoredToken(page);
    await gotoSignedInHome(page);
    await page.locator('.navigation a', { hasText: 'Watchlist' }).click();

    await expect(page.locator('.watchlist')).toBeVisible({ timeout: 20_000 });
    await expect(page.locator('.anilistReconnect')).toHaveCount(0);
  });
});
