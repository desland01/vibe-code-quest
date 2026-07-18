import type { Landmark } from '../schema.ts';

export const landmark = {
  id: 'commits-as-checkpoints',
  title: 'Commits as checkpoints',
  draft: false,
  hook: 'A commit makes agent work inspectable and reversible.',
  definition: 'A commit records a project snapshot with its parent history and a message. In an AI-assisted workflow, a focused commit gives you a boundary to inspect, test, compare, or undo.',
  when_to_use: [
    'Your agent has completed one coherent change and its checks pass.',
    'You want a stable point before asking an agent to attempt a risky edit.',
    'You need to compare generated work with the last known-good state.',
    'You want review history that explains why a change exists.'
  ],
  tradeoffs: {
    pros: [
      'Focused snapshots make generated changes easier to review.',
      'History provides known points for comparison and recovery.',
      'Commit messages preserve intent beyond the current agent session.'
    ],
    cons: [
      'Large mixed commits hide unrelated mistakes.',
      'Frequent checkpoints still require tests and human review.'
    ]
  },
  example: 'Your agent adds invoice reminders across a route, queue, and tests. Ask it to run the relevant checks, show the staged diff, and create one checkpoint only after you approve the scope.',
  gotchas: [
    'Review the staged diff before committing; agents can include generated files or unrelated edits.',
    'Keep secrets, local environment files, and credentials out of every snapshot.',
    'Do not treat a clean commit as proof that the behavior is correct.'
  ],
  vibe_coder_default: 'Commit one reviewed, tested task at a time with a message that states the outcome; split unrelated agent changes first.',
  quiz: {
    question: 'When should you create an agent-work checkpoint?',
    options: ['After one coherent change passes review and checks', 'Whenever the agent pauses mid-edit', 'After combining several unrelated tasks'],
    answer: 'After one coherent change passes review and checks',
    explanation: 'A useful checkpoint captures one understandable outcome that you can inspect and recover independently.'
  },
  sources: [
    { url: 'https://git-scm.com/docs/git-commit', checked: '2026-07-17' },
    { url: 'https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository', checked: '2026-07-17' },
    { url: 'https://git-scm.com/book/en/v2/Git-Basics-Viewing-the-Commit-History', checked: '2026-07-17' }
  ]
} satisfies Landmark;
