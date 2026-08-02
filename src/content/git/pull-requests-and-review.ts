import { legacyLevelContent } from '../beats/derive.ts';
import type { Landmark, LevelContent } from '../schema.ts';

// Re-voiced for the arcade L3 tier (ISSUE-012, CREATIVE_BIBLE §6).
const base = {
  id: 'pull-requests-and-review',
  title: 'Pull requests and review',
  draft: false,
  hook: 'Review the proposal before it becomes shared history.',
  definition:
    'A pull request asks to merge one branch into another. It gives you one place to read the changes. It is evidence, not proof that the work is safe.',
  when_to_use: [
    'An agent change will land on a shared branch.',
    'Someone else needs to review behavior or security.',
    'Checks must run before a change can merge.',
    'The decision needs a durable written record.'
  ],
  tradeoffs: {
    pros: [
      'Diffs and comments keep review tied to the change.',
      'Required checks block known failures from merging.',
      'The thread records decisions and requested revisions.'
    ],
    cons: [
      'Big pull requests overload reviewers and hide risk.',
      'Passing checks miss invented assumptions and product mistakes.'
    ]
  },
  example:
    'Your agent added team invites and changed who is allowed to do what. The diff touches your access rules.',
  gotchas: [
    'Read the code, not just the agent summary.',
    'Make the author disclose migrations and generated files.',
    'Re-read changed lines after new commits arrive.'
  ],
  vibe_coder_default: 'Keep it small, show test evidence, require review.',
  quiz: {
    question: 'What is the strongest basis for approving an agent pull request?',
    options: ['The reviewed diff, evidence, and passing checks', 'A confident summary from the agent', 'A small number of changed files'],
    answer: 'The reviewed diff, evidence, and passing checks',
    explanation: 'Approval rests on the change and its evidence, not on confidence or diff size.'
  },
  sources: [
    { url: 'https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests', checked: '2026-07-17' },
    { url: 'https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/about-pull-request-reviews', checked: '2026-07-17' },
    { url: 'https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches', checked: '2026-07-17' }
  ]
} satisfies Landmark;

// L1 "SAVE POINTS" (ISSUE-013). Vocabulary tier: push, pull request.
// Grounding: UGC findings A3 (repos confusion) and A20 ("is this a good,
// trustworthy repo?" — people cannot tell what a proposed change contains).
export const l1: LevelContent = {
  hook: 'Push sends your commits up. A pull request asks to merge.',
  definition:
    'Push copies your commits up to GitHub. A pull request asks to join your branch into main. People read it before that happens.',
  when_to_use: [
    'Your work is finished and you want it live.',
    'You want someone to look before it merges.',
    'Your commits only exist on your own machine.',
    'The team needs a record of the change.'
  ],
  tradeoffs: {
    pros: [
      'Pushing puts a copy somewhere besides your laptop.',
      'A pull request shows exactly what changed.',
      'Someone can catch a problem before it lands.'
    ],
    cons: [
      'Pushing does not mean anyone has read it.',
      'A huge pull request is hard to read.'
    ]
  },
  example: 'You made six commits today. GitHub still shows the version from yesterday.',
  gotchas: [
    'A commit is not pushed until you push it.',
    'A pull request is a request, not a merge.',
    'Approving is not the same as testing.'
  ],
  vibe_coder_default: 'Push early. Open a pull request before touching main.',
  assessment: {
    question: 'What does pushing do?',
    options: ['Copies your commits up to GitHub', 'Merges your branch into main', 'Deletes your local files'],
    answer: 'Copies your commits up to GitHub',
    explanation: 'Push copies commits up. Merging into main is a separate ask.'
  }
};

// L2 "THE AGENT MADE A BRANCH" (ISSUE-014). One agent decision: it wants to
// merge its own work into main. Grounding: UGC finding A20 — people who cannot
// tell whether a change is trustworthy and have nobody to ask.
export const l2: LevelContent = {
  hook: 'Your agent wants this in main. Right now.',
  definition:
    'Pushing is reversible. Merging into main is where other people start using it. That is the line worth slowing down at.',
  when_to_use: [
    'Your agent offers to merge its own work.',
    'Nobody else has read the change yet.',
    'The change touches money, login, or data.',
    'You are the only person who can say no.'
  ],
  tradeoffs: {
    pros: [
      'A pull request costs one extra minute.',
      'Someone else may spot what you missed.',
      'The change is written down before it lands.'
    ],
    cons: [
      'Waiting for review slows a fast build.',
      'A review is not a guarantee of anything.'
    ]
  },
  example: 'Tests pass. I am going to merge this straight into main and skip the pull request. OK?',
  gotchas: [
    'Passing tests is not the same as reviewed.',
    'Main is what your users actually get.',
    'Merging is much harder to undo than pushing.'
  ],
  vibe_coder_default: 'Push it, but open the pull request first.',
  assessment: {
    question: 'Your agent wants to skip the pull request. What do you say?',
    options: ['Push it, but open the request', 'Merge it, the tests passed', 'Delete the branch and restart'],
    answer: 'Push it, but open the request',
    explanation: 'Pushing is cheap to undo. Landing in main is the expensive step.'
  }
};

// L3 "TIME TRAVEL RESPONSIBLY" is the tier this landmark already shipped, so it
// is projected from the canonical top-level fields rather than restated. That
// projection is the same function the registry used during the L3-only
// compatibility window, which is what keeps the re-voiced L3 run byte-identical
// as this landmark gains its lower tiers (ISSUE-014, DATA_MODEL §6 step 1).
export const l3: LevelContent = legacyLevelContent(base);

// All three tiers registered (ISSUE-015). The page resolver now selects the
// level the player has unlocked, so serving L1 to a new player is correct
// rather than a 423 from the write gate.
export const landmark = { ...base, levels: { l1, l2, l3 } } satisfies Landmark;
