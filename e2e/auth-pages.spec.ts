import { test, expect } from './anilist-mock';

/**
 * The auth pages had no breakpoints at all — `.login__left` and `.login__right`
 * were `flex: 0.5` at every width, so a phone got a half-width form beside a
 * half-width photograph. These assert the behaviour that replaced it, plus the
 * two defects that were invisible until someone used a keyboard.
 */
const WIDTHS = [320, 375, 768, 1280];

for (const route of ['/login', '/sign-up']) {
  test.describe(`${route} layout`, () => {
    for (const width of WIDTHS) {
      test(`the card fits the viewport at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(route, { waitUntil: 'domcontentloaded' });

        const card = page.locator('.auth__card');
        await expect(card).toBeVisible({ timeout: 20_000 });

        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow, 'page scrolls sideways').toBe(0);

        // A gutter, not merely "fits" — the card butting the screen edge is the
        // failure this replaced.
        const box = (await card.boundingBox())!;
        expect(box.x).toBeGreaterThanOrEqual(8);
        expect(box.x + box.width).toBeLessThanOrEqual(width - 8);
      });
    }

    test('offers both providers', async ({ page }) => {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('.auth__card')).toBeVisible({ timeout: 20_000 });
      // Sign up offered neither, though a provider sign-in creates the account
      // anyway — so the two pages disagreed about how to make one.
      await expect(page.getByRole('button', { name: 'Apple' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Google' })).toBeVisible();
    });
  });
}

test('the decorative poster wall never blocks the form', async ({ page }) => {
  // The wall is the one thing on these pages that needs the network. It must
  // not gate the form, so this answers the query with an error outright.
  await page.route('https://graphql.anilist.co/**', (route) =>
    route.fulfill({ status: 500, contentType: 'application/json', body: '{"errors":[{"message":"down"}]}' }),
  );
  await page.goto('/login', { waitUntil: 'domcontentloaded' });

  await expect(page.locator('.auth__card')).toBeVisible({ timeout: 20_000 });
  await expect(page.locator('#login-email')).toBeVisible();
  await expect(page.locator('.auth__wallGrid img')).toHaveCount(0);
});

test('pressing Enter submits rather than reloading the page', async ({ page }) => {
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.auth__card')).toBeVisible({ timeout: 20_000 });

  // Survives a submit handler that calls preventDefault; does not survive a
  // navigation. The old form had no onSubmit, so Enter fell through to the
  // browser default and reloaded with the credentials in the query string.
  await page.evaluate(() => {
    (window as unknown as { __alive: boolean }).__alive = true;
  });

  await page.locator('#login-email').fill('nobody@example.com');
  await page.locator('#login-password').fill('not-the-password');
  await page.locator('#login-password').press('Enter');

  await expect(page.locator('.auth__error')).toBeVisible({ timeout: 20_000 });
  expect(page.url()).not.toContain('password');
  expect(
    await page.evaluate(() => (window as unknown as { __alive?: boolean }).__alive === true),
    'the page reloaded',
  ).toBe(true);
});

test('the password toggle reveals and re-hides', async ({ page }) => {
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.auth__card')).toBeVisible({ timeout: 20_000 });

  const field = page.locator('#login-password');
  await field.fill('hunter2');
  await expect(field).toHaveAttribute('type', 'password');

  await page.getByRole('button', { name: 'Show password' }).click();
  await expect(field).toHaveAttribute('type', 'text');

  await page.getByRole('button', { name: 'Hide password' }).click();
  await expect(field).toHaveAttribute('type', 'password');
});

test('sign up flags mismatched passwords on the field itself', async ({ page }) => {
  await page.goto('/sign-up', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.auth__card')).toBeVisible({ timeout: 20_000 });

  await page.locator('#signup-password').fill('correct-horse');
  await page.locator('#signup-confirm').fill('correct-hors');

  // Previously this collapsed into one "fill out all form fields" alert, which
  // named neither the field nor the problem.
  await expect(page.locator('#signup-confirm')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('.auth__hint')).toContainText('do not match');
});
