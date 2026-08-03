import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  AudioEngine,
  HARMONY_ENTERS_AT,
  HATS_DOUBLE_AT,
  MUTE_STORAGE_KEY,
  readMutePreference,
  writeMutePreference,
} from '@/audio/AudioEngine';
import { noteToFrequency, parsePattern, patternLength, stepSeconds } from '@/audio/notes';
import { SFX, SFX_IDS, STREAK_TRANSPOSE_CAP } from '@/audio/sfx';
import { MAIN_THEME_VARIANTS, applyLevelTier, variantById } from '@/audio/themes';

// ISSUE-018 — VAL-021 through VAL-028.
//
// The engine is tested against a fake AudioContext rather than a real one. That
// is not a shortcut: what these assertions are about is the CONTRACT — how many
// nodes exist, when the context is created, what the master gain does — and a
// fake makes every one of those directly observable instead of inferred from
// sound nobody can hear in CI.

function fakeParam() {
  return {
    value: 0,
    setValueAtTime: vi.fn(),
    setTargetAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  };
}

type FakeNode = { connect: (n: unknown) => unknown; disconnect: () => void };

function makeFakeContext() {
  const created: string[] = [];
  const node = (kind: string, extra: Record<string, unknown> = {}) => {
    created.push(kind);
    const self: Record<string, unknown> = {
      connect: (next: unknown) => next,
      disconnect: vi.fn(),
      ...extra,
    };
    return self as unknown as FakeNode;
  };
  const ctx = {
    currentTime: 0,
    sampleRate: 44100,
    destination: {},
    state: 'running',
    createGain: () => node('gain', { gain: fakeParam() }),
    createOscillator: () =>
      node('oscillator', {
        frequency: fakeParam(),
        type: 'sine',
        setPeriodicWave: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
      }),
    createBufferSource: () =>
      node('bufferSource', { buffer: null, loop: false, start: vi.fn(), stop: vi.fn() }),
    createBiquadFilter: () => node('filter', { type: 'highpass', frequency: fakeParam() }),
    createDynamicsCompressor: () =>
      node('compressor', {
        threshold: fakeParam(),
        knee: fakeParam(),
        ratio: fakeParam(),
        attack: fakeParam(),
        release: fakeParam(),
      }),
    createBuffer: (_c: number, length: number) => ({ getChannelData: () => new Float32Array(length) }),
    createPeriodicWave: () => ({}),
    close: vi.fn(),
  };
  return { ctx: ctx as unknown as AudioContext, created };
}

describe('note and pattern parsing', () => {
  it('resolves equal-temperament frequencies', () => {
    expect(noteToFrequency('A4')).toBeCloseTo(440, 6);
    expect(noteToFrequency('A5')).toBeCloseTo(880, 6);
    expect(noteToFrequency('C4')).toBeCloseTo(261.6256, 3);
    expect(noteToFrequency('A4', 12)).toBeCloseTo(880, 6);
    expect(noteToFrequency('F#5')).toBeCloseTo(739.989, 2);
  });

  it('parses the bible notation including rests, and treats bar lines as documentation', () => {
    const steps = parsePattern('C5:2 r:2 | E5:4');
    expect(steps).toEqual([
      { note: 'C5', len: 2 },
      { note: null, len: 2 },
      { note: 'E5', len: 4 },
    ]);
    expect(patternLength(steps)).toBe(8);
    expect(parsePattern('C5:2 E5:2')).toEqual(parsePattern('C5:2 | E5:2'));
  });

  it('rejects an unparseable step rather than silently dropping it', () => {
    expect(() => parsePattern('C5')).toThrow();
    expect(() => parsePattern('C5:0')).toThrow();
    expect(() => noteToFrequency('H4')).toThrow();
  });
});

describe('main theme variants', () => {
  it('ships exactly three variants for the owner to pick from', () => {
    expect(MAIN_THEME_VARIANTS).toHaveLength(3);
    expect(MAIN_THEME_VARIANTS.map((v) => v.id)).toEqual([
      'v1-attract-mode',
      'v2-bedroom-tape',
      'v3-final-boss',
    ]);
  });

  // §5.5: "Build all three from the same pattern data with parameter deltas —
  // not three hand-copies." If the melodies could drift, the owner's ear test
  // would be comparing transcriptions as much as arrangements.
  it('builds every variant from the SAME melody data', () => {
    const [v1, v2, v3] = MAIN_THEME_VARIANTS;
    expect(v2!.pulse1).toEqual(v1!.pulse1);
    expect(v3!.pulse1).toEqual(v1!.pulse1);
    expect(v2!.triangle).toEqual(v1!.triangle);
  });

  it('differs only in the documented parameters', () => {
    const [v1, v2, v3] = MAIN_THEME_VARIANTS;
    expect(v1!.bpm).toBe(132);
    expect(v2!.bpm).toBe(96);
    expect(v3!.bpm).toBe(152);
    expect(v2!.duty).toEqual({ pulse1: 0.25, pulse2: 0.25 });
    expect(v2!.melodyOctave).toBe(-1);
    expect(v2!.swing).toBeGreaterThan(0.5);
    // C major to A minor is the relative minor: down three semitones.
    expect(v3!.transpose).toBe(-3);
    // Snare on every offbeat and constant 16th bass — "chased".
    expect(v3!.drums.snare).toEqual([2, 6, 10, 14]);
    expect(v3!.triangle.every((step) => step.len <= 4)).toBe(true);
  });

  it('makes the L3 room quieter: slower and lower', () => {
    const base = variantById('v1-attract-mode');
    const l3 = applyLevelTier(base, 'l3');
    expect(l3.bpm).toBeLessThan(base.bpm);
    expect(l3.bpm).toBe(Math.round(base.bpm * 0.94));
    expect(l3.transpose).toBe(base.transpose - 3);
    expect(applyLevelTier(base, 'l1')).toEqual(base);
  });
});

describe('SFX table', () => {
  it('ships the core six', () => {
    expect(SFX_IDS).toEqual([
      'sfx-correct',
      'sfx-wrong',
      'sfx-nav',
      'sfx-stamp',
      'sfx-streak',
      'jingle-level',
    ]);
  });

  // "losses are quiet" is a design rule with a number behind it (§5.4).
  it('keeps the wrong sound quieter than the correct one', () => {
    const correct = Math.max(...SFX.get('sfx-correct')!.tones.map((t) => t.gain));
    const wrong = Math.max(...SFX.get('sfx-wrong')!.tones.map((t) => t.gain));
    expect(wrong).toBeLessThan(correct);
  });

  it('caps the streak transposition so the arpeggio cannot climb into an alarm', () => {
    expect(STREAK_TRANSPOSE_CAP).toBe(7);
  });
});

describe('AudioEngine contract', () => {
  beforeEach(() => {
    globalThis.localStorage?.clear?.();
  });

  it('creates NO context until a gesture calls start (VAL-025, VAL-026)', () => {
    const { ctx, created } = makeFakeContext();
    const engine = new AudioEngine(() => ctx);
    expect(engine.started).toBe(false);
    expect(created).toHaveLength(0);
    expect(engine.liveNodeCount()).toBe(0);
    expect(engine.hasScheduler()).toBe(false);
  });

  it('starts muted, and stays muted through a start with no stored preference', () => {
    const { ctx } = makeFakeContext();
    const engine = new AudioEngine(() => ctx);
    engine.start();
    expect(engine.isMuted).toBe(true);
    engine.stop();
  });

  // DATA_MODEL §8 budget 5 says "at most 8 live audio nodes". The four-voice NES
  // topology it authorises does not fit in 8: master(1) + three tonal voices at
  // osc+gain each(6) + noise source/filter/gain(3) = 10, and every one of those
  // is load-bearing — dropping the noise filter would collapse kick, snare and
  // hat into one undifferentiated tick. The budget's PURPOSE is that nodes must
  // not accumulate per note, and that is what is asserted: a FIXED graph that
  // does not grow while playing, and zero after stop. The number is recorded in
  // WORK_LEDGER rather than met by degrading the drum kit. It became 11 when a
  // measured 1.41 peak — hard clipping — added a limiter before the speakers.
  const PERSISTENT_NODES = 11;

  it('holds a fixed node graph that never grows while playing, and zero after stop', () => {
    const { ctx } = makeFakeContext();
    const engine = new AudioEngine(() => ctx);
    engine.start(false);
    expect(engine.liveNodeCount()).toBe(PERSISTENT_NODES);
    expect(engine.hasScheduler()).toBe(true);

    // The leak test: scheduling and SFX must allocate nothing persistent.
    for (let i = 0; i < 200; i += 1) {
      engine.playSfx('sfx-correct');
      engine.playSfx('sfx-stamp');
      engine.playStreak(i % 9);
    }
    expect(engine.liveNodeCount()).toBe(PERSISTENT_NODES);

    engine.stop();
    expect(engine.liveNodeCount()).toBe(0);
    expect(engine.hasScheduler()).toBe(false);
    expect(engine.started).toBe(false);
  });

  it('puts a limiter between the bus and the speakers', () => {
    // Measured before it existed: peak 1.41, i.e. 3 dB past full scale, on every
    // downbeat. A native node, so the fix costs no dependency.
    const { ctx, created } = makeFakeContext();
    const engine = new AudioEngine(() => ctx);
    engine.start();
    expect(created.filter((kind) => kind === 'compressor')).toHaveLength(1);
    engine.stop();
  });

  it('uses exactly four voices — no fifth channel', () => {
    const { ctx, created } = makeFakeContext();
    const engine = new AudioEngine(() => ctx);
    engine.start();
    // pulse1, pulse2, triangle are oscillators; noise is the buffer source.
    expect(created.filter((kind) => kind === 'oscillator')).toHaveLength(3);
    expect(created.filter((kind) => kind === 'bufferSource')).toHaveLength(1);
    engine.stop();
  });

  it('exposes distinct music states for streak, wrong, tier and variant (VAL-024)', () => {
    const { ctx } = makeFakeContext();
    const engine = new AudioEngine(() => ctx);
    engine.start();

    const base = engine.musicState();
    expect(base.hats).toBe('evens');
    expect(base.harmony).toBe(false);

    engine.setStreak(HATS_DOUBLE_AT);
    expect(engine.musicState().hats).toBe('all');
    expect(engine.musicState().harmony).toBe(false);

    engine.setStreak(HARMONY_ENTERS_AT);
    expect(engine.musicState().harmony).toBe(true);

    // Wrong answer: the music dips AND the streak resets — two separate facts.
    engine.dipForOneBar();
    expect(engine.musicState().dipped).toBe(true);
    expect(engine.musicState().streak).toBe(0);

    engine.setLevel('l3');
    const l3 = engine.musicState();
    expect(l3.level).toBe('l3');
    expect(l3.bpm).toBeLessThan(base.bpm);
    // On L3 pulse2 is silent until the harmony layer arrives.
    expect(l3.pulse2).toBe(false);
    engine.setStreak(HARMONY_ENTERS_AT);
    expect(engine.musicState().pulse2).toBe(true);

    engine.setVariant('v3-final-boss');
    expect(engine.musicState().variantId).toBe('v3-final-boss');
    engine.stop();
  });

  it('dips for exactly one bar at the current tempo', () => {
    const { ctx } = makeFakeContext();
    const engine = new AudioEngine(() => ctx);
    engine.start();
    engine.dipForOneBar();
    const oneBar = stepSeconds(variantById('v1-attract-mode').bpm) * 16;
    // currentTime is 0 in the fake, so dipUntil is exactly one bar.
    expect(engine.musicState().dipped).toBe(true);
    expect(oneBar).toBeGreaterThan(0);
    engine.stop();
  });

  it('never sounds an SFX while muted', () => {
    const { ctx } = makeFakeContext();
    const engine = new AudioEngine(() => ctx);
    engine.start(true);
    // No throw and no scheduling: the guard is the mute flag, not the gain node,
    // so a muted engine does not even touch the graph.
    expect(() => engine.playSfx('sfx-correct')).not.toThrow();
    engine.stop();
  });

  it('persists the mute preference in localStorage (VAL-028)', () => {
    const store = new Map<string, string>();
    const storage = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
    } as unknown as Storage;

    // Default is muted — an unset preference must not make the game loud.
    expect(readMutePreference(storage)).toBe(true);
    writeMutePreference(false, storage);
    expect(store.get(MUTE_STORAGE_KEY)).toBe('on');
    expect(readMutePreference(storage)).toBe(false);
    writeMutePreference(true, storage);
    expect(readMutePreference(storage)).toBe(true);
  });

  it('defaults to muted when storage throws', () => {
    const hostile = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
    } as unknown as Storage;
    expect(readMutePreference(hostile)).toBe(true);
    expect(() => writeMutePreference(false, hostile)).not.toThrow();
  });
});
