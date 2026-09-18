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
  await page.locator('.slideHero').waitFor({ state: 'visible', timeout: 20_000 });
}

/**
 * Loads Discover but waits only for the app shell.
 *
 * Waits on .app__body rather than any chrome: the pill column is hidden below
 * 960px and the tab bar above it, so neither is a width-agnostic signal.
 *
 * Prefer this for assertions about layout and navigation, which are pure CSS
 * and do not depend on media data. AniList rate-limits aggressively (429 with
 * no CORS header, which surfaces in the browser as a misleading CORS error), so
 * a test that loads the hero at seven viewport widths is needlessly fragile.
 */
async function gotoShell(page: Page) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.locator('.app__body').waitFor({ state: 'visible', timeout: 20_000 });
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
  test('below the breakpoint the tab bar replaces the pill column', async ({ page }) => {
    await page.setViewportSize({ width: MOBILE_BREAKPOINT, height: 900 });
    await gotoShell(page);

    await expect(page.locator('.tabBar')).toBeVisible();
    await expect(page.locator('.pillNav')).toBeHidden();
  });

  test('above the breakpoint the pill column returns and the tab bar goes', async ({ page }) => {
    await page.setViewportSize({ width: MOBILE_BREAKPOINT + 1, height: 900 });
    await gotoShell(page);

    await expect(page.locator('.pillNav')).toBeVisible();
    await expect(page.locator('.tabBar')).toBeHidden();
  });

  test('exactly one navigation affordance exists at every width', async ({ page }) => {
    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 900 });
      await gotoShell(page);

      const column = await page.locator('.pillNav').isVisible();
      const bar = await page.locator('.tabBar').isVisible();

      expect(
        [column, bar].filter(Boolean).length,
        `at ${width}px: column=${column} bar=${bar}`,
      ).toBe(1);
    }
  });

  test('the column is a fixed 248px and does not expand on hover', async ({ page }) => {
    // It used to grow to 240px over the page, which is what made the left edge
    // of every view swallow clicks.
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoShell(page);

    const before = await page.locator('.app__body').boundingBox();
    await page.locator('.pillNav').hover();
    await page.waitForTimeout(400);

    await expect(page.locator('.pillNav')).toHaveCSS('width', '248px');
    expect((await page.locator('.app__body').boundingBox())?.x).toBe(before?.x);
  });
});

test.describe('the phone tab bar', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 500, height: 900 });
    await gotoShell(page);
  });

  test('carries four public destinations and no More, which would open on nothing', async ({
    page,
  }) => {
    // Signed out every public destination already has a slot, so the drawer
    // would hold only a Log in row. The drawer's own behaviour is covered in
    // the authed project, where it has content.
    await expect(page.locator('.tabBar a')).toHaveCount(4);
    await expect(page.locator('.tabBar__more')).toHaveCount(0);
  });

  test('marks the destination you are on', async ({ page }) => {
    // Browse rather than Calendar: the calendar's AiringSchedule query has no
    // captured fixture, and the mock throws rather than reaching the network.
    await page.locator('.tabBar a', { hasText: 'Browse' }).click();

    await expect(page).toHaveURL(/\/search\/anime$/);
    await expect(page.locator('.tabBar a', { hasText: 'Browse' })).toHaveClass(
      /tabBar__item--active/,
    );
  });

  test('floats over the content rather than covering the last row of it', async ({ page }) => {
    await gotoDiscover(page);
    const bar = (await page.locator('.tabBar').boundingBox())!;
    const body = page.locator('.app__body');

    // The scroll container reserves the bar's height plus a gap, so scrolling
    // to the end still leaves the last card clear of it.
    await body.evaluate((el) => el.scrollTo(0, el.scrollHeight));
    await page.waitForTimeout(300);
    const last = (await page.locator('.posterEchoCard').last().boundingBox())!;

    expect(last.y + last.height).toBeLessThanOrEqual(bar.y + 1);
  });
});

test.describe('slide hero', () => {
  test('genre tags stay inside the banner instead of clipping', async ({ page }) => {
    for (const width of [320, 375, 500]) {
      await page.setViewportSize({ width, height: 900 });
      await gotoDiscover(page);

      const clipped = await page.evaluate(() => {
        const limit = document.documentElement.clientWidth;
        return [...document.querySelectorAll('.slideHero__tags .chip')].filter(
          (el) => el.getBoundingClientRect().right > limit + 1,
        ).length;
      });

      expect(clipped, `tags clipped at ${width}px`).toBe(0);
    }
  });

  test('poster sits beside the copy, and gives way entirely on a narrow phone', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoDiscover(page);
    const wide = (await page.locator('.slideHero__poster').boundingBox())!;
    const wideCopy = (await page.locator('.slideHero__body').boundingBox())!;
    expect(wideCopy.x).toBeGreaterThan(wide.x);
    expect((await page.locator('.slideHero').boundingBox())!.height).toBeGreaterThan(300);

    await page.setViewportSize({ width: 500, height: 900 });
    await gotoDiscover(page);
    const narrow = (await page.locator('.slideHero__poster').boundingBox())!;
    expect(narrow.width).toBeLessThan(wide.width);
    expect((await page.locator('.slideHero').boundingBox())!.height).toBeLessThan(260);

    // Below 400px the copy has no room to share, so the poster goes and the
    // artwork behind the slide carries the art on its own.
    await page.setViewportSize({ width: 320, height: 900 });
    await gotoDiscover(page);
    await expect(page.locator('.slideHero__poster')).toBeHidden();
  });
});
