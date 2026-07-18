import { expect, test } from '@playwright/test';

const legalPages = [
  { path: '/legal/terms', heading: 'Terms of Service' },
  { path: '/legal/privacy', heading: 'Privacy Policy' },
  { path: '/legal/refund', heading: 'Cancellation & Refund Policy' }
] as const;

for (const legalPage of legalPages) {
  test(`${legalPage.heading} renders with its draft warning and footer links`, async ({ page }) => {
    await page.goto(legalPage.path);

    await expect(page.getByRole('heading', { level: 1, name: legalPage.heading })).toBeVisible();
    await expect(page.getByTestId('legal-draft-banner')).toContainText(
      'Draft — pending legal review'
    );

    const footer = page.getByRole('contentinfo');
    for (const destination of legalPages) {
      await expect(footer.getByRole('link', { name: destination.heading })).toHaveAttribute(
        'href',
        destination.path
      );
    }
  });
}

test('site-wide footer navigates among every legal page', async ({ page }) => {
  await page.goto('/');

  for (const legalPage of legalPages) {
    await page.getByRole('contentinfo').getByRole('link', { name: legalPage.heading }).click();
    await expect(page).toHaveURL(legalPage.path);
    await expect(page.getByRole('heading', { level: 1, name: legalPage.heading })).toBeVisible();
  }
});
