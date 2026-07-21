import { describe, expect, it } from 'vitest';

import { resolveProgressWrite, validateBeatStateWrite } from '@/server/beatProgress';
import { initialBeatProgressState, type BeatProgressState } from '@/content/beats/schema';

function state(overrides: Partial<BeatProgressState> = {}): BeatProgressState {
  return { ...initialBeatProgressState(), ...overrides };
}

describe('validateBeatStateWrite (server, registry-aware)', () => {
  it('accepts a valid in-bounds write on the pilot landmark', () => {
    const result = validateBeatStateWrite('git', 'commits-as-checkpoints', state({ furthestBeatIndex: 3 }));
    expect(result.ok).toBe(true);
  });

  it('accepts a valid in-bounds write on a factory-derived landmark', () => {
    const result = validateBeatStateWrite('git', 'branches-as-isolation', state({ furthestBeatIndex: 3 }));
    expect(result.ok).toBe(true);
  });

  it('accepts a valid terminal stamped state', () => {
    const result = validateBeatStateWrite('git', 'commits-as-checkpoints', state({
      furthestBeatIndex: 7, checked: true, completed: true, stampedAt: '2026-07-19T00:00:00Z',
    }));
    expect(result.ok).toBe(true);
  });

  it('rejects unknown region', () => {
    expect(validateBeatStateWrite('nope', 'commits-as-checkpoints', state())).toMatchObject({ ok: false, status: 400 });
  });

  it('rejects landmark not in region', () => {
    expect(validateBeatStateWrite('git', 'sql', state())).toMatchObject({ ok: false, status: 400 });
  });

  it('rejects out-of-bounds furthestBeatIndex', () => {
    expect(validateBeatStateWrite('git', 'commits-as-checkpoints', state({ furthestBeatIndex: 8 }))).toMatchObject({ ok: false, status: 400 });
  });

  it('rejects checked before reaching the check beat (index 6)', () => {
    expect(validateBeatStateWrite('git', 'commits-as-checkpoints', state({ furthestBeatIndex: 5, checked: true }))).toMatchObject({ ok: false, status: 400 });
  });

  it('rejects completed before the terminal beat', () => {
    expect(validateBeatStateWrite('git', 'commits-as-checkpoints', state({
      furthestBeatIndex: 6, checked: true, completed: true, stampedAt: '2026-07-19T00:00:00Z',
    }))).toMatchObject({ ok: false, status: 400 });
  });

  it('rejects completed without checked/stampedAt and stampedAt without completed', () => {
    expect(validateBeatStateWrite('git', 'commits-as-checkpoints', state({
      furthestBeatIndex: 7, checked: false, completed: true, stampedAt: '2026-07-19T00:00:00Z',
    }))).toMatchObject({ ok: false, status: 400 });
    expect(validateBeatStateWrite('git', 'commits-as-checkpoints', state({
      furthestBeatIndex: 7, checked: true, completed: false, stampedAt: '2026-07-19T00:00:00Z',
    }))).toMatchObject({ ok: false, status: 400 });
  });

  it('rejects malformed states (extra keys, wrong kinds)', () => {
    expect(validateBeatStateWrite('git', 'commits-as-checkpoints', { ...state(), beatIndex: 3 })).toMatchObject({ ok: false, status: 400 });
    expect(validateBeatStateWrite('git', 'commits-as-checkpoints', { hello: 'world' })).toMatchObject({ ok: false, status: 400 });
  });
});

describe('resolveProgressWrite (registry-keyed routing — security boundary)', () => {
  const pilot: [string, string] = ['git', 'commits-as-checkpoints'];
  const factory: [string, string] = ['git', 'branches-as-isolation'];

  it('routes valid beat state on a beat-enabled landmark to the beat path', () => {
    expect(resolveProgressWrite(...pilot, state({ furthestBeatIndex: 2 }))).toMatchObject({ path: 'beat' });
    expect(resolveProgressWrite(...factory, state({ furthestBeatIndex: 2 }))).toMatchObject({ path: 'beat' });
  });

  it('rejects a beat-enabled landmark write with omitted kind (never legacy)', () => {
    expect(resolveProgressWrite(...pilot, { completed: true })).toMatchObject({ path: 'reject', status: 400 });
    expect(resolveProgressWrite(...pilot, { hello: 'world' })).toMatchObject({ path: 'reject', status: 400 });
    // L-002: every canonical landmark is beat-enabled — ordinary legacy payloads on real
    // landmarks are rejected (never silently absorbed as legacy).
    expect(resolveProgressWrite(...factory, { notes: 'x', completed: false })).toMatchObject({
      path: 'reject',
      status: 400,
    });
    expect(resolveProgressWrite('databases', 'sql', { anything: 1 })).toMatchObject({
      path: 'reject',
      status: 400,
    });
  });

  it('rejects a forged completed:true payload on a beat-enabled landmark', () => {
    expect(resolveProgressWrite(...pilot, state({ furthestBeatIndex: 7, checked: true, completed: true, stampedAt: null }))).toMatchObject({ path: 'reject', status: 400 });
    expect(resolveProgressWrite(...pilot, { ...state(), completed: true })).toMatchObject({ path: 'reject', status: 400 });
  });

  it('leaves v1 legacy behavior untouched for unknown non-beat identifiers only', () => {
    // After L-002 the legacy path is unreachable for any real landmark (all 48 are registered).
    // It remains as a safety fallback for unknown identifiers only.
    expect(resolveProgressWrite('nope', 'nope', { x: 1 }).path).toBe('legacy');
    expect(resolveProgressWrite('nope', 'nope', state()).path).toBe('reject');
  });
});
