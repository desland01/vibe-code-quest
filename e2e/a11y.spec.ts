import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const evidenceDirectory = path.join(process.cwd(), 'docs/missions/2026-07-10-code-tutor-v1/evidence/ISSUE-013');
const regionButtons = (page: Page) => page.getByRole('navigation', { name: 'Learning regions' }).getByRole('button');

test('keyboard-only traversal activates all eight regions and restores focus', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to regions' })).toBeFocused();
  await page.keyboard.press('Enter');

  const buttons = regionButtons(page);
  await expect(buttons).toHaveCount(8);
  for (let index = 0; index < 8; index += 1) {
    await expect(buttons.nth(index)).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('complementary')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('complementary')).toBeHidden();
    await expect(buttons.nth(index)).toBeFocused();
    if (index < 7) await page.keyboard.press('Tab');
  }
});

test('live region announces keyboard zoom and selection', async ({ page }) => {
  await page.goto('/');
  const live = page.getByTestId('map-live-region');
  await page.locator('.map-renderer').focus();
  await page.keyboard.press('+');
  await expect(live).toHaveText('Zoom 2x');
  await regionButtons(page).filter({ hasText: 'Explore Databases' }).focus();
  await page.keyboard.press('Enter');
  await expect(live).toHaveText('Databases selected — panel open');
});

test('axe serious and critical report is clean on map routes', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const reports = [];
  for (const route of ['/', '/map/databases', '/map/databases/sql']) {
    await page.goto(route);
    await page.waitForTimeout(400);
    const report = await new AxeBuilder({ page }).analyze();
    console.log(`[axe] ${route}`, JSON.stringify(report.violations, null, 2));
    reports.push({ route, ...report });
    expect(report.violations.filter((violation) => violation.impact === 'serious' || violation.impact === 'critical')).toEqual([]);
  }
  await mkdir(evidenceDirectory, { recursive: true });
  await writeFile(path.join(evidenceDirectory, 'axe-report.json'), JSON.stringify(reports, null, 2));
});

test('reduced motion disables ambient animation deterministically', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('body')).toHaveAttribute('data-reduced-motion', 'true');
  await expect(page.locator('.map-renderer')).toHaveAttribute('data-ambient-animation', 'disabled');
  await expect(page.locator('.map-renderer')).not.toHaveClass(/ambient/);
  await expect(page.locator('.map-renderer')).toHaveCSS('animation-name', 'none');
});

test('DOM-only fallback retains map interactions', async ({ page }) => {
  await page.goto('/?nocanvas=1');
  await expect(page.getByTestId('map-fallback')).toBeVisible();
  await regionButtons(page).nth(3).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('complementary')).toBeVisible();
});

for (const [label, viewport] of [['200%', { width: 720, height: 450 }], ['400%', { width: 360, height: 225 }]] as const) {
  test(`${label} zoom proxy remains scrollable without horizontal region-control clipping`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await expect(regionButtons(page)).toHaveCount(8);
    const viewportBox = await page.locator('.map-viewport').boundingBox();
    expect(viewportBox).not.toBeNull();
    for (const button of await regionButtons(page).all()) {
      const box = await button.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.x).toBeGreaterThanOrEqual(viewportBox!.x - 1);
      expect(box!.x + box!.width).toBeLessThanOrEqual(viewportBox!.x + viewportBox!.width + 1);
    }
    await regionButtons(page).last().focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('complementary')).toBeVisible();
    const dimensions = await page.evaluate(() => ({ scrollHeight: document.documentElement.scrollHeight, innerHeight }));
    expect(dimensions.scrollHeight).toBeGreaterThan(dimensions.innerHeight);
  });
}
