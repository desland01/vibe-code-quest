import { expect, test } from '@playwright/test';

test('share snapshot is public, revocable, and unknown tokens 404', async ({ browser, page }) => {
  await page.goto('/map');
  await expect(page.getByRole('button', { name: 'Share my progress' })).toBeVisible();
  await page.getByRole('button', { name: 'Share my progress' }).click();
  const input = page.getByLabel('Public link');
  await expect(input).toBeVisible();
  const url = await input.inputValue();

  const crawler = await browser.newContext({ userAgent: 'facebookexternalhit/1.1' });
  const publicPage = await crawler.newPage();
  await publicPage.goto(url);
  await expect(publicPage.getByRole('heading', { name: /landmarks explored/ })).toBeVisible();

  await page.getByRole('button', { name: 'Revoke link' }).click();
  await expect(page.getByTestId('share-status')).toContainText('revoked');
  expect((await publicPage.goto(url))?.status()).toBe(404);
  expect((await publicPage.goto('/s/abcdefghijklmnopqrstuv'))?.status()).toBe(404);
  await crawler.close();
});
