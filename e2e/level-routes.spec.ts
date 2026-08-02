import { expect, test } from '@playwright/test';

import manifest from '../public/content-manifest.v2.json' with { type: 'json' };

// ISSUE-015 — the additive level path segment (REQ-010, VAL-015, VAL-016).
//
// The whole point of "additive" is that nothing that worked before stops
// working. These are the assertions that make that claim falsifiable: every one
// of the 48 pre-rebuild landmark URLs still returns 200 and still serves
// playable content, and the new segment sits alongside it rather than replacing
// it. No redirect is asserted in either direction, because adding one would
// change what the existing 48 URLs mean.

// Read from the committed public manifest rather than the server-only content
// module: this spec runs in Playwright's plain-ESM loader, and the manifest is
// the same 8x6 shape the app itself ships.
const ALL_LANDMARK_PATHS = manifest.regions.flatMap((region) =>
  region.landmarks.map((landmark) => `/map/${region.id}/${landmark.id}`),
);

test('all 48 legacy landmark URLs still return 200 (VAL-015)', async ({ request }) => {
  expect(ALL_LANDMARK_PATHS).toHaveLength(48);
  const statuses = await Promise.all(
    ALL_LANDMARK_PATHS.map(async (path) => [path, (await request.get(path)).status()] as const),
  );
  expect(statuses.filter(([, status]) => status !== 200)).toEqual([]);
});

test('a legacy URL with no level segment serves playable content (VAL-016)', async ({ page }) => {
  await page.goto('/map/git/merge-conflicts?format=lesson');
  const stage = page.locator('[data-stage]');
  await expect(stage).toBeVisible({ timeout: 20000 });
  // It resolved to SOME level and serialized exactly one sequence.
  await expect(stage).toHaveAttribute('data-level', /^l[123]$/);
  await expect(page.getByTestId('beat-advance')).toBeVisible();
});

test('the level segment is additive — both forms resolve to a playable stage', async ({ page }) => {
  for (const level of ['l1', 'l2', 'l3'] as const) {
    await page.goto(`/map/git/merge-conflicts/${level}?format=lesson`);
    await expect(page.locator('[data-stage]')).toBeVisible({ timeout: 20000 });
    await expect(page.getByTestId('beat-advance')).toBeVisible();
  }
});

test('an unknown level segment 404s rather than silently serving a level', async ({ request }) => {
  expect((await request.get('/map/git/merge-conflicts/l4')).status()).toBe(404);
  expect((await request.get('/map/git/merge-conflicts/nonsense')).status()).toBe(404);
});

test('a landmark that is not fully tiered still resolves through the level segment', async ({ page }) => {
  // Islands still inside the L3-only compatibility window have no L1 run. The
  // request resolves DOWN to what exists instead of 404ing, because a bookmark
  // that outran the authored content should still open the game.
  await page.goto('/map/databases/sql/l1?format=lesson');
  await expect(page.locator('[data-stage]')).toHaveAttribute('data-level', 'l3', { timeout: 20000 });
});
