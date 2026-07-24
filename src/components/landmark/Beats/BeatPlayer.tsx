'use client';

import Link from 'next/link';
import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';

import type { Beat, BeatProgressState, BeatSequence } from '@/content/beats/schema';
import type { Landmark } from '@/content/schema';
import { recordClientEvent } from '@/components/landmark/clientEvents';
import {
  canAdvance,
  initialPlayerState,
  isChoiceBeat,
  playerReducer,
  shouldPersist,
  type PlayerAction,
  type PlayerState,
} from './beatReducer';
import {
  collectibleFor,
  COLLECTIBLE_CONFIRMED_EVENT,
  COLLECTIBLE_GLOW_STORAGE_KEY,
  isServerConfirmedCompletion,
  upsertCollectibleGlowMarker,
  type Collectible,
} from '@/lib/collectibles';
import {
  readLocalBeatProgress,
  toBeatProgressState,
  writeLocalBeatProgress,
} from './beatStorage';
import styles from './beats.module.css';

export type BeatPlayerProps = {
  sequence: BeatSequence;
  landmark: Landmark;
  regionId: string;
  regionTitle: string;
  landmarkIndex: number; // 0-based within region
  regionLandmarkCount: number;
  nextLandmark: { id: string; title: string } | null;
  initialProgress?: BeatProgressState | null;
  regionStampedCount: number;
};

const KEY_LABELS = ['A', 'B', 'C', 'D'] as const;

function applyResume(
  state: PlayerState,
  progress: BeatProgressState | null | undefined,
  sequence: BeatSequence,
): PlayerState {
  if (!progress) return state;
  return playerReducer(sequence, state, {
    type: 'resume',
    furthestBeatIndex: progress.furthestBeatIndex,
    checked: progress.checked,
    completed: progress.completed,
    stampedAt: progress.stampedAt,
  });
}

function feedbackClass(kind: NonNullable<PlayerState['feedback']>['kind']): string {
  if (kind === 'correct') return `${styles.feedback} ${styles.ok}`;
  if (kind === 'wrong') return `${styles.feedback} ${styles.no}`;
  return styles.feedback;
}

function feedbackLead(kind: NonNullable<PlayerState['feedback']>['kind']): string {
  if (kind === 'correct') return 'Good call.';
  if (kind === 'wrong') return 'Not quite.';
  return 'Noted.';
}

function actionLabel(beat: Beat): string {
  switch (beat.type) {
    case 'hook':
      return 'Begin →';
    case 'predict':
      return 'See the worked example →';
    case 'reveal':
      return 'Continue →';
    case 'scenario':
    case 'gotcha':
      return 'Next →';
    case 'tradeoff':
      return 'Lock it in →';
    case 'default':
      return 'Got it →';
    case 'check':
      return 'Finish →';
    default:
      return 'Continue →';
  }
}

function nowMs(): number {
  return typeof performance !== 'undefined' ? performance.now() : Date.now();
}

export function BeatPlayer({
  sequence,
  landmark,
  regionId,
  regionTitle,
  landmarkIndex,
  regionLandmarkCount,
  nextLandmark,
  initialProgress = null,
  regionStampedCount,
}: BeatPlayerProps) {
  const init = useCallback(() => {
    const base = initialPlayerState(sequence);
    return applyResume(base, initialProgress, sequence);
  }, [sequence, initialProgress]);

  const [state, dispatch] = useReducer(
    (current: PlayerState, action: PlayerAction) => playerReducer(sequence, current, action),
    undefined,
    init,
  );

  const beat = sequence.beats[state.displayIndex]!;
  const terminal = sequence.beats.length - 1;
  const belowFrontier = state.displayIndex < state.furthestBeatIndex;
  const mayAdvance = belowFrontier || canAdvance(beat, state);

  const mountMs = useRef(0);
  const beatEnteredAt = useRef(0);
  const prevState = useRef(state);
  const startedBeats = useRef(new Set<string>());
  const completedBeats = useRef(new Set<string>());
  const stampedEvent = useRef(false);
  const resumeEvent = useRef(false);
  const hydrated = useRef(false);
  const hasMounted = useRef(false);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [quizChoice, setQuizChoice] = useState('');
  const [sessionStamped, setSessionStamped] = useState(false);
  // Collectible ownership is server-confirmed only (never local/optimistic).
  const [collectibleConfirmed, setCollectibleConfirmed] = useState(
    () => initialProgress?.completed === true,
  );
  // Fresh grant announcement only — resumed ownership stays quiet (no aria-live).
  const [collectibleJustConfirmed, setCollectibleJustConfirmed] = useState(false);
  const collectibleConfirmedRef = useRef(initialProgress?.completed === true);
  // Set in onStamp; glow marker + confirmed event only after a real stamp gesture.
  const freshStampGestureRef = useRef(false);
  const collectible = useMemo(
    () => collectibleFor(regionId, landmark.id),
    [regionId, landmark.id],
  );

  const estimatedMinutes = useMemo(() => {
    const seconds = sequence.beats.reduce((sum, item) => sum + item.estimatedSeconds, 0);
    return Math.max(1, Math.round(seconds / 60));
  }, [sequence.beats]);

  // Initialize timers once on mount (purity: no performance/Date during render).
  useEffect(() => {
    const now = nowMs();
    mountMs.current = now;
    beatEnteredAt.current = now;
  }, []);

  // localStorage resume (monotonic with server seed) — once on mount.
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    const local = readLocalBeatProgress(regionId, landmark.id);
    if (local) {
      const before = state.furthestBeatIndex;
      dispatch({
        type: 'resume',
        furthestBeatIndex: local.furthestBeatIndex,
        checked: local.checked,
        completed: local.completed,
        stampedAt: local.stampedAt,
      });
      if (!resumeEvent.current && Math.max(before, local.furthestBeatIndex) > 0) {
        resumeEvent.current = true;
        recordClientEvent('resume_succeeded', {
          region: regionId,
          landmark: landmark.id,
          furthest_beat_index: Math.max(before, local.furthestBeatIndex),
        });
      }
    } else if (!resumeEvent.current && (initialProgress?.furthestBeatIndex ?? 0) > 0) {
      resumeEvent.current = true;
      recordClientEvent('resume_succeeded', {
        region: regionId,
        landmark: landmark.id,
        furthest_beat_index: initialProgress!.furthestBeatIndex,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only hydrate
  }, []);

  // Persist + analytics edges on state transitions.
  useEffect(() => {
    const prev = prevState.current;
    const next = state;
    prevState.current = next;

    if (shouldPersist(prev, next)) {
      const payload = toBeatProgressState(next);
      writeLocalBeatProgress(regionId, landmark.id, payload);
      void fetch('/api/progress', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ region: regionId, landmark: landmark.id, state: payload }),
      })
        .then(async (response) => {
          if (!response.ok) return;
          const body = (await response.json()) as {
            state?: unknown;
            xp?: {
              total?: number;
              newPoints?: number;
              awarded?: Array<{ awardKey: string; points: number }>;
            };
          };

          // XP branch is independent of collectible ownership.
          const xp = body.xp;
          if (
            xp
            && typeof xp.newPoints === 'number'
            && xp.newPoints > 0
            && typeof xp.total === 'number'
          ) {
            recordClientEvent('xp_awarded', {
              region: regionId,
              landmark: landmark.id,
              points: xp.newPoints,
              total: xp.total,
              award_count: Array.isArray(xp.awarded) ? xp.awarded.length : 0,
            });
          }

          // Collectible ownership only after server-merged completed === true.
          // Never from local reducer, localStorage, or outgoing payload.
          // Glow marker + live announcement only after a real stamp gesture this session
          // (resume of already-completed must stay static / no glow replay).
          if (
            !collectibleConfirmedRef.current
            && isServerConfirmedCompletion(body.state)
          ) {
            collectibleConfirmedRef.current = true;
            setCollectibleConfirmed(true);
            if (freshStampGestureRef.current) {
              setCollectibleJustConfirmed(true);
              try {
                const current = window.sessionStorage.getItem(COLLECTIBLE_GLOW_STORAGE_KEY);
                const next = upsertCollectibleGlowMarker(current, regionId, landmark.id);
                window.sessionStorage.setItem(COLLECTIBLE_GLOW_STORAGE_KEY, next);
              } catch {
                // Private mode / blocked storage — shelf still works from server progress.
              }
              // Same-tab event closes stamp→map race (storage events are cross-tab only).
              try {
                window.dispatchEvent(
                  new CustomEvent(COLLECTIBLE_CONFIRMED_EVENT, {
                    detail: { regionId, landmarkId: landmark.id },
                  }),
                );
              } catch {
                // Non-browser / blocked events — region map will catch up on next GET.
              }
            }
          }
        })
        .catch(() => {
          // Offline / 401 — localStorage is the floor; play never blocks.
          // Collectible stays hidden until a server-confirmed PUT lands.
        });
    }
  }, [state, regionId, landmark.id]);

  // beat_started on displayed beat change; focus the card only after real transitions.
  useEffect(() => {
    const current = sequence.beats[state.displayIndex];
    if (!current) return;
    beatEnteredAt.current = nowMs();
    if (!startedBeats.current.has(current.id)) {
      startedBeats.current.add(current.id);
      recordClientEvent('beat_started', {
        region: regionId,
        landmark: landmark.id,
        beat_id: current.id,
        type: current.type,
      });
    }
    if (hasMounted.current) {
      const id = window.requestAnimationFrame(() => {
        // Skip if the user/test already moved focus inside the card — avoids racing
        // keyboard activation (Enter/Space) that landed between remount and this frame.
        const active = document.activeElement;
        if (active && cardRef.current?.contains(active)) return;
        cardRef.current?.focus({ preventScroll: true });
      });
      return () => window.cancelAnimationFrame(id);
    }
    hasMounted.current = true;
    return undefined;
  }, [state.displayIndex, sequence.beats, regionId, landmark.id]);

  const completeBeatAndAdvance = useCallback(() => {
    const current = sequence.beats[state.displayIndex];
    if (!current) return;
    if (!(state.displayIndex < state.furthestBeatIndex) && !canAdvance(current, state)) return;

    // Emit beat_completed only on frontier resolve (first time leaving this beat).
    if (state.displayIndex === state.furthestBeatIndex && !completedBeats.current.has(current.id)) {
      completedBeats.current.add(current.id);
      recordClientEvent('beat_completed', {
        region: regionId,
        landmark: landmark.id,
        beat_id: current.id,
        type: current.type,
        ms: Math.max(0, Math.round(nowMs() - beatEnteredAt.current)),
      });
    }
    setQuizChoice('');
    dispatch({ type: 'advance' });
  }, [sequence.beats, state, regionId, landmark.id]);

  const onBack = () => {
    setQuizChoice('');
    dispatch({ type: 'back' });
  };

  const onChoose = (optionId: string) => {
    dispatch({ type: 'choose', optionId });
  };

  const onClassify = (itemId: string, side: 'pro' | 'con') => {
    dispatch({ type: 'classify', itemId, side });
  };

  const onGradeCheck = (correct: boolean) => {
    recordClientEvent('quiz_completed', {
      region: regionId,
      landmark: landmark.id,
      score: correct ? 1 : 0,
      correct,
    });
    dispatch({ type: 'grade_check', correct });
  };

  const onStamp = () => {
    // Gesture-based emission: stamp means "learner pressed stamp", never resume.
    if (state.completed || stampedEvent.current) return;
    stampedEvent.current = true;
    freshStampGestureRef.current = true;
    recordClientEvent('landmark_stamped', {
      region: regionId,
      landmark: landmark.id,
      ms_total: Math.max(0, Math.round(nowMs() - mountMs.current)),
    });
    setSessionStamped(true);
    dispatch({ type: 'stamp', stampedAt: new Date().toISOString() });
  };

  const onNextLandmark = () => {
    if (!nextLandmark) return;
    recordClientEvent('next_landmark_accepted', {
      region: regionId,
      from: landmark.id,
      to: nextLandmark.id,
    });
  };

  const onChoiceKeyDown = (event: KeyboardEvent<HTMLButtonElement>, optionIds: string[]) => {
    const index = optionIds.indexOf(event.currentTarget.dataset.optionId ?? '');
    if (index < 0) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      event.preventDefault();
      const next = (index + 1) % optionIds.length;
      event.currentTarget.parentElement?.parentElement
        ?.querySelectorAll<HTMLButtonElement>('button[data-option-id]')
        [next]?.focus();
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      event.preventDefault();
      const next = (index - 1 + optionIds.length) % optionIds.length;
      event.currentTarget.parentElement?.parentElement
        ?.querySelectorAll<HTMLButtonElement>('button[data-option-id]')
        [next]?.focus();
    }
  };

  // Server seed + this-session stamp (resume-already-stamped never re-enters onStamp).
  const stampedDisplay = Math.min(
    regionLandmarkCount,
    regionStampedCount + (sessionStamped ? 1 : 0),
  );

  const pips = sequence.beats.map((item, index) => {
    const done = index < state.furthestBeatIndex || (index === terminal && state.completed);
    const current = index === state.displayIndex && !state.completed;
    return { id: item.id, done, current };
  });

  return (
    <section
      className={styles.panel}
      data-testid="beat-player"
      aria-labelledby="beat-player-title"
    >
      <p className="region-kicker">
        {regionTitle} · Landmark {landmarkIndex + 1} of {regionLandmarkCount}
      </p>
      <h3 id="beat-player-title" style={{ margin: '0 0 18px', fontFamily: 'var(--font-pixel), monospace' }}>
        {landmark.title}
      </h3>

      <ol className={styles.pips} aria-label={`Beat ${state.displayIndex + 1} of ${sequence.beats.length}`}>
        {pips.map((pip) => (
          <li
            key={pip.id}
            className={pip.done ? styles.done : pip.current ? styles.current : undefined}
            aria-current={pip.current ? 'step' : undefined}
          >
            <span className={styles.sr}>
              {pip.done ? 'done' : pip.current ? 'current' : 'upcoming'}
            </span>
          </li>
        ))}
      </ol>

      <div
        key={state.displayIndex}
        ref={cardRef}
        className={`${styles.beatCard} ${styles.entering}`}
        tabIndex={-1}
        data-beat-id={beat.id}
        data-beat-type={beat.type}
      >
        {state.completed && beat.type === 'recap' ? (
          <StampPanel
            landmarkTitle={landmark.title}
            regionTitle={regionTitle}
            estimatedMinutes={estimatedMinutes}
            stampedCount={stampedDisplay}
            regionLandmarkCount={regionLandmarkCount}
            nextLandmark={nextLandmark}
            regionId={regionId}
            onNext={onNextLandmark}
            collectible={collectibleConfirmed ? collectible : null}
            announceCollectible={collectibleJustConfirmed}
            animateStamp={sessionStamped}
          />
        ) : (
          <>
            <p className={styles.prompt}>{beat.prompt}</p>

            {beat.type === 'reveal' && (
              <ul className={styles.cards} aria-live="polite">
                {beat.cards.slice(0, state.revealCount).map((card) => (
                  <li key={card}>{card}</li>
                ))}
              </ul>
            )}

            {/* Scenario mock-diff panel deferred: comps had a hard-coded git staged-diff;
                the frozen beat grammar has no typed `diff` field (R001). Re-add only via
                contract amendment. CSS `.diff` classes remain for that future path. */}

            {isChoiceBeat(beat) && (
              <ul className={styles.choices} aria-label={`${beat.type} choices`}>
                {beat.options.map((option, index) => {
                  const selected = state.feedback?.optionId === option.id;
                  const correctPick = selected && state.feedback?.kind === 'correct';
                  const wrongPick = selected && state.feedback?.kind === 'wrong';
                  const infoPick = selected && state.feedback?.kind === 'info';
                  const className = [
                    styles.choice,
                    correctPick || infoPick ? styles.isCorrect : '',
                    wrongPick ? styles.isWrong : '',
                  ]
                    .filter(Boolean)
                    .join(' ');
                  return (
                    <li key={option.id}>
                      <button
                        type="button"
                        className={className}
                        data-option-id={option.id}
                        aria-pressed={selected ? 'true' : 'false'}
                        onClick={() => onChoose(option.id)}
                        onKeyDown={(event) =>
                          onChoiceKeyDown(
                            event,
                            beat.options.map((candidate) => candidate.id),
                          )
                        }
                      >
                        <span className={styles.key} aria-hidden="true">
                          {correctPick ? '✓' : wrongPick ? '✗' : KEY_LABELS[index] ?? String(index + 1)}
                        </span>
                        {option.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            {beat.type === 'tradeoff' && (
              <ul className={styles.choices} aria-label="Tradeoff items">
                {beat.items.map((item) => {
                  const picked = state.classifications[item.id];
                  const rowClass = [
                    styles.tradeoffRow,
                    picked && picked === item.side ? styles.correctPick : '',
                    picked && picked !== item.side ? styles.wrongPick : '',
                  ]
                    .filter(Boolean)
                    .join(' ');
                  return (
                    <li key={item.id} className={rowClass}>
                      <span>{item.label}</span>
                      <button
                        type="button"
                        className={`${styles.side} ${picked === 'pro' ? styles.sidePicked : ''}`}
                        aria-pressed={picked === 'pro'}
                        onClick={() => onClassify(item.id, 'pro')}
                      >
                        Pro
                      </button>
                      <button
                        type="button"
                        className={`${styles.side} ${picked === 'con' ? styles.sidePicked : ''}`}
                        aria-pressed={picked === 'con'}
                        onClick={() => onClassify(item.id, 'con')}
                      >
                        Con
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            {beat.type === 'check' && (
              <fieldset className={styles.choices} disabled={state.feedback?.kind === 'correct'}>
                <legend className={styles.sr}>Choose one answer</legend>
                {landmark.quiz.options.map((option, index) => {
                  const selected = quizChoice === option;
                  const graded = state.feedback !== null && selected;
                  const correct = graded && option === landmark.quiz.answer;
                  const wrong = graded && option !== landmark.quiz.answer;
                  return (
                    <label
                      key={option}
                      className={[
                        styles.choice,
                        correct ? styles.isCorrect : '',
                        wrong ? styles.isWrong : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      <span className={styles.key} aria-hidden="true">
                        {correct ? '✓' : wrong ? '✗' : KEY_LABELS[index] ?? String(index + 1)}
                      </span>
                      <input
                        type="radio"
                        name={`beat-check-${beat.id}`}
                        value={option}
                        checked={selected}
                        onChange={() => setQuizChoice(option)}
                      />
                      {option}
                    </label>
                  );
                })}
              </fieldset>
            )}

            {beat.type === 'recap' && !state.completed && (
              <ul className={styles.bullets}>
                {beat.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            )}

            {beat.hint && !state.feedback && beat.type !== 'recap' && (
              <p className={styles.hint}>{beat.hint}</p>
            )}

            {state.feedback && (
              <p className={feedbackClass(state.feedback.kind)} role="status" aria-live="polite">
                <strong>{feedbackLead(state.feedback.kind)}</strong> {state.feedback.text}
                {beat.type === 'check' && state.feedback.kind === 'correct' && (
                  <> {landmark.quiz.explanation}</>
                )}
              </p>
            )}

            <div className={styles.actions}>
              {beat.type === 'reveal' && state.revealCount < beat.cards.length && (
                <button
                  type="button"
                  className={`${styles.btn} ${styles.primary}`}
                  onClick={() => dispatch({ type: 'reveal_next' })}
                >
                  Show next card →
                </button>
              )}

              {beat.type === 'check' && state.feedback?.kind !== 'correct' && (
                <button
                  type="button"
                  className={`${styles.btn} ${styles.primary}`}
                  disabled={!quizChoice}
                  onClick={() => onGradeCheck(quizChoice === landmark.quiz.answer)}
                >
                  Check answer
                </button>
              )}

              {beat.type === 'recap' && !state.completed && (
                <button
                  type="button"
                  className={`${styles.btn} ${styles.primary}`}
                  data-testid="beat-stamp"
                  disabled={!state.checked}
                  onClick={onStamp}
                >
                  Stamp this lesson →
                </button>
              )}

              {beat.type !== 'recap'
                && mayAdvance
                && !(beat.type === 'reveal' && state.revealCount < beat.cards.length && !belowFrontier) && (
                <button
                  type="button"
                  className={`${styles.btn} ${styles.primary}`}
                  data-testid="beat-advance"
                  onClick={completeBeatAndAdvance}
                >
                  {actionLabel(beat)}
                </button>
              )}

              {state.displayIndex > 0 && (
                <button
                  type="button"
                  className={`${styles.btn} ${styles.back}`}
                  data-testid="beat-back"
                  onClick={onBack}
                >
                  ← Back
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function StampPanel({
  landmarkTitle,
  regionTitle,
  estimatedMinutes,
  stampedCount,
  regionLandmarkCount,
  nextLandmark,
  regionId,
  onNext,
  collectible,
  announceCollectible,
  animateStamp,
}: {
  landmarkTitle: string;
  regionTitle: string;
  estimatedMinutes: number;
  stampedCount: number;
  regionLandmarkCount: number;
  nextLandmark: { id: string; title: string } | null;
  regionId: string;
  onNext: () => void;
  collectible: Collectible | null;
  /** Live region only for a freshly server-confirmed stamp this session. */
  announceCollectible: boolean;
  /** Stamp-in motion only after a real stamp gesture this session (not resume). */
  animateStamp: boolean;
}) {
  // E-004: 6-pip region progress (R030) — reuse beat pips classes.
  const regionPips = Array.from({ length: regionLandmarkCount }, (_, index) => index < stampedCount);

  return (
    <div className={styles.stampWrap} data-testid="beat-stamp-panel">
      <div
        className={`${styles.stamp}${animateStamp ? ` ${styles.stampFresh}` : ''}`}
        role="img"
        aria-label="Stamped: landmark complete"
        data-stamp-animate={animateStamp ? 'true' : 'false'}
      >
        STAMPED
        <span className={styles.sub}>
          {landmarkTitle} · ~{estimatedMinutes} min
        </span>
      </div>
      {collectible && (
        <div
          className={styles.collectibleGrant}
          data-testid="collectible-grant"
          {...(announceCollectible
            ? { role: 'status' as const, 'aria-live': 'polite' as const }
            : {})}
        >
          <div className={styles.collectibleTile} aria-hidden="true">
            {collectible.sigil}
          </div>
          <div>
            <strong>{collectible.name}</strong>
            <p>Your shelf keeps it for the next visit.</p>
          </div>
        </div>
      )}
      <p className={styles.regionLine}>
        {regionTitle} — <b>{stampedCount} of {regionLandmarkCount}</b> stamped
      </p>
      <ol className={styles.pips} aria-label={`${stampedCount} of ${regionLandmarkCount} landmarks stamped`}>
        {regionPips.map((done, index) => (
          <li key={index} className={done ? styles.done : undefined}>
            <span className={styles.sr}>{done ? 'stamped' : 'open'}</span>
          </li>
        ))}
      </ol>
      <div className={styles.actions} style={{ width: '100%' }}>
        {nextLandmark && (
          <Link
            className={`${styles.btn} ${styles.primary}`}
            href={`/map/${regionId}/${nextLandmark.id}?format=lesson`}
            onClick={onNext}
            data-testid="beat-next-landmark"
          >
            Next: {nextLandmark.title} →
          </Link>
        )}
        <Link
          className={`${styles.btn} ${styles.secondary}`}
          href={`/map/${regionId}`}
          data-testid="beat-back-map"
        >
          Back to map
        </Link>
      </div>
    </div>
  );
}
