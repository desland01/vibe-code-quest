import { landmarkRegistry } from './index.ts';
import { regionMetas } from './regions.ts';
import { landmarkSchema, manifestSchema, type ContentManifest } from './schema.ts';

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
