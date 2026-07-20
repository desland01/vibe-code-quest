import { expect, test, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const PILOT = '/map/git/commits-as-checkpoints?format=lesson';
const EVIDENCE = path.join(
  process.cwd(),
  'docs/missions/2026-07-19-code-tutor-engagement-v2/evidence/E-003',
);

function analyticsLines(page: Page): string[] {
  const lines: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'debug' && message.text().includes('[analytics]')) {
      lines.push(message.text());
    }
  });
  return lines;
}

function playerStatus(page: Page) {
  return page.getByTestId('beat-player').getByRole('status');
}

async function blockAiApis(page: Page) {
  await page.route('**/api/guide**', (route) => route.abort());
  await page.route('**/api/lesson**', (route) => route.abort());
}

async function openPlayer(page: Page) {
  await page.goto(PILOT);
  await page.waitForResponse((r) => r.url().includes('/api/session'), { timeout: 15000 }).catch(() => {});
  const player = page.getByTestId('beat-player');
  await expect(player).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole('button', { name: 'Play' })).toHaveAttribute('aria-current', 'true');
  return player;
}

async function advance(page: Page) {
  await page.getByTestId('beat-advance').click();
}

async function choose(page: Page, label: RegExp | string) {
  await page.getByRole('button', { name: label }).click();
}

async function playThroughToStamp(page: Page, { capture = false }: { capture?: boolean } = {}) {
  await openPlayer(page);

  // 0 hook
  await expect(page.locator('[data-beat-type="hook"]')).toBeVisible();
  await advance(page);

  // 1 predict — any pick resolves
  await expect(page.locator('[data-beat-type="predict"]')).toBeVisible();
  if (capture) {
    await page.screenshot({ path: path.join(EVIDENCE, 'predict-desktop.png'), fullPage: false });
  }
  await choose(page, /Everything it touched so far/);
  await expect(playerStatus(page)).toBeVisible();
  await advance(page);

  // 2 reveal — two cards
  await expect(page.locator('[data-beat-type="reveal"]')).toBeVisible();
  await page.getByRole('button', { name: /Show next card/ }).click();
  await advance(page);

  // 3 scenario — wrong then right
  await expect(page.locator('[data-beat-type="scenario"]')).toBeVisible();
  if (capture) {
    await page.screenshot({ path: path.join(EVIDENCE, 'scenario-desktop.png'), fullPage: false });
  }
  await choose(page, /Commit everything right now/);
  await expect(playerStatus(page)).toContainText(/Not quite|sweep|Review/i);
  await expect(page.getByTestId('beat-advance')).toHaveCount(0);
  await choose(page, /Stage, review the diff/);
  await expect(playerStatus(page)).toContainText(/Right|Good call|Review/i);
  await advance(page);

  // 4 gotcha — wrong then right
  await expect(page.locator('[data-beat-type="gotcha"]')).toBeVisible();
  await choose(page, /A staged diff you already reviewed/);
  await expect(playerStatus(page)).toBeVisible();
  await choose(page, /\.env\.local with your keys/);
  await advance(page);

  // 5 default
  await expect(page.locator('[data-beat-type="default"]')).toBeVisible();
  await advance(page);

  // 6 check — radio + grade
  await expect(page.locator('[data-beat-type="check"]')).toBeVisible();
  await page.getByRole('radio', { name: /After one coherent change passes review and checks/ }).check();
  await page.getByRole('button', { name: 'Check answer' }).click();
  await expect(playerStatus(page)).toContainText(/Correct|Good call/i);
  await advance(page);

  // 7 recap → stamp
  await expect(page.locator('[data-beat-type="recap"]')).toBeVisible();
  await page.getByTestId('beat-stamp').click();
  await expect(page.getByTestId('beat-stamp-panel')).toBeVisible();
  // stamp button is gone after completion (idempotent path is resume, not re-click)
  await expect(page.getByTestId('beat-stamp')).toHaveCount(0);
  if (capture) {
    await page.screenshot({ path: path.join(EVIDENCE, 'stamp-desktop.png'), fullPage: false });
  }
}

async function waitForStampedProgress(page: Page) {
  await expect.poll(async () => {
    const response = await page.request.get('/api/progress');
    if (!response.ok()) return false;
    const body = (await response.json()) as {
      items?: Array<{ region: string; landmark: string; state?: { completed?: boolean } }>;
    };
    return Boolean(
      body.items?.some(
        (item) =>
          item.region === 'git'
          && item.landmark === 'commits-as-checkpoints'
          && item.state?.completed === true,
      ),
    );
  }, { timeout: 10000 }).toBe(true);
}

test.describe('engagement-v2 BeatPlayer (E-003/E-004)', () => {
  test.beforeAll(async () => {
    await mkdir(EVIDENCE, { recursive: true });
  });

  test('full pilot loop stamps with guide/lesson APIs blocked', async ({ page }) => {
    const messages = analyticsLines(page);
    await blockAiApis(page);
    await playThroughToStamp(page, { capture: true });

    await expect(page.getByTestId('beat-next-landmark')).toBeVisible();
    await expect(page.getByTestId('beat-back-map')).toBeVisible();
    // E-004 region pips on stamp panel (accessible label covers the count)
    await expect(page.getByLabel(/1 of 6 landmarks stamped/)).toBeVisible();

    const joined = messages.join('\n');
    expect(joined).toMatch(/beat_started/);
    expect(joined).toMatch(/beat_completed/);
    expect(joined).toMatch(/quiz_completed/);
    expect(joined).toMatch(/landmark_stamped/);
    expect(joined).not.toMatch(/email|token|profileId|userId|sourceUserId/i);

    // stamp fires exactly once; resume must not re-fire
    expect(messages.filter((line) => line.includes('landmark_stamped')).length).toBe(1);
    await page.reload();
    await expect(page.getByTestId('beat-stamp-panel')).toBeVisible();
    await page.waitForTimeout(300);
    expect(messages.filter((line) => line.includes('landmark_stamped')).length).toBe(1);
  });

  test('resume mid-lesson restores furthest beat from localStorage', async ({ page }) => {
    const messages = analyticsLines(page);
    await blockAiApis(page);
    // Also block progress so resume is pure localStorage.
    await page.route('**/api/progress**', (route) => route.abort());

    await openPlayer(page);
    await advance(page); // hook → predict
    await choose(page, /One reviewed change that passes its checks/);
    await advance(page); // predict → reveal
    await expect(page.locator('[data-beat-id="reveal-definition"]')).toBeVisible();
    await expect(page.getByLabel(/Beat 3 of 8/)).toBeVisible();

    await page.reload();
    await expect(page.getByTestId('beat-player')).toBeVisible();
    await expect(page.locator('[data-beat-id="reveal-definition"]')).toBeVisible();
    await expect(page.getByLabel(/Beat 3 of 8/)).toBeVisible();
    await expect.poll(() => messages.some((line) => line.includes('resume_succeeded'))).toBe(true);
  });

  test('next-landmark offer and clean stop both work', async ({ page }) => {
    const messages = analyticsLines(page);
    await blockAiApis(page);
    await playThroughToStamp(page);

    await page.getByTestId('beat-next-landmark').click();
    await expect(page).toHaveURL(/\/map\/git\/branches-as-isolation\?format=lesson/, { timeout: 15000 });
    await expect.poll(() => messages.some((line) => line.includes('next_landmark_accepted'))).toBe(true);
    expect(messages.filter((line) => line.includes('next_landmark_accepted')).length).toBe(1);

    // clean stop: resume completed pilot → stamp panel → back to map
    await page.goto(PILOT);
    await page.waitForResponse((r) => r.url().includes('/api/session'), { timeout: 15000 }).catch(() => {});
    await expect(page.getByTestId('beat-stamp-panel')).toBeVisible({ timeout: 15000 });
    await page.getByTestId('beat-back-map').click();
    await expect(page).toHaveURL(/\/map\/git$/, { timeout: 15000 });
  });

  test('keyboard path reaches stamp (focus + Enter/Space)', async ({ page }) => {
    await blockAiApis(page);
    await openPlayer(page);

    async function focusAndPress(locator: ReturnType<Page['locator']>, key = 'Enter') {
      await locator.focus();
      await expect(locator).toBeFocused();
      await page.keyboard.press(key);
    }

    // Deterministic focus (a11y-spec style) + Enter/Space activation.
    await expect(page.locator('[data-beat-type="hook"]')).toBeVisible();
    await focusAndPress(page.getByTestId('beat-advance')); // → predict
    await expect(page.locator('[data-beat-type="predict"]')).toBeVisible();

    // Arrow-key option nav, then Enter to pick
    const firstChoice = page.locator('[data-option-id]').first();
    await firstChoice.focus();
    await expect(firstChoice).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(playerStatus(page)).toBeVisible();
    await focusAndPress(page.getByTestId('beat-advance')); // → reveal
    await expect(page.locator('[data-beat-type="reveal"]')).toBeVisible();

    await focusAndPress(page.getByRole('button', { name: /Show next card/ }));
    await focusAndPress(page.getByTestId('beat-advance')); // → scenario
    await expect(page.locator('[data-beat-type="scenario"]')).toBeVisible();

    await focusAndPress(page.getByRole('button', { name: /Stage, review the diff/ }));
    await focusAndPress(page.getByTestId('beat-advance'));
    await expect(page.locator('[data-beat-type="gotcha"]')).toBeVisible();

    await focusAndPress(page.getByRole('button', { name: /\.env\.local with your keys/ }));
    await focusAndPress(page.getByTestId('beat-advance'));
    await expect(page.locator('[data-beat-type="default"]')).toBeVisible();

    await focusAndPress(page.getByTestId('beat-advance')); // default → check
    await expect(page.locator('[data-beat-type="check"]')).toBeVisible();

    const quizRadio = page.getByRole('radio', { name: /After one coherent change passes review and checks/ });
    await focusAndPress(quizRadio, 'Space');
    await focusAndPress(page.getByRole('button', { name: 'Check answer' }));
    await expect(playerStatus(page)).toContainText(/Correct|Good call/i);
    await focusAndPress(page.getByTestId('beat-advance')); // → recap
    await expect(page.locator('[data-beat-type="recap"]')).toBeVisible();

    await focusAndPress(page.getByTestId('beat-stamp'));
    await expect(page.getByTestId('beat-stamp-panel')).toBeVisible();
  });

  test('reduced-motion disables beat enter animation', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await blockAiApis(page);
    await openPlayer(page);
    const card = page.locator('[data-beat-type="hook"]');
    await expect(card).toBeVisible();
    await expect(card).toHaveCSS('animation-name', 'none');
  });

  test('mobile viewport playthrough reaches stamp', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await blockAiApis(page);
    await playThroughToStamp(page);
    await page.screenshot({ path: path.join(EVIDENCE, 'stamp-mobile.png'), fullPage: false });
    await expect(page.getByTestId('beat-stamp-panel')).toBeVisible();
  });

  test('status announces once and focus moves on advance', async ({ page }) => {
    await blockAiApis(page);
    await openPlayer(page);
    await advance(page); // → predict
    await choose(page, /Wait and batch more changes first/);
    await expect(page.getByTestId('beat-player').locator('[role="status"]')).toHaveCount(1);
    await advance(page); // → reveal
    await expect.poll(async () =>
      page.evaluate(() => document.activeElement?.getAttribute('data-beat-type') ?? ''),
    ).toBe('reveal');
  });

  test('share snapshot counts stamped landmark after progress write', async ({ page }) => {
    await blockAiApis(page);
    await playThroughToStamp(page);
    await waitForStampedProgress(page);

    const created = await page.request.post('/api/share', { data: { action: 'create' } });
    expect(created.ok()).toBeTruthy();
    const body = (await created.json()) as { token: string; url: string };
    expect(body.url).toMatch(/\/s\//);

    const publicPage = await page.context().newPage();
    await publicPage.goto(body.url);
    await expect(publicPage.getByRole('heading', { name: /landmarks explored/i })).toBeVisible({ timeout: 15000 });
    await expect(publicPage.getByText(/Git/i)).toBeVisible();
    await expect(publicPage.getByText(/1\s*(of|\/)\s*6/i)).toBeVisible();
    await publicPage.close();
  });
});
