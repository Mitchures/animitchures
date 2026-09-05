import { test, expect } from './anilist-mock';
import type { Page } from '@playwright/test';

/**
 * Guards the invariants established when the app was made responsive.
 *
 * These assert behaviour, not pixels — no screenshot baselines to churn every
 * time a poster image changes. Two of the defects these cover (the hero's dead
 * space and a clipped genre tag) were invisible to both CSS review and computed
 * -style checks; only rendering caught them.
 */

const MOBILE_BREAKPOINT = 960;

/** Widths that matter: narrowest supported, common phones, and both sides of the handoff. */
const WIDTHS = [320, 375, 500, 768, 960, 961, 1280];

/**
 * Loads Discover and waits for the hero, which renders from an AniList query.
 * Use only where the assertion needs real media content.
 */
async function gotoDiscover(page: Page) {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.locator('.hero__banner').waitFor({ state: 'visible', timeout: 20_000 });
}

/**
 * Loads Discover but waits only for the app shell.
 *
 * Prefer this for assertions about layout and navigation, which are pure CSS
 * and do not depend on media data. AniList rate-limits aggressively (429 with
 * no CORS header, which surfaces in the browser as a misleading CORS error), so
 * a test that loads the hero at seven viewport widths is needlessly fragile.
 */
async function gotoShell(page: Page) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.locator('.header').waitFor({ state: 'visible', timeout: 20_000 });
}

test.describe('no horizontal overflow', () => {
  for (const width of WIDTHS) {
    test(`page does not scroll sideways at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await gotoDiscover(page);

      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));

      expect(scrollWidth, `overflowed by ${scrollWidth - clientWidth}px`).toBe(clientWidth);
    });
  }
});

test.describe('navigation handoff at the 960px boundary', () => {
  test('below the breakpoint the hamburger replaces the sidebar', async ({ page }) => {
    await page.setViewportSize({ width: MOBILE_BREAKPOINT, height: 900 });
    await gotoShell(page);

    await expect(page.locator('.header__menuButton')).toBeVisible();
    await expect(page.locator('.navigation')).toBeHidden();
  });

  test('above the breakpoint the sidebar returns and the hamburger goes', async ({ page }) => {
    await page.setViewportSize({ width: MOBILE_BREAKPOINT + 1, height: 900 });
    await gotoShell(page);

    await expect(page.locator('.navigation')).toBeVisible();
    await expect(page.locator('.header__menuButton')).toBeHidden();
  });

  test('exactly one navigation affordance exists at every width', async ({ page }) => {
    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 900 });
      await gotoShell(page);

      const sidebar = await page.locator('.navigation').isVisible();
      const hamburger = await page.locator('.header__menuButton').isVisible();

      expect(
        [sidebar, hamburger].filter(Boolean).length,
        `at ${width}px: sidebar=${sidebar} hamburger=${hamburger}`,
      ).toBe(1);
    }
  });
});

test.describe('overlay menu', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 500, height: 900 });
    await gotoDiscover(page);
  });

  test('opens from the hamburger and closes on Escape', async ({ page }) => {
    await page.click('.header__menuButton');
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toBeHidden();
  });

  test('closes via the close button', async ({ page }) => {
    await page.click('.header__menuButton');
    await page.getByRole('button', { name: /close menu/i }).click();
    await expect(page.getByRole('dialog')).toBeHidden();
  });

  test('closes on navigation rather than covering the new page', async ({ page }) => {
    await page.click('.header__menuButton');
    await page.getByRole('dialog').getByText('Discover').click();
    await expect(page.getByRole('dialog')).toBeHidden();
  });

  test('locks body scroll while open', async ({ page }) => {
    await page.click('.header__menuButton');
    await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
  });

  test('does not overflow while open', async ({ page }) => {
    await page.click('.header__menuButton');
    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(scrollWidth).toBe(clientWidth);
  });
});

test.describe('hero', () => {
  test('genre tags stay inside the banner instead of clipping', async ({ page }) => {
    for (const width of [320, 375, 500]) {
      await page.setViewportSize({ width, height: 900 });
      await gotoDiscover(page);

      const clipped = await page.evaluate(() => {
        const limit = document.documentElement.clientWidth;
        return [...document.querySelectorAll('.hero__tag')].filter(
          (el) => el.getBoundingClientRect().right > limit + 1,
        ).length;
      });

      expect(clipped, `tags clipped at ${width}px`).toBe(0);
    }
  });

  test('stacks below the breakpoint and stays side-by-side above it', async ({ page }) => {
    await page.setViewportSize({ width: 500, height: 900 });
    await gotoDiscover(page);
    await expect(page.locator('.hero__bannerBody')).toHaveCSS('flex-direction', 'column');

    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoDiscover(page);
    await expect(page.locator('.hero__bannerBody')).toHaveCSS('flex-direction', 'row');
  });
});
