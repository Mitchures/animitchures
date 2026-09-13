/**
 * AniList allows 30 requests a minute and answers a spent budget with HTTP 429
 * carrying a Cloudflare *HTML* body — which is why the failure used to surface
 * as `ServerParseError: Unexpected token '<'`.
 *
 * Before the retry link, one 429 rendered the page empty for good: Apollo's
 * default errorPolicy drops the response and nothing asked again. These specs
 * pin the recovery, since the failure is invisible in every other test — the
 * fixture mock always answers 200.
 */
import { readFileSync } from 'node:fs';

import { test, expect } from './anilist-mock';
import type { Page, Route } from '@playwright/test';

const DETAILS = '/anime/1/cowboy-bebop';

/** Cloudflare's shape, not a GraphQL error body. Parsing this is what threw. */
const TOO_MANY_REQUESTS = '<html><head><title>429 Too Many Requests</title></head></html>';

/**
 * Refuses the first `failures` DetailsExtended requests with a 429, then serves
 * the fixture. Registered after the base mock, so it takes precedence.
 */
async function refuseThenServe(page: Page, failures: number) {
  const state = { attempts: 0 };

  await page.route('https://graphql.anilist.co/**', async (route: Route) => {
    const name = JSON.parse(route.request().postData() ?? '{}').operationName;

    if (name === 'DetailsExtended') {
      state.attempts += 1;
      if (state.attempts <= failures) {
        await route.fulfill({ status: 429, contentType: 'text/html', body: TOO_MANY_REQUESTS });
        return;
      }
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: readFileSync(`e2e/fixtures/${name}.json`, 'utf-8'),
    });
  });

  return state;
}

test.describe('rate limiting', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('a 429 is retried and the page fills in on its own', async ({ page }) => {
    const state = await refuseThenServe(page, 1);

    await page.goto(DETAILS, { waitUntil: 'domcontentloaded' });

    // The hero only renders from real data — DetailsSkeleton deliberately avoids
    // the details__* class names, so this cannot pass on the skeleton.
    await expect(page.locator('.details__hero')).toBeVisible({ timeout: 25_000 });
    expect(state.attempts).toBe(2);
  });

  test('a refusal that recovers quickly is never mentioned to the reader', async ({ page }) => {
    // The reader should see the skeleton for a moment longer and nothing else.
    // Showing the notice immediately put a warning on screen *ahead of* the
    // loaders it was explaining, for a problem that was over before they read it.
    test.setTimeout(60_000);
    await refuseThenServe(page, 1);

    await page.goto(DETAILS, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.details__hero')).toBeVisible({ timeout: 25_000 });

    // Well past the grace period: if recovery had not disarmed the notice, it
    // would have surfaced by now.
    await page.waitForTimeout(8000);
    await expect(page.locator('.rateLimit')).toHaveCount(0);
  });

  test('the reader is told we are waiting, and the notice clears on recovery', async ({ page }) => {
    // Three failures: long enough that the refusal outlasts the grace period, so
    // the notice genuinely earns its place rather than flashing.
    test.setTimeout(120_000);
    await refuseThenServe(page, 3);

    await page.goto(DETAILS, { waitUntil: 'domcontentloaded' });

    // Raised once the trouble has persisted, not on the first refusal.
    await expect(page.locator('.rateLimit')).toBeVisible({ timeout: 20_000 });
    await expect(page.locator('.rateLimit')).toContainText('slow down');

    // A response arriving is proof the window reopened, so the notice goes.
    await expect(page.locator('.details__hero')).toBeVisible({ timeout: 60_000 });
    await expect(page.locator('.rateLimit')).toHaveCount(0);
  });

  test('gives up rather than retrying forever, and says so', async ({ page }) => {
    // The backoff ladder is roughly 2 + 4 + 8 + 16 seconds, so exhausting it
    // takes longer than Playwright's 30s default all by itself.
    test.setTimeout(120_000);
    // Five failures outlast the four attempts, so this is the exhausted path.
    const state = await refuseThenServe(page, 5);

    await page.goto(DETAILS, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.rateLimit')).toBeVisible({ timeout: 20_000 });

    // 1 initial + MAX_RETRY_ATTEMPTS. Without a ceiling this would climb until
    // the page was closed, which is the opposite of helpful to a rate limit.
    await expect(async () => expect(state.attempts).toBe(5)).toPass({ timeout: 60_000 });
    await page.waitForTimeout(3000);
    expect(state.attempts).toBe(5);
  });
});
