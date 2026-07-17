'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import type { Region } from '@/content/schema';
import styles from './SubMapScene.module.css';

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
    <aside ref={panelRef} className={`region-panel ${styles.panelLinks}`} tabIndex={-1} aria-labelledby="region-panel-title">
      <button className="panel-close" onClick={() => { onClose(); restoreFocus(); }} aria-label="Close region details">×</button>
      <p className="region-kicker">{region.label}</p>
      <h2 id="region-panel-title">{region.title}</h2>
      <p>{region.description}</p>
      <h3>Landmarks</h3>
      <ul>{region.landmarks.map((landmark) => <li key={landmark.id}><Link href={`/map/${region.id}/${landmark.id}`}>{landmark.title}</Link></li>)}</ul>
      <Link className="region-explore" href={`/map/${region.id}`}>Explore {region.title}</Link>
    </aside>
  );
}
