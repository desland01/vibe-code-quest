import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

// E-002 comp renderer: captures each [data-comp] section of beat-comps.html
// at desktop + mobile. Local file:// only; no Next server involved.
const root = resolve(process.cwd());
const htmlPath = `file://${resolve(root, 'designs/comps/engagement-v2/beat-comps.html')}`;
const outDir = resolve(root, 'designs/comps/engagement-v2/captures');

const viewports = [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'mobile', width: 390, height: 844 },
];
const comps = ['01-predict-card', '02-scenario-diff', '03-stamp-next'];

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch();

for (const vp of viewports) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
  for (const comp of comps) {
    await page.goto(htmlPath);
    await page.evaluate((target) => window.__beatPrototype.showComp(target, { focus: false }), comp);
    if (comp === '02-scenario-diff') {
      await page.getByRole('button', { name: /Commit everything right now/ }).click();
    }
    await page.evaluate(() => document.fonts.ready);
    const pixelFontLoaded = await page.evaluate(() => document.fonts.check('12px "Press Start 2P"'));
    if (!pixelFontLoaded) {
      throw new Error('Press Start 2P failed to load — refusing fallback-font captures');
    }
    // Objective §7 assertions: no horizontal overflow (incl. 8px box-shadow budget);
    // diff rows single-line, no path/delta clipping; interactive targets ≥44px.
    const checks = await page.evaluate((target) => {
      const section = document.querySelector(`[data-comp="${target}"]`);
      const vw = document.documentElement.clientWidth;
      const overflow = section.scrollWidth > vw;
      const panel = section.querySelector('.panel');
      const SHADOW = 8; // .panel box-shadow x-offset in px
      const shadowClip = panel ? panel.getBoundingClientRect().right + SHADOW > vw : false;
      const diffClips = [];
      for (const span of section.querySelectorAll('.diff .file > span')) {
        if (span.scrollWidth > span.clientWidth + 1) {
          diffClips.push(span.textContent || '?');
        }
        if (getComputedStyle(span).whiteSpace !== 'nowrap' && span.getBoundingClientRect().height > 30) {
          diffClips.push(`wrapped:${(span.textContent || '?').slice(0, 30)}`);
        }
      }
      const short = [];
      for (const el of section.querySelectorAll('.choice, .btn')) {
        if (el.hidden || getComputedStyle(el).display === 'none') continue;
        const h = el.getBoundingClientRect().height;
        if (h < 44) short.push(`${el.className}:${Math.round(h)}px`);
      }
      return { overflow, shadowClip, diffClips, short };
    }, comp);
    if (checks.overflow) throw new Error(`Horizontal overflow in ${comp} @ ${vp.name}`);
    if (checks.shadowClip) throw new Error(`Panel shadow clipped by viewport in ${comp} @ ${vp.name}`);
    if (checks.diffClips.length) throw new Error(`Diff row clip/wrap in ${comp} @ ${vp.name}: ${checks.diffClips.join(' | ')}`);
    if (checks.short.length) throw new Error(`Sub-44px targets in ${comp} @ ${vp.name}: ${checks.short.join(', ')}`);
    const short = comp.slice(3); // predict-card, scenario-diff, stamp-next
    await page.locator(`[data-comp="${comp}"]`).screenshot({
      path: resolve(outDir, `${short}-${vp.name}.png`),
    });
    console.log(`captured ${short}-${vp.name}.png`);
  }
  await page.close();
}
await browser.close();
console.log('done: 6 captures in', outDir);
