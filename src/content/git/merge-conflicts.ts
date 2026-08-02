import { legacyLevelContent } from '../beats/derive.ts';
import type { Landmark, LevelContent } from '../schema.ts';

// Re-voiced for the arcade L3 tier (ISSUE-012, CREATIVE_BIBLE §6).
const base = {
  id: 'merge-conflicts',
  title: 'Merge conflicts',
  draft: false,
  hook: 'A conflict is a design decision, not cleanup.',
  definition:
    'A merge conflict means Git cannot combine two changes. You pick the right result yourself. Then you test it, because either side may be incomplete.',
  when_to_use: [
    'Git stops a merge and marks unmerged paths.',
    'Two agent tasks changed the same function or schema.',
    'One branch renamed a file another branch edited.',
    'A clean merge still joins work from separate tasks.'
  ],
  tradeoffs: {
    pros: [
      'Markers show what Git cannot safely reconcile.',
      'Resolving one creates a deliberate combined result.',
      'Merging early reveals bad assumptions early.'
    ],
    cons: [
      'A clean-looking fix can still break behavior.',
      'Stale branches make resolution slower and riskier.'
    ]
  },
  example:
    'One agent changed the account schema. Another changed the checks that guard it. Both touch the same contract.',
  gotchas: [
    'Read both sides before you accept either one.',
    'Search for every conflict marker before finishing.',
    'Run the tests for both tasks after resolving.'
  ],
  vibe_coder_default: 'Resolve it yourself from the contract, then test.',
  quiz: {
    question: 'What should guide a merge-conflict resolution?',
    options: ['The intended combined behavior and its tests', 'Whichever branch changed the file last', 'The version with fewer lines'],
    answer: 'The intended combined behavior and its tests',
    explanation: 'Resolution has to keep the product contract across both changes.'
  },
  sources: [
    { url: 'https://git-scm.com/docs/git-merge', checked: '2026-07-17' },
    { url: 'https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging', checked: '2026-07-17' },
    { url: 'https://git-scm.com/docs/git-rerere', checked: '2026-07-17' }
  ]
} satisfies Landmark;

// L1 "SAVE POINTS" (ISSUE-013). Vocabulary tier: merge, conflict. Grounding:
// UGC finding B13 — someone who knows what they want but has "no idea" what
// the technical process for a major revision even is.
export const l1: LevelContent = {
  hook: 'Merging joins two branches. Sometimes it cannot.',
  definition:
    'Merging joins the work from one branch into another. Git does it for you when the changes do not overlap. When they do overlap, it stops and asks you.',
  when_to_use: [
    'Your branch is finished and main moved on.',
    'You want two pieces of work in one place.',
    'Git stopped and printed something about conflicts.',
    'Your tool asks you to resolve something.'
  ],
  tradeoffs: {
    pros: [
      'Git merges most changes without asking you.',
      'A conflict shows you which lines clash.',
      'You decide what the final version says.'
    ],
    cons: [
      'A conflict stops everything until you fix it.',
      'Git cannot tell which version is correct.'
    ]
  },
  example: 'You changed the header. Your agent changed the same line. Git will not pick.',
  gotchas: [
    'A conflict is not an error you caused.',
    'Git marks the clashing lines inside the file.',
    'Picking a side is a choice, not cleanup.'
  ],
  vibe_coder_default: 'Merge early, before the two branches drift apart.',
  assessment: {
    question: 'What is a merge conflict?',
    options: ['Two changes to the same lines', 'A bug in Git', 'A deleted branch'],
    answer: 'Two changes to the same lines',
    explanation: 'Git stops when two changes touch the same lines. You pick.'
  }
};

// L2 "THE AGENT MADE A BRANCH" (ISSUE-014). One agent decision: it wants to
// resolve a conflict by picking its own side. Grounding: UGC finding B13.
export const l2: LevelContent = {
  hook: 'Your agent hit a conflict. It wants to guess.',
  definition:
    'A conflict means two changes disagree. Git will not choose between them. Whoever chooses needs to know what the code is for.',
  when_to_use: [
    'Your agent says it resolved a conflict.',
    'Two agents worked on the same file.',
    'You do not know which version is right.',
    'The merge touches something you care about.'
  ],
  tradeoffs: {
    pros: [
      'An agent can explain both sides quickly.',
      'You still decide which behavior you want.',
      'Asking first costs you one question.'
    ],
    cons: [
      'Explaining the intent takes longer than merging.',
      'You may not know the answer either.'
    ]
  },
  example: 'You and I both changed the price field. I am picking my version. OK?',
  gotchas: [
    'An agent picks what builds, not what is right.',
    'A resolved conflict can still lose behavior.',
    'Both sides can be wrong at the same time.'
  ],
  vibe_coder_default: 'Ask what each side does before you choose.',
  assessment: {
    question: 'Your agent wants to resolve a conflict its own way. What now?',
    options: ['Ask what each version does', 'Let it pick, the code builds', 'Undo both changes'],
    answer: 'Ask what each version does',
    explanation: 'Git stopped because it cannot know the intent. Neither can the agent.'
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
