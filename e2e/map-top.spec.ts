import { expect, test } from '@playwright/test';

test('semantic regions open and close landmark details', async ({ page }) => {
  await page.goto('/');
  const regions = page.getByRole('navigation', { name: 'Learning regions' }).getByRole('button');
  await expect(regions).toHaveCount(8);
  await expect(regions.first()).toHaveAccessibleName(/languages/i);
  await regions.first().click();
  const panel = page.getByRole('complementary');
  await expect(panel).toBeVisible();
  await expect(panel.getByRole('listitem')).toHaveCount(6);
  await page.keyboard.press('Escape');
  await expect(panel).toBeHidden();
});

test('region map works with keyboard alone', async ({ page }) => {
  await page.goto('/');
  const firstRegion = page.getByRole('navigation', { name: 'Learning regions' }).getByRole('button').first();
  await firstRegion.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('complementary')).toContainText('Landmarks');
});

test('DOM fallback preserves interactions', async ({ page }) => {
  await page.goto('/?nocanvas=1');
  await expect(page.getByTestId('map-fallback')).toBeVisible();
  await page.getByRole('navigation', { name: 'Learning regions' }).getByRole('button').nth(2).click();
  await expect(page.getByRole('complementary').getByRole('listitem')).toHaveCount(6);
});

test('reduced motion exposes its deterministic hook', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('body')).toHaveAttribute('data-reduced-motion', 'true');
  await expect(page.getByRole('navigation', { name: 'Learning regions' })).toBeVisible();
});
