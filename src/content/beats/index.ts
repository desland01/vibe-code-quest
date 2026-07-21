import { beatSequenceSchema, type BeatSequence } from './schema.ts';
import { deriveBeatSequence } from './derive.ts';
import { sequence as commitsAsCheckpoints } from '../git/beats/commits-as-checkpoints.ts';
import { sequence as trustBoundaries } from '../security/beats/trust-boundaries.ts';
import { landmarkRegistry } from '../index.ts';

// Static beat-sequence registry (frozen DESIGN_CONTRACT §4/§8). Server-side only.
// L-002: every canonical landmark has a sequence. Two hand-authored pilot/transfer
// sequences stay as overrides; the remaining 46 are deterministic canonical projections
// of that landmark's own fields only (no sibling-landmark text).

const HAND_AUTHORED: ReadonlyMap<string, BeatSequence> = new Map([
  ['git/commits-as-checkpoints', commitsAsCheckpoints],
  ['security/trust-boundaries', trustBoundaries],
]);

const registryEntries: BeatSequence[] = [];
for (const [regionId, landmarks] of Object.entries(landmarkRegistry)) {
  for (const landmark of landmarks) {
    const key = `${regionId}/${landmark.id}`;
    const hand = HAND_AUTHORED.get(key);
    registryEntries.push(hand ?? deriveBeatSequence(regionId, landmark));
  }
}

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

export function listBeatSequenceKeys(): string[] {
  return [...registry.keys()].sort();
}

export function isHandAuthoredBeatSequence(regionId: string, landmarkId: string): boolean {
  return HAND_AUTHORED.has(`${regionId}/${landmarkId}`);
}

// Build-time validation hook: parses every registered sequence and checks canonical references.
// Called by build-manifest.
export function validateBeatSequences(
  entries: readonly BeatSequence[] = registryEntries,
): { count: number; keys: string[] } {
  const keys: string[] = [];
  for (const entry of entries) {
    const parsedEntry = beatSequenceSchema.parse(entry);
    const key = `${parsedEntry.regionId}/${parsedEntry.landmarkId}`;
    const region = landmarkRegistry[parsedEntry.regionId];
    if (!region?.some((landmark) => landmark.id === parsedEntry.landmarkId)) {
      throw new Error(`Beat sequence references missing canonical landmark: ${key}`);
    }
    keys.push(key);
  }
  return {
    count: entries === registryEntries ? registry.size : entries.length,
    keys: keys.sort(),
  };
}

export {
  deriveBeatSequence,
  FACTORY_FRAMING,
  factoryFramingValues,
  landmarkCorpus,
  definitionSentences,
  stableSlot,
  allowedWrongFeedbacks,
  wrongFeedbackFor,
} from './derive.ts';
