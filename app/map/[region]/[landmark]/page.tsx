import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';

import { SubMapScene, type LandmarkFormat } from '@/components/map/SubMapScene';
import type { LandmarkBeatProps } from '@/components/landmark/LandmarkView';
import { isLandmarkFormat } from '@/components/landmark/formats';
import { getBeatSequence } from '@/content/beats';
import { parseBeatProgressState } from '@/components/landmark/Beats/beatStorage';
import { getLandmark, getRegion, regions } from '@/lib/content';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth/session';
import { queryAsUser } from '@/lib/db';

export function generateStaticParams() {
  return regions.flatMap((region) =>
    region.landmarks.map((landmark) => ({ region: region.id, landmark: landmark.id })),
  );
}

export default async function LandmarkMapPage({
  params,
  searchParams,
}: {
  params: Promise<{ region: string; landmark: string }>;
  searchParams: Promise<{ format?: string | string[] }>;
}) {
  const [{ region: regionId, landmark: landmarkId }, query] = await Promise.all([params, searchParams]);
  const region = getRegion(regionId);
  if (!region) notFound();
  const landmark = getLandmark(regionId, landmarkId);
  if (!landmark) notFound();

  const sequence = getBeatSequence(regionId, landmarkId);
  const requestedFormat = typeof query.format === 'string' ? query.format : undefined;
  let defaultFormat: LandmarkFormat = sequence ? 'lesson' : 'overview';
  if (!requestedFormat) {
    const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
    const session = token ? await verifySessionToken(token) : null;
    if (session) {
      const depth = (
        await queryAsUser<{ depth_preference: string | null }>(
          session.userId,
          'SELECT depth_preference FROM profiles WHERE id = $1',
          [session.userId],
        )
      ).rows[0]?.depth_preference;
      // expert_refresh still prefers quiz; thorough prefers lesson/Play; otherwise beat-enabled defaults to Play.
      if (depth === 'expert_refresh') defaultFormat = 'quiz';
      else if (depth === 'thorough') defaultFormat = 'lesson';
      else if (!sequence) defaultFormat = 'overview';
    }
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
    let initialProgress = null;
    let regionStampedCount = 0;

    const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
    const session = token ? await verifySessionToken(token) : null;
    if (session) {
      const progressRows = await queryAsUser<{ landmark: string; state: unknown }>(
        session.userId,
        `SELECT landmark, state
         FROM progress
         WHERE profile_id = $1 AND region = $2`,
        [session.userId, regionId],
      );
      for (const row of progressRows.rows) {
        const parsed = parseBeatProgressState(row.state);
        if (!parsed) continue;
        if (parsed.completed) regionStampedCount += 1;
        if (row.landmark === landmarkId) initialProgress = parsed;
      }
    }

    beats = {
      sequence,
      regionTitle: region.title,
      landmarkIndex: Math.max(0, landmarkIndex),
      regionLandmarkCount: region.landmarks.length,
      nextLandmark: next ? { id: next.id, title: next.title } : null,
      initialProgress,
      regionStampedCount,
    };
  }

  return <SubMapScene region={region} landmark={landmark} format={format} beats={beats} />;
}
