'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { CSSProperties } from 'react';
import type { Landmark, Region } from '@/content/schema';
import styles from './SubMapScene.module.css';

export type LandmarkFormat = 'overview' | 'lesson' | 'quiz';

const formatLabels: Record<LandmarkFormat, string> = { overview: 'Overview', lesson: 'Lesson', quiz: 'Quiz' };
const accents: Record<string, string> = {
  databases: '#d98f6c', infra: '#8f9fd9', 'ai-types': '#c98fd9', git: '#d96c6c',
  languages: '#6cd9a8', security: '#d9c96c', design: '#ed9ec4', 'pm-tools': '#9ad0ed'
};

function DetailList({ items }: { items: string[] }) {
  return <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>;
}

function LandmarkDetail({ landmark, format }: { landmark: Landmark; format: LandmarkFormat }) {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <article className="landmark-detail" aria-labelledby="landmark-title">
      <header className="landmark-detail-header">
        <div>
          <p className="region-kicker">Landmark detail</p>
          <h2 id="landmark-title">{landmark.title}</h2>
        </div>
        {landmark.draft && <span className="draft-chip">draft</span>}
      </header>
      <div className="format-switcher" aria-label="Lesson format">
        {(Object.keys(formatLabels) as LandmarkFormat[]).map((value) => (
          <button
            key={value}
            type="button"
            className={format === value ? 'is-active' : ''}
            aria-pressed={format === value}
            onClick={() => router.replace(`${pathname}?format=${value}`, { scroll: false })}
          >{formatLabels[value]}</button>
        ))}
      </div>
      <p className="format-note" data-testid="format-note"><strong>{formatLabels[format]} format:</strong> adaptive {format} presentation arrives in a later lesson update.</p>
      <p className="landmark-hook">{landmark.hook}</p>
      <section><h3>Definition</h3><p>{landmark.definition}</p></section>
      <section><h3>When to use it</h3><DetailList items={landmark.when_to_use} /></section>
      <section className="tradeoff-grid">
        <div><h3>Pros</h3><DetailList items={landmark.tradeoffs.pros} /></div>
        <div><h3>Cons</h3><DetailList items={landmark.tradeoffs.cons} /></div>
      </section>
      <section><h3>Example</h3><p>{landmark.example}</p></section>
      <section><h3>Gotchas</h3><DetailList items={landmark.gotchas} /></section>
      <section><h3>Vibe coder default</h3><p>{landmark.vibe_coder_default}</p></section>
      {format === 'quiz' && <section className="landmark-quiz"><h3>Quiz</h3><p>{landmark.quiz.question}</p><DetailList items={landmark.quiz.options} /></section>}
    </article>
  );
}

export function SubMapScene({ region, landmark, format = 'overview' }: { region: Region; landmark?: Landmark; format?: LandmarkFormat }) {
  const style = { '--region-accent': accents[region.id] ?? '#d98f6c' } as CSSProperties;
  return (
    <main className={`sub-map-scene ${styles.scene}`} style={style}>
      <div className="sub-map-zoom">
        <Link className="back-to-map" href="/map">← Back to map</Link>
        <header className="sub-map-banner">
          <p>{region.label}</p>
          <h1>{region.title}</h1>
          <p>{region.description}</p>
        </header>
        <section className="island-detail" aria-label={`${region.title} landmarks`}>
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
        {landmark && <LandmarkDetail landmark={landmark} format={format} />}
      </div>
    </main>
  );
}
