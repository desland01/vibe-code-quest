import { expect, test } from '@playwright/test';

/**
 * L-006 free product path.
 * The guide is free within caps. Canonical content stays readable.
 * No trial/subscribe/paywall UI appears on the guide journey.
 * Billing routes stay dormant and are never requested from this surface.
 */
test('canonical overview stays readable and guide opens without a paywall', async ({ page }) => {
  let billingHits = 0;
  await page.route('**/api/billing/**', async (route) => {
    billingHits += 1;
    await route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'billing not configured' }),
    });
  });

  await page.goto('/map/databases/sql?format=overview');
  await expect(page.getByRole('heading', { name: 'SQL' })).toBeVisible();
  await expect(page.getByText(/SQL databases store durable records/i)).toBeVisible();

  await page.getByRole('button', { name: 'Ask the guide' }).click();
  await expect(page.getByTestId('guide-panel')).toBeVisible();
  await expect(page.getByTestId('guide-form')).toBeVisible();
  await expect(page.getByTestId('guide-paywall')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Start free trial|Subscribe/i })).toHaveCount(0);

  // Successful guide reply path.
  await page.route('**/api/guide', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        kind: 'ok',
        message: 'SQL is the durable record language for structured data.',
        escalated: false,
      }),
    });
  });
  await page.getByTestId('guide-message').fill('What is SQL for?');
  await page.getByTestId('guide-send').click();
  await expect(page.getByTestId('guide-log')).toContainText(/durable record language/i);
  await page.unroute('**/api/guide');

  // Cap/gateway failure degrades to canonical offline copy, never a billing wall.
  await page.route('**/api/guide', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }
    await route.abort();
  });
  await page.getByTestId('guide-message').fill('Explain it again');
  await page.getByTestId('guide-send').click();
  await expect(page.getByTestId('guide-offline')).toBeVisible();
  await expect(page.getByTestId('guide-log')).toContainText(/SQL databases store durable records/i);
  await expect(page.getByTestId('guide-paywall')).toHaveCount(0);
  await expect(page.getByText(/SQL databases store durable records/i).first()).toBeVisible();

  expect(billingHits).toBe(0);
});
