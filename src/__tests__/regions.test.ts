import { describe, expect, it } from 'vitest';
import { regionsSchema } from '../content/schema';
import { regions } from '../data/regions';

describe('regions', () => {
  it('contains exactly eight regions with landmark arrays', () => {
    expect(regions).toHaveLength(8);

    for (const region of regions) {
      expect(Array.isArray(region.landmarks)).toBe(true);
    }
  });

  it('uses unique region and landmark ids', () => {
    const regionIds = regions.map((region) => region.id);
    const landmarkIds = regions.flatMap((region) =>
      region.landmarks.map((landmark) => landmark.id)
    );

    expect(new Set(regionIds).size).toBe(regionIds.length);
    expect(new Set(landmarkIds).size).toBe(landmarkIds.length);
  });

  it('parses the existing sample data with the runtime schema', () => {
    expect(regionsSchema.parse(regions)).toEqual(regions);
  });
});
