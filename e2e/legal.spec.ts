import { expect, test } from '@playwright/test';

const legalPages = [
  { path: '/legal/terms', heading: 'Terms of Service' },
  { path: '/legal/privacy', heading: 'Privacy Policy' },
  { path: '/legal/refund', heading: 'Cancellation & Refund Policy' }
] as const;

for (const legalPage of legalPages) {
  test(`${legalPage.heading} renders with its legal notice and footer links`, async ({ page }) => {
    await page.goto(legalPage.path);

    await expect(page.getByRole('heading', { level: 1, name: legalPage.heading })).toBeVisible();
    await expect(page.getByTestId('legal-not-legal-advice')).toBeVisible();
    await expect(page.getByTestId('legal-not-legal-advice')).toContainText('not legal advice');

    const bodyText = await page.locator('body').innerText();
    expect(bodyText).not.toMatch(/\[[A-Z][A-Z ]+\]/);
    expect(bodyText).not.toMatch(/subscription|refund a payment|credit card|Stripe/i);
    expect(bodyText).not.toMatch(/code-tutor/i);
    expect(bodyText).not.toMatch(/Trueline/i);

    const footer = page.getByRole('contentinfo');
    for (const destination of legalPages) {
      await expect(footer.getByRole('link', { name: destination.heading })).toHaveAttribute(
        'href',
        destination.path
      );
    }
  });
}

test('public brand is shown on the map and footer', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1, name: 'Vibe Code Quest' })).toBeVisible();

  const footer = page.getByRole('contentinfo');
  const byline = footer.getByTestId('site-byline');
  await expect(byline).toHaveText('Vibe Code Quest by Truline');
  await expect(byline.getByRole('link', { name: 'Truline' })).toHaveAttribute(
    'href',
    'https://truline.io'
  );
  await expect(footer.getByTestId('site-constance')).toHaveText('Governed by Constance');
  await expect(page).toHaveTitle(/Vibe Code Quest by Truline/);
});

test('site-wide footer navigates among every legal page', async ({ page }) => {
  await page.goto('/');

  for (const legalPage of legalPages) {
    await page.getByRole('contentinfo').getByRole('link', { name: legalPage.heading }).click();
    await expect(page).toHaveURL(legalPage.path);
    await expect(page.getByRole('heading', { level: 1, name: legalPage.heading })).toBeVisible();
  }
});
