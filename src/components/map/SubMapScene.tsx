'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import type { Landmark, Region } from '@/content/schema';
import { LandmarkView, type LandmarkBeatProps } from '@/components/landmark/LandmarkView';
import type { LandmarkFormat } from '@/components/landmark/FormatSwitcher';
import { useSession } from '@/lib/auth/SessionProvider';
import {
  COLLECTIBLE_CONFIRMED_EVENT,
  COLLECTIBLE_GLOW_STORAGE_KEY,
  collectibleFor,
  collectiblesForRegion,
  completedLandmarkIds,
  consumeCollectibleGlowMarker,
  readCollectibleGlowMarkers,
} from '@/lib/collectibles';
import { getRegionAccent } from './regionAccents';
import styles from './SubMapScene.module.css';

export type { LandmarkFormat } from '@/components/landmark/FormatSwitcher';

type ProgressResponse = {
  items?: Array<{ region?: unknown; landmark?: unknown; state?: unknown }>;
};

export function SubMapScene({
  region,
  landmark,
  format = 'overview',
  beats = null,
}: {
  region: Region;
  landmark?: Landmark;
  format?: LandmarkFormat;
  beats?: LandmarkBeatProps | null;
}) {
  const style = { '--region-accent': getRegionAccent(region.id) } as CSSProperties;
  const session = useSession();
  const isAuthed = session.status === 'authenticated';
  const isRegionOverview = landmark === undefined;
  // Region-keyed raw fetch state. Unauthenticated UI derives to null so logout
  // never needs a synchronous effect reset (react-hooks/set-state-in-effect).
  // Keying by regionId also prevents one-frame cross-region leakage on nav.
  type RegionIdSet = { regionId: string; ids: Set<string> };
  const [ownedRaw, setOwnedRaw] = useState<RegionIdSet | null>(null);
  const [freshGlowRaw, setFreshGlowRaw] = useState<RegionIdSet | null>(null);
  const completed =
    isAuthed && ownedRaw?.regionId === region.id ? ownedRaw.ids : null;
  const freshGlow =
    isAuthed && isRegionOverview && freshGlowRaw?.regionId === region.id
      ? freshGlowRaw.ids
      : null;

  const refreshProgress = useCallback(
    async (signal?: AbortSignal) => {
      try {
        const response = await fetch('/api/progress', {
          credentials: 'same-origin',
          signal,
        });
        if (!response.ok) {
          setOwnedRaw(null);
          setFreshGlowRaw(null);
          return;
        }
        const body = (await response.json()) as ProgressResponse;
        if (!body || !Array.isArray(body.items)) {
          setOwnedRaw(null);
          setFreshGlowRaw(null);
          return;
        }
        const owned = completedLandmarkIds(body.items, region.id);
        setOwnedRaw({ regionId: region.id, ids: owned });

        // One-shot glow is region-overview only. Landmark detail pages refresh
        // ownership but must not consume markers (offscreen cards).
        if (!isRegionOverview) {
          setFreshGlowRaw(null);
          return;
        }

        try {
          // Animate every owned, unconsumed marker for this region. Consume only
          // this region's markers so stamps from other regions remain queued.
          let raw = window.sessionStorage.getItem(COLLECTIBLE_GLOW_STORAGE_KEY);
          const markers = readCollectibleGlowMarkers(raw)
            .filter((m) => m.regionId === region.id && owned.has(m.landmarkId))
            .sort((a, b) => a.at - b.at);
          const animatedIds = markers.map((m) => m.landmarkId);
          for (const marker of markers) {
            const result = consumeCollectibleGlowMarker(raw, marker.regionId, marker.landmarkId);
            raw = result.nextRaw;
          }
          if (raw === null) {
            window.sessionStorage.removeItem(COLLECTIBLE_GLOW_STORAGE_KEY);
          } else {
            window.sessionStorage.setItem(COLLECTIBLE_GLOW_STORAGE_KEY, raw);
          }
          setFreshGlowRaw(
            animatedIds.length > 0
              ? { regionId: region.id, ids: new Set(animatedIds) }
              : null,
          );
        } catch {
          setFreshGlowRaw(null);
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setOwnedRaw(null);
        setFreshGlowRaw(null);
      }
    },
    [region.id, isRegionOverview],
  );

  useEffect(() => {
    if (!isAuthed) return;
    const controller = new AbortController();
    // Defer past the effect body so setState only lands in async callbacks
    // (react-hooks/set-state-in-effect).
    const timer = window.setTimeout(() => {
      void refreshProgress(controller.signal);
    }, 0);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [isAuthed, refreshProgress]);

  useEffect(() => {
    if (!isAuthed) return;
    const onConfirmed = (event: Event) => {
      const detail = (event as CustomEvent<{ regionId?: string; landmarkId?: string }>).detail;
      if (detail?.regionId && detail.regionId !== region.id) return;
      void refreshProgress();
    };
    window.addEventListener(COLLECTIBLE_CONFIRMED_EVENT, onConfirmed);
    return () => window.removeEventListener(COLLECTIBLE_CONFIRMED_EVENT, onConfirmed);
  }, [isAuthed, region.id, refreshProgress]);

  const shelfItems = useMemo(() => {
    if (!completed) return null;
    return collectiblesForRegion(region.id).map((item) => ({
      collectible: item,
      earned: completed.has(item.landmarkId),
    }));
  }, [completed, region.id]);

  const earnedCount = shelfItems?.filter((item) => item.earned).length ?? 0;

  return (
    <main className={`sub-map-scene ${styles.scene}`} id="main-content" tabIndex={-1} style={style}>
      <a className="sub-map-skip-link" href="#landmark-list">Skip to landmarks</a>
      <div className="sub-map-zoom">
        <Link className="back-to-map" href="/map">← Back to map</Link>
        <header className="sub-map-banner">
          <p>{region.label}</p>
          <h1>{region.title}</h1>
          <p>{region.description}</p>
        </header>

        {/* Shelf is region-overview only — landmark detail stays focused on the lesson. */}
        {isRegionOverview && shelfItems && (
          <section
            className="collection-shelf"
            data-testid="collection-shelf"
            aria-label={`${region.title} keepsakes`}
          >
            <div className="collection-shelf-header">
              <h2>Your keepsakes</h2>
              <p>
                {earnedCount === 0
                  ? 'Stamp a landmark to earn your first keepsake.'
                  : `${earnedCount} earned on ${region.title}. Stamp another landmark whenever you want another keepsake.`}
              </p>
            </div>
            <div className="collection-shelf-grid">
              {shelfItems.map(({ collectible, earned }) => (
                <article
                  key={collectible.id}
                  className={`collection-shelf-card${earned ? ' is-earned' : ' is-open'}`}
                  data-testid={earned ? 'collectible-earned' : 'collectible-open'}
                  data-collectible-id={collectible.id}
                >
                  <div className="collection-shelf-tile" aria-hidden="true">
                    {earned ? collectible.sigil : '··'}
                  </div>
                  <h3>{collectible.name}</h3>
                  <p>
                    {region.landmarks.find((item) => item.id === collectible.landmarkId)?.title
                      ?? collectible.landmarkId}
                  </p>
                  <span className="collection-shelf-chip">{earned ? 'Earned' : 'Open'}</span>
                </article>
              ))}
            </div>
          </section>
        )}

        <section className="island-detail" id="landmark-list" tabIndex={-1} aria-label={`${region.title} landmarks`}>
          <div className="landmark-grid" data-testid="region-landmark-grid">
            {region.landmarks.map((item, index) => {
              const isStamped = completed?.has(item.id) === true;
              const keepsake = isStamped ? collectibleFor(region.id, item.id) : null;
              const isFresh = isStamped && freshGlow?.has(item.id) === true;
              const className = [
                'landmark-card',
                landmark?.id === item.id ? 'is-selected' : '',
                isStamped ? 'is-stamped' : '',
                isStamped && !isFresh ? 'is-settled' : '',
                isFresh ? 'is-fresh-glow' : '',
              ]
                .filter(Boolean)
                .join(' ');

              return (
                <Link
                  key={item.id}
                  href={`/map/${region.id}/${item.id}`}
                  className={className}
                  style={{ '--marker-index': index } as CSSProperties}
                  aria-current={landmark?.id === item.id ? 'page' : undefined}
                  data-testid={isStamped ? 'landmark-stamped' : 'landmark-open'}
                  data-landmark-id={item.id}
                  onAnimationEnd={
                    isFresh
                      ? (event) => {
                          // Only the landmark-glow contract ends here; ignore nested animations.
                          if (event.target !== event.currentTarget) return;
                          setFreshGlowRaw((prev) => {
                            if (!prev || prev.regionId !== region.id || !prev.ids.has(item.id)) {
                              return prev;
                            }
                            const next = new Set(prev.ids);
                            next.delete(item.id);
                            return next.size > 0 ? { regionId: prev.regionId, ids: next } : null;
                          });
                        }
                      : undefined
                  }
                >
                  <span className="marker-number" aria-hidden="true">{index + 1}</span>
                  <strong>{item.title}</strong>
                  <span>{item.hook}</span>
                  {item.draft && <span className="draft-chip">draft</span>}
                  {isStamped ? (
                    <>
                      <span className="stamped-badge">Stamped</span>
                      {keepsake && <span className="collectible-chip">{keepsake.name}</span>}
                    </>
                  ) : (
                    completed && <span className="open-label">Open</span>
                  )}
                </Link>
              );
            })}
          </div>
        </section>
        {landmark && (
          <LandmarkView
            landmark={landmark}
            regionId={region.id}
            format={format}
            beats={beats}
          />
        )}
      </div>
    </main>
  );
}
