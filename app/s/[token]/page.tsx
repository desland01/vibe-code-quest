import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getSnapshotByToken } from '@/server/share';

export const revalidate = 60;

type PageProps = { params: Promise<{ token: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params;
  return {
    title: 'Learning progress · code-tutor',
    description: 'A code-tutor learning progress snapshot.',
    openGraph: { images: [`/s/${token}/opengraph-image`] }
  };
}

export default async function SharePage({ params }: PageProps) {
  const { token } = await params;
  const snapshot = await getSnapshotByToken(token);
  if (!snapshot) notFound();

  return <main className="share-page" id="main-content">
    <header className="share-hero">
      <p className="region-kicker">code-tutor progress snapshot</p>
      <h1>{snapshot.totals.landmarksCompleted} of {snapshot.totals.landmarksTotal} landmarks explored</h1>
      <p>{snapshot.totals.regionsStarted} learning regions started.</p>
    </header>
    <section aria-labelledby="region-progress-title">
      <h2 id="region-progress-title">Region progress</h2>
      <ul className="share-region-list">
        {snapshot.regions.map((region) => <li key={region.id}>
          <span>{region.title}</span>
          <strong>{region.landmarksCompleted} / {region.landmarksTotal}</strong>
        </li>)}
      </ul>
    </section>
    <p className="share-date">Snapshot created {new Date(snapshot.createdAt).toLocaleDateString('en-US', { dateStyle: 'long', timeZone: 'UTC' })}</p>
  </main>;
}
