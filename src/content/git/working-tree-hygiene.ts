import type { Landmark } from '../schema.ts';

// Re-voiced for the arcade L3 tier (ISSUE-012, CREATIVE_BIBLE §6).
export const landmark = {
  id: 'working-tree-hygiene',
  title: 'Working-tree hygiene',
  draft: false,
  hook: 'Know what is dirty before an agent touches it.',
  definition:
    'Your working tree is every file you have checked out. Each file is tracked, changed, staged, ignored, or untracked. Reading that state stops one task from eating another.',
  when_to_use: [
    'Before you let an agent edit repository files.',
    'Before you switch branches, merge, or commit.',
    'After a tool writes caches, migrations, or builds.',
    'When several sessions share one repository.'
  ],
  tradeoffs: {
    pros: [
      'A status check reveals work that needs protecting.',
      'Explicit staging keeps commits inside the task scope.',
      'Ignore rules cut noise from local build artifacts.'
    ],
    cons: [
      'The check adds a pause to fast work.',
      'Bad ignore rules hide files that belong in history.'
    ]
  },
  example:
    'An agent starts a Git lesson while an untracked mission file already sits in the tree, owned by nobody.',
  gotchas: [
    'Run status before and after every agent task.',
    'Never discard unknown changes without finding the owner.',
    'Check ignore rules so secrets stay untracked.'
  ],
  vibe_coder_default: 'Check status, keep other work, stage named paths.',
  quiz: {
    question: 'What should an agent do after finding an unrelated untracked file?',
    options: ['Preserve and classify it before editing', 'Delete it to restore a clean tree', 'Include it in the next task commit'],
    answer: 'Preserve and classify it before editing',
    explanation: 'Unknown work may belong to someone else, so ownership comes before cleanup.'
  },
  sources: [
    { url: 'https://git-scm.com/docs/git-status', checked: '2026-07-17' },
    { url: 'https://git-scm.com/docs/git-add', checked: '2026-07-17' },
    { url: 'https://git-scm.com/docs/gitignore', checked: '2026-07-17' },
    { url: 'https://git-scm.com/docs/git-worktree', checked: '2026-07-17' }
  ]
} satisfies Landmark;
