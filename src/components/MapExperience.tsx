'use client';

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import Link from 'next/link';
import { useSession } from '@/lib/auth/SessionProvider';
import { regions } from '@/lib/content-client';
import { UpgradeAccountModal } from '@/components/UpgradeAccountModal';
import { OnboardingChat } from '@/components/OnboardingChat';
import { XpHud } from '@/components/XpHud';
import { MapCanvas } from '@/components/map/MapCanvas';
import { RegionControls } from '@/components/map/RegionControls';
import { RegionPanel } from '@/components/map/RegionPanel';
import { LEADERBOARD_COPY } from '@/lib/leaderboard';
import { initialMapState, mapReducer } from '@/lib/mapState';
import '@/components/map/Accessibility.css';
import { recordClientEvent } from '@/components/landmark/clientEvents';

export function MapExperience() {
  const session = useSession();
  const [state, dispatch] = useReducer(mapReducer, initialMapState);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [liveMessage, setLiveMessage] = useState('');
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);
  const selectedRegion = regions.find((region) => region.id === state.selectedRegion);
  const closePanel = useCallback(() => {
    dispatch({ type: 'deselect' });
    requestAnimationFrame(() => lastTriggerRef.current?.focus());
  }, []);
  const announceZoom = useCallback((scale: number) => setLiveMessage(`Zoom ${scale}x`), []);
  const announceSelection = useCallback((region: { id: string; title: string }) => {
    setLiveMessage(`${region.title} selected — panel open`);
    recordClientEvent('region_click', { region: region.id });
  }, []);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      setReducedMotion(query.matches);
      document.body.dataset.reducedMotion = String(query.matches);
    };
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return (
    <main className="map-experience" id="main-content" tabIndex={-1}>
      <a className="map-skip-link" href="#region-languages">Skip to regions</a>
      <section className="sr-only sr-map-alternative" aria-labelledby="map-alternative-title">
        <h2 id="map-alternative-title">Learning regions</h2>
        <ul>
          {regions.map((region) => (
            <li key={region.id}><a href={`/map/${region.id}`}>{region.title}, {region.landmarks.length} landmarks</a></li>
          ))}
        </ul>
      </section>
      <header className="map-header">
        <div><h1>Vibe Code Quest</h1><p>A map for post-AI builders. Pick an island and start exploring.</p></div>
        <div className="map-header-actions">
          <XpHud />
          <Link href="/leaderboard" className="map-header-link" data-testid="quest-board-link">
            {LEADERBOARD_COPY.mapNav}
          </Link>
          <UpgradeAccountModal />
        </div>
      </header>
      <section className="map-shell" aria-label="Learning map">
        <div className="map-viewport">
          <MapCanvas regions={regions} state={state} dispatch={dispatch} reducedMotion={reducedMotion} onZoom={announceZoom} onSelect={announceSelection} />
          <RegionControls regions={regions} state={state} dispatch={dispatch} lastTriggerRef={lastTriggerRef} onSelect={announceSelection} />
        </div>
        {selectedRegion && <RegionPanel region={selectedRegion} onClose={closePanel} restoreFocus={() => lastTriggerRef.current?.focus()} />}
      </section>
      <OnboardingChat />
      {session.status === 'authenticated' && <ShareProgress />}
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true" data-testid="map-live-region">
        {liveMessage}
      </p>
    </main>
  );
}

function ShareProgress() {
  const [share, setShare] = useState<{ token: string; url: string } | null>(null);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  async function createShare() {
    setBusy(true);
    setStatus('Creating share link…');
    try {
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action: 'create' })
      });
      if (!response.ok) throw new Error('Could not create share link');
      const result = await response.json() as { token: string; url: string };
      setShare(result);
      setStatus('Share link ready.');
    } catch {
      setStatus('Could not create a share link. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function copyShare() {
    if (!share) return;
    try {
      await navigator.clipboard.writeText(share.url);
      setStatus('Share link copied.');
    } catch {
      setStatus('Copy failed. Select and copy the link manually.');
    }
  }

  async function revokeShare() {
    if (!share) return;
    setBusy(true);
    try {
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action: 'revoke', token: share.token })
      });
      if (response.ok) {
        setShare(null);
        setStatus('Share link revoked.');
      } else {
        setStatus('Could not revoke the share link.');
      }
    } catch {
      setStatus('Could not revoke the share link.');
    } finally {
      setBusy(false);
    }
  }

  return <section className="share-control" aria-labelledby="share-progress-title">
    <h2 id="share-progress-title">Share your progress</h2>
    <p>Create a public snapshot with completion counts only. It contains no email or account details.</p>
    {!share ? <button type="button" onClick={createShare} disabled={busy}>Share my progress</button> : <div className="share-link-actions">
      <label htmlFor="share-progress-url">Public link</label>
      <input id="share-progress-url" value={share.url} readOnly onFocus={(event) => event.currentTarget.select()} />
      <button type="button" onClick={copyShare}>Copy link</button>
      <button type="button" onClick={revokeShare} disabled={busy}>Revoke link</button>
    </div>}
    <p role="status" aria-live="polite" data-testid="share-status">{status}</p>
  </section>;
}
