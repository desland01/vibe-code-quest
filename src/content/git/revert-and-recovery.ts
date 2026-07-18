import type { Landmark } from '../schema.ts';

export const landmark = {
  id: 'revert-and-recovery',
  title: 'Revert and recovery',
  draft: false,
  hook: 'Back out agent mistakes without erasing the trail.',
  definition: 'Git offers different recovery tools for committed, staged, and working-tree changes. A revert records a new commit that reverses an earlier commit, making it the safer default for shared history.',
  when_to_use: [
    'An agent commit reached a shared branch and caused a regression.',
    'You need to restore one file from a known-good commit.',
    'You staged the wrong changes but want to keep the files.',
    'You need to locate the commit where working behavior changed.'
  ],
  tradeoffs: {
    pros: [
      'Reverts preserve an auditable shared history.',
      'Restore can target working-tree or staged file content.',
      'Bisect narrows a regression using known good and bad commits.'
    ],
    cons: [
      'Reverting dependent commits can create conflicts or partial behavior.',
      'Restore, reset, and clean can destroy uncommitted work when misused.'
    ]
  },
  example: 'An agent deployment changes checkout behavior and tests missed the regression. Revert the focused commit on the shared branch, verify checkout, then investigate the failure on a separate branch.',
  gotchas: [
    'Inspect status and save valuable uncommitted work before any recovery command.',
    'Prefer revert for published commits; avoid rewriting history others may use.',
    'Require an exact path and source commit before letting an agent run restore or reset.'
  ],
  vibe_coder_default: 'Revert a bad shared commit, restore only named files when needed, and use destructive reset or clean commands only after explicit review.',
  quiz: {
    question: 'How should you undo a bad commit already on a shared branch?',
    options: ['Create a revert commit', 'Hard-reset the shared branch', 'Delete the changed files manually'],
    answer: 'Create a revert commit',
    explanation: 'A revert preserves shared history while recording the inverse change for review and deployment.'
  },
  sources: [
    { url: 'https://git-scm.com/docs/git-revert', checked: '2026-07-17' },
    { url: 'https://git-scm.com/docs/git-restore', checked: '2026-07-17' },
    { url: 'https://git-scm.com/docs/git-reset', checked: '2026-07-17' },
    { url: 'https://git-scm.com/docs/git-bisect', checked: '2026-07-17' }
  ]
} satisfies Landmark;
