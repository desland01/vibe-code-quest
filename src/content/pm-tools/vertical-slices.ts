import type { Landmark } from '../schema.ts';

export const landmark = {
  id: 'vertical-slices',
  title: 'Scope as vertical slices',
  draft: false,
  hook: 'Slice by testable outcomes, not technical layers.',
  definition: 'A vertical slice delivers a small user outcome through every layer it needs. It lets you test real behavior before agents build a collection of disconnected parts.',
  when_to_use: [
    'You need early evidence that a feature works end to end.',
    'Separate frontend and backend tasks could drift apart.',
    'An uncertain workflow needs feedback before broader investment.',
    'You want each agent assignment to end in demonstrable behavior.'
  ],
  tradeoffs: {
    pros: [
      'Each slice produces behavior you can test and review.',
      'Integration risks appear earlier.',
      'User feedback can change later slices before they are built.'
    ],
    cons: [
      'Thin end-to-end changes may touch several parts of the system.',
      'Poor slicing can duplicate setup or hide necessary foundation work.'
    ]
  },
  example: 'Instead of assigning database, API, and UI phases for notifications, ship one slice for an overdue-invoice email. Tell your agent to add the preference, trigger, delivery seam, and end-to-end test for that single outcome.',
  gotchas: [
    'Define the observable user outcome before naming layers.',
    'Keep infrastructure work tied to the first slice that needs it.',
    'Reject agent plans that finish components without proving an integrated path.'
  ],
  vibe_coder_default: 'Create the smallest end-to-end slice that one user can exercise, and split it again when its acceptance proof still contains multiple outcomes.',
  quiz: {
    question: 'Which plan is a vertical slice for notifications?',
    options: ['Build every notification database table', 'Build all notification screens', 'Let one user receive and disable an overdue-invoice email'],
    answer: 'Let one user receive and disable an overdue-invoice email',
    explanation: 'The chosen slice crosses the necessary layers and ends in one testable user outcome.'
  },
  sources: [
    { url: 'https://agilemanifesto.org/principles.html', checked: '2026-07-17' },
    { url: 'https://scrumguides.org/scrum-guide.html', checked: '2026-07-17' },
    { url: 'https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/creating-an-issue', checked: '2026-07-17' }
  ]
} satisfies Landmark;
