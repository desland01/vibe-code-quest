import { notFound } from 'next/navigation';
import { SubMapScene, type LandmarkFormat } from '@/components/map/SubMapScene';
import { getLandmark, getRegion, regions } from '@/lib/content';

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
  const format = formats.includes(requestedFormat as LandmarkFormat) ? requestedFormat as LandmarkFormat : 'overview';
  return <SubMapScene region={region} landmark={landmark} format={format} />;
}
