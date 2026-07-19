import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
import { resolve } from 'node:path';

const htmlPath = `file://${resolve(process.cwd(), 'designs/comps/engagement-v2/beat-comps.html')}`;
const viewports = [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'mobile', width: 390, height: 844 },
];
const browser = await chromium.launch();

try {
  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport });
    try {
      await page.goto(htmlPath);
      await page.waitForFunction(() => Boolean(window.__beatPrototype), null, { timeout: 1500 });

      const visibleComps = async () => page.locator('[data-comp]:visible').evaluateAll((nodes) =>
        nodes.map((node) => node.getAttribute('data-comp'))
      );

      assert.deepEqual(await visibleComps(), ['01-predict-card']);

      const predictChoice = page.getByRole('button', { name: /Everything it touched so far/ });
      await predictChoice.click();
      assert.equal(await predictChoice.getAttribute('aria-pressed'), 'true');
      await assert.doesNotReject(() => page.locator('#fb1').waitFor({ state: 'visible' }));
      assert.match(await page.locator('#fb1').innerText(), /prediction|reviewed change/i);

      const toScenario = page.getByRole('button', { name: /See the worked example/i });
      await assert.doesNotReject(() => toScenario.waitFor({ state: 'visible' }));
      await toScenario.click();
      assert.deepEqual(await visibleComps(), ['02-scenario-diff']);

      const wrongChoice = page.getByRole('button', { name: /Commit everything right now/ });
      await wrongChoice.click();
      assert.match(await wrongChoice.getAttribute('class'), /is-wrong/);
      assert.match(await page.locator('#fb2').innerText(), /review the staged diff/i);
      await assert.rejects(() => page.getByRole('button', { name: /Stamp this lesson/i }).waitFor({ state: 'visible', timeout: 200 }));

      const correctChoice = page.getByRole('button', { name: /Stage, review the diff/ });
      await correctChoice.click();
      assert.match(await correctChoice.getAttribute('class'), /is-correct/);
      assert.match(await page.locator('#fb2').innerText(), /one inspectable outcome/i);

      const toStamp = page.getByRole('button', { name: /Stamp this lesson/i });
      await assert.doesNotReject(() => toStamp.waitFor({ state: 'visible' }));
      await toStamp.click();
      assert.deepEqual(await visibleComps(), ['03-stamp-next']);

      const next = page.getByRole('link', { name: /Next: Branches as isolation/ });
      await next.click();
      assert.match(await page.locator('#prototype-status').innerText(), /Branches as isolation/);

      const back = page.getByRole('link', { name: /Back to map/ });
      await back.click();
      assert.match(await page.locator('#prototype-status').innerText(), /Git River/);

      console.log(`PASS (${viewport.name}): predict → scenario retry → stamp → simulated navigation`);
    } finally {
      await page.close();
    }
  }
} finally {
  await browser.close();
}
