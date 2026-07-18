import { expect, test } from '@playwright/test';

test('onboarding unlocks after Q1, caps at five, and leaves the map browsable', async ({ page }) => {
  await page.goto('/');
  const panel = page.getByTestId('onboarding-panel');
  await expect(panel).toBeVisible();
  await expect(page.getByRole('region', { name: 'Learning map' })).toBeVisible();

  await panel.getByLabel('Your answer').fill('student');
  await panel.getByRole('button', { name: 'Send' }).click();
  await expect(panel.getByText(/Map unlocked/)).toBeVisible();

  for (let step = 1; step < 5 && await panel.isVisible(); step += 1) {
    await panel.getByRole('button', { name: 'Skip' }).click();
  }
  await expect(panel).toBeHidden();

  await page.reload();
  await expect(page.getByRole('region', { name: 'Learning map' })).toBeVisible();
  if (await panel.isVisible()) {
    await panel.getByRole('button', { name: 'Dismiss onboarding' }).click();
    await expect(panel).toBeHidden();
  }
  await expect(page.getByRole('link', { name: /Languages/ }).first()).toBeVisible();
});
