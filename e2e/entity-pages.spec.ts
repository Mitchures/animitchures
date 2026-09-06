/**
 * Staff, character and studio pages.
 *
 * These exist because the cast chips and studio name on Details used to lead
 * nowhere — the app's biggest dead end. All three are public routes, so the
 * coverage runs signed out, and AniList is mocked from captured fixtures.
 */
import { test, expect } from './anilist-mock';

const STAFF = '/staff/95185/kana-hanazawa';
const CHARACTER = '/character/136072/mitsuri-kanroji';
const STUDIO = '/studio/2/kyoto-animation';
const DETAILS = '/anime/1/cowboy-bebop';

test.describe('entity pages', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('a staff page lists roles as pairings', async ({ page }) => {
    await page.goto(STAFF, { waitUntil: 'domcontentloaded' });

    await expect(page.locator('.entityHero__id h1')).toHaveText('Kana Hanazawa');
    // The facts line was invisible once: --primary is the dark-mode background.
    await expect(page.locator('.entityHero__facts')).toContainText('favourites');

    const pairs = page.locator('.rolePair');
    await expect(pairs.first()).toBeVisible({ timeout: 20_000 });
    expect(await pairs.count()).toBeGreaterThan(4);

    // Each pairing leads to the character, and carries the title it came from.
    await expect(pairs.first().locator('a[href^="/character/"]').first()).toBeVisible();
    await expect(pairs.first().locator('a[href^="/anime/"]').first()).toBeVisible();
  });

  test('a character page leads to the voice actor', async ({ page }) => {
    await page.goto(CHARACTER, { waitUntil: 'domcontentloaded' });

    await expect(page.locator('.entityHero__id h1')).toHaveText('Mitsuri Kanroji');
    await expect(page.locator('.rolePair').first()).toBeVisible({ timeout: 20_000 });

    // On a character page the actor is the new information, so the leading
    // face is theirs and it links to their page.
    await expect(page.locator('.rolePair a[href^="/staff/"]').first()).toBeVisible();
  });

  test('a studio page groups its filmography by year', async ({ page }) => {
    await page.goto(STUDIO, { waitUntil: 'domcontentloaded' });

    await expect(page.locator('.entityHero__id h1')).toHaveText('Kyoto Animation');
    await expect(page.locator('.studio__work').first()).toBeVisible({ timeout: 20_000 });

    const years = page.locator('.studio__yearLabel b');
    expect(await years.count()).toBeGreaterThan(1);

    // Newest first, and undated productions keep a TBA row rather than being
    // dropped or dated wrongly.
    const labels = await years.allTextContents();
    const numeric = labels.filter((label) => /^\d{4}$/.test(label)).map(Number);
    expect(numeric).toEqual([...numeric].sort((a, b) => b - a));
  });

  test('details no longer dead-ends: chips and the studio link out', async ({ page }) => {
    await page.goto(DETAILS, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.details__hero')).toBeVisible({ timeout: 20_000 });

    await expect(page.locator('.sidebar__link[href^="/studio/"]').first()).toBeVisible();

    // Characters and Staff sit on Overview, which is the default tab — no
    // navigation needed to reach the chips.
    await expect(page.locator('.castChip a[href^="/character/"]').first()).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.locator('.castChip a[href^="/staff/"]').first()).toBeVisible();
  });

  test('the whole cast chip is clickable, and the actor still is too', async ({ page }) => {
    await page.goto(DETAILS, { waitUntil: 'domcontentloaded' });
    const chip = page.locator('.castChip--link').first();
    await chip.scrollIntoViewIfNeeded();

    // The character link is stretched across the chip, so empty space in the
    // corner navigates. This broke once already: the overlay sat above the
    // actor's portrait and swallowed it.
    const box = (await chip.boundingBox())!;
    await page.mouse.click(box.x + box.width - 14, box.y + 10);
    await expect(page).toHaveURL(/\/character\/\d+\//);

    await page.goto(DETAILS, { waitUntil: 'domcontentloaded' });
    const inset = page.locator('.castChip__insetLink').first();
    await inset.scrollIntoViewIfNeeded();
    await inset.click();
    await expect(page).toHaveURL(/\/staff\/\d+\//);
  });
});
