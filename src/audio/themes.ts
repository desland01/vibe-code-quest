import { parsePattern, type Step } from './notes.ts';

// ISSUE-018 — "Insert Coin, Ask Questions" and its three variants
// (CREATIVE_BIBLE §5.5), plus the island themes that ship in v1.
//
// The three variants are PARAMETER DELTAS over one set of pattern data, not
// three hand-copies. That is the explicit instruction in §5.5 and it is also the
// only version the owner can actually judge: three transcriptions would differ
// in ways nobody intended, and the taste gate (ISSUE-021) would be comparing
// transcription accidents as much as arrangements.

export type DrumMap = {
  kick: number[];
  snare: number[];
  /** 'evens' = 8ths, 'all' = 16ths, 'none' = dropped. */
  hats: 'evens' | 'all' | 'none';
};

export type Theme = {
  id: string;
  title: string;
  bpm: number;
  /** Semitone offset applied to every tonal voice. */
  transpose: number;
  /** PeriodicWave duty for each pulse voice. */
  duty: { pulse1: 0.5 | 0.25; pulse2: 0.5 | 0.25 };
  /** Melody octave shift, in octaves. */
  melodyOctave: number;
  /** 0.5 = straight; 0.55 is the lo-fi shuffle. */
  swing: number;
  drums: DrumMap;
  pulse1: Step[];
  pulse2: Step[];
  triangle: Step[];
};

// ── Main theme pattern data (§5.5), transcribed once ─────────────────────────

const MAIN_PULSE1 = `
C5:2 E5:2 G5:2 C6:2 B5:2 G5:2 A5:4 |
F5:2 A5:2 C6:2 A5:2 G5:4 E5:4 |
D5:2 F5:2 A5:2 D6:2 C6:2 A5:2 B5:4 |
G5:2 E5:2 D5:2 E5:2 C5:8 |
E5:2 G5:2 C6:2 E6:2 D6:2 C6:2 B5:4 |
F5:2 A5:2 C6:2 F6:2 E6:2 C6:2 D6:4 |
G5:2 B5:2 D6:2 G6:2 F6:2 D6:2 E6:2 C6:2 |
D6:2 B5:2 G5:2 B5:2 C6:8
`;

// Roots in 8ths, alternating root/fifth; bar 4 is G2 then C3; bar 8 lands on C3.
const MAIN_TRIANGLE = `
C3:2 G3:2 C3:2 G3:2 C3:2 G3:2 C3:2 G3:2 |
F3:2 C4:2 F3:2 C4:2 F3:2 C4:2 F3:2 C4:2 |
D3:2 A3:2 D3:2 A3:2 D3:2 A3:2 D3:2 A3:2 |
G2:2 D3:2 G2:2 D3:2 C3:2 G3:2 C3:2 G3:2 |
C3:2 G3:2 C3:2 G3:2 C3:2 G3:2 C3:2 G3:2 |
F3:2 C4:2 F3:2 C4:2 F3:2 C4:2 F3:2 C4:2 |
G3:2 D4:2 G3:2 D4:2 G3:2 D4:2 G3:2 D4:2 |
G2:2 G2:2 G2:2 G2:2 C3:8
`;

// Offbeat chord stabs: rest on every downbeat 8th, the chord third on every
// offbeat. Bars 4 and 8 hold the third under the melody's long note.
const MAIN_PULSE2 = `
r:2 E4:2 r:2 E4:2 r:2 G4:2 r:2 G4:2 |
r:2 A4:2 r:2 A4:2 r:2 C5:2 r:2 C5:2 |
r:2 F4:2 r:2 F4:2 r:2 A4:2 r:2 A4:2 |
r:2 E4:2 r:2 E4:2 E4:8 |
r:2 E4:2 r:2 E4:2 r:2 G4:2 r:2 G4:2 |
r:2 A4:2 r:2 A4:2 r:2 C5:2 r:2 C5:2 |
r:2 B4:2 r:2 B4:2 r:2 D5:2 r:2 D5:2 |
r:2 B4:2 r:2 B4:2 E4:8
`;

const STANDARD_KIT: DrumMap = { kick: [0, 8], snare: [4, 12], hats: 'evens' };

const MAIN_BASE = {
  pulse1: parsePattern(MAIN_PULSE1),
  pulse2: parsePattern(MAIN_PULSE2),
  triangle: parsePattern(MAIN_TRIANGLE),
};

/**
 * The three variants, as deltas. Each one names exactly what it changes, so the
 * owner's pick (VAL-029) is a pick between arrangements rather than between
 * three separately-typed tunes.
 */
export const MAIN_THEME_VARIANTS: readonly Theme[] = [
  {
    id: 'v1-attract-mode',
    title: 'V1 — Attract Mode',
    bpm: 132,
    transpose: 0,
    duty: { pulse1: 0.5, pulse2: 0.25 },
    melodyOctave: 0,
    swing: 0.5,
    drums: STANDARD_KIT,
    ...MAIN_BASE,
  },
  {
    id: 'v2-bedroom-tape',
    title: 'V2 — Bedroom Tape',
    bpm: 96,
    transpose: 0,
    duty: { pulse1: 0.25, pulse2: 0.25 },
    melodyOctave: -1,
    swing: 0.55,
    drums: { kick: [0, 8], snare: [4, 12], hats: 'evens' },
    ...MAIN_BASE,
  },
  {
    id: 'v3-final-boss',
    title: 'V3 — Final Boss of Not Knowing',
    bpm: 152,
    // C major → A minor is the relative minor: down three semitones.
    transpose: -3,
    duty: { pulse1: 0.5, pulse2: 0.25 },
    melodyOctave: 0,
    swing: 0.5,
    // Snare on every offbeat 8th, and the bass runs constant 16ths (below).
    drums: { kick: [0, 8], snare: [2, 6, 10, 14], hats: 'all' },
    ...MAIN_BASE,
    triangle: parsePattern(
      MAIN_TRIANGLE.replace(/:2/g, ':1').replace(/:8/g, ':4'),
    ),
  },
];

export const DEFAULT_VARIANT_ID = 'v1-attract-mode';

export function variantById(id: string): Theme {
  return MAIN_THEME_VARIANTS.find((theme) => theme.id === id) ?? MAIN_THEME_VARIANTS[0]!;
}

// ── Island themes (§5.2) ─────────────────────────────────────────────────────
// Out of bounds for v1: only git, databases and security get their own theme
// (§8.1 cut item 3). Every other island plays the main theme at its own tempo.

export const ISLAND_THEMES: Record<string, { bpm: number; transpose: number; riff: string; drums: DrumMap }> = {
  git: {
    bpm: 116,
    transpose: 7, // G major
    riff: 'G4:2 B4:2 D5:2 G5:2 F#5:2 D5:2 E5:4',
    drums: STANDARD_KIT,
  },
  databases: {
    bpm: 96,
    transpose: -3, // A minor
    riff: 'A3:4 A3:2 C4:2 E4:4 D4:2 C4:2',
    drums: STANDARD_KIT,
  },
  security: {
    bpm: 100,
    transpose: 1, // C# minor
    riff: 'C#4:1 r:1 C#4:1 r:1 E4:2 F#4:2 G#4:4 E4:2 r:2',
    // Security drops hats — staccato sneak.
    drums: { kick: [0, 8], snare: [4, 12], hats: 'none' },
  },
};

/** The tempo an island plays at, whether or not it has its own theme. */
export const ISLAND_TEMPO: Record<string, number> = {
  languages: 112,
  databases: 96,
  infra: 120,
  'ai-types': 132,
  'pm-tools': 104,
  git: 116,
  security: 100,
  design: 108,
};

/**
 * The L3 tier variant (§5.3): "the room gets quieter." Tempo ×0.94, down three
 * semitones, and pulse2 stays silent until a streak of five.
 */
export function applyLevelTier(theme: Theme, level: 'l1' | 'l2' | 'l3'): Theme {
  if (level !== 'l3') return theme;
  return {
    ...theme,
    bpm: Math.round(theme.bpm * 0.94),
    transpose: theme.transpose - 3,
  };
}
