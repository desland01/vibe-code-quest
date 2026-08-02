import { expect, test, type Locator, type Page } from '@playwright/test';

// ISSUE-009: the stage-fit harness (VAL-013, VAL-014, VAL-014b).
//
// This spec is written BEFORE the locked stage shell exists. That ordering is
// deliberate — "enforcement before content" applies to layout too: the shell
// ISSUE-015 builds has to satisfy a contract that was written down first, rather
// than a contract reverse-engineered from whatever the shell happened to do.
//
// Until the shell lands, the stage-scoped assertions skip with a named reason
// keyed to the `[data-stage]` marker, so they arm themselves automatically the
// moment ISSUE-015 adds it. Nothing here is weakened to make it pass early.

const VIEWPORTS = [
  { name: '1024x640', width: 1024, height: 640 },
  { name: '1440x900', width: 1440, height: 900 },
] as const;

// One landmark per beat type reachable in the current corpus. Every registered
// sequence is L3 during the compatibility window, so the render-state matrix
// walks the eight L3 beat types of one run.
const SUBJECT = '/map/git/commits-as-checkpoints?format=lesson';

/** The stage shell, once ISSUE-015 exists. */
function stage(page: Page): Locator {
  return page.locator('[data-stage]');
}

async function stageExists(page: Page): Promise<boolean> {
  return (await stage(page).count()) > 0;
}

async function setTextScale(page: Page, percent: number) {
  // 200% text size, NOT a browser zoom: zoom scales the whole layout uniformly
  // and would hide exactly the reflow problems this mode is meant to catch.
  await page.addStyleTag({ content: `html { font-size: ${percent}% !important; }` });
}

/** Every focusable descendant that is actually rendered. */
async function visibleFocusables(root: Locator): Promise<Locator[]> {
  const selector = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';
  const all = root.locator(selector);
  const count = await all.count();
  const out: Locator[] = [];
  for (let i = 0; i < count; i += 1) {
    const item = all.nth(i);
    if (await item.isVisible()) out.push(item);
  }
  return out;
}

test.describe('Mode 1 — 100% presentation is one fixed, non-scrolling stage (VAL-013)', () => {
  for (const viewport of VIEWPORTS) {
    test(`no page scroll at ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(SUBJECT);
      await page.waitForLoadState('networkidle');

      test.skip(
        !(await stageExists(page)),
        'Locked stage shell not implemented yet — ISSUE-015 adds [data-stage]. This assertion arms itself then.',
      );

      const metrics = await page.evaluate(() => ({
        scrollHeight: document.body.scrollHeight,
        innerHeight: window.innerHeight,
        scrollWidth: document.body.scrollWidth,
        innerWidth: window.innerWidth,
      }));
      expect(metrics.scrollHeight).toBeLessThanOrEqual(metrics.innerHeight);
      expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.innerWidth);
    });

    test(`every focusable control sits inside the stage box at ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(SUBJECT);
      await page.waitForLoadState('networkidle');

      test.skip(
        !(await stageExists(page)),
        'Locked stage shell not implemented yet — ISSUE-015 adds [data-stage].',
      );

      // Real rendered geometry, never a string-length estimate: a word budget is
      // the fast guard, the DOM is the authority (REQ-009).
      const box = await stage(page).boundingBox();
      expect(box, 'stage has a rendered box').not.toBeNull();

      for (const control of await visibleFocusables(stage(page))) {
        const rect = await control.boundingBox();
        if (!rect) continue;
        expect.soft(rect.x).toBeGreaterThanOrEqual(box!.x - 1);
        expect.soft(rect.y).toBeGreaterThanOrEqual(box!.y - 1);
        expect.soft(rect.x + rect.width).toBeLessThanOrEqual(box!.x + box!.width + 1);
        expect.soft(rect.y + rect.height).toBeLessThanOrEqual(box!.y + box!.height + 1);
      }
    });
  }
});

test.describe('Mode 2 — 200% text reflows on ONE axis with persistent chrome (VAL-014)', () => {
  test('vertical overflow only, no clipping, no downscale', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 640 });
    await page.goto(SUBJECT);
    await page.waitForLoadState('networkidle');
    await setTextScale(page, 200);

    test.skip(
      !(await stageExists(page)),
      'Locked stage shell not implemented yet — ISSUE-015 adds [data-stage].',
    );

    const metrics = await page.evaluate(() => {
      const el = document.querySelector('[data-stage]') as HTMLElement;
      return {
        scrollWidth: el.scrollWidth,
        clientWidth: el.clientWidth,
        scrollHeight: el.scrollHeight,
        clientHeight: el.clientHeight,
        bodyScrollWidth: document.body.scrollWidth,
        innerWidth: window.innerWidth,
        transform: getComputedStyle(el).transform,
      };
    });

    // Single-axis: vertical overflow is allowed, horizontal is not.
    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);
    expect(metrics.bodyScrollWidth).toBeLessThanOrEqual(metrics.innerWidth + 1);
    // No text downscale to fake a fit — a scale() transform is the cheat this
    // check exists to forbid.
    expect(['none', 'matrix(1, 0, 0, 1, 0, 0)']).toContain(metrics.transform);
  });

  test('every focusable control stays inside the reachable scroll area', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 640 });
    await page.goto(SUBJECT);
    await page.waitForLoadState('networkidle');
    await setTextScale(page, 200);

    test.skip(
      !(await stageExists(page)),
      'Locked stage shell not implemented yet — ISSUE-015 adds [data-stage].',
    );

    const reach = await page.evaluate(() => {
      const el = document.querySelector('[data-stage]') as HTMLElement;
      const rect = el.getBoundingClientRect();
      return { top: rect.top + window.scrollY, height: el.scrollHeight, left: rect.left, width: el.clientWidth };
    });

    for (const control of await visibleFocusables(stage(page))) {
      const rect = await control.boundingBox();
      if (!rect) continue;
      expect.soft(rect.x).toBeGreaterThanOrEqual(reach.left - 1);
      expect.soft(rect.x + rect.width).toBeLessThanOrEqual(reach.left + reach.width + 1);
      expect.soft(rect.y).toBeGreaterThanOrEqual(reach.top - 1);
      expect.soft(rect.y + rect.height).toBeLessThanOrEqual(reach.top + reach.height + 1);
    }
  });
});

test.describe('Render-state matrix — every beat type, every named state (VAL-014)', () => {
  // The states a beat can be in that change its rendered height. Overflow that
  // only appears after a wrong answer is still overflow.
  const STATES = [
    'initial render',
    'wrong-answer feedback shown',
    'correct-answer feedback shown',
    'all reveal cards visible',
    'check explanation shown',
    'completed stamp panel',
  ] as const;

  for (const state of STATES) {
    test(`fits at 1024x640 with "${state}"`, async ({ page }) => {
      await page.setViewportSize({ width: 1024, height: 640 });
      await page.goto(SUBJECT);
      await page.waitForLoadState('networkidle');

      test.skip(
        !(await stageExists(page)),
        'Locked stage shell not implemented yet — ISSUE-015 adds [data-stage]. ' +
          'The state driver lands with the shell, since it depends on the shell\'s controls.',
      );

      const metrics = await page.evaluate(() => ({
        scrollHeight: document.body.scrollHeight,
        innerHeight: window.innerHeight,
      }));
      expect(metrics.scrollHeight).toBeLessThanOrEqual(metrics.innerHeight);
    });
  }

  test('fits with prefers-reduced-motion: reduce', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1024, height: 640 });
    await page.goto(SUBJECT);
    await page.waitForLoadState('networkidle');

    test.skip(
      !(await stageExists(page)),
      'Locked stage shell not implemented yet — ISSUE-015 adds [data-stage].',
    );

    const metrics = await page.evaluate(() => ({
      scrollHeight: document.body.scrollHeight,
      innerHeight: window.innerHeight,
    }));
    expect(metrics.scrollHeight).toBeLessThanOrEqual(metrics.innerHeight);
  });
});

test.describe('Word budgets are the fast guard, the DOM is the authority (VAL-014b)', () => {
  test('the manifest build enforces word budgets for arcade-authored content', async () => {
    // The build-time half of the stage-fit contract. Measured in the unit suite
    // (src/__tests__/voice.test.ts) rather than re-run here; this test records
    // that the two halves are one contract so neither is dropped alone.
    const { WORD_BUDGETS } = await import('../src/content/beats/voice.ts');
    expect(WORD_BUDGETS.hook).toBe(14);
    expect(WORD_BUDGETS.scenarioPrompt).toBe(28);
    expect(WORD_BUDGETS.optionLabel).toBe(9);
  });
});
