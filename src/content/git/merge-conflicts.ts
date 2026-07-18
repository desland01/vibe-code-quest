import type { Landmark } from '../schema.ts';

export const landmark = {
  id: 'merge-conflicts',
  title: 'Merge conflicts',
  draft: false,
  hook: 'A conflict is a design decision, not cleanup.',
  definition: 'A merge conflict occurs when Git cannot combine competing changes automatically. You must choose a correct result, then test the combined behavior because either side may be incomplete alone.',
  when_to_use: [
    'Git stops a merge or rebase and marks unmerged paths.',
    'Two agent tasks changed the same function, schema, or configuration.',
    'One branch renamed a file that another branch edited.',
    'A clean automatic merge still combines related behavior from separate tasks.'
  ],
  tradeoffs: {
    pros: [
      'Conflict markers expose changes Git cannot safely reconcile.',
      'Resolution creates a deliberate combined result.',
      'Frequent integration reveals incompatible assumptions early.'
    ],
    cons: [
      'A syntactically clean resolution can still break behavior.',
      'Large or stale branches increase resolution effort and uncertainty.'
    ]
  },
  example: 'One agent changes the account schema while another updates its API validation. Resolve the conflict from the shared contract, then rerun migration, API, and authorization tests.',
  gotchas: [
    'Read both branches and the surrounding code before accepting either side.',
    'Search for every conflict marker before completing the merge.',
    'Run tests for both tasks after resolution; generated resolutions can compile while dropping behavior.'
  ],
  vibe_coder_default: 'Resolve conflicts yourself from the intended contract, ask an agent for analysis when useful, and verify the combined behavior before committing.',
  quiz: {
    question: 'What should guide a merge-conflict resolution?',
    options: ['The intended combined behavior and its tests', 'Whichever branch changed the file last', 'The version with fewer lines'],
    answer: 'The intended combined behavior and its tests',
    explanation: 'Conflict resolution must preserve the product contract across both changes, not favor a mechanical side.'
  },
  sources: [
    { url: 'https://git-scm.com/docs/git-merge', checked: '2026-07-17' },
    { url: 'https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging', checked: '2026-07-17' },
    { url: 'https://git-scm.com/docs/git-rerere', checked: '2026-07-17' }
  ]
} satisfies Landmark;
