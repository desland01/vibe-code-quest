import type { Region } from '@/content/schema';

export function countDeepRegions(regions: Region[]) {
  return regions.length;
}

export function countLandmarks(regions: Region[]) {
  return regions.reduce((total, region) => total + region.landmarks.length, 0);
}
