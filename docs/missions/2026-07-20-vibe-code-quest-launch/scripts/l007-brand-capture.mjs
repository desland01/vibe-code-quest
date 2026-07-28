#!/usr/bin/env node
/**
 * L-007 rebrand evidence capture.
 *
 * Renders the public brand surfaces at desktop and mobile against the local
 * preview and asserts the brand strings mechanically before writing PNGs, so a
 * green run is proof rather than decoration.
 *
 * Preview origin is http://localhost:3100 only (never 127.0.0.1 — Next
 * hydration blocks on that host in this project).
 *
 *   node docs/missions/2026-07-20-vibe-code-quest-launch/scripts/l007-brand-capture.mjs
 */

import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

const BASE = 'http://localhost:3100';
const OUT = path.join(
  process.cwd(),
  'docs/missions/2026-07-20-vibe-code-quest-launch/evidence/L-007'
);

const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'mobile', width: 390, height: 844 },
];

const failures = [];

function check(label, condition, detail) {
  if (condition) {
    console.log(`  PASS  ${label}`);
  } else {
    console.log(`  FAIL  ${label}${detail ? ` — ${detail}` : ''}`);
    failures.push(label);
  }
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();

  for (const viewport of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
    });
    const page = await context.newPage();

    console.log(`\n[${viewport.name}] ${BASE}/`);
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });

    const title = await page.title();
    check(
      'document title carries the full brand string',
      title.includes('Vibe Code Quest by Truline'),
      `got "${title}"`
    );

    const heading = await page.getByRole('heading', { level: 1 }).first().innerText();
    check('map h1 is "Vibe Code Quest"', heading.trim() === 'Vibe Code Quest', `got "${heading}"`);

    const byline = page.getByTestId('site-byline');
    const bylineText = (await byline.innerText()).replace(/\s+/g, ' ').trim();
    check(
      'footer byline reads "Vibe Code Quest by Truline"',
      bylineText === 'Vibe Code Quest by Truline',
      `got "${bylineText}"`
    );

    const href = await byline.getByRole('link', { name: 'Truline' }).getAttribute('href');
    check('byline links https://truline.io', href === 'https://truline.io', `got "${href}"`);

    const constance = (await page.getByTestId('site-constance').innerText()).trim();
    check(
      'footer credits Constance',
      constance === 'Governed by Constance',
      `got "${constance}"`
    );

    const body = await page.locator('body').innerText();
    check('no legacy "code-tutor" string on the map page', !/code-tutor/i.test(body));
    check('no "Trueline" misspelling anywhere on the page', !/trueline/i.test(body));

    // Horizontal overflow guard — the byline must not widen the footer.
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    check('no horizontal overflow', overflow <= 0, `scrollWidth overflow ${overflow}px`);

    await page.screenshot({
      path: path.join(OUT, `map-header-${viewport.name}.png`),
      fullPage: false,
    });
    await page.getByRole('contentinfo').screenshot({
      path: path.join(OUT, `footer-${viewport.name}.png`),
    });

    console.log(`[${viewport.name}] ${BASE}/legal/terms`);
    await page.goto(`${BASE}/legal/terms`, { waitUntil: 'networkidle' });
    const legalBody = await page.locator('body').innerText();
    check('legal page carries no legacy brand', !/code-tutor/i.test(legalBody));
    check('legal page names Vibe Code Quest', /Vibe Code Quest/.test(legalBody));
    check('legal page has no bracket placeholder', !/\[[A-Z][A-Z ]+\]/.test(legalBody));
    await page.screenshot({
      path: path.join(OUT, `legal-terms-${viewport.name}.png`),
      fullPage: false,
    });

    await context.close();
  }

  await browser.close();

  console.log('');
  if (failures.length > 0) {
    console.log(`FAIL — ${failures.length} assertion(s): ${failures.join(', ')}`);
    process.exit(1);
  }
  console.log(`PASS — all brand assertions green; captures in ${OUT}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
