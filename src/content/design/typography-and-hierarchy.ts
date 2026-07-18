import type { Landmark } from '../schema.ts';

export const landmark = {
  id: 'typography-and-hierarchy',
  title: 'Typography and hierarchy',
  draft: false,
  hook: 'Type tells the eye where to begin.',
  definition: 'Typography controls size, weight, line height, measure, and contrast. A clear hierarchy helps people scan importance and relationships before they read every word.',
  when_to_use: [
    'Users must scan dashboards, settings, or long-form content quickly.',
    'Your agent uses bold text and large sizes without a repeatable hierarchy.',
    'Different screens assign different styles to the same content role.',
    'You need readable text across viewport sizes and zoom levels.'
  ],
  tradeoffs: {
    pros: [
      'A type scale makes content roles recognizable across screens.',
      'Consistent line height and measure improve reading comfort.',
      'Defined roles reduce arbitrary styling in generated interfaces.'
    ],
    cons: [
      'Too many type roles weaken hierarchy and increase maintenance.',
      'Brand fonts can add loading cost and may render poorly at interface sizes.'
    ]
  },
  example: 'A knowledge base needs article titles, section headings, body copy, metadata, and code notes. Tell your agent to assign each role from the system type scale, limit body measure, and preserve semantic heading order.',
  gotchas: [
    'Keep semantic heading levels in document order instead of choosing them for appearance.',
    'Verify text contrast, zoom behavior, and fallback fonts before shipping.',
    'Stop your agent from creating a new text style for one isolated label.'
  ],
  vibe_coder_default: 'Use a restrained system-font type scale with named roles, readable line heights, and semantic HTML; introduce a brand font only when its value offsets loading and rendering costs.',
  quiz: {
    question: 'A visually small section title follows an h2. Which markup should it use?',
    options: ['An h3 styled with the appropriate type role', 'A paragraph made bold', 'An h5 because its browser default is smaller'],
    answer: 'An h3 styled with the appropriate type role',
    explanation: 'Heading markup expresses document structure, while the type role controls its visual size.'
  },
  sources: [
    { url: 'https://www.w3.org/WAI/tutorials/page-structure/headings/', checked: '2026-07-17' },
    { url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/HTML', checked: '2026-07-17' },
    { url: 'https://m3.material.io/styles/typography/overview', checked: '2026-07-17' }
  ]
} satisfies Landmark;
