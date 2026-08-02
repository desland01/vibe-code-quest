import 'server-only';

import type { PoolClient } from 'pg';

import type { BeatSequence, LevelId, SequenceRef } from '@/content/beats/schema';
import { beatProgressStateSchema, type BeatProgressState } from '@/content/beats/schema';
import { getSequence } from '@/content/beats';
import { XP_AWARD_INSERT_SQL_PRE_LEVEL } from './levelCompatibility';

// L-003 competence XP (A4.5 / R042–R045).
// Server-derived from progress facts only. Zero penalties, zero decay.
// Predict never awards: any pick advances, so correctness is not a server fact.
// XP is fully derivable from the progress table; xp_awards is a durable competence index.

export const XP_AWARD_POINTS = {
  scenario_solved: 15,
  gotcha_solved: 15,
  check_passed: 20,
  landmark_stamped: 50,
} as const;

export type XpAwardKey = keyof typeof XP_AWARD_POINTS;

export type XpAward = {
  awardKey: XpAwardKey;
  points: number;
};

/** Max XP for one fully stamped LEVEL (15+15+20+50). */
export const XP_PER_LEVEL =
  XP_AWARD_POINTS.scenario_solved +
  XP_AWARD_POINTS.gotcha_solved +
  XP_AWARD_POINTS.check_passed +
  XP_AWARD_POINTS.landmark_stamped;

/**
 * Max XP for one landmark across all three levels. The cap is per level (100)
 * and per landmark (300) — point VALUES are unchanged and there are still only
 * four unqualified award keys; what changed is that the same key may now exist
 * once per level (DATA_MODEL §3).
 */
export const XP_PER_LANDMARK = XP_PER_LEVEL * 3;

export type XpClient = Pick<PoolClient, 'query'>;

export function parseProgressStateForXp(raw: unknown): BeatProgressState | null {
  const parsed = beatProgressStateSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

/**
 * Derive unlocked awards from a merged beat progress state + registered sequence.
 * Lookups are by beat type, not hard-coded indexes.
 */
export function deriveXpAwards(
  state: BeatProgressState,
  sequence: BeatSequence | undefined,
): XpAward[] {
  if (!sequence || state.kind !== 'beat-sequence') return [];

  const awards: XpAward[] = [];
  const scenarioIndex = sequence.beats.findIndex((beat) => beat.type === 'scenario');
  const gotchaIndex = sequence.beats.findIndex((beat) => beat.type === 'gotcha');

  // Crossing the frontier means the graded beat was solved and advance landed past it.
  if (scenarioIndex >= 0 && state.furthestBeatIndex > scenarioIndex) {
    awards.push({ awardKey: 'scenario_solved', points: XP_AWARD_POINTS.scenario_solved });
  }
  if (gotchaIndex >= 0 && state.furthestBeatIndex > gotchaIndex) {
    awards.push({ awardKey: 'gotcha_solved', points: XP_AWARD_POINTS.gotcha_solved });
  }
  if (state.checked) {
    awards.push({ awardKey: 'check_passed', points: XP_AWARD_POINTS.check_passed });
  }
  if (state.completed) {
    awards.push({ awardKey: 'landmark_stamped', points: XP_AWARD_POINTS.landmark_stamped });
  }

  return awards;
}

export function deriveXpAwardsForLevel(ref: SequenceRef, rawState: unknown): XpAward[] {
  const state = parseProgressStateForXp(rawState);
  if (!state) return [];
  // Scenario and gotcha positions are read from the EXACT selected sequence, so
  // award thresholds follow that level's own beat layout.
  return deriveXpAwards(state, getSequence(ref));
}

// Five-column conflict identity (DATA_MODEL §3). The same four unqualified award
// keys remain the only valid keys — 0009's CHECK is untouched, and no 'l1_'/'l2_'
// /'l3_' variant exists. What the level column buys is that one key may be earned
// once per level, which is what makes the 300-point landmark ceiling reachable
// without inventing new keys or changing any point value.
export const XP_AWARD_INSERT_SQL = `
INSERT INTO xp_awards (profile_id, region, landmark, level, award_key, points)
VALUES ($1, $2, $3, $4, $5, $6)
ON CONFLICT (profile_id, region, landmark, level, award_key) DO NOTHING
RETURNING level, award_key, points
`;

export const XP_TOTAL_SQL = `
SELECT COALESCE(SUM(points), 0)::int AS total
FROM xp_awards
WHERE profile_id = $1
`;

export type XpWriteResult = {
  total: number;
  awarded: Array<{ awardKey: XpAwardKey; points: number }>;
  newPoints: number;
};

/**
 * Insert unlocked awards idempotently and return total + newly inserted rows.
 * Caller must run inside an existing withUserTransaction client.
 * Awards are derived from the server-merged progress state, never client authority.
 */
export async function applyXpAwards(
  client: XpClient,
  userId: string,
  regionId: string,
  landmarkId: string,
  level: LevelId,
  rawState: unknown,
  levelColumnPresent = true,
): Promise<XpWriteResult> {
  const awards = deriveXpAwardsForLevel({ regionId, landmarkId, level }, rawState);
  const awarded: Array<{ awardKey: XpAwardKey; points: number }> = [];

  for (const award of awards) {
    // Compatibility window: award identity loses its level column too, and every
    // pre-migration award is an L3 award.
    const inserted = levelColumnPresent
      ? await client.query<{ award_key: string; points: number }>(XP_AWARD_INSERT_SQL, [
          userId,
          regionId,
          landmarkId,
          level,
          award.awardKey,
          award.points,
        ])
      : await client.query<{ award_key: string; points: number }>(XP_AWARD_INSERT_SQL_PRE_LEVEL, [
          userId,
          regionId,
          landmarkId,
          award.awardKey,
          award.points,
        ]);
    if (inserted.rows[0]) {
      const key = inserted.rows[0].award_key;
      if (key in XP_AWARD_POINTS) {
        awarded.push({
          awardKey: key as XpAwardKey,
          points: inserted.rows[0].points,
        });
      }
    }
  }

  const total = await getXpTotal(client, userId);
  const newPoints = awarded.reduce((sum, row) => sum + row.points, 0);
  return { total, awarded, newPoints };
}

export async function getXpTotal(client: XpClient, userId: string): Promise<number> {
  const totalRow = await client.query<{ total: number }>(XP_TOTAL_SQL, [userId]);
  return totalRow.rows[0]?.total ?? 0;
}
