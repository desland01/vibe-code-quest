import { beatSequenceSchema, type BeatSequence } from './schema.ts';
import { sequence as commitsAsCheckpoints } from '../git/beats/commits-as-checkpoints.ts';

// Static beat-sequence registry (frozen DESIGN_CONTRACT §4/§8). Server-side only.
// Explicit imports only — no dynamic loading, no full-registry client exposure.

const registryEntries: readonly BeatSequence[] = [
  commitsAsCheckpoints,
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

// Build-time validation hook: parses every registered sequence. Called by build-manifest.
export function validateBeatSequences(): { count: number; keys: string[] } {
  for (const entry of registryEntries) beatSequenceSchema.parse(entry);
  return { count: registry.size, keys: [...registry.keys()] };
}
