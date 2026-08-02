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

  const switcher = (
    <FormatSwitcher
      format={format}
      regionId={regionId}
      landmarkId={landmark.id}
      playLabel={beats !== null}
    />
  );

  // ISSUE-015: in play mode the stage IS the page. The document header and the
  // format switcher move inside it, and the article collapses out of flow, so
  // the only thing with height is the fixed stage — which is what makes
  // `document.body.scrollHeight <= window.innerHeight` true (VAL-013) rather
  // than merely hiding a scrollbar over content that still overflows.
  if (playMode) {
    return (
      <article className="landmark-detail is-staged" aria-labelledby="beat-player-title">
        <BeatPlayer
          // Three-part identity: keying by region/landmark alone would reuse one
          // player's state across two levels of the same landmark.
          key={`${regionId}/${landmark.id}/${beats.sequence.level}`}
          sequence={beats.sequence}
          landmark={landmark}
          regionId={regionId}
          regionTitle={beats.regionTitle}
          landmarkIndex={beats.landmarkIndex}
          regionLandmarkCount={beats.regionLandmarkCount}
          nextLandmark={beats.nextLandmark}
          initialProgress={beats.initialProgress}
          regionStampedCount={beats.regionStampedCount}
          hud={switcher}
        />
        <GuideChat landmark={landmark} regionId={regionId} />
      </article>
    );
  }

  return (
    <article className="landmark-detail" aria-labelledby="landmark-title">
      <header className="landmark-detail-header">
        <div>
          <p className="region-kicker">Landmark detail</p>
          <h2 id="landmark-title">{landmark.title}</h2>
        </div>
      </header>
      {switcher}
      {format === 'overview' && <OverviewFormat landmark={landmark} />}
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
