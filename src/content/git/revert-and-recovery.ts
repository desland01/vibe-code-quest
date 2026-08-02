import type { Landmark } from '../schema.ts';

// Re-voiced for the arcade L3 tier (ISSUE-012, CREATIVE_BIBLE §6).
export const landmark = {
  id: 'revert-and-recovery',
  title: 'Revert and recovery',
  draft: false,
  hook: 'Back out agent mistakes without erasing the trail.',
  definition:
    'Git has one recovery tool per state. Committed, staged, and working-tree changes each need a different one. A revert adds a new commit that undoes an old one.',
  when_to_use: [
    'An agent commit reached main and broke something.',
    'You need one file back from a good commit.',
    'You staged the wrong changes but want the files.',
    'You need to find where working behavior changed.'
  ],
  tradeoffs: {
    pros: [
      'Reverts keep shared history whole and auditable.',
      'Restore can target working-tree or staged content.',
      'Bisect narrows a break between good and bad commits.'
    ],
    cons: [
      'Reverting dependent commits can create conflicts.',
      'Reset and clean can destroy uncommitted work.'
    ]
  },
  example:
    'An agent deploy broke checkout and the tests missed it. The bad commit is already on the shared branch.',
  gotchas: [
    'Check status and save uncommitted work first.',
    'Do not rewrite history other people already pulled.',
    'Make the agent name the exact path first.'
  ],
  vibe_coder_default: 'Revert the bad shared commit. Reset only after review.',
  quiz: {
    question: 'How should you undo a bad commit already on a shared branch?',
    options: ['Create a revert commit', 'Hard-reset the shared branch', 'Delete the changed files manually'],
    answer: 'Create a revert commit',
    explanation: 'A revert keeps shared history and records the inverse change for review.'
  },
  sources: [
    { url: 'https://git-scm.com/docs/git-revert', checked: '2026-07-17' },
    { url: 'https://git-scm.com/docs/git-restore', checked: '2026-07-17' },
    { url: 'https://git-scm.com/docs/git-reset', checked: '2026-07-17' },
    { url: 'https://git-scm.com/docs/git-bisect', checked: '2026-07-17' }
  ]
} satisfies Landmark;
