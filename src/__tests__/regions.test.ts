import { describe, expect, it } from 'vitest';
import {
  buildContentManifest,
  buildPublicContentManifest,
  PUBLIC_MANIFEST_MAX_RAW_BYTES,
} from '../content/manifest';
import {
  canonicalLandmarkSchema,
  landmarkSchema,
  manifestSchema,
  publicManifestSchema,
} from '../content/schema';
import { getLandmark, getRegion, loadManifest, resolveLandmarkAnyVersion } from '../lib/content';
import { tieredLandmark } from '../content/__fixtures__/tiered-landmark';

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

describe('public manifest v2 projection (VAL-002, DATA_MODEL §8)', () => {
  const built = buildPublicContentManifest('2026-08-02T00:00:00.000Z');

  it('carries region and map metadata plus a slim landmark overview only', () => {
    expect(built.version).toBe(2);
    expect(built.regions).toHaveLength(8);
    for (const region of built.regions) {
      expect(region.mapArea).toBeDefined();
      expect(region.landmarks).toHaveLength(6);
      for (const landmark of region.landmarks) {
        expect(Object.keys(landmark).sort()).toEqual(['draft', 'id', 'title']);
      }
    }
    expect(publicManifestSchema.parse(built)).toEqual(built);
  });

  it('leaks no levels, assessments, beats, or answer keys', () => {
    const serialized = JSON.stringify(built);
    expect(serialized).not.toContain('"levels"');
    expect(serialized).not.toContain('"assessment"');
    expect(serialized).not.toContain('"quiz"');
    expect(serialized).not.toContain('"answer"');
    expect(serialized).not.toContain('"beats"');
    // A real answer string from production content must not appear either.
    const sqlAnswer = getLandmark('databases', 'sql')!.quiz.answer;
    expect(serialized).not.toContain(sqlAnswer);
  });

  it('stays inside the public manifest byte budget', () => {
    expect(Buffer.byteLength(JSON.stringify(built), 'utf8')).toBeLessThanOrEqual(
      PUBLIC_MANIFEST_MAX_RAW_BYTES,
    );
  });

  it('rejects a canonical landmark that is missing its tier fields (VAL-001)', () => {
    // The manifest builder parses EVERY landmark through landmarkSchema, so a
    // schema rejection is exactly how the build fails. canonicalLandmarkSchema is
    // the tier-required form that content authored in M4-M6 must satisfy.
    const { levels: _levels, ...untiered } = tieredLandmark;
    expect(() => canonicalLandmarkSchema.parse(untiered)).toThrow();
    expect(() => canonicalLandmarkSchema.parse(tieredLandmark)).toThrow(); // strict: legacy fields present
    expect(() =>
      canonicalLandmarkSchema.parse({
        id: tieredLandmark.id,
        title: tieredLandmark.title,
        draft: tieredLandmark.draft,
        levels: tieredLandmark.levels,
        sources: tieredLandmark.sources,
      }),
    ).not.toThrow();
  });

  it('fails the manifest build when a landmark is missing required fields (VAL-002)', () => {
    // Prove the failure travels through the builder's own parse, not just the
    // schema in isolation: buildContentManifest calls landmarkSchema.parse per
    // landmark and manifestSchema.parse over the assembled regions.
    const good = buildContentManifest('2026-08-02T00:00:00.000Z');
    const { hook: _dropped, ...brokenLandmark } = good.regions[0].landmarks[0];
    const brokenManifest = {
      ...good,
      regions: [
        { ...good.regions[0], landmarks: [brokenLandmark, ...good.regions[0].landmarks.slice(1)] },
        ...good.regions.slice(1),
      ],
    };
    expect(() => manifestSchema.parse(brokenManifest)).toThrow();

    const { hook: _hook, ...missingHook } = tieredLandmark;
    expect(() => landmarkSchema.parse(missingHook)).toThrow();

    const { assessment: _assessment, ...missingAssessment } = tieredLandmark.levels!.l2;
    expect(() =>
      landmarkSchema.parse({
        ...tieredLandmark,
        levels: { ...tieredLandmark.levels!, l2: missingAssessment },
      }),
    ).toThrow();

    // A malformed assessment (answer not among options) is rejected too.
    expect(() =>
      landmarkSchema.parse({
        ...tieredLandmark,
        levels: {
          ...tieredLandmark.levels!,
          l1: {
            ...tieredLandmark.levels!.l1,
            assessment: { ...tieredLandmark.levels!.l1.assessment, answer: 'not an option' },
          },
        },
      }),
    ).toThrow();
  });
});
