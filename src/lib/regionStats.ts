import type { Region } from '@/data/regions';

export function countDeepRegions(regions: Region[]) {
  return regions.filter((region) => region.status === 'deep').length;
}

export function countLandmarks(regions: Region[]) {
  return regions.reduce((total, region) => total + region.landmarks.length, 0);
}
