'use client';

import { useEffect, useRef } from 'react';
import type { Region } from '@/content/schema';

export function RegionPanel({ region, onClose, restoreFocus }: { region: Region; onClose: () => void; restoreFocus: () => void }) {
  const panelRef = useRef<HTMLElement>(null);
  useEffect(() => {
    panelRef.current?.focus();
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', escape);
    return () => document.removeEventListener('keydown', escape);
  }, [onClose]);

  return (
    <aside ref={panelRef} className="region-panel" tabIndex={-1} aria-labelledby="region-panel-title">
      <button className="panel-close" onClick={() => { onClose(); restoreFocus(); }} aria-label="Close region details">×</button>
      <p className="region-kicker">{region.label}</p>
      <h2 id="region-panel-title">{region.title}</h2>
      <p>{region.description}</p>
      <h3>Landmarks</h3>
      <ul>{region.landmarks.map((landmark) => <li key={landmark.id}>{landmark.title}</li>)}</ul>
    </aside>
  );
}
