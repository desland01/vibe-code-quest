#!/usr/bin/env node
/**
 * L-008 self-host (no-DB) probe.
 *
 * Drives a production server started WITHOUT DATABASE_URL and reports, per
 * surface, whether a self-hoster can actually play. Read-only: it asserts and
 * captures, it never edits the app.
 *
 * Start the target first, e.g.
 *   set -a; source .env.local; set +a
 *   DATABASE_URL="" ./node_modules/.bin/next start --port 3101
 *
 *   node docs/missions/2026-07-20-vibe-code-quest-launch/scripts/l008-nodb-probe.mjs
 */

import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

const BASE = process.env.NODB_BASE_URL ?? 'http://localhost:3101';
const OUT = path.join(
  process.cwd(),
  'docs/missions/2026-07-20-vibe-code-quest-launch/evidence/L-008'
);

const results = [];
function record(surface, verdict, detail) {
  results.push({ surface, verdict, detail });
  console.log(`  ${verdict.padEnd(5)} ${surface}${detail ? ` — ${detail}` : ''}`);
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  const failedRequests = [];
  page.on('response', (response) => {
    if (response.status() >= 500) failedRequests.push(`${response.status()} ${response.url()}`);
  });

  console.log(`\nno-DB probe against ${BASE}\n`);

  // 1. Landing + map render
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2_000);
  const h1 = await page.getByRole('heading', { level: 1 }).first().innerText();
  record('landing page renders', h1.trim() === 'Vibe Code Quest' ? 'PASS' : 'FAIL', `h1 "${h1.trim()}"`);

  const regionLinks = await page.getByRole('link', { name: /Languages|Databases/ }).count();
  record('region links present', regionLinks > 0 ? 'PASS' : 'FAIL', `${regionLinks} link(s)`);

  await page.screenshot({ path: path.join(OUT, 'nodb-landing.png') });

  // 2. Session endpoint
  const session = await page.request.get(`${BASE}/api/session`);
  record(
    'GET /api/session',
    session.ok() ? 'PASS' : 'FAIL',
    `HTTP ${session.status()}${session.ok() ? '' : ' — no anonymous session can be issued'}`
  );

  // 3. Progress endpoint
  const progress = await page.request.get(`${BASE}/api/progress`);
  record(
    'GET /api/progress',
    progress.status() === 401 || progress.ok() ? 'PASS' : 'FAIL',
    `HTTP ${progress.status()} (401 is acceptable: client falls back to localStorage)`
  );

  // 4. Leaderboard degrades rather than crashing
  await page.goto(`${BASE}/leaderboard`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1_500);
  const leaderboardBody = await page.locator('body').innerText();
  record(
    'leaderboard degrades gracefully',
    !/internal server error|application error/i.test(leaderboardBody) ? 'PASS' : 'FAIL'
  );
  await page.screenshot({ path: path.join(OUT, 'nodb-leaderboard.png') });

  // 5. The actual question: can a landmark be played to a stamp?
  // domcontentloaded, not networkidle: a broken /api/session retries and the
  // network never goes idle, which would mask the surfaces under test.
  await page.goto(`${BASE}/map/databases/sql?format=overview`, { waitUntil: 'domcontentloaded' });
  const overviewVisible = await page
    .getByText(/SQL databases store durable records/i)
    .first()
    .isVisible({ timeout: 10_000 })
    .catch(() => false);
  record('canonical landmark content readable', overviewVisible ? 'PASS' : 'FAIL');

  // FormatSwitcher renders the beat surface as a button labelled "Play".
  const playTab = page.getByRole('button', { name: 'Play' });
  const hasPlay = (await playTab.count()) > 0;
  record('Play surface reachable', hasPlay ? 'PASS' : 'FAIL');

  if (hasPlay) {
    await playTab.first().click();
    await page.waitForTimeout(1500);
    const beatVisible = await page
      .getByTestId('beat-player')
      .isVisible()
      .catch(() => false);
    record(
      'BeatPlayer mounts without a database',
      beatVisible ? 'PASS' : 'WARN',
      beatVisible ? '' : 'beat-player testid not visible; inspect the capture'
    );
    await page.screenshot({ path: path.join(OUT, 'nodb-landmark-play.png'), fullPage: false });
  }

  // 6. Noise budget — a self-hoster should not see a console full of 500s
  record(
    'no 5xx responses during the probe',
    failedRequests.length === 0 ? 'PASS' : 'FAIL',
    failedRequests.slice(0, 4).join(' | ')
  );
  record(
    'console error budget',
    consoleErrors.length === 0 ? 'PASS' : 'WARN',
    `${consoleErrors.length} console error(s): ${consoleErrors.slice(0, 2).join(' | ')}`
  );

  await context.close();
  await browser.close();

  const failed = results.filter((r) => r.verdict === 'FAIL');
  const warned = results.filter((r) => r.verdict === 'WARN');
  console.log(
    `\n${failed.length === 0 ? 'PASS' : 'FAIL'} — ${results.length - failed.length - warned.length} pass, ${warned.length} warn, ${failed.length} fail`
  );
  console.log(`captures in ${OUT}`);
  process.exit(failed.length === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
