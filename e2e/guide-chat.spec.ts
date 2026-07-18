import { expect, test } from '@playwright/test';

test('guide falls back to canonical landmark text when the gateway is down', async ({ page }) => {
  await page.goto('/map/databases/sql?format=overview');
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: 'Ask the guide' }).click();
  await page.getByLabel('Ask about SQL').fill('What does this mean?');
  await page.getByRole('button', { name: 'Send' }).click();
  const guide = page.getByTestId('guide-chat');
  await expect(guide.getByRole('alert')).toContainText("The guide is offline — here's the canonical explanation", { timeout: 15_000 });
  await expect(guide.getByRole('log')).toContainText('SQL databases store durable records');
});
