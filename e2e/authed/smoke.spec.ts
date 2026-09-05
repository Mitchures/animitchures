import { test, expect } from '@playwright/test';

test('the saved session is signed in', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.header__avatar')).toBeVisible({ timeout: 20_000 });
});
