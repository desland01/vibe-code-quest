import { describe, expect, it } from 'vitest';
import { regions } from '@/data/regions';
import { countDeepRegions, countLandmarks } from '@/lib/regionStats';

describe('regionStats', () => {
  it('keeps v1 scoped to two deep regions', () => {
    expect(countDeepRegions(regions)).toBe(2);
  });

  it('has starter landmarks for the deep regions', () => {
    expect(countLandmarks(regions)).toBeGreaterThanOrEqual(4);
  });
});
