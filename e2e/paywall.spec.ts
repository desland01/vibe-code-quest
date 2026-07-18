import { expect, test } from '@playwright/test';

test('canonical overview remains readable when the guide is paywalled', async ({ page }) => {
  await page.route('**/api/guide', async (route) => {
    if (route.request().method() === 'GET') await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ allowed: false, verifiedEmail: true }) });
    else await route.continue();
  });
  await page.route('**/api/billing/checkout', (route) => route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: 'billing not configured' }) }));
  await page.goto('/map/databases/sql?format=overview');
  await expect(page.getByRole('heading', { name: 'SQL' })).toBeVisible();
  await expect(page.getByText(/SQL databases store durable records/i)).toBeVisible();
  await page.getByRole('button', { name: 'Ask the guide' }).click();
  await expect(page.getByTestId('guide-paywall')).toBeVisible();
  await page.getByRole('button', { name: 'Subscribe (test mode)' }).click();
  await expect(page.getByTestId('guide-paywall').getByRole('alert')).toHaveText('billing not configured');
  await expect(page.getByText(/SQL databases store durable records/i)).toBeVisible();
});
