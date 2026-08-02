import type { Landmark, LevelContent } from '../schema.ts';

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

// L1 "SAVE POINTS" (ISSUE-013). Vocabulary tier: commit, commit history,
// version control. Grounding: UGC findings A4 ("Git for what?") and A16
// (wiped repo AND commit history, "baffled").
export const l1: LevelContent = {
  hook: 'A commit is a save point. Git is the save system.',
  definition:
    'A commit is one saved state of your project. The list of them is your commit history. That history is what version control means.',
  when_to_use: [
    'You finished something and it works.',
    'You are about to try something risky.',
    'You want to name what you just did.',
    'You want to get back here later.'
  ],
  tradeoffs: {
    pros: [
      'You can go back to any save point.',
      'Each commit carries a message you wrote.',
      'The history shows what changed and when.'
    ],
    cons: [
      'A commit saves files, not a working app.',
      'One giant commit tells you almost nothing.'
    ]
  },
  example: 'Your agent finished the login page and it works. Nothing is saved yet.',
  gotchas: [
    'Nothing is saved until you make the commit.',
    'A message reading "update" tells you nothing later.',
    'Deleting a repo deletes its commit history too.'
  ],
  vibe_coder_default: 'Commit every time something works. Write a real message.',
  assessment: {
    question: 'What is a commit?',
    options: ['One saved state of your project', 'A message to your agent', 'A copy of the internet'],
    answer: 'One saved state of your project',
    explanation: 'A commit is one saved state. The list of them is your history.'
  }
};
