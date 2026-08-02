import { legacyLevelContent } from '../beats/derive.ts';
import type { Landmark, LevelContent } from '../schema.ts';

// Re-voiced for the arcade L3 tier (ISSUE-012, CREATIVE_BIBLE §6). This landmark's
// L3 run is hand-authored in ./beats/commits-as-checkpoints.ts and overrides the
// derived projection; these fields stay the canonical fact source behind it.
const base = {
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

// L2 "THE AGENT MADE A BRANCH" (ISSUE-014). One agent decision: it wants to
// commit everything it touched. Grounding: UGC finding B13 — people who cannot
// tell what the tool actually did on their behalf.
export const l2: LevelContent = {
  hook: 'Your agent wants to save. It never said what.',
  definition:
    'Committing is safe. It only saves what is already sitting there. The risk is what gets swept in with it.',
  when_to_use: [
    'Your agent says it is ready to commit.',
    'You cannot tell what it changed.',
    'The change touches more files than you expected.',
    'You want a save point before the next step.'
  ],
  tradeoffs: {
    pros: [
      'Reading the list first takes about ten seconds.',
      'A commit you understand is one you can undo.',
      'You find surprise files before they are saved.'
    ],
    cons: [
      'Reading every change slows the agent down.',
      'You will not catch a subtle logic bug.'
    ]
  },
  example: 'I finished the login fix. I am going to commit all fourteen changed files now. OK?',
  gotchas: [
    'Fourteen changed files is not one change.',
    'Agents commit files you never opened.',
    'A commit is easy to undo. Read it anyway.'
  ],
  vibe_coder_default: 'Ask it to list the files first.',
  assessment: {
    question: 'Your agent wants to commit fourteen files at once. What now?',
    options: ['Ask which files and why', 'Say yes, commits are reversible', 'Tell it to stop committing'],
    answer: 'Ask which files and why',
    explanation: 'A commit is easy to undo. Knowing what went in is the hard part.'
  }
};

// L3 "TIME TRAVEL RESPONSIBLY" is the tier this landmark already shipped, so it
// is projected from the canonical top-level fields rather than restated. That
// projection is the same function the registry used during the L3-only
// compatibility window, which is what keeps the re-voiced L3 run byte-identical
// as this landmark gains its lower tiers (ISSUE-014, DATA_MODEL §6 step 1).
export const l3: LevelContent = legacyLevelContent(base);

// ISSUE-015 flips this one line to `{ ...base, levels: { l1, l2, l3 } }`.
// Registering L1 and L2 changes which run the landmark page serves, and the
// page resolver that picks the unlocked level is ISSUE-015's slice — wiring
// them here would serve L1 from a route that still hard-codes L3 and every
// write would come back 423 Level locked.
export const landmark = base satisfies Landmark;
