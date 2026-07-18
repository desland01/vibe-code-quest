import Link from 'next/link';

import type { LegalDocument } from '@/content/legal/types';

const draftNotice =
  '⚠ Draft — pending legal review; placeholders in [BRACKETS] must be completed before launch';

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
      <aside
        role="note"
        aria-label="Legal draft notice"
        data-testid="legal-draft-banner"
        style={{
          margin: '24px 0',
          border: '3px solid var(--ink)',
          background: 'var(--banner)',
          padding: '16px 18px',
          boxShadow: '5px 5px 0 var(--banner-border)',
          fontWeight: 800,
          lineHeight: 1.5
        }}
      >
        {draftNotice}
        <div style={{ marginTop: 6, fontWeight: 600 }}>
          This agent-drafted document has not been reviewed by a lawyer and is not final legal advice.
        </div>
      </aside>
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
