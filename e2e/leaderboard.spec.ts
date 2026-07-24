import { expect, test, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

/**
 * L-004 quest board — opt-in handle, weekly/all-time, positive copy.
 *
 * Browser pages auto-issue an anonymous JWT via /api/session, so SessionProvider
 * is always "authenticated" in the UI. Cookie-free public GET is covered separately.
 */

const EVIDENCE_DIR = path.join(
  process.cwd(),
  'docs/missions/2026-07-20-vibe-code-quest-launch/evidence/L-004',
);

const SHAME = [
  'lost',
  'dropped',
  'fell',
  'behind',
  'shame',
  'last place',
  'you lost',
  'falling',
  'slipped',
  'worst',
];

function uniqueHandle(prefix = 'E2E') {
  const suffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  return `${prefix}${suffix}`.replace(/[^A-Za-z0-9]/g, '').slice(0, 24);
}

async function gotoWithSession(page: Page, url: string) {
  const sessionResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/api/session') && response.request().method() === 'GET',
  );
  await page.goto(url);
  await sessionResponse;
}

async function waitForBoardReady(page: Page) {
  await expect(page.getByTestId('leaderboard-page')).toBeVisible({ timeout: 15000 });
  await expect(page.getByTestId('leaderboard-table')).toBeVisible({ timeout: 15000 });
  await expect(page.getByTestId('leaderboard-handle-input')).toBeVisible({ timeout: 15000 });
}

async function assertNoHorizontalOverflow(page: Page, scope: string) {
  const report = await page.evaluate(() => {
    const doc = document.documentElement;
    const body = document.body;
    const viewportW = window.innerWidth;
    const scrollW = Math.max(doc.scrollWidth, body.scrollWidth);
    return {
      viewportW,
      scrollW,
      pageOverflow: scrollW > viewportW + 1,
    };
  });
  expect(report.pageOverflow, `${scope}: page overflow`).toBe(false);
}

function assertNoShame(text: string) {
  const lower = text.toLowerCase();
  for (const term of SHAME) {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(?:^|[^a-z])${escaped}(?:$|[^a-z])`, 'i');
    expect(re.test(lower), `shame term "${term}" in: ${text}`).toBe(false);
  }
}

test.describe('L-004 quest board', () => {
  test.beforeAll(async () => {
    await mkdir(EVIDENCE_DIR, { recursive: true });
  });

  test('cookie-free public GET has no self row or PII', async ({ playwright, baseURL }) => {
    const ctx = await playwright.request.newContext({
      baseURL: baseURL ?? 'http://localhost:3100',
    });
    try {
      const res = await ctx.get('/api/leaderboard?period=weekly');
      expect(res.ok()).toBe(true);
      const body = (await res.json()) as {
        optedIn: boolean;
        own: unknown;
        handle: string | null;
        entries: Array<{ isSelf?: boolean }>;
        tone: string;
      };
      expect(body.optedIn).toBe(false);
      expect(body.own).toBeNull();
      expect(body.handle).toBeNull();
      expect(body.entries.every((row) => !row.isSelf)).toBe(true);
      assertNoShame(body.tone || '');
      expect(JSON.stringify(body)).not.toMatch(/@|profileId|userId|email/i);
    } finally {
      await ctx.dispose();
    }
  });

  test('map link + opt-in/out with positive copy', async ({ page, context }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await gotoWithSession(page, '/map');

    const link = page.getByTestId('quest-board-link');
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', '/leaderboard');

    // Keyboard path: focus link and activate.
    await link.focus();
    await page.keyboard.press('Enter');
    await waitForBoardReady(page);

    // Browser visitors always have anon JWT → join form visible, no self yet.
    await expect(page.getByTestId('leaderboard-handle-input')).toBeVisible();
    await expect(page.getByTestId('leaderboard-optin')).toBeVisible();
    await expect(page.getByTestId('leaderboard-row-self')).toHaveCount(0);

    const preTone = await page.getByTestId('leaderboard-tone').innerText();
    assertNoShame(preTone);

    const cookie = (await context.cookies()).find((c) => c.name === 'ct_session');
    expect(cookie?.httpOnly).toBe(true);

    const handle = uniqueHandle('E2E');
    await page.getByTestId('leaderboard-handle-input').fill(handle);
    await page.getByTestId('leaderboard-optin').click();

    await expect(page.getByTestId('leaderboard-status')).toContainText(/on the board/i, {
      timeout: 15000,
    });
    await expect(page.getByTestId('leaderboard-row-self')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('leaderboard-row-self')).toContainText(handle);
    await expect(page.getByTestId('leaderboard-row-self')).toContainText('(you)');

    const joinedTone = await page.getByTestId('leaderboard-tone').innerText();
    assertNoShame(joinedTone);
    const bodyText = await page.locator('main').innerText();
    assertNoShame(bodyText);
    expect(bodyText).not.toMatch(/@|profileId|userId|ct_session/i);

    // Immediate rename must cool down (429) — assert before screenshots/reload
    // so the 10s profile cooldown cannot expire mid-test.
    const rename = await page.request.put('/api/leaderboard', {
      data: { handle: uniqueHandle('E2R') },
    });
    expect(rename.status()).toBe(429);
    const coolBody = (await rename.json()) as { error?: string };
    assertNoShame(coolBody.error || '');

    // Screenshots while self row is still visible.
    await page.screenshot({
      path: path.join(EVIDENCE_DIR, 'leaderboard-desktop.png'),
      fullPage: false,
    });
    await assertNoHorizontalOverflow(page, 'desktop leaderboard');

    await page.setViewportSize({ width: 390, height: 844 });
    const mobileSession = page.waitForResponse(
      (response) =>
        response.url().includes('/api/session') && response.request().method() === 'GET',
    );
    await page.reload();
    await mobileSession;
    await waitForBoardReady(page);
    await expect(page.getByTestId('leaderboard-row-self')).toBeVisible({ timeout: 15000 });
    await page.screenshot({
      path: path.join(EVIDENCE_DIR, 'leaderboard-mobile.png'),
      fullPage: false,
    });
    await assertNoHorizontalOverflow(page, 'mobile leaderboard');

    // Tab switch weekly ↔ all-time keeps positive copy (also exercises refetch).
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.getByTestId('leaderboard-tab-all-time').click();
    await expect(page.getByTestId('leaderboard-tone')).toBeVisible();
    assertNoShame(await page.getByTestId('leaderboard-tone').innerText());
    await page.getByTestId('leaderboard-tab-weekly').click();
    await expect(page.getByTestId('leaderboard-tone')).toBeVisible();
    await expect(page.getByTestId('leaderboard-row-self')).toBeVisible();

    // Leave is immediate for the board surface (soft opt-out).
    await page.getByTestId('leaderboard-leave').click();
    await expect(page.getByTestId('leaderboard-status')).toContainText(/Left the board/i, {
      timeout: 15000,
    });
    await expect(page.getByTestId('leaderboard-row-self')).toHaveCount(0);

    // Invalid handle via UI
    await page.getByTestId('leaderboard-handle-input').fill('bad@email.com');
    await page.getByTestId('leaderboard-optin').click();
    await expect(page.getByTestId('leaderboard-status')).toBeVisible({ timeout: 10000 });
    assertNoShame(await page.getByTestId('leaderboard-status').innerText());
  });
});
