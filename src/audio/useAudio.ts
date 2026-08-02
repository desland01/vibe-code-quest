'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { AudioEngine, readMutePreference } from './AudioEngine.ts';

// ISSUE-018 — the React seam.
//
// One engine per mount, created lazily and torn down on unmount so the node and
// timer budget returns to zero (DATA_MODEL §8 budget 5). The hook deliberately
// exposes commands rather than the engine: a component that can reach the
// AudioContext can start it without a gesture, and the gesture rule is the one
// part of this feature a browser will punish us for getting wrong.

export function useAudio(level: 'l1' | 'l2' | 'l3') {
  const engineRef = useRef<AudioEngine | null>(null);
  const [muted, setMutedState] = useState(true);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    return () => {
      engineRef.current?.stop();
      engineRef.current = null;
    };
  }, []);

  /** Called from a real gesture. Idempotent. */
  const unlock = useCallback(() => {
    if (engineRef.current) return;
    if (typeof window === 'undefined' || typeof window.AudioContext === 'undefined') return;
    const engine = new AudioEngine();
    engine.start(readMutePreference());
    engine.setLevel(level);
    engineRef.current = engine;
    setMutedState(engine.isMuted);
    setStarted(true);
  }, [level]);

  const toggleMute = useCallback(() => {
    // Toggling mute IS a gesture, so it is also a valid moment to create the
    // context — otherwise the first thing a player does to turn sound ON is the
    // one interaction that cannot turn it on.
    const existing = engineRef.current;
    if (!existing) {
      unlock();
      const created: AudioEngine | null = engineRef.current;
      created?.setMuted(false);
      setMutedState(created ? created.isMuted : false);
      return;
    }
    setMutedState(existing.toggleMute());
  }, [unlock]);

  const sfx = useCallback((id: string) => engineRef.current?.playSfx(id), []);
  const setStreak = useCallback((streak: number) => engineRef.current?.setStreak(streak), []);
  const dip = useCallback(() => engineRef.current?.dipForOneBar(), []);

  useEffect(() => {
    engineRef.current?.setLevel(level);
  }, [level]);

  // `M` toggles mute (§5.1). Ignored while typing so it cannot fire from a form.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'm' && event.key !== 'M') return;
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if (target?.isContentEditable) return;
      toggleMute();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggleMute]);

  return { muted, started, unlock, toggleMute, sfx, setStreak, dip, engine: engineRef };
}
