'use client';

import { useEffect } from 'react';
import type { BeatProgressState, BeatSequence } from '@/content/beats/schema';
import type { Landmark } from '@/content/schema';
import { FormatSwitcher, type LandmarkFormat } from './FormatSwitcher';
import { LessonFormat } from './LessonFormat';
import { OverviewFormat } from './OverviewFormat';
import { QuizFormat } from './QuizFormat';
import { recordClientEvent } from './clientEvents';
import { GuideChat } from './GuideChat';
import { BeatPlayer } from './Beats/BeatPlayer';

export type LandmarkBeatProps = {
  sequence: BeatSequence;
  regionTitle: string;
  landmarkIndex: number;
  regionLandmarkCount: number;
  nextLandmark: { id: string; title: string } | null;
  initialProgress: BeatProgressState | null;
  regionStampedCount: number;
};

export function LandmarkView({
  landmark,
  regionId,
  format,
  beats = null,
}: {
  landmark: Landmark;
  regionId: string;
  format: LandmarkFormat;
  beats?: LandmarkBeatProps | null;
}) {
  useEffect(() => {
    recordClientEvent('landmark_open', { region: regionId, landmark: landmark.id });
  }, [regionId, landmark.id]);

  const playMode = format === 'lesson' && beats !== null;

  return (
    <article className="landmark-detail" aria-labelledby="landmark-title">
      <header className="landmark-detail-header">
        <div>
          <p className="region-kicker">Landmark detail</p>
          <h2 id="landmark-title">{landmark.title}</h2>
        </div>
      </header>
      <FormatSwitcher
        format={format}
        regionId={regionId}
        landmarkId={landmark.id}
        playLabel={beats !== null}
      />
      {format === 'overview' && <OverviewFormat landmark={landmark} />}
      {playMode && (
        <BeatPlayer
          sequence={beats.sequence}
          landmark={landmark}
          regionId={regionId}
          regionTitle={beats.regionTitle}
          landmarkIndex={beats.landmarkIndex}
          regionLandmarkCount={beats.regionLandmarkCount}
          nextLandmark={beats.nextLandmark}
          initialProgress={beats.initialProgress}
          regionStampedCount={beats.regionStampedCount}
        />
      )}
      {format === 'lesson' && !playMode && (
        <>
          <OverviewFormat landmark={landmark} />
          <LessonFormat landmark={landmark} regionId={regionId} />
        </>
      )}
      {format === 'quiz' && <QuizFormat landmark={landmark} regionId={regionId} />}
      <GuideChat landmark={landmark} regionId={regionId} />
    </article>
  );
}
