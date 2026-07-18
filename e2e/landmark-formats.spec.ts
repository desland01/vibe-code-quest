import { expect, test } from '@playwright/test';

test('landmark formats are real, deterministic, and keyboard operable', async ({ page }) => {
  await page.goto('/map/databases/sql?format=overview');
  await page.waitForResponse((r) => r.url().includes('/api/session'), { timeout: 15000 }).catch(() => {});
  await page.waitForLoadState('networkidle');
  const overview = page.getByTestId('landmark-overview');
  await expect(overview).toBeVisible();
  const words = (await overview.locator('p').innerText()).trim().split(/\s+/);
  expect(words.length).toBeGreaterThanOrEqual(70);
  expect(words.length).toBeLessThanOrEqual(90);

  const switcher = page.getByRole('group', { name: 'Landmark format' });
  await switcher.getByRole('button', { name: 'Overview' }).focus();
  await page.keyboard.press('End');
  await expect(page).toHaveURL(/format=quiz/);

  const quiz = page.getByRole('heading', { name: 'Quiz', exact: true }).locator('..');
  await quiz.getByRole('radio', { name: /A client portal with related records and invoices/ }).check();
  await page.waitForLoadState('networkidle');
  await quiz.getByRole('button', { name: 'Check answer' }).click();
  await expect(quiz.getByRole('status')).toContainText(/Correct/);

  await switcher.getByRole('button', { name: 'Lesson' }).click();
  await expect(page.getByTestId('lesson-chat')).toContainText(/\?|overview/i);
});
