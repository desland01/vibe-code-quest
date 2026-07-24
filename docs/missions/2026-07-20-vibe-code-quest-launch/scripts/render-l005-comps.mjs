#!/usr/bin/env node
/**
 * L-005 comps renderer — file:// only, no Next server.
 * Captures stamp-collectible, collection-shelf, map-glow at desktop + mobile.
 * Asserts fonts, overflow, touch targets, motion budget, shame-free visible copy.
 */
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(process.cwd());
const htmlPath = `file://${resolve(root, 'designs/comps/vibe-launch-l005/collectible-glow-comps.html')}`;
const outDir = resolve(root, 'designs/comps/vibe-launch-l005/captures');

const viewports = [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'mobile', width: 390, height: 844 },
];
const comps = ['01-stamp-collectible', '02-collection-shelf', '03-map-glow'];

const SHAME = [
  'lost',
  'dropped',
  'fell',
  'behind',
  'shame',
  'shames',
  'last place',
  'you lost',
  'falling',
  'slipped',
  'worst',
  'missing',
  'debt',
  'loss',
];

function hasShame(text) {
  const lower = String(text || '').toLowerCase();
  return SHAME.filter((term) => {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(?:^|[^a-z])${escaped}(?:$|[^a-z])`, 'i').test(lower);
  });
}

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch();

for (const vp of viewports) {
  const page = await browser.newPage({
    viewport: { width: vp.width, height: vp.height },
    reducedMotion: 'no-preference',
  });

  for (const comp of comps) {
    await page.goto(htmlPath);
    await page.evaluate((target) => window.__l005Prototype.showComp(target, { focus: false }), comp);
    await page.evaluate(() => document.fonts.ready);
    const pixelFontLoaded = await page.evaluate(() => document.fonts.check('12px "Press Start 2P"'));
    if (!pixelFontLoaded) {
      throw new Error('Press Start 2P failed to load — refusing fallback-font captures');
    }

    // Motion/contract checks on stamp + glow before canonical settled screenshot.
    if (comp === '01-stamp-collectible') {
      const stampMotion = await page.evaluate(() => {
        const stamp = document.querySelector('[data-comp="01-stamp-collectible"] .stamp');
        const cs = getComputedStyle(stamp);
        return {
          name: cs.animationName,
          durationMs: parseFloat(cs.animationDuration) * 1000,
          iteration: cs.animationIterationCount,
          timing: cs.animationTimingFunction,
        };
      });
      if (!/stamp-in/i.test(stampMotion.name)) {
        throw new Error(`stamp animation missing @ ${vp.name}: ${JSON.stringify(stampMotion)}`);
      }
      if (Math.abs(stampMotion.durationMs - 480) > 1) {
        throw new Error(`stamp duration expected 480ms got ${stampMotion.durationMs}`);
      }
      if (String(stampMotion.iteration) !== '1') {
        throw new Error(`stamp iteration expected 1 got ${stampMotion.iteration}`);
      }
      if (!/steps\(\s*6/i.test(stampMotion.timing)) {
        throw new Error(`stamp easing expected steps(6) got ${stampMotion.timing}`);
      }
    }

    if (comp === '03-map-glow') {
      // Prove active glow settings, then settle for the canonical capture.
      const glowMotion = await page.evaluate(() => {
        const card = document.querySelector('[data-testid="landmark-stamped"]');
        card.classList.remove('is-settled', 'reduced');
        void card.offsetWidth;
        card.classList.add('is-stamped');
        const cs = getComputedStyle(card);
        return {
          name: cs.animationName,
          durationMs: parseFloat(cs.animationDuration) * 1000,
          iteration: cs.animationIterationCount,
          timing: cs.animationTimingFunction,
        };
      });
      if (!/landmark-glow/i.test(glowMotion.name)) {
        throw new Error(`glow animation missing @ ${vp.name}: ${JSON.stringify(glowMotion)}`);
      }
      if (Math.abs(glowMotion.durationMs - 1200) > 1) {
        throw new Error(`glow duration expected 1200ms got ${glowMotion.durationMs}`);
      }
      if (String(glowMotion.iteration) !== '3') {
        throw new Error(`glow iteration expected 3 got ${glowMotion.iteration}`);
      }
      if (!/ease-in-out/i.test(glowMotion.timing)) {
        throw new Error(`glow easing expected ease-in-out got ${glowMotion.timing}`);
      }
      // Canonical screenshot is the settled highlight after the one glow budget.
      await page.evaluate(() => {
        const card = document.querySelector('[data-testid="landmark-stamped"]');
        card.classList.add('is-settled');
      });
    }

    const checks = await page.evaluate((target) => {
      const section = document.querySelector(`[data-comp="${target}"]`);
      const vw = document.documentElement.clientWidth;
      const overflow = Math.max(section.scrollWidth, document.documentElement.scrollWidth) > vw + 1;
      const panel = section.querySelector('.panel, .map-shell');
      const SHADOW = 10;
      const shadowClip = panel ? panel.getBoundingClientRect().right + SHADOW > vw + 1 : false;

      const short = [];
      for (const el of section.querySelectorAll('.btn, .landmark-card, a.btn')) {
        if (el.hidden || getComputedStyle(el).display === 'none') continue;
        const h = el.getBoundingClientRect().height;
        const w = el.getBoundingClientRect().width;
        if (h < 44 || w < 44) short.push(`${el.className}:${Math.round(w)}x${Math.round(h)}`);
      }

      const cols = (sel) => {
        const grid = section.querySelector(sel);
        if (!grid) return null;
        return getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length;
      };

      const text = section.innerText || '';
      const stamped = section.querySelector('[data-testid="landmark-stamped"]');
      const open = section.querySelector('[data-testid="landmark-open"]');
      const stampedHasText = stamped
        ? /stamped/i.test(stamped.innerText) && /checkpoint coin/i.test(stamped.innerText)
        : true;
      const openHasText = open ? /\bopen\b/i.test(open.innerText) : true;

      return {
        overflow,
        shadowClip,
        short,
        shelfCols: cols('[data-testid="collection-shelf"]'),
        mapCols: cols('[data-testid="region-landmark-grid"]'),
        text,
        stampedHasText,
        openHasText,
        hasBlur: [...section.querySelectorAll('*')].some((el) => {
          const f = getComputedStyle(el).filter || '';
          const bb = getComputedStyle(el).backdropFilter || getComputedStyle(el).webkitBackdropFilter || '';
          return /blur\(/i.test(f) || /blur\(/i.test(bb);
        }),
      };
    }, comp);

    if (checks.overflow) throw new Error(`Horizontal overflow in ${comp} @ ${vp.name}`);
    if (checks.shadowClip) throw new Error(`Panel/map shadow clipped in ${comp} @ ${vp.name}`);
    if (checks.short.length) throw new Error(`Sub-44px targets in ${comp} @ ${vp.name}: ${checks.short.join(', ')}`);
    if (checks.hasBlur) throw new Error(`Blur/glass forbidden in ${comp} @ ${vp.name}`);
    if (!checks.stampedHasText) throw new Error(`Stamped state color-only in ${comp} @ ${vp.name}`);
    if (!checks.openHasText) throw new Error(`Open state color-only in ${comp} @ ${vp.name}`);

    if (comp === '02-collection-shelf') {
      const expectedCols = vp.name === 'mobile' ? 1 : 3;
      if (checks.shelfCols !== expectedCols) {
        throw new Error(`shelf cols expected ${expectedCols} got ${checks.shelfCols} @ ${vp.name}`);
      }
    }
    if (comp === '03-map-glow') {
      const expectedCols = vp.name === 'mobile' ? 1 : 3;
      if (checks.mapCols !== expectedCols) {
        throw new Error(`map cols expected ${expectedCols} got ${checks.mapCols} @ ${vp.name}`);
      }
    }

    const shameHits = hasShame(checks.text);
    if (shameHits.length) {
      throw new Error(`shame terms in ${comp} @ ${vp.name}: ${shameHits.join(', ')}`);
    }

    const short = comp.slice(3); // stamp-collectible, collection-shelf, map-glow
    await page.locator(`[data-comp="${comp}"]`).screenshot({
      path: resolve(outDir, `${short}-${vp.name}.png`),
    });
    console.log(`captured ${short}-${vp.name}.png`);
  }

  // Reduced-motion proof (desktop only is enough; same CSS media query).
  if (vp.name === 'desktop') {
    const rmPage = await browser.newPage({
      viewport: { width: vp.width, height: vp.height },
      reducedMotion: 'reduce',
    });
    await rmPage.goto(htmlPath);
    await rmPage.evaluate(() => window.__l005Prototype.showComp('01-stamp-collectible', { focus: false }));
    await rmPage.evaluate(() => document.fonts.ready);
    const stampRm = await rmPage.evaluate(() => {
      const stamp = document.querySelector('[data-comp="01-stamp-collectible"] .stamp');
      const cs = getComputedStyle(stamp);
      return { name: cs.animationName, duration: cs.animationDuration };
    });
    if (stampRm.name !== 'none') {
      throw new Error(`reduced-motion stamp still animates: ${JSON.stringify(stampRm)}`);
    }

    await rmPage.evaluate(() => window.__l005Prototype.showComp('03-map-glow', { focus: false }));
    const glowRm = await rmPage.evaluate(() => {
      const card = document.querySelector('[data-testid="landmark-stamped"]');
      card.classList.remove('is-settled');
      void card.offsetWidth;
      const cs = getComputedStyle(card);
      const badge = card.querySelector('.stamped-badge');
      const chip = card.querySelector('.collectible-chip');
      return {
        name: cs.animationName,
        badgeVisible: !!badge && getComputedStyle(badge).display !== 'none',
        chipVisible: !!chip && getComputedStyle(chip).display !== 'none',
        outline: cs.outlineStyle,
      };
    });
    if (glowRm.name !== 'none') {
      throw new Error(`reduced-motion glow still animates: ${JSON.stringify(glowRm)}`);
    }
    if (!glowRm.badgeVisible || !glowRm.chipVisible) {
      throw new Error('reduced-motion stamped labels not legible');
    }
    console.log('reduced-motion checks PASS');
    await rmPage.close();
  }

  await page.close();
}

await browser.close();
console.log('done: 6 captures in', outDir);
