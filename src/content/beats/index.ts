import { beatSequenceSchema, type BeatSequence } from './schema.ts';
import { sequence as commitsAsCheckpoints } from '../git/beats/commits-as-checkpoints.ts';
import { sequence as trustBoundaries } from '../security/beats/trust-boundaries.ts';
import { landmarkRegistry } from '../index.ts';

// Static beat-sequence registry (frozen DESIGN_CONTRACT §4/§8). Server-side only.
// Explicit imports only — no dynamic loading, no full-registry client exposure.

const registryEntries: readonly BeatSequence[] = [
  commitsAsCheckpoints,
  trustBoundaries,
];

const parsed = registryEntries.map((entry) => beatSequenceSchema.parse(entry));
const registry = new Map<string, BeatSequence>();
for (const entry of parsed) {
  const key = `${entry.regionId}/${entry.landmarkId}`;
  if (registry.has(key)) throw new Error(`Duplicate beat sequence registered: ${key}`);
  registry.set(key, entry);
}

export function getBeatSequence(regionId: string, landmarkId: string): BeatSequence | undefined {
  return registry.get(`${regionId}/${landmarkId}`);
}

export function hasBeatSequence(regionId: string, landmarkId: string): boolean {
  return registry.has(`${regionId}/${landmarkId}`);
}

// Build-time validation hook: parses every registered sequence and checks canonical references.
// Called by build-manifest.
export function validateBeatSequences(entries: readonly BeatSequence[] = registryEntries): { count: number; keys: string[] } {
  for (const entry of entries) {
    const parsedEntry = beatSequenceSchema.parse(entry);
    const key = `${parsedEntry.regionId}/${parsedEntry.landmarkId}`;
    const region = landmarkRegistry[parsedEntry.regionId];
    if (!region?.some((landmark) => landmark.id === parsedEntry.landmarkId)) {
      throw new Error(`Beat sequence references missing canonical landmark: ${key}`);
    }
  }
  return { count: registry.size, keys: [...registry.keys()] };
}
