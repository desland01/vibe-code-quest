import {
  beatProgressStateSchema,
  type BeatProgressState,
} from '@/content/beats/schema';
import type { PlayerState } from './beatReducer';
import { persistentFacts } from './beatReducer';

export function beatProgressStorageKey(regionId: string, landmarkId: string): string {
  return `ct-beat-progress:${regionId}/${landmarkId}`;
}

export function toBeatProgressState(state: Pick<PlayerState, 'furthestBeatIndex' | 'checked' | 'completed' | 'stampedAt'>): BeatProgressState {
  return {
    v: 1,
    kind: 'beat-sequence',
    ...persistentFacts(state),
  };
}

export function parseBeatProgressState(raw: unknown): BeatProgressState | null {
  const parsed = beatProgressStateSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

export function readLocalBeatProgress(regionId: string, landmarkId: string): BeatProgressState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(beatProgressStorageKey(regionId, landmarkId));
    if (!raw) return null;
    return parseBeatProgressState(JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}

export function writeLocalBeatProgress(regionId: string, landmarkId: string, state: BeatProgressState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(beatProgressStorageKey(regionId, landmarkId), JSON.stringify(state));
  } catch {
    // Quota / private mode — play must never block on storage.
  }
}
