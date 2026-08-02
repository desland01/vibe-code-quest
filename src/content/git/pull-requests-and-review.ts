import type { Landmark } from '../schema.ts';

// Re-voiced for the arcade L3 tier (ISSUE-012, CREATIVE_BIBLE §6).
export const landmark = {
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
