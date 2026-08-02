import { noteToFrequency } from './notes.ts';

// ISSUE-018 — the core SFX (CREATIVE_BIBLE §5.4).
//
// Each entry is DATA, not a function that touches an AudioContext. The engine
// plays them; this module only says what they are. That split is what lets the
// whole SFX table be unit-tested with no Web Audio at all, and it keeps the
// "losses are quiet" rule visible as a number rather than buried in a callback.

export type SfxTone = {
  /** Which voice renders it. SFX may steal pulse2 and noise, never pulse1's melody. */
  voice: 'pulse' | 'triangle' | 'noise';
  /** Note name, or null for an unpitched noise burst. */
  note: string | null;
  /** Milliseconds. */
  ms: number;
  gain: number;
  duty?: 0.5 | 0.25;
  /** Noise colouring, applied to the shared noise filter. */
  filter?: { type: BiquadFilterType; hz: number };
  decay?: 'linear' | 'exponential';
};

export type Sfx = { id: string; tones: SfxTone[] };

const SFX_LIST: Sfx[] = [
  {
    id: 'sfx-correct',
    tones: [
      { voice: 'pulse', note: 'C6', ms: 30, gain: 0.3, duty: 0.5 },
      { voice: 'pulse', note: 'E6', ms: 30, gain: 0.3, duty: 0.5 },
      { voice: 'pulse', note: 'G6', ms: 60, gain: 0.3, duty: 0.5, decay: 'exponential' },
    ],
  },
  {
    id: 'sfx-wrong',
    // Quieter than correct, on purpose: losses are quiet (§5.4). The gain gap is
    // the design, so it is asserted rather than left to taste.
    tones: [
      { voice: 'pulse', note: 'E4', ms: 60, gain: 0.22, duty: 0.25 },
      { voice: 'pulse', note: 'C4', ms: 90, gain: 0.22, duty: 0.25, decay: 'linear' },
    ],
  },
  {
    id: 'sfx-nav',
    tones: [{ voice: 'noise', note: null, ms: 12, gain: 0.12, filter: { type: 'highpass', hz: 6000 } }],
  },
  {
    id: 'sfx-stamp',
    tones: [
      { voice: 'triangle', note: 'C3', ms: 40, gain: 0.28 },
      { voice: 'noise', note: null, ms: 80, gain: 0.24, filter: { type: 'lowpass', hz: 400 }, decay: 'exponential' },
    ],
  },
  {
    id: 'sfx-streak',
    tones: [
      { voice: 'pulse', note: 'C5', ms: 25, gain: 0.2, duty: 0.5 },
      { voice: 'pulse', note: 'E5', ms: 25, gain: 0.2, duty: 0.5 },
      { voice: 'pulse', note: 'G5', ms: 25, gain: 0.2, duty: 0.5 },
    ],
  },
  {
    id: 'jingle-level',
    tones: [
      { voice: 'pulse', note: 'C5', ms: 110, gain: 0.26, duty: 0.5 },
      { voice: 'pulse', note: 'E5', ms: 110, gain: 0.26, duty: 0.5 },
      { voice: 'pulse', note: 'G5', ms: 110, gain: 0.26, duty: 0.5 },
      { voice: 'pulse', note: 'C6', ms: 110, gain: 0.26, duty: 0.5 },
      { voice: 'pulse', note: 'E6', ms: 330, gain: 0.26, duty: 0.5 },
      { voice: 'pulse', note: 'D6', ms: 110, gain: 0.26, duty: 0.5 },
      { voice: 'pulse', note: 'C6', ms: 440, gain: 0.26, duty: 0.5, decay: 'exponential' },
    ],
  },
];

export const SFX: ReadonlyMap<string, Sfx> = new Map(SFX_LIST.map((entry) => [entry.id, entry]));

export const SFX_IDS = SFX_LIST.map((entry) => entry.id);

/**
 * `sfx-streak` transposes the whole figure +1 semitone per combo level, capped
 * at +7 (§5.4) — the cap is the point: an uncapped run climbs out of the
 * register and starts sounding like an alarm.
 */
export const STREAK_TRANSPOSE_CAP = 7;

export function streakTones(streak: number): SfxTone[] {
  const semitones = Math.min(Math.max(streak - 1, 0), STREAK_TRANSPOSE_CAP);
  return SFX.get('sfx-streak')!.tones.map((tone) => ({ ...tone, note: tone.note, transposed: semitones })) as SfxTone[];
}

export function toneFrequency(tone: SfxTone, transpose = 0): number | null {
  return tone.note === null ? null : noteToFrequency(tone.note, transpose);
}
