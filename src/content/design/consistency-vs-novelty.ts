import type { Landmark } from '../schema.ts';

export const landmark = {
  id: 'consistency-vs-novelty',
  title: 'Consistency vs novelty',
  draft: false,
  hook: 'Spend surprise where it earns attention.',
  definition: 'Consistency makes familiar actions predictable across your product and the wider platform. Novelty adds character, but it should serve a meaningful moment instead of making routine work harder to recognize.',
  when_to_use: [
    'Your agent proposes custom controls for familiar actions.',
    'You need to decide where brand expression belongs in a workflow.',
    'Several generated screens work alone but feel like different products.',
    'A signature moment could benefit from focused visual distinction.'
  ],
  tradeoffs: {
    pros: [
      'Conventional controls reduce learning and recognition costs.',
      'Consistent patterns make new screens easier to predict and review.',
      'Selective novelty gives important moments stronger emphasis.'
    ],
    cons: [
      'Too much consistency can make a product feel generic or hide key moments.',
      'Novel interactions require more explanation, accessibility work, and testing.'
    ]
  },
  example: 'A budgeting app keeps navigation, forms, and destructive confirmations conventional, then gives the monthly progress story a distinctive visual treatment. Tell your agent to reuse product patterns everywhere else and explain the user value of each proposed exception.',
  gotchas: [
    'Keep navigation, form controls, and destructive actions recognizable before adding brand expression.',
    'Require your agent to state what a novel pattern improves and how users recover from mistakes.',
    'Test distinctive interactions for keyboard access, reduced motion, and comprehension.'
  ],
  vibe_coder_default: 'Keep routine interactions conventional and consistent with your component library; spend novelty on one or two product-defining moments that survive accessibility and usability review.',
  quiz: {
    question: 'Where is a novel interaction most defensible?',
    options: ['A product-defining insight with a tested conventional fallback', 'The primary navigation on every screen', 'A destructive confirmation users must decode quickly'],
    answer: 'A product-defining insight with a tested conventional fallback',
    explanation: 'Novelty earns its cost when it strengthens a meaningful moment without blocking a familiar, accessible path.'
  },
  sources: [
    { url: 'https://www.w3.org/WAI/WCAG22/Understanding/consistent-navigation.html', checked: '2026-07-17' },
    { url: 'https://www.w3.org/WAI/WCAG22/Understanding/consistent-identification.html', checked: '2026-07-17' },
    { url: 'https://m3.material.io/foundations/interaction/states/overview', checked: '2026-07-17' }
  ]
} satisfies Landmark;
