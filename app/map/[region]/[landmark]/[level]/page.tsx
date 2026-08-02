import { notFound } from 'next/navigation';

import { LandmarkRoute, parseLevelSegment } from '../resolveLandmark';

/**
 * The additive level segment (REQ-010). This route exists ALONGSIDE the legacy
 * landmark URL, which is why there is no redirect in either direction: adding a
 * canonical form would change what the 48 existing URLs mean, and that is an
 * owner decision the packet has not taken (HANDOFF §9).
 *
 * An unknown segment 404s rather than falling through to the landmark page, so
 * `/map/git/merge-conflicts/l4` is an error and not a silent L1.
 */
export default async function LandmarkLevelPage({
  params,
  searchParams,
}: {
  params: Promise<{ region: string; landmark: string; level: string }>;
  searchParams: Promise<{ format?: string | string[] }>;
}) {
  const [{ region: regionId, landmark: landmarkId, level }, query] = await Promise.all([
    params,
    searchParams,
  ]);
  const requestedLevel = parseLevelSegment(level);
  if (!requestedLevel) notFound();

  return (
    <LandmarkRoute
      regionId={regionId}
      landmarkId={landmarkId}
      requestedLevel={requestedLevel}
      query={query}
    />
  );
}
