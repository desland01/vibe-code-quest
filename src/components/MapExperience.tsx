'use client';

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { regions } from '@/lib/content-client';
import { UpgradeAccountModal } from '@/components/UpgradeAccountModal';
import { MapCanvas } from '@/components/map/MapCanvas';
import { RegionControls } from '@/components/map/RegionControls';
import { RegionPanel } from '@/components/map/RegionPanel';
import { initialMapState, mapReducer } from '@/lib/mapState';
import '@/components/map/Accessibility.css';

export function MapExperience() {
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
  const announceSelection = useCallback((title: string) => setLiveMessage(`${title} selected — panel open`), []);

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
        <div><h1>code-tutor</h1><p>A map for post-AI builders. Pick an island and start exploring.</p></div>
        <UpgradeAccountModal />
      </header>
      <section className="map-shell" aria-label="Learning map">
        <div className="map-viewport">
          <MapCanvas regions={regions} state={state} dispatch={dispatch} reducedMotion={reducedMotion} onZoom={announceZoom} onSelect={announceSelection} />
          <RegionControls regions={regions} state={state} dispatch={dispatch} lastTriggerRef={lastTriggerRef} onSelect={announceSelection} />
        </div>
        {selectedRegion && <RegionPanel region={selectedRegion} onClose={closePanel} restoreFocus={() => lastTriggerRef.current?.focus()} />}
      </section>
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true" data-testid="map-live-region">
        {liveMessage}
      </p>
    </main>
  );
}
