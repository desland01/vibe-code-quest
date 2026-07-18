import type { Landmark } from '../schema.ts';

export const landmark = {
  id: 'layout-and-spacing-rhythm',
  title: 'Layout and spacing rhythm',
  draft: false,
  hook: 'Good spacing is a system, not a hunch.',
  definition: 'Layout sets alignment, width, flow, and responsive structure. A spacing rhythm uses a limited scale so related elements feel grouped and screens feel intentionally composed.',
  when_to_use: [
    'Your screens look locally plausible but inconsistent when viewed together.',
    'You need content to adapt across phone, tablet, and desktop widths.',
    'Dense workflows need clear grouping without excessive borders.',
    'Your agent chooses a new margin for every element.'
  ],
  tradeoffs: {
    pros: [
      'A spacing scale creates repeatable visual relationships.',
      'Shared containers and grids align unrelated screens.',
      'Responsive rules prevent layout choices from depending on one screenshot.'
    ],
    cons: [
      'Rigid grids can waste space in dense or unusual workflows.',
      'Responsive behavior needs testing at content extremes, not only standard breakpoints.'
    ]
  },
  example: 'An operations dashboard has a page header, filters, summary cards, and a results table. Tell your agent to use the shared container, a defined spacing scale, and content-driven responsive changes instead of inventing margins for each block.',
  gotchas: [
    'Test long labels, empty states, validation messages, and zoom before accepting a layout.',
    'Require your agent to reuse spacing tokens and explain any exception.',
    'Check narrow widths between named breakpoints where wrapping often exposes failures.'
  ],
  vibe_coder_default: 'Use a small Tailwind CSS spacing scale, shared page containers, and mobile-first layout rules; add exceptions only for a demonstrated content need.',
  quiz: {
    question: 'Generated screens use many close but different gaps. What should you change?',
    options: ['Map relationships to a shared spacing scale', 'Round every gap to the nearest even pixel', 'Keep each gap because its screen looks acceptable'],
    answer: 'Map relationships to a shared spacing scale',
    explanation: 'A shared scale turns spacing into consistent relationships instead of isolated visual guesses.'
  },
  sources: [
    { url: 'https://tailwindcss.com/docs/padding', checked: '2026-07-17' },
    { url: 'https://tailwindcss.com/docs/responsive-design', checked: '2026-07-17' },
    { url: 'https://m3.material.io/foundations/adaptive-design/overview', checked: '2026-07-17' }
  ]
} satisfies Landmark;
