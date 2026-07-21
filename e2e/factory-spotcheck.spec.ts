import { expect, test, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

import { getBeatSequence } from '../src/content/beats/index.ts';
import { landmarkRegistry } from '../src/content/index.ts';

/**
 * L-002 factory spot-check — one derived (or representative) landmark per region.
 * Driven from the live registry so correct-option slots can rotate without hardcoding A/B/C.
 * Hand-authored pilot/transfer are covered by beats.spec.ts; this file focuses the factory path.
 */

const EVIDENCE_DIR = path.join(
  process.cwd(),
  'docs/missions/2026-07-20-vibe-code-quest-launch/evidence/L-002',
);

type Spot = {
  regionId: string;
  landmarkId: string;
  /** Prefer factory-derived landmarks; pilot/transfer already covered elsewhere. */
};

const SPOTS: Spot[] = [
  { regionId: 'languages', landmarkId: 'python' },
  { regionId: 'databases', landmarkId: 'sql' },
  { regionId: 'infra', landmarkId: 'serverless-functions' },
  { regionId: 'ai-types', landmarkId: 'tool-use' },
  { regionId: 'pm-tools', landmarkId: 'issues-as-specs' },
  { regionId: 'git', landmarkId: 'branches-as-isolation' },
  { regionId: 'security', landmarkId: 'secrets-and-environment' },
  { regionId: 'design', landmarkId: 'design-tokens' },
];

async function blockAiApis(page: Page) {
  await page.route('**/api/guide**', (route) => route.abort());
  await page.route('**/api/lesson**', (route) => route.abort());
}

async function openPlayer(page: Page, regionId: string, landmarkId: string) {
  await page.goto(`/map/${regionId}/${landmarkId}?format=lesson`);
  await page.waitForResponse((r) => r.url().includes('/api/session'), { timeout: 15000 }).catch(() => {});
  const player = page.getByTestId('beat-player');
  await expect(player).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole('button', { name: 'Play' })).toHaveAttribute('aria-current', 'true');
  return player;
}

async function advance(page: Page) {
  await page.getByTestId('beat-advance').click();
}

async function chooseById(page: Page, optionId: string) {
  await page.locator(`[data-option-id="${optionId}"]`).click();
}

/** Mechanical rendered-layout proof (vision API credit-blocked; screenshots stay as human evidence). */
async function assertNoHorizontalOverflow(page: Page, scope: string) {
  const report = await page.evaluate(() => {
    const doc = document.documentElement;
    const body = document.body;
    const viewportW = window.innerWidth;
    const scrollW = Math.max(doc.scrollWidth, body.scrollWidth);
    const player = document.querySelector('[data-testid="beat-player"]') as HTMLElement | null;
    const choiceEls = Array.from(
      document.querySelectorAll<HTMLElement>('[data-option-id], [data-testid="beat-advance"], [data-testid="beat-stamp"], [data-testid="beat-next-landmark"], [data-testid="beat-back-map"]'),
    );
    const overflows = choiceEls
      .map((el) => {
        const r = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        const internal = el.scrollWidth > el.clientWidth + 1;
        const outside =
          r.left < -1 || r.right > viewportW + 1 || r.width > viewportW + 1;
        return {
          id: el.getAttribute('data-option-id') || el.getAttribute('data-testid') || el.tagName,
          left: Math.round(r.left),
          right: Math.round(r.right),
          width: Math.round(r.width),
          scrollWidth: el.scrollWidth,
          clientWidth: el.clientWidth,
          whiteSpace: style.whiteSpace,
          outside,
          internal,
        };
      })
      .filter((row) => row.outside || row.internal);
    return {
      viewportW,
      scrollW,
      pageOverflow: scrollW > viewportW + 1,
      playerWidth: player ? Math.round(player.getBoundingClientRect().width) : null,
      overflows,
    };
  });
  expect(report.pageOverflow, `${scope}: page horizontal overflow scrollW=${report.scrollW} viewportW=${report.viewportW}`).toBe(false);
  expect(report.overflows, `${scope}: control overflow ${JSON.stringify(report.overflows)}`).toEqual([]);
}

async function playFactoryLandmark(
  page: Page,
  regionId: string,
  landmarkId: string,
  {
    captureHookPath,
    captureScenarioPath,
    captureStampPath,
  }: {
    captureHookPath?: string;
    captureScenarioPath?: string;
    captureStampPath?: string;
  } = {},
) {
  const landmark = landmarkRegistry[regionId]!.find((entry) => entry.id === landmarkId);
  if (!landmark) throw new Error(`missing landmark ${regionId}/${landmarkId}`);
  const sequence = getBeatSequence(regionId, landmarkId);
  if (!sequence) throw new Error(`missing sequence ${regionId}/${landmarkId}`);
  expect(sequence.beats).toHaveLength(8);

  await openPlayer(page, regionId, landmarkId);

  // 0 hook
  await expect(page.locator('[data-beat-type="hook"]')).toBeVisible();
  await expect(page.getByTestId('beat-player')).toContainText(landmark.hook);
  if (captureHookPath) {
    await page.screenshot({ path: captureHookPath, fullPage: false });
  }
  await advance(page);

  // 1 predict — any pick resolves
  await expect(page.locator('[data-beat-type="predict"]')).toBeVisible();
  const predict = sequence.beats[1]!;
  if (!('options' in predict)) throw new Error('predict missing options');
  await chooseById(page, predict.options[0]!.id);
  await expect(page.getByTestId('beat-player').getByRole('status')).toBeVisible();
  await advance(page);

  // 2 reveal — show every card dynamically
  await expect(page.locator('[data-beat-type="reveal"]')).toBeVisible();
  const reveal = sequence.beats[2]!;
  if (reveal.type !== 'reveal') throw new Error('expected reveal');
  for (let i = 1; i < reveal.cards.length; i += 1) {
    await page.getByRole('button', { name: /Show next card/ }).click();
  }
  await advance(page);

  // 3 scenario — correct option only (highest visual risk: long default labels)
  await expect(page.locator('[data-beat-type="scenario"]')).toBeVisible();
  await assertNoHorizontalOverflow(page, `${regionId}/${landmarkId} scenario`);
  if (captureScenarioPath) {
    await page.screenshot({ path: captureScenarioPath, fullPage: false });
  }
  const scenario = sequence.beats[3]!;
  if (!('options' in scenario)) throw new Error('scenario missing options');
  await chooseById(page, scenario.correctOptionId);
  await expect(page.getByTestId('beat-player').getByRole('status')).toBeVisible();
  await advance(page);

  // 4 gotcha — correct option only
  await expect(page.locator('[data-beat-type="gotcha"]')).toBeVisible();
  const gotcha = sequence.beats[4]!;
  if (!('options' in gotcha)) throw new Error('gotcha missing options');
  await chooseById(page, gotcha.correctOptionId);
  await expect(page.getByTestId('beat-player').getByRole('status')).toBeVisible();
  await advance(page);

  // 5 default
  await expect(page.locator('[data-beat-type="default"]')).toBeVisible();
  await expect(page.getByTestId('beat-player')).toContainText(landmark.vibe_coder_default);
  await advance(page);

  // 6 check — canonical quiz answer
  await expect(page.locator('[data-beat-type="check"]')).toBeVisible();
  await page.getByRole('radio', { name: landmark.quiz.answer }).check();
  await page.getByRole('button', { name: 'Check answer' }).click();
  await expect(page.getByTestId('beat-player').getByRole('status')).toContainText(/Correct|Good call/i);
  await advance(page);

  // 7 recap → stamp
  await expect(page.locator('[data-beat-type="recap"]')).toBeVisible();
  await page.getByTestId('beat-stamp').click();
  await expect(page.getByTestId('beat-stamp-panel')).toBeVisible();
  await expect(page.getByTestId('beat-stamp')).toHaveCount(0);
  await assertNoHorizontalOverflow(page, `${regionId}/${landmarkId} stamp`);
  if (captureStampPath) {
    await page.screenshot({ path: captureStampPath, fullPage: false });
  }
}

test.describe('L-002 factory spot-check (one landmark per region)', () => {
  test.beforeAll(async () => {
    await mkdir(EVIDENCE_DIR, { recursive: true });
  });

  for (const spot of SPOTS) {
    test(`${spot.regionId}/${spot.landmarkId} reaches stamp (factory path)`, async ({ page }) => {
      await blockAiApis(page);
      const capture = spot.regionId === 'databases' || spot.regionId === 'git';
      await playFactoryLandmark(page, spot.regionId, spot.landmarkId, {
        captureHookPath: capture
          ? path.join(EVIDENCE_DIR, `${spot.regionId}-${spot.landmarkId}-hook-desktop.png`)
          : undefined,
        captureScenarioPath: capture
          ? path.join(EVIDENCE_DIR, `${spot.regionId}-${spot.landmarkId}-scenario-desktop.png`)
          : undefined,
        captureStampPath: capture
          ? path.join(EVIDENCE_DIR, `${spot.regionId}-${spot.landmarkId}-stamp-desktop.png`)
          : undefined,
      });
      // All SPOTS are non-terminal within their region (index 0–4 of 6).
      await expect(page.getByTestId('beat-next-landmark')).toBeVisible();
      await expect(page.getByTestId('beat-back-map')).toBeVisible();
    });
  }

  test('mobile viewport: databases/sql factory path reaches stamp', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await blockAiApis(page);
    // Single playthrough — do not re-open the landmark mid-test (resume would skip hook).
    await playFactoryLandmark(page, 'databases', 'sql', {
      captureScenarioPath: path.join(EVIDENCE_DIR, 'databases-sql-scenario-mobile.png'),
      captureStampPath: path.join(EVIDENCE_DIR, 'databases-sql-stamp-mobile.png'),
    });
    await expect(page.getByTestId('beat-stamp-panel')).toBeVisible();
  });
});
