import { notFound } from 'next/navigation';
import { SubMapScene, type LandmarkFormat } from '@/components/map/SubMapScene';
import { getLandmark, getRegion, regions } from '@/lib/content';
import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth/session';
import { queryAsUser } from '@/lib/db';
import { recordEvent } from '@/server/events';

const formats: readonly LandmarkFormat[] = ['overview', 'lesson', 'quiz'];

export function generateStaticParams() {
  return regions.flatMap((region) => region.landmarks.map((landmark) => ({ region: region.id, landmark: landmark.id })));
}

export default async function LandmarkMapPage({
  params,
  searchParams
}: {
  params: Promise<{ region: string; landmark: string }>;
  searchParams: Promise<{ format?: string | string[] }>;
}) {
  const [{ region: regionId, landmark: landmarkId }, query] = await Promise.all([params, searchParams]);
  const region = getRegion(regionId);
  if (!region) notFound();
  const landmark = getLandmark(regionId, landmarkId);
  if (!landmark) notFound();
  const requestedFormat = typeof query.format === 'string' ? query.format : undefined;
  let defaultFormat: LandmarkFormat = 'overview';
  if (!requestedFormat) {
    const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
    const session = token ? await verifySessionToken(token) : null;
    if (session) {
      const depth = (await queryAsUser<{ depth_preference: string | null }>(session.userId, 'SELECT depth_preference FROM profiles WHERE id = $1', [session.userId])).rows[0]?.depth_preference;
      defaultFormat = depth === 'thorough' ? 'lesson' : depth === 'expert_refresh' ? 'quiz' : 'overview';
    }
  }
  const format = formats.includes(requestedFormat as LandmarkFormat) ? requestedFormat as LandmarkFormat : defaultFormat;
  recordEvent('landmark_open', { regionId, landmarkId, format });
  if (requestedFormat && formats.includes(requestedFormat as LandmarkFormat)) recordEvent('format_switched', { regionId, landmarkId, format });
  return <SubMapScene region={region} landmark={landmark} format={format} />;
}
