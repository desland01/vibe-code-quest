import type { Landmark } from '../schema.ts';

export const landmark = {
  id: 'working-tree-hygiene',
  title: 'Working-tree hygiene',
  draft: false,
  hook: 'Know what is dirty before an agent touches it.',
  definition: 'Your working tree contains checked-out files plus tracked, modified, staged, ignored, and untracked state. Inspecting that state protects existing work and keeps one agent task from absorbing another task’s changes.',
  when_to_use: [
    'Before you give an agent permission to edit repository files.',
    'Before switching branches, merging, rebasing, or generating a commit.',
    'After a tool creates manifests, caches, migrations, or build output.',
    'When several workers or sessions share a repository.'
  ],
  tradeoffs: {
    pros: [
      'Preflight status checks reveal work that needs protection.',
      'Explicit staging keeps commits aligned with task scope.',
      'Ignore rules reduce noise from reproducible local artifacts.'
    ],
    cons: [
      'Cleanliness checks add deliberate pauses to fast workflows.',
      'Poor ignore rules can hide files that actually belong in history.'
    ]
  },
  example: 'An agent starts a Git lesson while an untracked mission prompt already exists. Tell it to classify and preserve that file, edit only the assigned paths, and stage explicit files instead of the entire tree.',
  gotchas: [
    'Run status before and after agent work, then explain every changed path.',
    'Never discard, overwrite, or stash unknown changes without confirming their owner and purpose.',
    'Review ignore rules so secrets stay untracked while required artifacts remain visible.'
  ],
  vibe_coder_default: 'Start every agent task with a status check, preserve unrelated changes, use separate worktrees for concurrent tasks, and stage explicit paths.',
  quiz: {
    question: 'What should an agent do after finding an unrelated untracked file?',
    options: ['Preserve and classify it before editing', 'Delete it to restore a clean tree', 'Include it in the next task commit'],
    answer: 'Preserve and classify it before editing',
    explanation: 'Unknown work may belong to another person or task, so ownership comes before cleanup or staging.'
  },
  sources: [
    { url: 'https://git-scm.com/docs/git-status', checked: '2026-07-17' },
    { url: 'https://git-scm.com/docs/git-add', checked: '2026-07-17' },
    { url: 'https://git-scm.com/docs/gitignore', checked: '2026-07-17' },
    { url: 'https://git-scm.com/docs/git-worktree', checked: '2026-07-17' }
  ]
} satisfies Landmark;
