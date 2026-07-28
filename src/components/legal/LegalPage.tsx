import Link from 'next/link';

import type { LegalDocument } from '@/content/legal/types';

export function LegalPage({ document }: { document: LegalDocument }) {
  return (
    <main
      style={{
        width: 'min(100% - 32px, 800px)',
        margin: '0 auto',
        padding: 'clamp(32px, 6vw, 72px) 0'
      }}
    >
      <Link href="/" style={{ color: 'var(--ink)', fontWeight: 700 }}>
        ← Back to the map
      </Link>
      <p
        data-testid="legal-not-legal-advice"
        style={{
          margin: '24px 0',
          color: 'var(--ink)',
          fontSize: '0.875rem',
          lineHeight: 1.5
        }}
      >
        This page explains how Vibe Code Quest works. It is general information, not legal advice.
      </p>
      <header style={{ marginBottom: 32 }}>
        <h1 style={{ margin: '0 0 10px', fontFamily: 'var(--font-pixel), monospace' }}>
          {document.title}
        </h1>
        <p style={{ margin: 0 }}>
          <strong>Last updated:</strong> {document.lastUpdated}
        </p>
      </header>
      <div style={{ fontSize: '1.05rem', lineHeight: 1.75 }}>
        {document.sections.map((section) => (
          <section key={section.heading} style={{ marginBottom: 34 }}>
            <h2 style={{ lineHeight: 1.25 }}>{section.heading}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {section.items ? (
              <ul>
                {section.items.map((item) => (
                  <li key={item} style={{ marginBottom: 10 }}>
                    {item}
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </div>
    </main>
  );
}
