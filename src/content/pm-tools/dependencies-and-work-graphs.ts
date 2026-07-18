import type { Landmark } from '../schema.ts';

export const landmark = {
  id: 'dependencies-and-work-graphs',
  title: 'Dependencies and work graphs',
  draft: false,
  hook: 'The work graph tells agents what must exist first.',
  definition: 'A work graph connects tasks through prerequisite, blocked, and related relationships. It reveals the safe execution order and which work can proceed in parallel.',
  when_to_use: [
    'One issue depends on a schema, contract, or decision from another.',
    'Several agents may work concurrently without sharing a session.',
    'A milestone has enough tasks that sequence is hard to hold in memory.',
    'Blocked work needs a visible cause and owner.'
  ],
  tradeoffs: {
    pros: [
      'Prerequisites prevent agents from building against missing contracts.',
      'Parallel-safe branches of work become visible.',
      'Blockers carry context instead of becoming silent delays.'
    ],
    cons: [
      'Incorrect dependency links can serialize work unnecessarily.',
      'The graph needs maintenance when scope or architecture changes.'
    ]
  },
  example: 'A team plans account deletion across policy, database, API, and interface work. Link the policy decision and deletion contract as prerequisites, then tell agents to start only issues whose blockers are resolved.',
  gotchas: [
    'Link true prerequisites, not every related conversation.',
    'Assign one owner to each blocker and record the unblock condition.',
    'Make your agent re-read dependency outputs instead of assuming their shape.'
  ],
  vibe_coder_default: 'Model prerequisites with blocked-by links in Linear or GitHub Issues, then assign agents only from the unblocked edge of the graph.',
  quiz: {
    question: 'When should issue B be marked as blocked by issue A?',
    options: ['When both issues mention the same feature', 'When B cannot be verified until A produces a required contract', 'When A was created first'],
    answer: 'When B cannot be verified until A produces a required contract',
    explanation: 'A dependency represents a required input, not loose similarity or creation order.'
  },
  sources: [
    { url: 'https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/creating-issue-dependencies', checked: '2026-07-17' },
    { url: 'https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects/about-projects', checked: '2026-07-17' },
    { url: 'https://linear.app/docs/issue-relations', checked: '2026-07-17' }
  ]
} satisfies Landmark;
