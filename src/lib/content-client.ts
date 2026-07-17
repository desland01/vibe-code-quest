import manifestV1Json from '../../public/content-manifest.v1.json';
import type { ContentManifest, Region } from '@/content/schema';

const manifest = manifestV1Json as ContentManifest;

export const regions: readonly Region[] = manifest.regions;
export const defaultRegion = regions.find((region) => region.id === 'databases') ?? regions[0];
