import { loadManifest } from './content';
import type { ContentManifest, Region } from '@/content/schema';

const manifest: ContentManifest = loadManifest();

export const regions: readonly Region[] = manifest.regions;
export const defaultRegion = regions.find((region) => region.id === 'databases') ?? regions[0];
