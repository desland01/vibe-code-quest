import { describe, expect, it } from 'vitest';
import { buildContentManifest } from '../content/manifest';
import { manifestSchema } from '../content/schema';
import { getLandmark, getRegion, loadManifest, resolveLandmarkAnyVersion } from '../lib/content';

describe('content manifest', () => {
  it('validates exactly eight regions with six unique landmarks each', () => {
    const built = buildContentManifest('2026-07-17T00:00:00.000Z');
    expect(built.regions).toHaveLength(8);
    expect(built.regions.every((region) => region.landmarks.length === 6)).toBe(true);
    const ids = built.regions.flatMap((region) => region.landmarks.map(({ id }) => id));
    expect(ids).toHaveLength(48);
    expect(new Set(ids).size).toBe(48);
    expect(manifestSchema.parse(built)).toEqual(built);
  });

  it('keeps the committed manifest structurally fresh with the registry', () => {
    const committed = loadManifest();
    const built = buildContentManifest(committed.generatedAt, committed.version);
    expect(built).toEqual(committed);
  });

  it('loads regions and resolves current or prior-version landmarks', () => {
    expect(getRegion('databases')?.title).toBe('Databases');
    expect(getLandmark('databases', 'sql')?.id).toBe('sql');
    expect(resolveLandmarkAnyVersion('databases', 'sql')?.id).toBe('sql');
    expect(resolveLandmarkAnyVersion('databases', 'missing')).toBeUndefined();
  });
});
