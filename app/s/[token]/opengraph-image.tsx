import { ImageResponse } from 'next/og';

import { getSnapshotByToken } from '@/server/share';

export const alt = 'Vibe Code Quest progress snapshot';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const revalidate = 60;

export default async function Image({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const snapshot = await getSnapshotByToken(token);
  const completed = snapshot?.totals.landmarksCompleted ?? 0;
  const total = snapshot?.totals.landmarksTotal ?? 48;
  const subtitle = snapshot
    ? `${snapshot.totals.regionsStarted} regions started`
    : 'This progress snapshot is unavailable';

  return new ImageResponse(<div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '72px 84px', color: '#f8f0d7', background: '#173f35', fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>
    <div style={{ display: 'flex', fontSize: 30, letterSpacing: 2 }}>VIBE CODE QUEST · PROGRESS MAP</div>
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', fontSize: 104, lineHeight: 1, fontWeight: 800 }}>{completed} / {total}</div>
      <div style={{ display: 'flex', marginTop: 24, fontSize: 42 }}>landmarks explored</div>
    </div>
    <div style={{ display: 'flex', fontSize: 28, color: '#ffd166' }}>{subtitle}</div>
  </div>, size);
}
