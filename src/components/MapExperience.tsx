'use client';

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { regions } from '@/lib/content';
import { UpgradeAccountModal } from '@/components/UpgradeAccountModal';
import { MapCanvas } from '@/components/map/MapCanvas';
import { RegionControls } from '@/components/map/RegionControls';
import { RegionPanel } from '@/components/map/RegionPanel';
import { initialMapState, mapReducer } from '@/lib/mapState';

export function MapExperience() {
  const [state, dispatch] = useReducer(mapReducer, initialMapState);
  const [reducedMotion, setReducedMotion] = useState(false);
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);
  const selectedRegion = regions.find((region) => region.id === state.selectedRegion);
  const closePanel = useCallback(() => {
    dispatch({ type: 'deselect' });
    requestAnimationFrame(() => lastTriggerRef.current?.focus());
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
    <main className="map-experience">
      <header className="map-header">
        <div><h1>code-tutor</h1><p>A map for post-AI builders. Pick an island and start exploring.</p></div>
        <UpgradeAccountModal />
      </header>
      <section className="map-shell" aria-label="Learning map">
        <div className="map-viewport">
          <MapCanvas regions={regions} state={state} dispatch={dispatch} reducedMotion={reducedMotion} />
          <RegionControls regions={regions} state={state} dispatch={dispatch} lastTriggerRef={lastTriggerRef} />
        </div>
        {selectedRegion && <RegionPanel region={selectedRegion} onClose={closePanel} restoreFocus={() => lastTriggerRef.current?.focus()} />}
      </section>
    </main>
  );
}
