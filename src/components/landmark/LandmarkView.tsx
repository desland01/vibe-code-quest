'use client';

import { useEffect } from 'react';
import type { Landmark } from '@/content/schema';
import { FormatSwitcher, type LandmarkFormat } from './FormatSwitcher';
import { LessonFormat } from './LessonFormat';
import { OverviewFormat } from './OverviewFormat';
import { QuizFormat } from './QuizFormat';
import { recordClientEvent } from './clientEvents';

export function LandmarkView({ landmark, regionId, format }: { landmark: Landmark; regionId: string; format: LandmarkFormat }) {
  useEffect(() => { recordClientEvent('landmark_open', { regionId, landmarkId: landmark.id, format }); }, [regionId, landmark.id, format]);
  return <article className="landmark-detail" aria-labelledby="landmark-title">
    <header className="landmark-detail-header"><div><p className="region-kicker">Landmark detail</p><h2 id="landmark-title">{landmark.title}</h2></div></header>
    <FormatSwitcher format={format} regionId={regionId} landmarkId={landmark.id} />
    {format === 'overview' && <OverviewFormat landmark={landmark} />}
    {format === 'lesson' && <><OverviewFormat landmark={landmark} /><LessonFormat landmark={landmark} regionId={regionId} /></>}
    {format === 'quiz' && <QuizFormat landmark={landmark} regionId={regionId} />}
  </article>;
}
