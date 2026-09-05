/**
 * Extends Playwright's `test` so every AniList request is answered from a
 * captured fixture. No spec importing from here reaches the live API.
 *
 * Specs import `test` and `expect` from this module instead of
 * `@playwright/test`. The one exception is e2e/live.spec.ts, which deliberately
 * imports the unmocked `test` to check for fixture drift.
 */
import { test as base, expect, Page } from '@playwright/test';
import { readFileSync, existsSync } from 'node:fs';

const FIXTURES = 'e2e/fixtures';

/**
 * Routes every AniList request on `page` to a captured fixture.
 *
 * Exported separately so auth.setup.ts can use it too — the setup lands on '/'
 * after signing in, which fires the Featured query. Without this it would make
 * one live request per run, which is one more than zero.
 */
export async function mockAniList(page: Page): Promise<void> {
  await page.route('https://graphql.anilist.co/**', async (route) => {
    const name = JSON.parse(route.request().postData() ?? '{}').operationName;
    const file = `${FIXTURES}/${name}.json`;

    // Fail loudly rather than falling through to the network. A silent
    // passthrough would quietly reintroduce live traffic and the rate-limit
    // flakiness this exists to remove — and it would do so invisibly, because
    // the tests would still pass.
    if (!name || !existsSync(file)) {
      throw new Error(
        `No AniList fixture for operation "${name}". ` +
          `Capture it with \`yarn e2e:capture\`, or add ${file}.`,
      );
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: readFileSync(file, 'utf-8'),
    });
  });
}

export const test = base.extend({
  page: async ({ page }, use) => {
    await mockAniList(page);
    await use(page);
  },
});

export { expect };
