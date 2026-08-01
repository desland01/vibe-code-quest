#!/usr/bin/env node
/**
 * L-010 production smoke.
 *
 * Drives the deployed URL at desktop and mobile and asserts the launch
 * criteria from evidence/L-010.md §4, including the G-8 live-guide criterion.
 *
 *   PROD_URL=https://… node docs/missions/2026-07-20-vibe-code-quest-launch/scripts/l010-prod-smoke.mjs
 *
 * Writes captures to evidence/L-010/. Exits non-zero if any criterion fails.
 * The leaderboard check opts in with an obvious throwaway handle and opts out
 * again at the end, so it leaves no lasting row on the public board.
 */

import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { chromium, devices } from '@playwright/test';

const BASE = process.env.PROD_URL;
if (!BASE) {
  console.error('PROD_URL is required');
  process.exit(2);
}
const OUT = path.join(
  process.cwd(),
  'docs/missions/2026-07-20-vibe-code-quest-launch/evidence/L-010'
);
const HANDLE = `smoke${String(process.env.SMOKE_TAG ?? '01')}`;

const results = [];
function check(name, ok, detail) {
  const verdict = ok === null ? 'WARN' : ok ? 'PASS' : 'FAIL';
  results.push({ name, verdict });
  console.log(`  ${verdict.padEnd(4)}  ${name}${detail ? ` — ${detail}` : ''}`);
}

async function run(label, viewport, isMobile) {
  console.log(`\n=== ${label} ===`);
  const browser = await chromium.launch();
  const context = await browser.newContext(
    isMobile ? devices['iPhone 13'] : { viewport }
  );
  const page = await context.newPage();

  // --- brand + shell -------------------------------------------------------
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);
  check(`${label} title carries the brand`, (await page.title()).includes('Vibe Code Quest by Truline'));
  check(
    `${label} h1 is Vibe Code Quest`,
    (await page.getByRole('heading', { level: 1 }).first().innerText()).trim() === 'Vibe Code Quest'
  );
  check(
    `${label} footer byline links truline.io`,
    (await page.getByTestId('site-byline').getByRole('link', { name: 'Truline' }).getAttribute('href')) ===
      'https://truline.io'
  );
  check(`${label} footer credits Constance`, await page.getByTestId('site-constance').isVisible());
  check(`${label} hosted mode (not self-host)`, (await page.getByTestId('local-mode-note').count()) === 0);
  check(`${label} XP HUD present`, (await page.getByTestId('quest-board-link').count()) > 0);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  check(`${label} no horizontal overflow`, overflow <= 0, `${overflow}px`);
  await page.screenshot({ path: path.join(OUT, `prod-map-${label}.png`) });

  // --- legal ---------------------------------------------------------------
  await page.goto(`${BASE}/legal/terms`, { waitUntil: 'domcontentloaded' });
  const legal = await page.locator('body').innerText();
  check(`${label} legal has no [BRACKET] placeholder`, !/\[[A-Z][A-Z ]+\]/.test(legal));
  check(`${label} legal has no legacy brand`, !/code-tutor/i.test(legal));
  check(`${label} legal dated 2026-07-28`, legal.includes('2026-07-28'));
  check(`${label} legal carries the not-legal-advice line`, /not legal advice/i.test(legal));
  check(`${label} legal names Florida + admin@truline.io`, /Florida/.test(legal) && /admin@truline\.io/.test(legal));
  await page.screenshot({ path: path.join(OUT, `prod-legal-${label}.png`) });

  // --- play a landmark to its stamp ---------------------------------------
  await page.goto(`${BASE}/map/databases/sql`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);
  const playButton = page.getByRole('button', { name: 'Play' });
  if (await playButton.count()) await playButton.first().click();
  await page.waitForTimeout(1200);
  check(`${label} BeatPlayer mounts`, await page.getByTestId('beat-player').isVisible().catch(() => false));

  let advanced = 0;
  for (let step = 0; step < 40; step += 1) {
    if (await page.getByTestId('beat-stamp-panel').isVisible().catch(() => false)) break;
    const stamp = page.getByTestId('beat-stamp');
    const advance = page.getByTestId('beat-advance');
    if (await stamp.isVisible().catch(() => false)) {
      await stamp.click();
    } else if (await advance.isVisible().catch(() => false)) {
      await advance.click();
    } else if (await page.getByRole('button', { name: /Show next card/ }).isVisible().catch(() => false)) {
      await page.getByRole('button', { name: /Show next card/ }).click();
    } else if (await page.getByRole('button', { name: 'Check answer' }).isVisible().catch(() => false)) {
      // quiz beat: pick the first radio, then check
      const radio = page.getByRole('radio').first();
      if (await radio.isVisible().catch(() => false)) await radio.check();
      await page.getByRole('button', { name: 'Check answer' }).click();
    } else {
      // choice beat: options carry data-option-id (see e2e/beats.spec.ts)
      const option = page.locator('[data-option-id]').first();
      if (await option.isVisible().catch(() => false)) await option.click();
      else break;
    }
    advanced += 1;
    await page.waitForTimeout(450);
  }
  const stamped = await page.getByTestId('beat-stamp-panel').isVisible().catch(() => false);
  check(`${label} landmark plays through to its stamp`, stamped, `${advanced} interactions`);
  await page.screenshot({ path: path.join(OUT, `prod-stamp-${label}.png`) });

  // --- G-8: a real guide turn ---------------------------------------------
  const guide = await page.request.post(`${BASE}/api/guide`, {
    data: {
      regionId: 'databases',
      landmarkId: 'sql',
      message: 'In one sentence, when should I reach for SQL instead of a spreadsheet?',
    },
  });
  const guideStatus = guide.status();
  const guideText = await guide.text();
  const guideBody = await Promise.resolve().then(() => JSON.parse(guideText || '{}')).catch(() => ({}));
  const live = guideBody.kind === 'ok';
  const guideBodyPreview = guideText.slice(0, 200);
  const guideDetail = live
    ? 'live model reply'
    : guideBody.kind === 'offline'
      ? `HTTP ${guideStatus} kind=offline — canonical offline text (gateway not reached)`
      : guideStatus < 200 || guideStatus >= 300
        ? `HTTP ${guideStatus} server error — body: ${guideBodyPreview}`
        : `HTTP ${guideStatus} unexpected response shape — body: ${guideBodyPreview}`;
  check(
    `${label} G-8 guide returns MODEL-GENERATED text`,
    live,
    guideDetail
  );

  await context.close();
  await browser.close();
}

async function leaderboardAndShare() {
  console.log('\n=== leaderboard + share (desktop) ===');
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const board = await page.request.get(`${BASE}/api/leaderboard?period=all_time`);
  check('leaderboard GET is public and 200', board.ok(), `HTTP ${board.status()}`);

  const join = await page.request.put(`${BASE}/api/leaderboard`, { data: { handle: HANDLE } });
  check('leaderboard opt-in accepted', join.ok(), `HTTP ${join.status()}`);

  const weekly = await page.request.get(`${BASE}/api/leaderboard?period=weekly`);
  const allTime = await page.request.get(`${BASE}/api/leaderboard?period=all_time`);
  check('weekly board loads', weekly.ok());
  check('all-time board loads', allTime.ok());

  await page.goto(`${BASE}/leaderboard`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(OUT, 'prod-leaderboard-desktop.png') });

  const share = await page.request.post(`${BASE}/api/share`, { data: { action: 'create' } });
  const shareBody = await share.json().catch(() => ({}));
  check('share card creates', share.ok() && Boolean(shareBody.token), `HTTP ${share.status()}`);

  if (shareBody.token) {
    const publicPage = await context.newPage();
    const shareResponse = await publicPage.goto(`${BASE}/s/${shareBody.token}`, {
      waitUntil: 'domcontentloaded',
    });
    check('share link opens', Boolean(shareResponse?.ok()));
    const og = await publicPage.request.get(`${BASE}/s/${shareBody.token}/opengraph-image`);
    check('OG image renders', og.ok(), `HTTP ${og.status()} ${og.headers()['content-type'] ?? ''}`);
    await publicPage.screenshot({ path: path.join(OUT, 'prod-share-desktop.png') });
    await publicPage.close();
    await page.request.post(`${BASE}/api/share`, {
      data: { action: 'revoke', token: shareBody.token },
    });
  }

  // leave the board so the smoke leaves no lasting public row
  const left = await page.request.delete(`${BASE}/api/leaderboard`);
  check('leaderboard opt-out (cleanup)', left.ok(), `HTTP ${left.status()}`);

  await context.close();
  await browser.close();
}

async function reducedMotionAndKeyboard() {
  console.log('\n=== reduced motion + keyboard (desktop) ===');
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  await page.goto(`${BASE}/map`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  const flag = await page.evaluate(() => document.body.dataset.reducedMotion);
  check('reduced-motion hook is exposed', flag === 'true', `data-reduced-motion=${flag}`);

  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  let reachedRegion = false;
  for (let i = 0; i < 30; i += 1) {
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => document.activeElement?.textContent?.trim() ?? '');
    if (/Languages|Databases|Skip to regions/i.test(focused)) {
      reachedRegion = true;
      break;
    }
  }
  check('keyboard-only reaches a region control', reachedRegion);

  await context.close();
  await browser.close();
}

async function main() {
  await mkdir(OUT, { recursive: true });
  console.log(`\nProduction smoke against ${BASE}`);
  await run('desktop', { width: 1280, height: 800 }, false);
  await run('mobile', { width: 390, height: 844 }, true);
  await leaderboardAndShare();
  await reducedMotionAndKeyboard();

  const failed = results.filter((r) => r.verdict === 'FAIL');
  console.log(
    `\n${failed.length === 0 ? 'PASS' : 'FAIL'} — ${results.length - failed.length} pass, ${failed.length} fail`
  );
  if (failed.length) console.log('failed:\n  ' + failed.map((f) => f.name).join('\n  '));
  console.log(`captures in ${OUT}`);
  process.exit(failed.length === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
