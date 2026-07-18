import type { Landmark } from '../schema.ts';

export const landmark = {
  id: 'branches-as-isolation',
  title: 'Branches as isolation',
  draft: false,
  hook: 'Give each agent task its own line of work.',
  definition: 'A Git branch is a movable name for one line of commit history. Separate branches isolate agent tasks so you can review, combine, or discard them without mixing unfinished work.',
  when_to_use: [
    'You are starting an agent task that will change repository files.',
    'Two tasks may proceed without depending on the same unfinished code.',
    'You want to compare alternative implementations before choosing one.',
    'A change needs review before it reaches the shared branch.'
  ],
  tradeoffs: {
    pros: [
      'Tasks remain independently reviewable and discardable.',
      'The shared branch stays stable while work is unfinished.',
      'Alternative agent approaches can coexist for comparison.'
    ],
    cons: [
      'Long-lived branches drift and become harder to combine.',
      'Branches do not isolate uncommitted files in one working directory.'
    ]
  },
  example: 'You need an export feature while another task repairs authentication. Create separate branches and working directories, then tell each agent its exact scope and verification command.',
  gotchas: [
    'Start from the intended, current base branch before assigning work.',
    'Use separate worktrees or clones for simultaneous agents; branch names alone do not separate files on disk.',
    'Rebase or merge the current base before final review when the branch has drifted.'
  ],
  vibe_coder_default: 'Create a short-lived branch for every agent task, and pair concurrent branches with separate Git worktrees.',
  quiz: {
    question: 'What safely isolates two agents working at the same time?',
    options: ['Separate branches in separate worktrees', 'Two branches in one shared working directory', 'One branch with different commit messages'],
    answer: 'Separate branches in separate worktrees',
    explanation: 'Branches separate histories, while worktrees also separate the files each agent edits.'
  },
  sources: [
    { url: 'https://git-scm.com/docs/git-branch', checked: '2026-07-17' },
    { url: 'https://git-scm.com/book/en/v2/Git-Branching-Branches-in-a-Nutshell', checked: '2026-07-17' },
    { url: 'https://git-scm.com/docs/git-worktree', checked: '2026-07-17' }
  ]
} satisfies Landmark;
