import type { Page } from '@playwright/test';

/**
 * Helpers for driving the redesigned navigation.
 *
 * The desktop pill column splits its destinations across two tabs, so reaching
 * a Library item takes a tab click first — every spec that navigated by
 * clicking a rail link needs that, and it belongs in one place.
 */

/** Destinations that sit under the pill column's Library tab. */
const LIBRARY = new Set(['Watchlist', 'Taste', 'Social']);

/**
 * Waits for the signed-in shell, which only settles once Firebase resolves.
 *
 * Waits on the pill column's logout button being *attached*, not visible:
 * below 960px the column is display:none, so visibility is not a width-agnostic
 * signal. The button is in the DOM at every width, and only exists at all when
 * `user` is set — which is the condition to wait for.
 */
export async function waitForSignedInShell(page: Page, timeout = 20_000): Promise<void> {
  await page.locator('.pillNav__logout').waitFor({ state: 'attached', timeout });
}

/** Clicks a destination in the desktop pill column, switching tabs if needed. */
export async function navigateVia(page: Page, label: string): Promise<void> {
  if (LIBRARY.has(label)) await page.getByRole('tab', { name: 'Library' }).click();
  await page.locator('.pillNav a', { hasText: label }).click();
}
