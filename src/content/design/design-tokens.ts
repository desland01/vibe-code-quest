import type { Landmark } from '../schema.ts';

export const landmark = {
  id: 'design-tokens',
  title: 'Design tokens',
  draft: false,
  hook: 'Name visual decisions before screens multiply.',
  definition: 'Design tokens give reusable names to choices such as color roles, spacing steps, type sizes, and radii. They turn scattered values into a small system your team and agent can apply consistently.',
  when_to_use: [
    'You need several screens to share the same visual language.',
    'Your agent keeps inventing slightly different colors, gaps, or corner radii.',
    'You need light and dark themes without rewriting every component.',
    'You expect a brand change to affect many interface surfaces.'
  ],
  tradeoffs: {
    pros: [
      'Named roles make design decisions explicit and reusable.',
      'Central values keep generated screens visually coherent.',
      'Theme and brand changes can update many components together.'
    ],
    cons: [
      'A token set needs naming rules and ongoing ownership.',
      'Too many near-duplicate tokens recreate the inconsistency they should remove.'
    ]
  },
  example: 'A scheduling app uses surface, text, accent, danger, spacing, and radius tokens across its calendar and booking flow. Tell your agent to use existing semantic tokens and propose any missing role before adding a raw value.',
  gotchas: [
    'Name tokens by purpose, not by a value such as blue-500 that may later change.',
    'Restrict your agent from adding one-off colors or spacing values without review.',
    'Verify every theme keeps readable contrast and clear interactive states.'
  ],
  vibe_coder_default: 'Define a small semantic token layer with CSS variables, map it into Tailwind CSS, and add a token only when a repeated role is clear.',
  quiz: {
    question: 'Your agent needs a new card border color. What should it do first?',
    options: ['Use or propose a semantic border token', 'Add the closest hex value inside the card', 'Copy a color from an unrelated chart'],
    answer: 'Use or propose a semantic border token',
    explanation: 'A semantic token records the border role and keeps that decision consistent across components and themes.'
  },
  sources: [
    { url: 'https://m3.material.io/foundations/design-tokens/overview', checked: '2026-07-17' },
    { url: 'https://tailwindcss.com/docs/theme', checked: '2026-07-17' },
    { url: 'https://spectrum.adobe.com/page/design-tokens/', checked: '2026-07-17' }
  ]
} satisfies Landmark;
