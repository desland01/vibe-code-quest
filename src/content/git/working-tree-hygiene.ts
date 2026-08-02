import type { Landmark, LevelContent } from '../schema.ts';

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

// L1 "SAVE POINTS" (ISSUE-013). Vocabulary tier: repo, repository, git.
// Grounding: UGC finding A3 — "what's confusing about repos?" is the single
// highest-volume vocabulary gap in the corpus (15+ threads).
export const l1: LevelContent = {
  hook: 'A repo is a folder that remembers everything.',
  definition:
    'A repo is your project folder plus its history. Repository is the long name, and Git keeps that history. Every file in it is saved, changed, or brand new.',
  when_to_use: [
    'You are about to let an agent edit files.',
    'You do not know what changed since yesterday.',
    'A tool wrote files you did not ask for.',
    'You are about to switch branches.'
  ],
  tradeoffs: {
    pros: [
      'Git can list every file you changed.',
      'You choose which changes go into a commit.',
      'Ignored files stay out of the history.'
    ],
    cons: [
      'Checking takes a few seconds every time.',
      'A bad ignore rule hides real work.'
    ]
  },
  example: 'You open the repo and Git lists nine changed files. You wrote maybe two.',
  gotchas: [
    'Git ignores new files until you add them.',
    'Deleting the repo deletes the history with it.',
    'Never throw away changes you did not make.'
  ],
  vibe_coder_default: 'Look at what changed before you let anything run.',
  assessment: {
    question: 'What is a repo?',
    options: ['A project folder plus its history', 'A website that hosts code', 'A single saved file'],
    answer: 'A project folder plus its history',
    explanation: 'A repo is the folder and the history Git keeps for it.'
  }
};
