/**
 * The Discover dashboard's closing sections: "Coming later" and "All-time
 * popular", both derived from the one Featured response.
 *
 * Public route, AniList mocked, so every figure here is a known quantity from
 * `e2e/fixtures/Featured.json`. What the unit tests on `features/discover/derive.ts`
 * cannot check is that the figures reach the screen and that the two sections
 * line up with the rest of the column — both have been wrong at least once.
 */
import { test, expect } from './anilist-mock';

test.describe('coming later', () => {
  test.use({ viewport: { width: 1440, height: 1000 } });

  test('leads on the most-awaited title and marks it once', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const lead = page.locator('.comingLater__lead');
    await expect(lead).toBeVisible({ timeout: 25_000 });

    await expect(lead.locator('.comingLater__leadTitle')).toHaveText(
      'JUJUTSU KAISEN Season 3: The Culling Game Part 1',
    );
    await expect(lead.locator('.comingLater__leadCount .dotNumber')).toHaveAttribute(
      'aria-label',
      '256K',
    );
    // The lime chip is the only lime in the section: one thing marked, not four.
    await expect(page.locator('.comingLater .comingLater__badge')).toHaveCount(1);
    await expect(page.locator('.comingLater__row')).toHaveCount(3);
    await expect(page.locator('.comingLater__rest')).toContainText('more announced');
  });

  test('the title and its studio line do not share a line', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.comingLater__lead')).toBeVisible({ timeout: 25_000 });

    // FrostedTile hands every child to one flex item, which lays them out
    // inline — the caption rendered on the end of the title until the lead card
    // restyled that slot as a column.
    const [title, meta] = await Promise.all([
      page.locator('.comingLater__leadTitle').boundingBox(),
      page.locator('.comingLater__leadMeta').boundingBox(),
    ]);
    expect(meta!.y).toBeGreaterThan(title!.y + title!.height - 2);
  });
});

test.describe('all-time popular', () => {
  test.use({ viewport: { width: 1440, height: 1000 } });

  test('separates the leaders it is there to compare', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.popularList')).toBeVisible({ timeout: 25_000 });

    const rows = page.locator('.popularRow');
    await expect(rows).toHaveCount(6);
    await expect(rows.first().locator('.popularRow__title')).toHaveText('Attack on Titan');
    await expect(rows.first().locator('.popularRow__count .dotNumber')).toHaveAttribute(
      'aria-label',
      '1.05M',
    );

    // One dot per 25,000 members over 42 slots. Scaled from zero these six all
    // read 80-100 per cent; quantised they are visibly different lengths.
    const lit = await rows.evaluateAll((els) =>
      els.map((el) => el.querySelectorAll('.popularRow__matrix i.is-on').length),
    );
    expect(lit).toEqual([42, 40, 39, 38, 35, 34]);
  });

  test('only the leader is marked, and only its last dots go lime', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.popularList')).toBeVisible({ timeout: 25_000 });

    await expect(page.locator('.popularRow__leaderChip')).toHaveCount(1);
    await expect(page.locator('.popularRow--leader')).toHaveCount(1);
    await expect(page.locator('.popularRow__matrix i.is-lime')).toHaveCount(4);
    await expect(
      page.locator('.popularRow--leader .popularRow__matrix i.is-lime'),
    ).toHaveCount(4);
  });

  test('a pale cover colour is still dark enough to see', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.popularList')).toBeVisible({ timeout: 25_000 });

    // Demon Slayer's cover is #f1c9ae, which is invisible on the row's own
    // near-white surface. The lightness clamp is what makes it readable, and a
    // clamp that silently stopped applying would look like nothing at all.
    const lightness = await page
      .locator('.popularRow')
      .nth(1)
      .locator('.popularRow__matrix i.is-on')
      .first()
      .evaluate((el) => {
        const [r, g, b] = getComputedStyle(el)
          .backgroundColor.match(/[\d.]+/g)!
          .slice(0, 3)
          .map(Number);
        return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
      });
    expect(lightness, 'the pale-cover clamp is not applying').toBeLessThan(0.72);
  });
});

test.describe('the closing sections line up with the column', () => {
  test.use({ viewport: { width: 1440, height: 1000 } });

  test('both share the content column exactly', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.popularList')).toBeVisible({ timeout: 25_000 });

    // `.seasonWeeks` has shipped one gutter out of alignment in each direction
    // — `scroll-snap-align: start` ate its left padding, and the mobile bleed
    // applied at every width — so this measures both edges of every closing
    // section rather than trusting the CSS. It bleeds below 960px by design,
    // which is a separate assertion at that width.
    const [column, ...sections] = await page.evaluate(() =>
      ['.discover', '.genreTiles', '.seasonWeeks', '.comingLater', '.popularList'].map((sel) => {
        const box = document.querySelector(sel)!.getBoundingClientRect();
        return [Math.round(box.left), Math.round(box.right)];
      }),
    );
    for (const section of sections) expect(section).toEqual(column);
  });
});

test.describe('on a phone', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('neither section pushes the page sideways', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.popularList')).toBeVisible({ timeout: 25_000 });

    // The matrix and the "Most listed" column are dropped below 960px: there is
    // no room to compare six of them, and the figure is the fact.
    await expect(page.locator('.popularRow__matrix').first()).toBeHidden();

    // The week rail is the one section that *should* run past the column here,
    // where the gutter is 16px and stopping short would look cramped.
    const rail = (await page.locator('.seasonWeeks').boundingBox())!;
    expect(Math.round(rail.x + rail.width)).toBe(390);
    const body = page.locator('.app__body');
    const [scrollWidth, clientWidth] = await body.evaluate((el) => [
      el.scrollWidth,
      el.clientWidth,
    ]);
    expect(scrollWidth).toBe(clientWidth);
  });
});
