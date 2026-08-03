'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { AudioEngine } from '@/audio/AudioEngine';
import { MAIN_THEME_VARIANTS } from '@/audio/themes';
import { SFX_IDS } from '@/audio/sfx';

// ISSUE-018 / ISSUE-021 — the owner's listening surface.
//
// Everything here is a control over ONE engine instance. Playing each variant
// through a separate engine would let two synths differ in ways the arrangement
// data does not, and the whole point of the gate is that the owner is comparing
// arrangements.

const LEVELS = ['l1', 'l2', 'l3'] as const;

export function AudioPreview() {
  const engineRef = useRef<AudioEngine | null>(null);
  const [playing, setPlaying] = useState(false);
  const [variantId, setVariantId] = useState(MAIN_THEME_VARIANTS[0]!.id);
  const [level, setLevel] = useState<(typeof LEVELS)[number]>('l1');
  const [streak, setStreakValue] = useState(0);

  useEffect(() => () => engineRef.current?.stop(), []);

  const ensure = useCallback(() => {
    if (engineRef.current) return engineRef.current;
    const engine = new AudioEngine();
    // Explicitly unmuted: this page exists to be heard, and the player reached
    // it deliberately. The muted-by-default rule protects someone who did NOT
    // ask for sound — pressing Play here is asking.
    engine.start(false);
    engine.setMuted(false);
    engineRef.current = engine;
    // This page is the review surface (noindex, linked from nowhere), and the
    // thing being reviewed is a signal. Exposing the engine here lets a reviewer
    // — or a script — attach an analyser and MEASURE peak, clipping and spectral
    // balance instead of arguing about whether it "sounds harsh".
    (window as unknown as { __audioEngine?: AudioEngine }).__audioEngine = engine;
    return engine;
  }, []);

  const play = (id: string) => {
    const engine = ensure();
    engine.setVariant(id);
    engine.setLevel(level);
    engine.setStreak(streak);
    setVariantId(id);
    setPlaying(true);
  };

  const stop = () => {
    engineRef.current?.stop();
    engineRef.current = null;
    setPlaying(false);
  };

  const applyStreak = (value: number) => {
    setStreakValue(value);
    engineRef.current?.setStreak(value);
  };

  const applyLevel = (value: (typeof LEVELS)[number]) => {
    setLevel(value);
    engineRef.current?.setLevel(value);
  };

  return (
    <main className="audio-preview" style={{ padding: '32px', maxWidth: 760, margin: '0 auto' }}>
      <h1>Music variants — pick one by ear</h1>
      <p>
        All three are built from the same pattern data. Only the parameters differ, so what you
        are comparing is the arrangement.
      </p>

      <ol style={{ display: 'grid', gap: 16, padding: 0, listStyle: 'none' }}>
        {MAIN_THEME_VARIANTS.map((variant) => (
          <li key={variant.id} style={{ border: '3px solid var(--ink)', padding: 16 }}>
            <h2 style={{ margin: '0 0 6px' }}>{variant.title}</h2>
            <p style={{ margin: '0 0 12px' }}>
              {variant.bpm} BPM · lead duty {variant.duty.pulse1 * 100}% · melody{' '}
              {variant.melodyOctave === 0 ? 'as written' : `${variant.melodyOctave} octave`} ·{' '}
              {variant.swing > 0.5 ? `${Math.round(variant.swing * 100)}% swing` : 'straight'} ·{' '}
              {variant.transpose === 0 ? 'C major' : `transposed ${variant.transpose}`}
            </p>
            <button
              type="button"
              data-testid={`play-${variant.id}`}
              data-current={variantId === variant.id && playing ? 'true' : 'false'}
              onClick={() => play(variant.id)}
            >
              ▶ Play {variant.title}
            </button>
          </li>
        ))}
      </ol>

      <section style={{ marginTop: 24 }}>
        <h2>Reactive layers</h2>
        <p>Change these while a variant is playing — the layers move on the next bar.</p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {LEVELS.map((value) => (
            <button
              key={value}
              type="button"
              data-testid={`level-${value}`}
              aria-pressed={level === value}
              onClick={() => applyLevel(value)}
            >
              Level {value.toUpperCase()}
            </button>
          ))}
          {[0, 3, 5, 8].map((value) => (
            <button
              key={value}
              type="button"
              data-testid={`streak-${value}`}
              aria-pressed={streak === value}
              onClick={() => applyStreak(value)}
            >
              Streak {value}
            </button>
          ))}
          <button type="button" data-testid="dip" onClick={() => engineRef.current?.dipForOneBar()}>
            Wrong answer (dip one bar)
          </button>
          <button type="button" data-testid="stop" onClick={stop}>
            ■ Stop
          </button>
        </div>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Sound effects</h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {SFX_IDS.map((id) => (
            <button key={id} type="button" data-testid={`sfx-${id}`} onClick={() => ensure().playSfx(id)}>
              {id}
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
