import type { Landmark } from '../schema.ts';

export const landmark = {
  id: 'decision-logs',
  title: 'Decision logs',
  draft: false,
  hook: 'Record why, so future agents do not relitigate.',
  definition: 'A decision log records a consequential choice, its context, status, and consequences. An architecture decision record, or ADR, gives future contributors a durable reason behind the current design.',
  when_to_use: [
    'A technical choice affects several issues or future maintenance.',
    'The team rejected plausible alternatives for reasons that may be forgotten.',
    'An agent will encounter an unusual constraint and may try to remove it.',
    'You need a clear trigger for reconsidering a settled choice.'
  ],
  tradeoffs: {
    pros: [
      'Future agents can distinguish constraints from accidents.',
      'Recorded consequences make tradeoffs reviewable.',
      'A superseded status preserves history without pretending the choice is current.'
    ],
    cons: [
      'Trivial decisions can create noisy documentation.',
      'Unmaintained status leaves readers unsure which decision governs.'
    ]
  },
  example: 'A team chooses PostgreSQL row-level security instead of application-only filters for tenant isolation. Record the threat boundary, alternatives, consequences, and replacement trigger, then link the ADR from every authorization issue.',
  gotchas: [
    'Record the decision and rationale, not a meeting transcript.',
    'Mark replaced decisions as superseded and link the new record.',
    'Tell your agent to cite governing ADRs before proposing an architectural reversal.'
  ],
  vibe_coder_default: 'Keep short numbered ADRs in the repository for choices that constrain future work, and use a new ADR to supersede an old one.',
  quiz: {
    question: 'Which change most deserves an ADR?',
    options: ['Renaming a local variable', 'Choosing the tenant-isolation boundary used across the product', 'Fixing a typo in a button'],
    answer: 'Choosing the tenant-isolation boundary used across the product',
    explanation: 'A durable, cross-cutting choice needs context and consequences that future contributors can recover.'
  },
  sources: [
    { url: 'https://adr.github.io/', checked: '2026-07-17' },
    { url: 'https://github.com/joelparkerhenderson/architecture-decision-record', checked: '2026-07-17' },
    { url: 'https://docs.github.com/en/repositories/working-with-files/managing-files/creating-new-files', checked: '2026-07-17' }
  ]
} satisfies Landmark;
