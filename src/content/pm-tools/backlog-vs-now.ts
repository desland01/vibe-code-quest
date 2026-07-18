import type { Landmark } from '../schema.ts';

export const landmark = {
  id: 'backlog-vs-now',
  title: 'Backlog vs now',
  draft: false,
  hook: 'Generated ideas are not committed product scope.',
  definition: 'A backlog preserves possible work, while a small active queue represents current commitment. Keeping them separate stops agent-generated suggestions from silently becoming the product plan.',
  when_to_use: [
    'Agent reviews produce more ideas than the current milestone can absorb.',
    'A team needs one visible answer to what should happen next.',
    'Urgent fixes compete with planned product work.',
    'Old backlog items need periodic validation or removal.'
  ],
  tradeoffs: {
    pros: [
      'A small active queue keeps attention on current outcomes.',
      'The backlog preserves ideas without promising delivery.',
      'Explicit promotion makes scope changes visible.'
    ],
    cons: [
      'Backlog review requires recurring product judgment.',
      'A strict queue can delay useful discoveries unless urgent work has a clear path.'
    ]
  },
  example: 'An agent reviewing checkout proposes coupons, gift cards, and tax reports during a refund fix. Keep those ideas in the backlog, and tell the agent that only the verified refund path belongs in the active milestone.',
  gotchas: [
    'Require an explicit owner decision before promoting generated ideas.',
    'Limit active work and finish or remove blocked items before adding more.',
    'Archive stale backlog entries instead of treating age as priority.'
  ],
  vibe_coder_default: 'Keep ideas in a Linear or GitHub backlog and maintain a deliberately small Now view; promote work only with an owner, outcome, and acceptance checks.',
  quiz: {
    question: 'What should happen when an agent suggests three adjacent features during a focused fix?',
    options: ['Add all three to the active milestone', 'Discard every suggestion immediately', 'Capture them in the backlog and keep the current queue unchanged until review'],
    answer: 'Capture them in the backlog and keep the current queue unchanged until review',
    explanation: 'Capturing preserves useful ideas, while explicit review protects the current product commitment.'
  },
  sources: [
    { url: 'https://linear.app/docs/triage', checked: '2026-07-17' },
    { url: 'https://scrumguides.org/scrum-guide.html', checked: '2026-07-17' },
    { url: 'https://docs.github.com/en/issues/planning-and-tracking-with-projects/customizing-views-in-your-project', checked: '2026-07-17' }
  ]
} satisfies Landmark;
