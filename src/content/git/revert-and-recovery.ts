import type { Landmark, LevelContent } from '../schema.ts';

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

// L1 "SAVE POINTS" (ISSUE-013). Vocabulary tier: revert, undo. Grounding: UGC
// finding C3 — someone who wiped a repo AND its commit history and was
// "baffled" at how both went at once. §6.1 rule 4: state the stakes flat.
export const l1: LevelContent = {
  hook: 'Undo exists in Git. You have to ask for it.',
  definition:
    'A revert is a new commit undoing an older one. The old commit stays in the history. Nothing is erased.',
  when_to_use: [
    'Something worked yesterday and does not today.',
    'Your agent changed something and broke the app.',
    'You want one file back the way it was.',
    'You want to undo without losing the record.'
  ],
  tradeoffs: {
    pros: [
      'The bad change goes away and stays visible.',
      'You can undo one commit, not all of them.',
      'Nothing disappears from the history.'
    ],
    cons: [
      'Undoing one commit can break a later one.',
      'Some Git commands really do delete work.'
    ]
  },
  example: 'Checkout broke this morning. The commit that broke it is already on main.',
  gotchas: [
    'Revert and reset are not the same thing.',
    'Reset and clean can delete unsaved work.',
    'People have lost years of work this way.'
  ],
  vibe_coder_default: 'Revert to undo. Never reset without reading first.',
  assessment: {
    question: 'What does a revert do?',
    options: ['Adds a commit that undoes an old one', 'Erases the old commit', 'Deletes the branch'],
    answer: 'Adds a commit that undoes an old one',
    explanation: 'A revert adds a commit. The old one stays in the history.'
  }
};
