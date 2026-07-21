import { expect, test } from '@playwright/test';

test('map and renderer interactions dispatch allowlisted analytics without PII', async ({ page }) => {
  const messages: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'debug' && message.text().includes('[analytics]')) messages.push(message.text());
  });

  await page.goto('/?nocanvas=1');
  await page.getByRole('navigation', { name: 'Learning regions' }).getByRole('button', { name: 'Databases' }).click();
  await expect.poll(() => messages.some((message) => message.includes('[analytics] region_click'))).toBe(true);

  await page.getByRole('complementary').getByRole('link', { name: 'SQL', exact: true }).click();
  // L-002: BeatPlayer also renders an h3 with the landmark title — pin the page header h2.
  await expect(page.locator('#landmark-title')).toHaveText('SQL');
  await expect.poll(() => messages.some((message) => message.includes('[analytics] landmark_open'))).toBe(true);

  await page.getByRole('group', { name: 'Landmark format' }).getByRole('button', { name: 'Quiz' }).click();
  await expect.poll(() => messages.some((message) => message.includes('[analytics] format_switched'))).toBe(true);

  expect(messages.join('\n')).not.toMatch(/email|token|profileId|userId|sourceUserId/i);
});
