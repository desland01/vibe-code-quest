import { regions } from '@/lib/content';
import { LandmarkRoute } from './resolveLandmark';

export function generateStaticParams() {
  return regions.flatMap((region) =>
    region.landmarks.map((landmark) => ({ region: region.id, landmark: landmark.id })),
  );
}

/**
 * The legacy landmark URL. It keeps working exactly as it did (VAL-015/VAL-016)
 * and now resolves to the highest level the player has unlocked, rather than
 * hard-coding L3.
 */
export default async function LandmarkMapPage({
  params,
  searchParams,
}: {
  params: Promise<{ region: string; landmark: string }>;
  searchParams: Promise<{ format?: string | string[] }>;
}) {
  const [{ region: regionId, landmark: landmarkId }, query] = await Promise.all([
    params,
    searchParams,
  ]);
  return (
    <LandmarkRoute
      regionId={regionId}
      landmarkId={landmarkId}
      requestedLevel={null}
      query={query}
    />
  );
}
