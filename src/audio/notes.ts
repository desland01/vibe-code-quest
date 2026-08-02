// ISSUE-018 — note names, pattern parsing, and the 16th-note grid.
//
// Patterns are written in the creative bible's own notation (`C5:2 E5:2 | ...`,
// `r` = rest, length in 16th steps) and parsed here rather than transcribed into
// frequency arrays by hand. The bible's note data is the source of truth and the
// riffs "ship verbatim" (§5.2) — a transcription step is a place for them to
// stop being verbatim.

const SEMITONES: Record<string, number> = {
  C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4,
  F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11,
};

/** Equal temperament, A4 = 440 Hz. */
export function noteToFrequency(note: string, transpose = 0): number {
  const match = /^([A-G](?:#|b)?)(-?\d)$/.exec(note);
  if (!match) throw new Error(`Unparseable note: ${note}`);
  const [, name, octave] = match;
  const midi = (Number(octave) + 1) * 12 + SEMITONES[name!]! + transpose;
  return 440 * 2 ** ((midi - 69) / 12);
}

export type Step = { note: string | null; len: number };

/**
 * Parse `"C5:2 E5:2 G5:4"` into steps. Bars may be separated by `|`; the
 * separator is documentation, so it is accepted and ignored rather than made
 * load-bearing — a mis-typed bar line should not silently change the music.
 */
export function parsePattern(source: string): Step[] {
  return source
    .split(/[|\s]+/)
    .map((token) => token.trim())
    .filter(Boolean)
    .map((token) => {
      const [note, len] = token.split(':');
      const length = Number(len);
      if (!Number.isInteger(length) || length <= 0) {
        throw new Error(`Unparseable step: ${token}`);
      }
      return { note: note === 'r' ? null : note!, len: length };
    });
}

/** Total length of a pattern in 16th steps. */
export function patternLength(steps: readonly Step[]): number {
  return steps.reduce((sum, step) => sum + step.len, 0);
}

export const STEPS_PER_BAR = 16;

/** Seconds per 16th step at a tempo. */
export function stepSeconds(bpm: number): number {
  return 60 / bpm / 4;
}
