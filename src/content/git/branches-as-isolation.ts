import type { Landmark } from '../schema.ts';

// Re-voiced for the arcade L3 tier (ISSUE-012, CREATIVE_BIBLE §6).
// The hook is §6.4 item 7 verbatim. §6.4 item 8's three-sentence rewrite does not
// fit a gotcha slot — the factory renders a gotcha as a 9-word option label — so its
// sentences are distributed across the fields that already own them: "Branch names
// don't separate files on disk" stays a gotcha, "two agents in one folder overwrite
// each other" is the hook, and "worktrees fix that" is the default. No fact dropped.
export const landmark = {
  id: 'branches-as-isolation',
  title: 'Branches as isolation',
  draft: false,
  hook: 'Two agents, one folder, zero survivors. Give each its own lane.',
  definition:
    'A branch is a movable name for one history. Separate branches keep agent tasks apart. You can review, combine, or drop each one on its own.',
  when_to_use: [
    'An agent task will change files in the repo.',
    'Two tasks do not depend on the same code.',
    'You want to compare two builds before choosing.',
    'A change needs review before it reaches main.'
  ],
  tradeoffs: {
    pros: [
      'Each task stays reviewable and easy to drop.',
      'The shared branch stays stable while work is open.',
      'Two agent attempts can sit side by side.'
    ],
    cons: [
      'Long-lived branches drift and get harder to combine.',
      'Branches do not isolate files in one folder.'
    ]
  },
  example:
    'One agent builds export while another fixes login. Give each its own branch and its own folder.',
  gotchas: [
    'Branch names do not separate files on disk.',
    'Start from the current base branch before assigning work.',
    'Rebase or merge the base before final review.'
  ],
  vibe_coder_default: 'One short branch per agent task. Worktrees for two.',
  quiz: {
    question: 'What safely isolates two agents working at the same time?',
    options: ['Separate branches in separate worktrees', 'Two branches in one shared folder', 'One branch with different commit messages'],
    answer: 'Separate branches in separate worktrees',
    explanation: 'Branches separate histories. Worktrees also separate the files each agent edits.'
  },
  sources: [
    { url: 'https://git-scm.com/docs/git-branch', checked: '2026-07-17' },
    { url: 'https://git-scm.com/book/en/v2/Git-Branching-Branches-in-a-Nutshell', checked: '2026-07-17' },
    { url: 'https://git-scm.com/docs/git-worktree', checked: '2026-07-17' }
  ]
} satisfies Landmark;
