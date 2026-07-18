import type { Landmark } from '../schema.ts';

export const landmark = {
  id: 'pull-requests-and-review',
  title: 'Pull requests and review',
  draft: false,
  hook: 'Review the agent’s proposal before it becomes shared history.',
  definition: 'A pull request proposes merging one branch into another and provides a place to review its changes. It is an evidence packet for agent work, not a guarantee that the work is safe.',
  when_to_use: [
    'An agent change will affect a shared or protected branch.',
    'You need another person to review behavior, security, or architecture.',
    'Automated checks must run before a change can merge.',
    'The decision needs a durable record of discussion and revisions.'
  ],
  tradeoffs: {
    pros: [
      'Diffs and comments keep review tied to the proposed change.',
      'Required checks can block known failures from merging.',
      'The conversation records decisions and requested revisions.'
    ],
    cons: [
      'Large pull requests overload reviewers and conceal risk.',
      'Passing checks cannot detect every invented assumption or product mistake.'
    ]
  },
  example: 'Your agent adds team invitations and updates authorization rules. Require a pull request that explains the threat boundary, links tests, and calls out migrations before you review the diff.',
  gotchas: [
    'Read the changed code and test results; do not approve from the agent summary alone.',
    'Require the author to disclose migrations, dependency changes, generated files, and unresolved risks.',
    'Re-review changed lines after new commits arrive.'
  ],
  vibe_coder_default: 'Use a small GitHub pull request with a clear outcome, test evidence, and required review before merging agent-produced code.',
  quiz: {
    question: 'What is the strongest basis for approving an agent pull request?',
    options: ['The reviewed diff, evidence, and passing required checks', 'A confident summary from the agent', 'A small number of changed files'],
    answer: 'The reviewed diff, evidence, and passing required checks',
    explanation: 'Approval should rest on the actual change and its evidence, not the author’s confidence or diff size.'
  },
  sources: [
    { url: 'https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests', checked: '2026-07-17' },
    { url: 'https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/about-pull-request-reviews', checked: '2026-07-17' },
    { url: 'https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches', checked: '2026-07-17' }
  ]
} satisfies Landmark;
