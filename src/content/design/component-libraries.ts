import type { Landmark } from '../schema.ts';

export const landmark = {
  id: 'component-libraries',
  title: 'Component libraries',
  draft: false,
  hook: 'Reuse behavior, not only matching pixels.',
  definition: 'A component library packages repeated interface appearance and behavior into maintained building blocks. It gives your agent a constrained vocabulary for creating coherent, accessible screens.',
  when_to_use: [
    'You are building forms, dialogs, menus, and other patterns across several screens.',
    'Your agent repeatedly rebuilds the same controls with different behavior.',
    'You need accessible interaction details your team cannot maintain from scratch.',
    'You want product-specific styling without inventing every primitive.'
  ],
  tradeoffs: {
    pros: [
      'Shared components reduce visual and behavioral drift.',
      'Maintained primitives cover difficult keyboard and focus interactions.',
      'A known component vocabulary makes agent instructions more precise.'
    ],
    cons: [
      'Upgrades and local customizations require deliberate maintenance.',
      'A library can constrain unusual interactions or add code you do not need.'
    ]
  },
  example: 'A team dashboard repeats buttons, forms, tables, dialogs, and menus across account and billing screens. Tell your agent to compose those screens from the project library and extend a primitive only after checking its existing variants.',
  gotchas: [
    'Review generated wrappers so they preserve keyboard behavior, focus management, and ARIA attributes.',
    'Avoid copying a component into several local variants that will drift apart.',
    'Test the library in your supported browsers and assistive technology paths.'
  ],
  vibe_coder_default: 'Start with shadcn/ui components backed by Radix primitives and Tailwind CSS when you want owned source and flexible styling; leave that default when another maintained library already fits your stack.',
  quiz: {
    question: 'An agent needs a confirmation dialog already covered by your library. What is the strongest direction?',
    options: ['Compose the maintained dialog primitive and its approved variants', 'Build a new div-based modal inside the page', 'Copy the markup from a different application'],
    answer: 'Compose the maintained dialog primitive and its approved variants',
    explanation: 'The maintained primitive preserves shared behavior and gives the team one place to improve the pattern.'
  },
  sources: [
    { url: 'https://ui.shadcn.com/docs', checked: '2026-07-17' },
    { url: 'https://www.radix-ui.com/primitives/docs/overview/introduction', checked: '2026-07-17' },
    { url: 'https://tailwindcss.com/docs/styling-with-utility-classes', checked: '2026-07-17' }
  ]
} satisfies Landmark;
