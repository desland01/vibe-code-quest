import type { Landmark } from '../schema.ts';

// Re-voiced for the arcade L3 tier (ISSUE-012, CREATIVE_BIBLE §6). This landmark's
// L3 run is hand-authored in ./beats/commits-as-checkpoints.ts and overrides the
// derived projection; these fields stay the canonical fact source behind it.
export const landmark = {
  id: 'commits-as-checkpoints',
  title: 'Commits as checkpoints',
  draft: false,
  hook: 'A commit is a save point you can go back to.',
  definition:
    'A commit records a snapshot of the whole project. It stores the parent history and a message you write. A focused one gives you a point to inspect, test, compare, or undo.',
  when_to_use: [
    'Your agent finished one change and its checks pass.',
    'You want a stable point before a risky edit.',
    'You need to compare new work against known-good.',
    'You want history that explains why a change exists.'
  ],
  tradeoffs: {
    pros: [
      'Focused snapshots make generated changes easier to review.',
      'History gives you known points for comparison and recovery.',
      'Messages keep intent alive past the agent session.'
    ],
    cons: [
      'Large mixed commits hide unrelated mistakes.',
      'Checkpoints still need tests and human review.'
    ]
  },
  example:
    'Your agent changed a route, a queue, and the tests. The staged diff is sitting there, ready to commit.',
  gotchas: [
    'Review the staged diff before you commit.',
    'Keep secrets and local env files out of snapshots.',
    'A clean commit is not proof the code works.'
  ],
  vibe_coder_default: 'Commit one reviewed, tested task. Split unrelated changes first.',
  quiz: {
    question: 'When should you create an agent-work checkpoint?',
    options: ['After one coherent change passes review and checks', 'Whenever the agent pauses mid-edit', 'After combining several unrelated tasks'],
    answer: 'After one coherent change passes review and checks',
    explanation: 'A useful checkpoint holds one outcome you can inspect and recover on its own.'
  },
  sources: [
    { url: 'https://git-scm.com/docs/git-commit', checked: '2026-07-17' },
    { url: 'https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository', checked: '2026-07-17' },
    { url: 'https://git-scm.com/book/en/v2/Git-Basics-Viewing-the-Commit-History', checked: '2026-07-17' }
  ]
} satisfies Landmark;
