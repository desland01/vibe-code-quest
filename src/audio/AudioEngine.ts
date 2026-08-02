import { STEPS_PER_BAR, noteToFrequency, patternLength, stepSeconds, type Step } from './notes.ts';
import { SFX, STREAK_TRANSPOSE_CAP, type SfxTone } from './sfx.ts';
import { DEFAULT_VARIANT_ID, applyLevelTier, variantById, type Theme } from './themes.ts';

// ISSUE-018 — the Web Audio engine (REQ-013, REQ-014, REQ-015).
//
// Hard constraints, all of them load-bearing:
//   · Web Audio only. No `<audio>`, no `new Audio()`, no shipped audio file, no
//     runtime dependency. Every sound in this game is synthesised.
//   · Muted on load. The context is not even CREATED until a gesture, so nothing
//     can autoplay and no browser has to block us to keep us quiet.
//   · NES-strict: exactly four voices. A fifth voice is not a small addition, it
//     is a different instrument, and the whole soundtrack stops being one thing.
//   · The scheduler RUNS while muted (master gain 0), so unmuting mid-run lands
//     on the beat instead of restarting the bar.

export const MUTE_STORAGE_KEY = 'ct-audio';

export type MusicState = {
  streak: number;
  /** Set for one bar after a wrong answer — music dips, SFX do not. */
  dipUntil: number;
  level: 'l1' | 'l2' | 'l3';
  variantId: string;
};

/** 25ms interval scheduling 100ms ahead — the standard Web Audio pattern. */
const LOOKAHEAD_MS = 25;
const SCHEDULE_AHEAD_S = 0.1;

/** Reactive-layer thresholds (§5.3). */
export const HATS_DOUBLE_AT = 3;
export const HARMONY_ENTERS_AT = 5;

type Voice = {
  osc: OscillatorNode;
  gain: GainNode;
};

export function readMutePreference(storage: Storage | undefined = globalThis.localStorage): boolean {
  try {
    return storage?.getItem(MUTE_STORAGE_KEY) !== 'on';
  } catch {
    // A storage failure must not make the game loud. Silence is the safe default.
    return true;
  }
}

export function writeMutePreference(muted: boolean, storage: Storage | undefined = globalThis.localStorage): void {
  try {
    storage?.setItem(MUTE_STORAGE_KEY, muted ? 'off' : 'on');
  } catch {
    // Preference is a convenience; failing to persist it is not an error worth
    // surfacing mid-run.
  }
}

/** 50% / 25% duty square waves, built as PeriodicWave — no `square` shortcut. */
function dutyWave(ctx: BaseAudioContext, duty: number, harmonics = 24): PeriodicWave {
  const real = new Float32Array(harmonics);
  const imag = new Float32Array(harmonics);
  for (let n = 1; n < harmonics; n += 1) {
    imag[n] = (2 / (n * Math.PI)) * Math.sin(n * Math.PI * duty);
  }
  return ctx.createPeriodicWave(real, imag);
}

function whiteNoiseBuffer(ctx: BaseAudioContext): AudioBuffer {
  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 2), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  // Deterministic LCG rather than Math.random: the same build makes the same
  // noise, so an owner comparing two variants is comparing the arrangements.
  let seed = 22695477;
  for (let i = 0; i < data.length; i += 1) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    data[i] = (seed / 0x3fffffff) - 1;
  }
  return buffer;
}

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private pulse1: Voice | null = null;
  private pulse2: Voice | null = null;
  private triangle: Voice | null = null;
  private noiseSource: AudioBufferSourceNode | null = null;
  private noiseFilter: BiquadFilterNode | null = null;
  private noiseGain: GainNode | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;

  private theme: Theme = variantById(DEFAULT_VARIANT_ID);
  private nextStep = 0;
  private nextStepTime = 0;
  private muted = true;
  private state: MusicState = { streak: 0, dipUntil: 0, level: 'l1', variantId: DEFAULT_VARIANT_ID };

  /** Every node this engine created and has not disconnected. */
  private nodes = new Set<AudioNode>();

  constructor(private readonly makeContext: () => AudioContext = () => new AudioContext()) {}

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  get started(): boolean {
    return this.ctx !== null;
  }

  get isMuted(): boolean {
    return this.muted;
  }

  /** Persistent node count. The transient per-hit noise sources are not held. */
  liveNodeCount(): number {
    return this.nodes.size;
  }

  hasScheduler(): boolean {
    return this.timer !== null;
  }

  /**
   * Called from a real user gesture. Creating the context here rather than on
   * mount is the whole autoplay contract: there is nothing to block because
   * there is nothing running (VAL-025, VAL-026).
   */
  start(muted = readMutePreference()): void {
    if (this.ctx) return;
    const ctx = this.makeContext();
    this.ctx = ctx;
    this.muted = muted;

    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    this.master = master;
    this.nodes.add(master);

    this.pulse1 = this.makeVoice(dutyWave(ctx, this.theme.duty.pulse1));
    this.pulse2 = this.makeVoice(dutyWave(ctx, this.theme.duty.pulse2));
    this.triangle = this.makeVoice(null);

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = whiteNoiseBuffer(ctx);
    noiseSource.loop = true;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 6000;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0;
    noiseSource.connect(noiseFilter).connect(noiseGain).connect(master);
    noiseSource.start();
    this.noiseSource = noiseSource;
    this.noiseFilter = noiseFilter;
    this.noiseGain = noiseGain;
    this.nodes.add(noiseSource).add(noiseFilter).add(noiseGain);

    this.nextStep = 0;
    this.nextStepTime = ctx.currentTime;
    this.applyMasterGain();
    this.timer = setInterval(() => this.tick(), LOOKAHEAD_MS);
  }

  private makeVoice(wave: PeriodicWave | null): Voice {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    if (wave) osc.setPeriodicWave(wave);
    else osc.type = 'triangle';
    const gain = ctx.createGain();
    gain.gain.value = 0;
    osc.connect(gain).connect(this.master!);
    osc.start();
    this.nodes.add(osc).add(gain);
    return { osc, gain };
  }

  /** Tear everything down. Zero live nodes and zero timers afterwards. */
  stop(): void {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
    for (const node of this.nodes) {
      const stoppable = node as AudioScheduledSourceNode;
      if (typeof stoppable.stop === 'function') {
        try {
          stoppable.stop();
        } catch {
          // Already stopped — nothing to do, and nothing worth reporting.
        }
      }
      node.disconnect();
    }
    this.nodes.clear();
    this.pulse1 = this.pulse2 = this.triangle = null;
    this.noiseSource = null;
    this.noiseFilter = null;
    this.noiseGain = null;
    this.master = null;
    void this.ctx?.close();
    this.ctx = null;
  }

  // ── Mute ───────────────────────────────────────────────────────────────────

  setMuted(muted: boolean): void {
    this.muted = muted;
    writeMutePreference(muted);
    this.applyMasterGain();
  }

  toggleMute(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  private applyMasterGain(): void {
    if (!this.master || !this.ctx) return;
    const dipping = this.ctx.currentTime < this.state.dipUntil;
    const target = this.muted ? 0 : dipping ? 0.5 * 0.35 : 0.35;
    this.master.gain.setTargetAtTime(target, this.ctx.currentTime, 0.02);
  }

  // ── Reactive state (§5.3) ──────────────────────────────────────────────────

  setLevel(level: 'l1' | 'l2' | 'l3'): void {
    this.state = { ...this.state, level };
    this.theme = applyLevelTier(variantById(this.state.variantId), level);
  }

  setVariant(variantId: string): void {
    this.state = { ...this.state, variantId };
    this.theme = applyLevelTier(variantById(variantId), this.state.level);
  }

  setStreak(streak: number): void {
    this.state = { ...this.state, streak };
  }

  /** Wrong answer: music dips for exactly one bar. SFX are unaffected. */
  dipForOneBar(): void {
    if (!this.ctx) return;
    this.state = {
      ...this.state,
      dipUntil: this.ctx.currentTime + stepSeconds(this.theme.bpm) * STEPS_PER_BAR,
      streak: 0,
    };
    this.applyMasterGain();
  }

  /** A snapshot of everything that makes the music sound different right now. */
  musicState(): {
    streak: number;
    hats: 'evens' | 'all' | 'none';
    pulse2: boolean;
    harmony: boolean;
    dipped: boolean;
    level: string;
    bpm: number;
    variantId: string;
  } {
    return {
      streak: this.state.streak,
      // streak >= 3 doubles the hats: 8ths become 16ths.
      hats: this.state.streak >= HATS_DOUBLE_AT ? 'all' : this.theme.drums.hats,
      // Two different rules that are easy to conflate, so they are separate
      // fields. pulse2 AUDIBILITY: it plays its written offbeat stabs on every
      // tier except L3, where §5.3 keeps it silent until a streak of five —
      // that silence is what "the room gets quieter" means. HARMONY: at streak
      // five pulse2 additionally tracks a third below the melody, on every tier.
      pulse2: this.state.level !== 'l3' || this.state.streak >= HARMONY_ENTERS_AT,
      harmony: this.state.streak >= HARMONY_ENTERS_AT,
      dipped: this.ctx !== null && this.ctx.currentTime < this.state.dipUntil,
      level: this.state.level,
      bpm: this.theme.bpm,
      variantId: this.state.variantId,
    };
  }

  // ── Scheduler ──────────────────────────────────────────────────────────────

  private tick(): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const secondsPerStep = stepSeconds(this.theme.bpm);
    while (this.nextStepTime < ctx.currentTime + SCHEDULE_AHEAD_S) {
      this.scheduleStep(this.nextStep, this.nextStepTime);
      // Swing: delay every odd 8th. 0.5 is straight, 0.55 is the lo-fi shuffle.
      const isOffbeat8th = this.nextStep % 4 === 2;
      const swingOffset = isOffbeat8th ? (this.theme.swing - 0.5) * secondsPerStep * 4 : 0;
      this.nextStepTime += secondsPerStep + swingOffset;
      this.nextStep += 1;
    }
    // The dip expires on its own clock, so the gain has to be re-evaluated.
    this.applyMasterGain();
  }

  private scheduleStep(step: number, when: number): void {
    const bar = step % STEPS_PER_BAR;
    const music = this.musicState();
    this.scheduleVoice(this.pulse1, this.theme.pulse1, step, when, this.theme.melodyOctave * 12);
    if (music.pulse2) {
      // A third below the melody once the harmony layer is in; the written
      // offbeat stabs otherwise.
      if (music.harmony) {
        this.scheduleVoice(this.pulse1 ? this.pulse2 : null, this.theme.pulse1, step, when, this.theme.melodyOctave * 12 - 4);
      } else {
        this.scheduleVoice(this.pulse2, this.theme.pulse2, step, when, 0);
      }
    }
    this.scheduleVoice(this.triangle, this.theme.triangle, step, when, 0);
    this.scheduleDrums(bar, when);
  }

  private scheduleVoice(voice: Voice | null, pattern: Step[], step: number, when: number, extra: number): void {
    if (!voice || pattern.length === 0) return;
    const total = patternLength(pattern);
    const position = step % total;
    let cursor = 0;
    for (const entry of pattern) {
      if (cursor === position) {
        if (entry.note === null) return;
        const hz = noteToFrequency(entry.note, this.theme.transpose + extra);
        const length = entry.len * stepSeconds(this.theme.bpm);
        voice.osc.frequency.setValueAtTime(hz, when);
        // The triangle is on-or-off — NES-authentic, no volume envelope.
        if (voice === this.triangle) {
          voice.gain.gain.setValueAtTime(0.25, when);
          voice.gain.gain.setValueAtTime(0, when + length * 0.95);
        } else {
          voice.gain.gain.setValueAtTime(0.22, when);
          voice.gain.gain.exponentialRampToValueAtTime(0.001, when + length * 0.9);
        }
        return;
      }
      cursor += entry.len;
      if (cursor > position) return;
    }
  }

  private scheduleDrums(bar: number, when: number): void {
    if (!this.noiseGain || !this.noiseFilter) return;
    const { hats } = this.musicState();
    const kit = this.theme.drums;
    const hit = (hz: number, gain: number, decay: number) => {
      this.noiseFilter!.frequency.setValueAtTime(hz, when);
      this.noiseGain!.gain.setValueAtTime(gain, when);
      this.noiseGain!.gain.exponentialRampToValueAtTime(0.001, when + decay);
    };
    if (kit.kick.includes(bar)) hit(200, 0.3, 0.12);
    else if (kit.snare.includes(bar)) hit(1800, 0.22, 0.09);
    else if (hats === 'all' || (hats === 'evens' && bar % 2 === 0)) hit(9000, 0.09, 0.03);
  }

  // ── SFX ────────────────────────────────────────────────────────────────────

  /**
   * SFX steal pulse2 and noise for their duration; pulse1's melody is never
   * stolen (§5.1). They are scheduled on the same clock as the music, so a
   * correct answer lands with the beat rather than on top of it.
   */
  playSfx(id: string, transpose = 0): void {
    const ctx = this.ctx;
    const entry = SFX.get(id);
    if (!ctx || !entry || this.muted) return;
    let cursor = ctx.currentTime + 0.005;
    for (const tone of entry.tones) {
      this.playTone(tone, cursor, transpose);
      cursor += tone.ms / 1000;
    }
  }

  /** The streak arpeggio climbs a semitone per combo level, capped (§5.4). */
  playStreak(streak: number): void {
    this.playSfx('sfx-streak', Math.min(Math.max(streak - 1, 0), STREAK_TRANSPOSE_CAP));
  }

  private playTone(tone: SfxTone, when: number, transpose: number): void {
    const seconds = tone.ms / 1000;
    if (tone.voice === 'noise') {
      if (!this.noiseGain || !this.noiseFilter) return;
      if (tone.filter) {
        this.noiseFilter.type = tone.filter.type;
        this.noiseFilter.frequency.setValueAtTime(tone.filter.hz, when);
      }
      this.noiseGain.gain.setValueAtTime(tone.gain, when);
      this.noiseGain.gain.exponentialRampToValueAtTime(0.001, when + seconds);
      return;
    }
    const voice = tone.voice === 'triangle' ? this.triangle : this.pulse2;
    if (!voice || tone.note === null) return;
    voice.osc.frequency.setValueAtTime(noteToFrequency(tone.note, transpose), when);
    voice.gain.gain.setValueAtTime(tone.gain, when);
    if (tone.decay === 'linear') {
      voice.gain.gain.linearRampToValueAtTime(0.0001, when + seconds);
    } else {
      voice.gain.gain.exponentialRampToValueAtTime(0.001, when + seconds);
    }
  }
}
