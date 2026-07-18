'use client';

import type { Dispatch, RefObject } from 'react';
import type { Region } from '@/content/schema';
import type { MapAction, MapState } from '@/lib/mapState';

export function RegionControls({ regions, state, dispatch, lastTriggerRef, onSelect }: {
  regions: readonly Region[];
  state: MapState;
  dispatch: Dispatch<MapAction>;
  lastTriggerRef: RefObject<HTMLButtonElement | null>;
  onSelect: (region: Pick<Region, 'id' | 'title'>) => void;
}) {
  return (
    <nav className="region-controls" id="region-controls" aria-label="Learning regions">
      {regions.map((region) => {
        const active = state.hoveredRegion === region.id || state.selectedRegion === region.id;
        return (
          <button
            key={region.id}
            className={`region-control${active ? ' is-active' : ''}`}
            style={{ left: `${region.mapArea.x}%`, top: `${region.mapArea.y}%`, width: `${region.mapArea.width}%`, height: `${region.mapArea.height}%` }}
            aria-label={region.title}
            aria-pressed={state.selectedRegion === region.id}
            id={`region-${region.id}`}
            onFocus={() => dispatch({ type: 'hover', regionId: region.id })}
            onBlur={() => dispatch({ type: 'unhover', regionId: region.id })}
            onMouseEnter={() => dispatch({ type: 'hover', regionId: region.id })}
            onMouseLeave={() => dispatch({ type: 'unhover', regionId: region.id })}
            onClick={(event) => {
              lastTriggerRef.current = event.currentTarget;
              dispatch({ type: 'select', regionId: region.id });
              onSelect(region);
            }}
          ><span className="sr-only">Explore {region.title}</span></button>
        );
      })}
    </nav>
  );
}
