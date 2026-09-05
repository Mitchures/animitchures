/**
 * Captures real AniList responses once, so fixtures match the live schema rather
 * than a hand-written guess. Run with: yarn e2e:capture
 *
 * This and e2e/live.spec.ts are the only things in the suite that talk to the
 * real API. Requires the dev server on :3000.
 *
 * Two things this gets right, both learned the hard way:
 *
 * 1. Public routes are captured SIGNED OUT. The test account's stored AniList
 *    token is fabricated, and Details sends it via authHeader() — capturing while
 *    signed in yields `{"errors":[{"message":"Invalid token"}]}` rather than data.
 * 2. Responses OVERWRITE rather than first-wins. Results.tsx fires an initial
 *    query with an empty search string, so first-wins captures an empty page.
 */
import { writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { chromium, Browser } from '@playwright/test';

const OUT = 'e2e/fixtures';

function attach(page: import('@playwright/test').Page, seen: Set<string>) {
  page.on('response', async (response) => {
    if (!response.url().startsWith('https://graphql.anilist.co')) return;
    const name = JSON.parse(response.request().postData() ?? '{}').operationName;
    if (!name) return;
    try {
      const body = await response.json();
      // Never let an error response become a fixture — tests would then pass
      // against a payload the app can do nothing with.
      if (body.errors) {
        console.warn(`  skipped ${name}: ${body.errors[0]?.message}`);
        return;
      }
      writeFileSync(`${OUT}/${name}.json`, JSON.stringify(body, null, 2));
      seen.add(name);
    } catch {
      /* body already consumed or not JSON */
    }
  });
}

async function capturePublic(browser: Browser, seen: Set<string>): Promise<void> {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  attach(page, seen);

  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await page.locator('.hero__banner').waitFor({ timeout: 25_000 });
  await page.waitForTimeout(2500);

  await page.goto('http://localhost:3000/anime/1/cowboy-bebop', { waitUntil: 'domcontentloaded' });
  await page.locator('.details__container').waitFor({ timeout: 25_000 });
  await page.waitForTimeout(2500);

  // Type into the real search box so a populated query fires, rather than the
  // empty-string query Results issues on mount.
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await page.fill('.search input', 'frieren');
  await page.press('.search input', 'Enter');
  await page.locator('.results__container .card').first().waitFor({ timeout: 25_000 });
  await page.waitForTimeout(2500);

  await context.close();
}

async function captureFavorites(browser: Browser, seen: Set<string>): Promise<void> {
  const context = await browser.newContext({
    storageState: 'e2e/.auth/user.json',
    viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();
  attach(page, seen);

  // Reached via the UI: direct navigation to a private route redirects to '/'
  // (the known auth-timing bug).
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await page
    .locator('.navigation a:has-text("Logout")')
    .waitFor({ state: 'attached', timeout: 25_000 });
  await page.locator('.navigation a', { hasText: 'Favorites' }).click();
  await page.locator('.favorites__grid .card').first().waitFor({ timeout: 25_000 });
  await page.waitForTimeout(2500);

  await context.close();
}

async function main(): Promise<void> {
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const seen = new Set<string>();

  await capturePublic(browser, seen);
  await captureFavorites(browser, seen);
  await browser.close();

  console.log('captured:', [...seen].sort().join(', ') || 'nothing');
  for (const name of [...seen].sort()) {
    const file = `${OUT}/${name}.json`;
    if (existsSync(file)) console.log(`  ${name}: ${statSync(file).size} bytes`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
