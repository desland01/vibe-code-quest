import {
  beatSequenceSchema,
  sequenceKey,
  type BeatSequence,
  type SequenceRef,
} from './schema.ts';
import {
  deriveLevelSequence,
  landmarkLevelSources,
  sequenceProvenanceViolations,
} from './derive.ts';
import { sequence as commitsAsCheckpoints } from '../git/beats/commits-as-checkpoints.ts';
import { sequence as trustBoundaries } from '../security/beats/trust-boundaries.ts';
import { landmarkRegistry } from '../index.ts';
import type { LevelId } from '../schema.ts';
import { sequenceVoiceViolations } from './voice.ts';

// Static beat-sequence registry. Server-side only.
//
// Arcade rebuild: keys are the three-part identity `${regionId}/${landmarkId}/${level}`.
// A landmark that declares `levels` registers all three of its runs; a landmark
// still carrying only legacy top-level fields registers its L3 run alone during
// the L3-only compatibility window (DATA_MODEL §6 step 1). The registry reaches
// its full 144 keys when M4–M6 finish authoring every island, which is when
// ISSUE-033 activates the 144-count gate.
//
// Two hand-authored sequences stay as overrides; every other run is a
// deterministic projection of that landmark's own level fields (no
// sibling-landmark and no cross-level text).

const HAND_AUTHORED: ReadonlyMap<string, BeatSequence> = new Map([
  ['git/commits-as-checkpoints/l3', commitsAsCheckpoints],
  ['security/trust-boundaries/l3', trustBoundaries],
]);

const registryEntries: BeatSequence[] = [];
for (const [regionId, landmarks] of Object.entries(landmarkRegistry)) {
  for (const landmark of landmarks) {
    for (const [level, content] of landmarkLevelSources(landmark)) {
      const key = `${regionId}/${landmark.id}/${level}`;
      const hand = HAND_AUTHORED.get(key);
      registryEntries.push(hand ?? deriveLevelSequence(regionId, landmark, level, content));
    }
  }
}

const parsed = registryEntries.map((entry) => beatSequenceSchema.parse(entry));
const registry = new Map<string, BeatSequence>();
for (const entry of parsed) {
  const key = sequenceKey(entry);
  if (registry.has(key)) throw new Error(`Duplicate beat sequence registered: ${key}`);
  registry.set(key, entry);
}

// ── SequenceRef API (the arcade lookup surface) ──────────────────────────────

export function getSequence(ref: SequenceRef): BeatSequence | undefined {
  return registry.get(sequenceKey(ref));
}

export function hasSequence(ref: SequenceRef): boolean {
  return registry.has(sequenceKey(ref));
}

/** Levels that actually have a playable run for this landmark, in tier order. */
export function availableLevels(regionId: string, landmarkId: string): LevelId[] {
  return (['l1', 'l2', 'l3'] as const).filter((level) =>
    registry.has(`${regionId}/${landmarkId}/${level}`),
  );
}

export function isHandAuthoredSequence(ref: SequenceRef): boolean {
  return HAND_AUTHORED.has(sequenceKey(ref));
}

// ── L3-only compatibility surface ────────────────────────────────────────────
// Callers that predate level identity resolve to the L3 run, which is the tier
// the pre-rebuild product shipped. These narrow to the SequenceRef API as their
// own issues land (server gating in ISSUE-005, routing in ISSUE-015).

export function getBeatSequence(regionId: string, landmarkId: string): BeatSequence | undefined {
  return getSequence({ regionId, landmarkId, level: 'l3' });
}

export function hasBeatSequence(regionId: string, landmarkId: string): boolean {
  return hasSequence({ regionId, landmarkId, level: 'l3' });
}

export function isHandAuthoredBeatSequence(regionId: string, landmarkId: string): boolean {
  return isHandAuthoredSequence({ regionId, landmarkId, level: 'l3' });
}

export function listBeatSequenceKeys(): string[] {
  return [...registry.keys()].sort();
}

// Build-time validation hook: parses every registered sequence and checks canonical references.
// Called by build-manifest. The returned count is a build report, never a public manifest field.
export function validateBeatSequences(
  entries: readonly BeatSequence[] = registryEntries,
): { count: number; keys: string[]; pendingRevoice: string[] } {
  const keys: string[] = [];
  const pendingRevoice: string[] = [];
  for (const entry of entries) {
    const parsedEntry = beatSequenceSchema.parse(entry);
    const key = sequenceKey(parsedEntry);
    const region = landmarkRegistry[parsedEntry.regionId];
    const landmark = region?.find((candidate) => candidate.id === parsedEntry.landmarkId);
    if (!landmark) {
      throw new Error(`Beat sequence references missing canonical landmark: ${key}`);
    }

    // Tier-aware provenance (VAL-012). Structure alone cannot catch a foreign
    // fact, so every derived sequence is checked against the exact level source
    // it claims to project. Hand-authored sequences are exempt here because
    // their copy is deliberately written rather than projected; they are held to
    // the voice and word-budget suite instead (ISSUE-008) and re-voiced through
    // it in ISSUE-012.
    if (!HAND_AUTHORED.has(key)) {
      const content = landmarkLevelSources(landmark).get(parsedEntry.level);
      if (!content) {
        throw new Error(`Beat sequence has no canonical level source: ${key}`);
      }
      const violations = sequenceProvenanceViolations(parsedEntry, landmark.title, content);
      if (violations.length > 0) {
        throw new Error(`Beat sequence provenance violations:\n${violations.join('\n')}`);
      }
    }

    // Voice enforcement (ISSUE-008, VAL-014b). Arcade-authored content — any
    // landmark that declares `levels` — MUST pass; a budget or banned-phrase
    // violation fails the build. Legacy landmarks still carrying only pre-rebuild
    // top-level fields are REPORTED, not failed: their copy is the coursework
    // slop the mission exists to replace, and it is re-voiced landmark by
    // landmark (Git in ISSUE-012, the rest in M4-M6). Failing them now would
    // simply make the build red for the entire mission with nothing actionable.
    const voice = sequenceVoiceViolations(parsedEntry);
    if (voice.length > 0) {
      if (landmark.levels) {
        throw new Error(`Beat sequence voice violations:\n${voice.join('\n')}`);
      }
      pendingRevoice.push(...voice);
    }

    keys.push(key);
  }
  return {
    count: entries === registryEntries ? registry.size : entries.length,
    keys: keys.sort(),
    pendingRevoice,
  };
}

export {
  deriveLevelSequence,
  landmarkLevelSources,
  legacyLevelContent,
  FACTORY_FRAMING,
  factoryFramingValues,
  levelCorpus,
  sequenceProvenanceViolations,
  definitionSentences,
  stableSlot,
  allowedWrongFeedbacks,
  wrongFeedbackFor,
} from './derive.ts';
