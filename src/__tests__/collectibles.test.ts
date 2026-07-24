import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  COLLECTIBLES,
  COLLECTIBLE_GLOW_TTL_MS,
  COLLECTIBLE_SHAME_TERMS,
  collectibleFor,
  collectibleKey,
  collectibleStaticCopyValues,
  collectiblesForRegion,
  completedLandmarkIds,
  consumeCollectibleGlowMarker,
  isServerConfirmedCompletion,
  readCollectibleGlowMarkers,
  upsertCollectibleGlowMarker,
} from '@/lib/collectibles';

function hasShame(text: string): string[] {
  const lower = text.toLowerCase();
  return COLLECTIBLE_SHAME_TERMS.filter((term) => {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(?:^|[^a-z])${escaped}(?:$|[^a-z])`, 'i').test(lower);
  });
}

describe('L-005 collectibles registry + ownership helpers', () => {
  const manifest = JSON.parse(
    readFileSync(resolve(process.cwd(), 'public/content-manifest.v1.json'), 'utf8'),
  ) as {
    regions: Array<{ id: string; landmarks: Array<{ id: string }> }>;
  };

  it('registers exactly one collectible per canonical landmark (48)', () => {
    expect(COLLECTIBLES).toHaveLength(48);

    const canonical = manifest.regions.flatMap((region) =>
      region.landmarks.map((landmark) => collectibleKey(region.id, landmark.id)),
    );
    expect(canonical).toHaveLength(48);

    const ids = COLLECTIBLES.map((item) => item.id);
    expect(new Set(ids).size).toBe(48);
    expect([...ids].sort()).toEqual([...canonical].sort());

    for (const region of manifest.regions) {
      expect(collectiblesForRegion(region.id)).toHaveLength(6);
    }
  });

  it('keeps ids, names, and sigils unique', () => {
    const names = COLLECTIBLES.map((item) => item.name);
    const sigils = COLLECTIBLES.map((item) => item.sigil);
    expect(new Set(names).size).toBe(48);
    expect(new Set(sigils).size).toBe(48);
    for (const item of COLLECTIBLES) {
      expect(item.sigil).toMatch(/^[A-Z0-9]{2}$/);
      expect(item.id).toBe(collectibleKey(item.regionId, item.landmarkId));
      expect(collectibleFor(item.regionId, item.landmarkId)).toEqual(item);
    }
    expect(collectibleFor('git', 'commits-as-checkpoints')?.name).toBe('Checkpoint Coin');
    expect(collectibleFor('missing', 'nope')).toBeNull();
  });

  it('requires strict server completed === true for ownership', () => {
    expect(isServerConfirmedCompletion({ completed: true })).toBe(true);
    expect(isServerConfirmedCompletion({ completed: false })).toBe(false);
    expect(isServerConfirmedCompletion({ completed: 'true' })).toBe(false);
    expect(isServerConfirmedCompletion({ completed: 1 })).toBe(false);
    expect(isServerConfirmedCompletion(null)).toBe(false);
    expect(isServerConfirmedCompletion(undefined)).toBe(false);
    expect(isServerConfirmedCompletion([])).toBe(false);

    const owned = completedLandmarkIds(
      [
        { region: 'git', landmark: 'commits-as-checkpoints', state: { completed: true } },
        { region: 'git', landmark: 'branches-as-isolation', state: { completed: 'true' } },
        { region: 'git', landmark: 'merge-conflicts', state: { completed: 1 } },
        // Cross-region completed row must never bleed into Git ownership.
        { region: 'security', landmark: 'trust-boundaries', state: { completed: true } },
        { region: 'git', landmark: '', state: { completed: true } },
      ],
      'git',
    );
    expect([...owned]).toEqual(['commits-as-checkpoints']);
    expect(owned.has('trust-boundaries')).toBe(false);
    expect(completedLandmarkIds(null, 'git').size).toBe(0);
  });

  it('upserts, expires, and consumes glow markers once', () => {
    const now = 1_000_000;
    const raw = upsertCollectibleGlowMarker(null, 'git', 'commits-as-checkpoints', now);
    const markers = readCollectibleGlowMarkers(raw, now);
    expect(markers).toEqual([
      { regionId: 'git', landmarkId: 'commits-as-checkpoints', at: now },
    ]);

    // Refresh same landmark does not duplicate.
    const refreshed = upsertCollectibleGlowMarker(raw, 'git', 'commits-as-checkpoints', now + 10);
    expect(readCollectibleGlowMarkers(refreshed, now + 10)).toHaveLength(1);
    expect(readCollectibleGlowMarkers(refreshed, now + 10)[0]?.at).toBe(now + 10);

    const first = consumeCollectibleGlowMarker(refreshed, 'git', 'commits-as-checkpoints', now + 10);
    expect(first.marker).toEqual({
      regionId: 'git',
      landmarkId: 'commits-as-checkpoints',
      at: now + 10,
    });
    expect(first.nextRaw).toBeNull();

    const second = consumeCollectibleGlowMarker(first.nextRaw, 'git', 'commits-as-checkpoints', now + 10);
    expect(second.marker).toBeNull();

    const stale = upsertCollectibleGlowMarker(null, 'git', 'branches-as-isolation', now);
    const expired = consumeCollectibleGlowMarker(
      stale,
      'git',
      'branches-as-isolation',
      now + COLLECTIBLE_GLOW_TTL_MS + 1,
    );
    expect(expired.marker).toBeNull();
    expect(expired.nextRaw).toBeNull();
  });

  it('consuming one marker preserves same-region and cross-region siblings', () => {
    const now = 2_000_000;
    let raw = upsertCollectibleGlowMarker(null, 'git', 'commits-as-checkpoints', now);
    raw = upsertCollectibleGlowMarker(raw, 'git', 'branches-as-isolation', now + 1);
    raw = upsertCollectibleGlowMarker(raw, 'security', 'trust-boundaries', now + 2);

    const afterGit = consumeCollectibleGlowMarker(raw, 'git', 'commits-as-checkpoints', now + 3);
    expect(afterGit.marker?.landmarkId).toBe('commits-as-checkpoints');
    const remaining = readCollectibleGlowMarkers(afterGit.nextRaw, now + 3);
    expect(remaining).toHaveLength(2);
    expect(remaining.some((m) => m.regionId === 'git' && m.landmarkId === 'branches-as-isolation')).toBe(
      true,
    );
    expect(remaining.some((m) => m.regionId === 'security' && m.landmarkId === 'trust-boundaries')).toBe(
      true,
    );

    const afterBranch = consumeCollectibleGlowMarker(
      afterGit.nextRaw,
      'git',
      'branches-as-isolation',
      now + 4,
    );
    expect(afterBranch.marker?.landmarkId).toBe('branches-as-isolation');
    const onlySecurity = readCollectibleGlowMarkers(afterBranch.nextRaw, now + 4);
    expect(onlySecurity).toEqual([
      { regionId: 'security', landmarkId: 'trust-boundaries', at: now + 2 },
    ]);

    const afterSecurity = consumeCollectibleGlowMarker(
      afterBranch.nextRaw,
      'security',
      'trust-boundaries',
      now + 5,
    );
    expect(afterSecurity.marker?.landmarkId).toBe('trust-boundaries');
    expect(afterSecurity.nextRaw).toBeNull();
  });

  it('keeps static collectible copy free of shame framing', () => {
    for (const value of collectibleStaticCopyValues()) {
      expect(hasShame(value), value).toEqual([]);
    }
  });
});
