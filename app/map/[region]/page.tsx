import { notFound } from 'next/navigation';
import { SubMapScene } from '@/components/map/SubMapScene';
import { getRegion, regions } from '@/lib/content';

export function generateStaticParams() {
  return regions.map((region) => ({ region: region.id }));
}

export default async function RegionMapPage({ params }: { params: Promise<{ region: string }> }) {
  const { region: regionId } = await params;
  const region = getRegion(regionId);
  if (!region) notFound();
  return <SubMapScene region={region} />;
}
