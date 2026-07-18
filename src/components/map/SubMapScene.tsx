'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';
import type { Landmark, Region } from '@/content/schema';
import { LandmarkView } from '@/components/landmark/LandmarkView';
import type { LandmarkFormat } from '@/components/landmark/FormatSwitcher';
import styles from './SubMapScene.module.css';

export type { LandmarkFormat } from '@/components/landmark/FormatSwitcher';
const accents: Record<string, string> = {
  databases: '#d98f6c', infra: '#8f9fd9', 'ai-types': '#c98fd9', git: '#d96c6c',
  languages: '#6cd9a8', security: '#d9c96c', design: '#ed9ec4', 'pm-tools': '#9ad0ed'
};

export function SubMapScene({ region, landmark, format = 'overview' }: { region: Region; landmark?: Landmark; format?: LandmarkFormat }) {
  const style = { '--region-accent': accents[region.id] ?? '#d98f6c' } as CSSProperties;
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
        <section className="island-detail" id="landmark-list" tabIndex={-1} aria-label={`${region.title} landmarks`}>
          <div className="landmark-grid">
            {region.landmarks.map((item, index) => (
              <Link
                key={item.id}
                href={`/map/${region.id}/${item.id}`}
                className={`landmark-card${landmark?.id === item.id ? ' is-selected' : ''}`}
                style={{ '--marker-index': index } as CSSProperties}
                aria-current={landmark?.id === item.id ? 'page' : undefined}
              >
                <span className="marker-number" aria-hidden="true">{index + 1}</span>
                <strong>{item.title}</strong>
                <span>{item.hook}</span>
                {item.draft && <span className="draft-chip">draft</span>}
              </Link>
            ))}
          </div>
        </section>
        {landmark && <LandmarkView landmark={landmark} regionId={region.id} format={format} />}
      </div>
    </main>
  );
}
