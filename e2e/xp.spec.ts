import { expect, test, type APIRequestContext, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

/**
 * L-003 competence XP — API accumulation + HUD.
 * Formula: scenario 15 + gotcha 15 + check 20 + stamp 50 = 100.
 * Predict never awards. Replay/stale writes add 0.
 */

const EVIDENCE_DIR = path.join(
  process.cwd(),
  'docs/missions/2026-07-20-vibe-code-quest-launch/evidence/L-003',
);

const REGION = 'git';
const LANDMARK = 'commits-as-checkpoints';

// Pilot grammar indices (locked by xp.test.ts + current 8-beat factory):
// 0 hook, 1 predict, 2 reveal, 3 scenario, 4 gotcha, 5 default, 6 check, 7 recap
function beatState(overrides: {
  furthestBeatIndex?: number;
  checked?: boolean;
  completed?: boolean;
  stampedAt?: string | null;
} = {}) {
  return {
    v: 1 as const,
    kind: 'beat-sequence' as const,
    furthestBeatIndex: overrides.furthestBeatIndex ?? 0,
    checked: overrides.checked ?? false,
    completed: overrides.completed ?? false,
    stampedAt: overrides.stampedAt ?? null,
  };
}

async function putProgress(
  request: APIRequestContext,
  state: ReturnType<typeof beatState>,
) {
  const response = await request.put('/api/progress', {
    data: { region: REGION, landmark: LANDMARK, state },
  });
  expect(response.status()).toBe(200);
  return response.json() as Promise<{
    region: string;
    landmark: string;
    state: Record<string, unknown>;
    xp: {
      total: number;
      newPoints: number;
      awarded: Array<{ awardKey: string; points: number }>;
    };
  }>;
}

async function getProgress(request: APIRequestContext) {
  const response = await request.get('/api/progress');
  expect(response.status()).toBe(200);
  return response.json() as Promise<{
    items: Array<{ region: string; landmark: string; state: Record<string, unknown> }>;
    xp: { total: number };
  }>;
}

async function gotoWithSession(page: Page, url: string) {
  const sessionResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/api/session') && response.request().method() === 'GET',
  );
  await page.goto(url);
  await sessionResponse;
}

async function assertNoHorizontalOverflow(page: Page, scope: string) {
  const report = await page.evaluate(() => {
    const doc = document.documentElement;
    const body = document.body;
    const viewportW = window.innerWidth;
    const scrollW = Math.max(doc.scrollWidth, body.scrollWidth);
    const hud = document.querySelector('[data-testid="xp-hud"]') as HTMLElement | null;
    const hudRect = hud?.getBoundingClientRect();
    const hudOutside = hudRect
      ? hudRect.left < -1 || hudRect.right > viewportW + 1
      : false;
    return {
      viewportW,
      scrollW,
      pageOverflow: scrollW > viewportW + 1,
      hudOutside,
      hudWidth: hudRect ? Math.round(hudRect.width) : null,
    };
  });
  expect(report.pageOverflow, `${scope}: page overflow`).toBe(false);
  expect(report.hudOutside, `${scope}: xp-hud outside viewport`).toBe(false);
}

test.describe('L-003 competence XP', () => {
  test.beforeAll(async () => {
    await mkdir(EVIDENCE_DIR, { recursive: true });
  });

  test('API awards accumulate to 100; replay is zero; HUD shows server total', async ({
    page,
    context,
  }) => {
    const messages: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'debug' && message.text().includes('[analytics]')) {
        messages.push(message.text());
      }
    });

    // Establish anonymous session (same cookie jar for page + request).
    await gotoWithSession(page, '/');
    const cookie = (await context.cookies()).find((c) => c.name === 'ct_session');
    expect(cookie?.httpOnly).toBe(true);

    // Fresh total
    let progress = await getProgress(page.request);
    expect(progress.xp.total).toBe(0);

    // Cross scenario frontier (index 3 → furthest 4)
    let put = await putProgress(page.request, beatState({ furthestBeatIndex: 4 }));
    expect(put.xp.newPoints).toBe(15);
    expect(put.xp.total).toBe(15);
    expect(put.xp.awarded.map((a) => a.awardKey)).toEqual(['scenario_solved']);

    // Replay identical write — zero new awards
    put = await putProgress(page.request, beatState({ furthestBeatIndex: 4 }));
    expect(put.xp.newPoints).toBe(0);
    expect(put.xp.total).toBe(15);
    expect(put.xp.awarded).toEqual([]);

    // Stale lower index absorbed — still zero new
    put = await putProgress(page.request, beatState({ furthestBeatIndex: 2 }));
    expect(put.xp.newPoints).toBe(0);
    expect(put.xp.total).toBe(15);

    // Cross gotcha frontier (index 4 → furthest 5)
    put = await putProgress(page.request, beatState({ furthestBeatIndex: 5 }));
    expect(put.xp.newPoints).toBe(15);
    expect(put.xp.total).toBe(30);
    expect(put.xp.awarded.map((a) => a.awardKey)).toEqual(['gotcha_solved']);

    // Check passed
    put = await putProgress(
      page.request,
      beatState({ furthestBeatIndex: 6, checked: true }),
    );
    expect(put.xp.newPoints).toBe(20);
    expect(put.xp.total).toBe(50);
    expect(put.xp.awarded.map((a) => a.awardKey)).toEqual(['check_passed']);

    // Stamp
    put = await putProgress(
      page.request,
      beatState({
        furthestBeatIndex: 7,
        checked: true,
        completed: true,
        stampedAt: '2026-07-21T12:00:00.000Z',
      }),
    );
    expect(put.xp.newPoints).toBe(50);
    expect(put.xp.total).toBe(100);
    expect(put.xp.awarded.map((a) => a.awardKey)).toEqual(['landmark_stamped']);

    // Full stamp replay — zero
    put = await putProgress(
      page.request,
      beatState({
        furthestBeatIndex: 7,
        checked: true,
        completed: true,
        stampedAt: '2026-07-21T12:00:00.000Z',
      }),
    );
    expect(put.xp.newPoints).toBe(0);
    expect(put.xp.total).toBe(100);

    // Legacy non-beat write: no awards, total unchanged, xp present
    const legacy = await page.request.put('/api/progress', {
      data: {
        region: 'foundations',
        landmark: 'prompting',
        state: { complete: true },
      },
    });
    expect(legacy.status()).toBe(200);
    const legacyBody = (await legacy.json()) as {
      region: string;
      landmark: string;
      state: Record<string, unknown>;
      xp: { total: number; newPoints: number; awarded: unknown[] };
    };
    expect(legacyBody.region).toBe('foundations');
    expect(legacyBody.landmark).toBe('prompting');
    expect(legacyBody.state).toMatchObject({ complete: true });
    expect(legacyBody.xp.total).toBe(100);
    expect(legacyBody.xp.newPoints).toBe(0);
    expect(legacyBody.xp.awarded).toEqual([]);

    progress = await getProgress(page.request);
    expect(progress.xp.total).toBe(100);

    // HUD on map home
    await gotoWithSession(page, '/map');
    const hud = page.getByTestId('xp-hud');
    await expect(hud).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('xp-hud-total')).toHaveText('100');
    await expect(hud).toHaveAttribute('aria-label', '100 experience points');

    await page.screenshot({
      path: path.join(EVIDENCE_DIR, 'xp-hud-desktop.png'),
      fullPage: false,
    });
    await assertNoHorizontalOverflow(page, 'desktop xp-hud');

    // Mobile geometry
    await page.setViewportSize({ width: 390, height: 844 });
    const reloadSession = page.waitForResponse(
      (response) =>
        response.url().includes('/api/session') && response.request().method() === 'GET',
    );
    await page.reload();
    await reloadSession;
    await expect(page.getByTestId('xp-hud-total')).toHaveText('100', { timeout: 15000 });
    await page.screenshot({
      path: path.join(EVIDENCE_DIR, 'xp-hud-mobile.png'),
      fullPage: false,
    });
    await assertNoHorizontalOverflow(page, 'mobile xp-hud');

    // BeatPlayer path: resume already-stamped pilot should not re-fire xp_awarded
    // (newPoints=0). Open Play tab and confirm no xp_awarded on resume load alone.
    const before = messages.filter((m) => m.includes('xp_awarded')).length;
    await gotoWithSession(page, `/map/${REGION}/${LANDMARK}?format=lesson`);
    await expect(page.getByTestId('beat-player')).toBeVisible({ timeout: 15000 });
    // Give any deferred progress PUT a moment
    await page.waitForTimeout(500);
    const after = messages.filter((m) => m.includes('xp_awarded')).length;
    expect(after).toBe(before);
    expect(messages.join('\n')).not.toMatch(/email|token|profileId|userId|sourceUserId/i);
  });

  test('xp_awarded fires only when server reports newPoints > 0 during live play', async ({
    page,
  }) => {
    const messages: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'debug' && message.text().includes('[analytics]')) {
        messages.push(message.text());
      }
    });

    // Fresh session via new context cookie isolation is automatic per test.
    await gotoWithSession(page, '/');

    // Seed just before scenario solve so one frontier advance earns XP via BeatPlayer PUT.
    // Use request API to set furthest=3 (on scenario, not past it), then play through scenario
    // in the UI so the PUT response path emits xp_awarded.
    const seed = await page.request.put('/api/progress', {
      data: {
        region: REGION,
        landmark: LANDMARK,
        state: beatState({ furthestBeatIndex: 3 }),
      },
    });
    expect(seed.status()).toBe(200);
    const seedBody = (await seed.json()) as { xp: { total: number; newPoints: number } };
    // furthest=3 is ON scenario — no award yet
    expect(seedBody.xp.newPoints).toBe(0);
    expect(seedBody.xp.total).toBe(0);

    await gotoWithSession(page, `/map/${REGION}/${LANDMARK}?format=lesson`);
    await expect(page.getByTestId('beat-player')).toBeVisible({ timeout: 15000 });

    // Resume lands at furthest=3 (scenario). Solve scenario correctly and advance.
    await expect(page.locator('[data-beat-type="scenario"]')).toBeVisible({ timeout: 10000 });
    // Pilot correct option
    await page.getByRole('button', { name: /Stage, review the diff/ }).click();
    await expect(page.getByTestId('beat-player').getByRole('status')).toBeVisible();
    await page.getByTestId('beat-advance').click();

    // Wait for progress PUT + xp_awarded console event
    await expect
      .poll(() => messages.some((m) => m.includes('xp_awarded')), { timeout: 10000 })
      .toBe(true);

    const xpLines = messages.filter((m) => m.includes('xp_awarded'));
    expect(xpLines.length).toBeGreaterThanOrEqual(1);
    expect(xpLines.join('\n')).toMatch(/"points":15/);
    expect(xpLines.join('\n')).not.toMatch(/email|token|profileId|userId/i);

    // HUD reflects server total after navigation home
    await gotoWithSession(page, '/map');
    await expect(page.getByTestId('xp-hud-total')).toHaveText('15', { timeout: 15000 });
  });
});
