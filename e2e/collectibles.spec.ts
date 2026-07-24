import { expect, test, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

/**
 * L-005 collectibles + map glow.
 * Ownership is server-confirmed completed only — no optimistic grant.
 */

const EVIDENCE_DIR = path.join(
  process.cwd(),
  'docs/missions/2026-07-20-vibe-code-quest-launch/evidence/L-005',
);

const PILOT = {
  url: '/map/git/commits-as-checkpoints?format=lesson',
  regionUrl: '/map/git',
  regionId: 'git',
  landmarkId: 'commits-as-checkpoints',
  collectibleName: /Checkpoint Coin/i,
  predictPick: /Everything it touched so far/,
  scenarioWrong: /Commit everything right now/,
  scenarioRight: /Stage, review the diff/,
  gotchaWrong: /A staged diff you already reviewed/,
  gotchaRight: /\.env\.local with your keys/,
  quizAnswer: /After one coherent change passes review and checks/,
};

const GLOW_KEY = 'ct-l005-glow-v1';

async function blockAiApis(page: Page) {
  await page.route('**/api/guide**', (route) => route.abort());
  await page.route('**/api/lesson**', (route) => route.abort());
}

async function gotoWithSession(page: Page, url: string) {
  const sessionResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/api/session') && response.request().method() === 'GET',
    { timeout: 15000 },
  );
  await page.goto(url);
  await sessionResponse.catch(() => {});
}

async function openPlayer(page: Page) {
  await gotoWithSession(page, PILOT.url);
  await expect(page.getByTestId('beat-player')).toBeVisible({ timeout: 15000 });
}

async function advance(page: Page) {
  await page.getByTestId('beat-advance').click();
}

async function choose(page: Page, label: RegExp | string) {
  await page.getByRole('button', { name: label }).click();
}

async function playThroughToRecap(page: Page) {
  await openPlayer(page);
  await advance(page); // hook
  await choose(page, PILOT.predictPick);
  await advance(page); // predict
  await page.getByRole('button', { name: /Show next card/ }).click();
  await advance(page); // reveal
  await choose(page, PILOT.scenarioWrong);
  await choose(page, PILOT.scenarioRight);
  await advance(page); // scenario
  await choose(page, PILOT.gotchaWrong);
  await choose(page, PILOT.gotchaRight);
  await advance(page); // gotcha
  await advance(page); // default
  await page.getByRole('radio', { name: PILOT.quizAnswer }).check();
  await page.getByRole('button', { name: 'Check answer' }).click();
  await expect(page.getByTestId('beat-player').getByRole('status')).toContainText(
    /Correct|Good call/i,
  );
  await advance(page); // check → recap
  await expect(page.getByTestId('beat-stamp')).toBeVisible();
}

async function waitForStampedProgress(page: Page) {
  await expect
    .poll(
      async () => {
        const response = await page.request.get('/api/progress');
        if (!response.ok()) return false;
        const body = (await response.json()) as {
          items?: Array<{ region: string; landmark: string; state?: { completed?: boolean } }>;
        };
        return Boolean(
          body.items?.some(
            (item) =>
              item.region === PILOT.regionId &&
              item.landmark === PILOT.landmarkId &&
              item.state?.completed === true,
          ),
        );
      },
      { timeout: 10000 },
    )
    .toBe(true);
}

async function assertNoHorizontalOverflow(page: Page, scope: string) {
  const report = await page.evaluate(() => {
    const doc = document.documentElement;
    const body = document.body;
    return {
      viewportW: window.innerWidth,
      scrollW: Math.max(doc.scrollWidth, body.scrollWidth),
    };
  });
  expect(report.scrollW > report.viewportW + 1, `${scope}: page overflow`).toBe(false);
}

function stampedCard(page: Page) {
  return page.locator(
    `[data-testid="landmark-stamped"][data-landmark-id="${PILOT.landmarkId}"]`,
  );
}

test.describe('L-005 collectibles + map glow', () => {
  test.beforeAll(async () => {
    await mkdir(EVIDENCE_DIR, { recursive: true });
  });

  test('no optimistic grant; shelf + one-shot glow after server confirm', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await blockAiApis(page);
    await playThroughToRecap(page);

    // Adversarial terminal-PUT proof:
    // 1) wait until the completed PUT actually hits the blocked handler
    // 2) assert no optimistic collectible while that request is held
    // 3) release, await the successful response, then assert ownership lands
    let release!: () => void;
    let released = false;
    const releaseGate = new Promise<void>((resolve) => {
      release = () => {
        if (released) return;
        released = true;
        resolve();
      };
    });
    let markTerminalSeen!: () => void;
    let terminalSeenFlag = false;
    const terminalSeen = new Promise<void>((resolve) => {
      markTerminalSeen = () => {
        if (terminalSeenFlag) return;
        terminalSeenFlag = true;
        resolve();
      };
    });

    await page.route('**/api/progress', async (route) => {
      if (route.request().method() !== 'PUT') {
        await route.continue();
        return;
      }
      // Hold only the terminal completed write so earlier beat PUTs still land.
      let body: { state?: { completed?: boolean } } = {};
      try {
        body = route.request().postDataJSON() as { state?: { completed?: boolean } };
      } catch {
        body = {};
      }
      if (body?.state?.completed === true) {
        markTerminalSeen();
        await releaseGate;
      }
      await route.continue();
    });

    try {
      const completedPutResponse = page.waitForResponse((response) => {
        if (!response.url().includes('/api/progress')) return false;
        if (response.request().method() !== 'PUT') return false;
        if (!response.ok()) return false;
        try {
          const body = response.request().postDataJSON() as {
            state?: { completed?: boolean };
          };
          return body?.state?.completed === true;
        } catch {
          return false;
        }
      }, { timeout: 15000 });
      await page.getByTestId('beat-stamp').click();
      await expect(page.getByTestId('beat-stamp-panel')).toBeVisible({ timeout: 15000 });
      // Prove the completed PUT reached the blocked handler before release.
      await Promise.race([
        terminalSeen,
        page.waitForTimeout(8000).then(() => {
          throw new Error('timed out waiting for completed PUT to hit the blocked handler');
        }),
      ]);
      // Optimistic local stamp is fine; collectible ownership is not.
      await expect(page.getByTestId('collectible-grant')).toHaveCount(0);
      // Fresh stamp gesture animates; resume path stays static.
      await expect(page.locator('[data-stamp-animate="true"]')).toBeVisible();
      release(); // let the completed PUT land
      const putRes = await completedPutResponse;
      const putBody = (await putRes.json()) as { state?: { completed?: boolean } };
      expect(putBody.state?.completed).toBe(true);
    } finally {
      release(); // idempotent if already called
      await page.unroute('**/api/progress');
    }

    await expect(page.getByTestId('collectible-grant')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('collectible-grant')).toContainText(PILOT.collectibleName);
    await expect(page.getByTestId('collectible-grant')).toHaveAttribute('role', 'status');
    await waitForStampedProgress(page);

    const progressResponse = page.waitForResponse(
      (response) =>
        response.url().includes('/api/progress') && response.request().method() === 'GET',
      { timeout: 15000 },
    );
    await page.getByTestId('beat-back-map').click();
    await expect(page).toHaveURL(/\/map\/git\/?$/);
    await progressResponse.catch(() => {});
    await expect(page.getByTestId('collection-shelf')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('collectible-earned')).toHaveCount(1);
    await expect(page.getByTestId('collectible-open')).toHaveCount(5);
    await expect(page.getByTestId('collectible-earned')).toContainText(PILOT.collectibleName);

    const stamped = stampedCard(page);
    await expect(stamped).toBeVisible();
    await expect(stamped).toContainText(/Stamped/i);
    await expect(stamped).toContainText(PILOT.collectibleName);
    await expect(stamped).toHaveClass(/is-fresh-glow/);

    const glow = await stamped.evaluate((el) => {
      const cs = getComputedStyle(el);
      return {
        name: cs.animationName,
        durationMs: parseFloat(cs.animationDuration) * 1000,
        iteration: cs.animationIterationCount,
        timing: cs.animationTimingFunction,
      };
    });
    // CSS Modules may hash keyframe names; assert non-none + timing contract.
    expect(glow.name).not.toBe('none');
    expect(glow.name.length).toBeGreaterThan(0);
    expect(Math.abs(glow.durationMs - 1200)).toBeLessThan(1);
    expect(String(glow.iteration)).toBe('3');
    expect(glow.timing).toMatch(/ease-in-out/i);

    await page.screenshot({
      path: path.join(EVIDENCE_DIR, 'shelf-glow-desktop.png'),
      fullPage: false,
    });
    await assertNoHorizontalOverflow(page, 'desktop region overview');

    // Reload: ownership stays, glow does not replay.
    const reloadProgress = page.waitForResponse(
      (response) =>
        response.url().includes('/api/progress') && response.request().method() === 'GET',
      { timeout: 15000 },
    );
    await page.reload();
    await reloadProgress.catch(() => {});
    await expect(page.getByTestId('collection-shelf')).toBeVisible({ timeout: 15000 });
    const stampedAfter = stampedCard(page);
    await expect(stampedAfter).toBeVisible();
    await expect(stampedAfter).toHaveClass(/is-settled/);
    await expect(stampedAfter).not.toHaveClass(/is-fresh-glow/);
    const settledAnim = await stampedAfter.evaluate((el) => getComputedStyle(el).animationName);
    expect(settledAnim).toBe('none');

    // Resume of completed lesson: collectible static, stamp not animated, no live status.
    await gotoWithSession(page, PILOT.url);
    await expect(page.getByTestId('beat-stamp-panel')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('collectible-grant')).toBeVisible();
    await expect(page.getByTestId('collectible-grant')).toContainText(PILOT.collectibleName);
    await expect(page.getByTestId('collectible-grant')).not.toHaveAttribute('role', 'status');
    await expect(page.locator('[data-stamp-animate="false"]')).toBeVisible();
    await expect(page.locator('[data-stamp-animate="true"]')).toHaveCount(0);

    // Reduced-motion: seed a fresh marker, then navigate to region overview
    // (glow is consumed only there) and assert animation is none while labels stay.
    await page.evaluate(
      ({ key, regionId, landmarkId }) => {
        window.sessionStorage.setItem(
          key,
          JSON.stringify([{ regionId, landmarkId, at: Date.now() }]),
        );
      },
      { key: GLOW_KEY, regionId: PILOT.regionId, landmarkId: PILOT.landmarkId },
    );
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const reducedProgress = page.waitForResponse(
      (response) =>
        response.url().includes('/api/progress') && response.request().method() === 'GET',
      { timeout: 15000 },
    );
    await gotoWithSession(page, PILOT.regionUrl);
    await reducedProgress.catch(() => {});
    await expect(page.getByTestId('collection-shelf')).toBeVisible({ timeout: 15000 });
    const reducedCard = stampedCard(page);
    await expect(reducedCard).toBeVisible({ timeout: 15000 });
    await expect(reducedCard).toContainText(/Stamped/i);
    await expect(reducedCard).toContainText(PILOT.collectibleName);
    const reducedAnim = await reducedCard.evaluate((el) => getComputedStyle(el).animationName);
    expect(reducedAnim).toBe('none');

    // Mobile overflow on shelf + cards.
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.setViewportSize({ width: 390, height: 844 });
    const mobileProgress = page.waitForResponse(
      (response) =>
        response.url().includes('/api/progress') && response.request().method() === 'GET',
      { timeout: 15000 },
    );
    await gotoWithSession(page, PILOT.regionUrl);
    await mobileProgress.catch(() => {});
    await expect(page.getByTestId('collection-shelf')).toBeVisible({ timeout: 15000 });
    await page.screenshot({
      path: path.join(EVIDENCE_DIR, 'shelf-glow-mobile.png'),
      fullPage: false,
    });
    await assertNoHorizontalOverflow(page, 'mobile region overview');
  });

  test('failed completed PUT never grants collectible', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await blockAiApis(page);
    await playThroughToRecap(page);

    await page.route('**/api/progress', async (route) => {
      if (route.request().method() !== 'PUT') {
        await route.continue();
        return;
      }
      let body: { state?: { completed?: boolean } } = {};
      try {
        body = route.request().postDataJSON() as { state?: { completed?: boolean } };
      } catch {
        body = {};
      }
      if (body?.state?.completed === true) {
        await route.abort();
        return;
      }
      await route.continue();
    });

    try {
      await page.getByTestId('beat-stamp').click();
      await expect(page.getByTestId('beat-stamp-panel')).toBeVisible({ timeout: 15000 });
      await page.waitForTimeout(500);
      await expect(page.getByTestId('collectible-grant')).toHaveCount(0);
    } finally {
      await page.unroute('**/api/progress');
    }
  });
});
