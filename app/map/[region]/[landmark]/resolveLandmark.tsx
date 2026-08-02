import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';

import { SubMapScene, type LandmarkFormat } from '@/components/map/SubMapScene';
import type { LandmarkBeatProps } from '@/components/landmark/LandmarkView';
import { isLandmarkFormat } from '@/components/landmark/formats';
import { availableLevels, getSequence } from '@/content/beats';
import { LEVEL_IDS, type LevelId } from '@/content/schema';
import { parseBeatProgressState } from '@/components/landmark/Beats/beatStorage';
import { getLandmark, getRegion } from '@/lib/content';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth/session';
import { queryAsUser } from '@/lib/db';
import { computeHighestUnlockedLevel, isLevelUnlocked } from '@/server/beatProgress';
import { IMPLICIT_LEVEL } from '@/server/levelCompatibility';
import { isHostedMode } from '@/server/hosting';

/**
 * ISSUE-015. One resolver behind both landmark routes.
 *
 * `/map/[region]/[landmark]` and `/map/[region]/[landmark]/[level]` render the
 * same page; the level segment is purely ADDITIVE (REQ-010). Every one of the
 * 48 legacy URLs keeps resolving and keeps serving playable content, because
 * "no level requested" is a real state with a defined answer — the highest
 * level this player has unlocked — not a missing parameter.
 */

export function parseLevelSegment(value: string | undefined): LevelId | null {
  if (value === undefined) return null;
  return (LEVEL_IDS as readonly string[]).includes(value) ? (value as LevelId) : null;
}

export async function LandmarkRoute({
  regionId,
  landmarkId,
  requestedLevel,
  query,
}: {
  regionId: string;
  landmarkId: string;
  requestedLevel: LevelId | null;
  query: { format?: string | string[] };
}) {
  const region = getRegion(regionId);
  if (!region) notFound();
  const landmark = getLandmark(regionId, landmarkId);
  if (!landmark) notFound();

  const levels = availableLevels(regionId, landmarkId);
  if (levels.length === 0) notFound();

  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;
  const hosted = Boolean(session) && isHostedMode();

  // Progress rows are read ONCE and reused for level selection, resume state and
  // the region stamp count. Reading them before choosing the level is the whole
  // point: the page cannot serve a level it has not checked the player can play,
  // or the write that follows comes back 423 from the gate.
  type ProgressRow = { landmark: string; level?: string; state: unknown };
  let rows: ProgressRow[] = [];
  let levelColumnPresent = false;
  if (hosted) {
    // Compatibility window: before 0011 lands there is no `level` column, and
    // every existing row is the L3 run by definition (DATA_MODEL §6 step 1).
    levelColumnPresent = await queryAsUser<{ ok: number }>(
      session!.userId,
      `SELECT 1 AS ok FROM information_schema.columns
       WHERE table_name = 'progress' AND column_name = 'level' LIMIT 1`,
    ).then((result) => (result.rowCount ?? 0) > 0);

    rows = (
      await queryAsUser<ProgressRow>(
        session!.userId,
        levelColumnPresent
          ? `SELECT landmark, level, state FROM progress WHERE profile_id = $1 AND region = $2`
          : `SELECT landmark, state FROM progress WHERE profile_id = $1 AND region = $2`,
        [session!.userId, regionId],
      )
    ).rows;
  }

  // Signed-in play is gated by the server's own rows, using the same function
  // the write gate uses — one definition of "unlocked", not two that can drift.
  // Anonymous and self-host play has no server rows to read, so the page serves
  // the lowest authored tier and the client's local progress carries the resume.
  const highestUnlocked = hosted
    ? computeHighestUnlockedLevel(
        rows
          .filter((row) => row.landmark === landmarkId)
          .map((row) => ({ level: (row.level ?? 'l3') as LevelId, state: row.state })),
        levels,
      )
    : levels[0]!;

  // A request for a level above the frontier resolves DOWN to what the player
  // can actually play rather than 404ing: the URL is a bookmark, and a bookmark
  // that outran your progress should still open the game.
  // Hosted play is gated by server rows. Anonymous and self-host play has no
  // server rows to gate against — the local frontier lives in the browser and
  // the server explicitly does not claim to verify a prerequisite it cannot see
  // (ISSUE-005, REQ-023) — so an explicitly requested, authored level is served.
  // Nothing durable is written on that path, so this widens what can be READ,
  // never what can be recorded.
  const requestable = requestedLevel !== null && levels.includes(requestedLevel);
  const unlocked = requestable && (!hosted || isLevelUnlocked(requestedLevel!, highestUnlocked))
    ? requestedLevel!
    : levels.includes(highestUnlocked)
      ? highestUnlocked
      : levels[0]!;

  // Compatibility-window clamp (DATA_MODEL §6 step 1). Before 0011 lands, the
  // `progress` table has one row per landmark, so an L1 or L2 write has nowhere
  // to go and the server correctly refuses it. Serving a level the player is
  // then unable to save is worse than serving the one they can: every answer
  // would come back 423 and their run would vanish on reload. Hosted play stays
  // on L3 until the column exists — which is the same condition `canWriteLevel`
  // uses, so the page and the write gate cannot disagree.
  const selected = hosted && !levelColumnPresent && levels.includes(IMPLICIT_LEVEL)
    ? IMPLICIT_LEVEL
    : unlocked;

  // Exactly one sequence is serialized to the client, never all three.
  const sequence = getSequence({ regionId, landmarkId, level: selected });

  const requestedFormat = typeof query.format === 'string' ? query.format : undefined;
  let defaultFormat: LandmarkFormat = sequence ? 'lesson' : 'overview';
  if (!requestedFormat && hosted) {
    const depth = (
      await queryAsUser<{ depth_preference: string | null }>(
        session!.userId,
        'SELECT depth_preference FROM profiles WHERE id = $1',
        [session!.userId],
      )
    ).rows[0]?.depth_preference;
    // expert_refresh still prefers quiz; thorough prefers lesson/Play; otherwise beat-enabled defaults to Play.
    if (depth === 'expert_refresh') defaultFormat = 'quiz';
    else if (depth === 'thorough') defaultFormat = 'lesson';
    else if (!sequence) defaultFormat = 'overview';
  }
  // Explicit valid ?format= always wins. Missing format uses beat-aware default (Play).
  // Explicitly invalid format falls back to overview (trust surface), not Play —
  // preserves deep-link safety and the pre-L-002 map-sub contract.
  const format: LandmarkFormat =
    requestedFormat === undefined
      ? defaultFormat
      : isLandmarkFormat(requestedFormat)
        ? requestedFormat
        : 'overview';

  let beats: LandmarkBeatProps | null = null;
  if (sequence) {
    const landmarkIndex = region.landmarks.findIndex((item) => item.id === landmark.id);
    const next = landmarkIndex >= 0 ? region.landmarks[landmarkIndex + 1] : undefined;

    // Region stamp count is a LANDMARK-level fact, not a row count. With three
    // level rows per landmark, incrementing per completed row would report up
    // to 18 stamps in a six-landmark region. Count distinct landmark ids for
    // which ANY level is completed.
    const stampedLandmarks = new Set<string>();
    let initialProgress = null;
    for (const row of rows) {
      const parsed = parseBeatProgressState(row.state);
      if (!parsed) continue;
      if (parsed.completed) stampedLandmarks.add(row.landmark);
      // Resume state must come from the row for the level actually serialized.
      if (row.landmark === landmarkId && (row.level ?? 'l3') === selected) initialProgress = parsed;
    }

    beats = {
      sequence,
      regionTitle: region.title,
      landmarkIndex: Math.max(0, landmarkIndex),
      regionLandmarkCount: region.landmarks.length,
      nextLandmark: next ? { id: next.id, title: next.title } : null,
      initialProgress,
      regionStampedCount: stampedLandmarks.size,
    };
  }

  return <SubMapScene region={region} landmark={landmark} format={format} beats={beats} />;
}
