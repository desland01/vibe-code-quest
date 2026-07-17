import { expect, test } from '@playwright/test';

const regionButtons = (page: import('@playwright/test').Page) => page.getByRole('navigation', { name: 'Learning regions' }).getByRole('button');

test('deep link and refresh preserve landmark quiz state', async ({ page }) => {
  await page.goto('/map/databases/sql?format=quiz');
  await expect(page.getByRole('heading', { name: 'SQL', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Quiz' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('heading', { name: 'Quiz' })).toBeVisible();
  await page.reload();
  await expect(page).toHaveURL(/\/map\/databases\/sql\?format=quiz$/);
  await expect(page.getByRole('button', { name: 'Quiz' })).toHaveAttribute('aria-pressed', 'true');
});

test('back and forward follow URL-backed map navigation', async ({ page }) => {
  await page.goto('/map');
  await page.goto('/map/databases');
  await page.locator("a[href=\"/map/databases/sql\"]").click();
  await expect(page).toHaveURL(/\/map\/databases\/sql$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/map\/databases$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/map$/);
  await page.goForward();
  await expect(page).toHaveURL(/\/map\/databases$/);
});

test('invalid ids 404 and invalid format falls back to overview', async ({ page }) => {
  await page.goto('/map/nope');
  await expect(page.getByText(/404|not found/i).first()).toBeVisible();
  await page.goto('/map/databases/nope');
  await expect(page.getByText(/404|not found/i).first()).toBeVisible();
  await page.goto('/map/databases/sql?format=bogus');
  await expect(page.getByRole('button', { name: 'Overview' })).toHaveAttribute('aria-pressed', 'true');
});

test('back link and browser back return to the eight-region map', async ({ page }) => {
  await page.goto('/map');
  await page.goto('/map/databases');
  await page.getByRole('link', { name: 'Back to map' }).click();
  await expect(page).toHaveURL(/\/map$/);
  await expect(regionButtons(page)).toHaveCount(8);
  await page.goto('/map/databases');
  await page.goBack();
  await expect(page).toHaveURL(/\/map$/);
  await expect(regionButtons(page)).toHaveCount(8);
});
