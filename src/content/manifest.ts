import { landmarkRegistry } from './index.ts';
import { regionMetas } from './regions.ts';
import {
  landmarkSchema,
  manifestSchema,
  publicManifestSchema,
  type ContentManifest,
  type PublicContentManifest,
} from './schema.ts';

export function buildContentManifest(generatedAt: string, version = 1): ContentManifest {
  const seen = new Set<string>();
  const regions = regionMetas.map((meta) => {
    const registered = landmarkRegistry[meta.id];
    if (!registered) throw new Error(`No landmark registry entry for region ${meta.id}`);
    const landmarks = registered.map((value) => landmarkSchema.parse(value));
    const ids = landmarks.map(({ id }) => id);
    if (JSON.stringify(ids) !== JSON.stringify(meta.landmarkIds)) {
      throw new Error(`Registry order mismatch for ${meta.id}: expected ${meta.landmarkIds.join(', ')}, got ${ids.join(', ')}`);
    }
    for (const id of ids) {
      if (seen.has(id)) throw new Error(`Duplicate landmark id: ${id}`);
      seen.add(id);
    }
    const { landmarkIds, ...region } = meta;
    return { ...region, landmarks };
  });

  if (regions.length !== 8 || seen.size !== 48) {
    throw new Error(`Expected 8 regions and 48 unique landmarks; got ${regions.length} and ${seen.size}`);
  }

  const manifest = manifestSchema.parse({ version, generatedAt, regions });
  const roundTrip = JSON.parse(JSON.stringify(manifest));
  return manifestSchema.parse(roundTrip);
}

/** Public manifest byte budgets (DATA_MODEL §8 budget 1). */
export const PUBLIC_MANIFEST_MAX_RAW_BYTES = 160_000;

/**
 * Build the public manifest v2 (DATA_MODEL §8): region and map metadata plus a
 * slim landmark overview. It carries no `levels`, no assessments, no beats, no
 * answer keys, and no registry inventory — those stay in server-only modules.
 */
export function buildPublicContentManifest(generatedAt: string): PublicContentManifest {
  const source = buildContentManifest(generatedAt);
  const regions = source.regions.map((region) => ({
    id: region.id,
    title: region.title,
    label: region.label,
    description: region.description,
    mapArea: region.mapArea,
    landmarks: region.landmarks.map((landmark) => ({
      id: landmark.id,
      title: landmark.title,
      draft: landmark.draft,
    })),
  }));

  const manifest = publicManifestSchema.parse({ version: 2, generatedAt, regions });
  const raw = Buffer.byteLength(JSON.stringify(manifest), 'utf8');
  if (raw > PUBLIC_MANIFEST_MAX_RAW_BYTES) {
    throw new Error(
      `Public manifest v2 is ${raw} raw bytes; budget is ${PUBLIC_MANIFEST_MAX_RAW_BYTES}`,
    );
  }
  return publicManifestSchema.parse(JSON.parse(JSON.stringify(manifest)));
}
