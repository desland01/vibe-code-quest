import manifestV1Json from '../../public/content-manifest.v1.json';
import { manifestSchema, type ContentManifest, type Landmark, type Region } from '@/content/schema';

const manifestVersions: readonly ContentManifest[] = [manifestSchema.parse(manifestV1Json)];

export function loadManifest(): ContentManifest {
  return manifestVersions.at(-1)!;
}

export const regions: readonly Region[] = loadManifest().regions;
export const defaultRegion = regions.find((region) => region.id === 'databases') ?? regions[0];

export function getRegion(regionId: string): Region | undefined {
  return regions.find((region) => region.id === regionId);
}

export function getLandmark(regionId: string, landmarkId: string): Landmark | undefined {
  return getRegion(regionId)?.landmarks.find((landmark) => landmark.id === landmarkId);
}

export function resolveLandmarkAnyVersion(regionId: string, landmarkId: string): Landmark | undefined {
  for (let index = manifestVersions.length - 1; index >= 0; index -= 1) {
    const region = manifestVersions[index].regions.find((candidate) => candidate.id === regionId);
    const landmark = region?.landmarks.find((candidate) => candidate.id === landmarkId);
    if (landmark) return landmark;
  }
  return undefined;
}
