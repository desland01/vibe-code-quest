import type { Landmark } from '../schema.ts';

export const landmark = {
  id: 'issues-as-specs',
  title: 'Issues as executable specs',
  draft: false,
  hook: 'An issue is your agent’s work order.',
  definition: 'An executable issue defines one outcome, its boundaries, and observable proof of completion. It gives your agent enough context to act while keeping you responsible for review.',
  when_to_use: [
    'You want an agent to implement a change without guessing the product goal.',
    'Several contributors need the same definition of done.',
    'A bug needs reproduction steps and a verifiable expected result.',
    'You need to hand work across sessions without losing constraints.'
  ],
  tradeoffs: {
    pros: [
      'Acceptance checks make completion observable.',
      'Explicit boundaries reduce accidental scope growth.',
      'Linked context survives handoffs between people and agents.'
    ],
    cons: [
      'Writing useful acceptance checks takes product judgment.',
      'Stale issues can direct an agent toward requirements that have changed.'
    ]
  },
  example: 'A billing issue requires a customer to download one invoice PDF from the account page. Tell your agent which route may change, which payment paths are out of scope, and which tests prove authorization and download behavior.',
  gotchas: [
    'State the user-visible outcome before listing implementation tasks.',
    'Separate required acceptance checks from optional ideas.',
    'Verify your agent’s evidence; a checked box is not proof that behavior works.'
  ],
  vibe_coder_default: 'Use a GitHub Issue or Linear issue with context, scope, acceptance checks, and explicit exclusions before assigning work to an agent.',
  quiz: {
    question: 'Which issue gives an agent the safest work order?',
    options: ['Add invoice downloads', 'Let customers download only their own invoice PDF, with authorization and route tests', 'Improve billing when convenient'],
    answer: 'Let customers download only their own invoice PDF, with authorization and route tests',
    explanation: 'A useful work order names the outcome, critical boundary, and evidence needed to verify completion.'
  },
  sources: [
    { url: 'https://docs.github.com/en/issues/tracking-your-work-with-issues/about-issues', checked: '2026-07-17' },
    { url: 'https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/creating-an-issue', checked: '2026-07-17' },
    { url: 'https://linear.app/docs/creating-issues', checked: '2026-07-17' }
  ]
} satisfies Landmark;
