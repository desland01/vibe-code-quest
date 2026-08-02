import type { BeatSequence } from '../../beats/schema.ts';

// Hand-authored L3 run for commits-as-checkpoints (frozen DESIGN_CONTRACT §12 pilot,
// re-voiced for the arcade in ISSUE-012 against CREATIVE_BIBLE §6).
//
// Copy loyalty: every claim traces to src/content/git/commits-as-checkpoints.ts —
// no new git facts. Hand-authored sequences are exempt from the mechanical
// provenance check (their copy is written, not projected) and are held to the
// voice suite instead: word budgets, the three allowlisted verdict leads, the
// banned-phrase list, and the grade-8 ceiling.
//
// Beat ids and types are the pinned L3_SHAPE tuple, with `check` at index 6.
export const sequence: BeatSequence = {
  regionId: 'git',
  landmarkId: 'commits-as-checkpoints',
  level: 'l3',
  assessment: {
    question: 'When should you create an agent-work checkpoint?',
    options: ['After one coherent change passes review and checks', 'Whenever the agent pauses mid-edit', 'After combining several unrelated tasks'],
    answer: 'After one coherent change passes review and checks',
    explanation: 'A useful checkpoint holds one outcome you can inspect and recover on its own.',
  },
  beats: [
    {
      id: 'hook',
      type: 'hook',
      prompt: 'A commit is a save point you can go back to.',
      estimatedSeconds: 10,
    },
    {
      id: 'predict-core',
      type: 'predict',
      prompt: 'Your agent touched a route, a queue, and tests. What gets committed?',
      options: [
        {
          id: 'one-reviewed',
          label: 'One reviewed change that passes its checks',
          feedback: 'Noted. That is the boundary you can inspect and undo.',
        },
        {
          id: 'everything',
          label: 'Everything it touched so far',
          feedback: 'Not that one. Large mixed commits hide unrelated mistakes.',
        },
        {
          id: 'batch-later',
          label: 'Wait and batch more changes first',
          feedback: 'Not that one. A bigger pile buries the intent.',
        },
      ],
      correctOptionId: 'one-reviewed',
      hint: 'Think about what you could undo on its own.',
      estimatedSeconds: 20,
    },
    {
      id: 'reveal-definition',
      type: 'reveal',
      prompt: 'Commits as checkpoints',
      cards: [
        'A commit records a snapshot of the whole project.',
        'It stores the parent history and a message you write.',
        'A focused one is a point you can inspect or undo.',
      ],
      estimatedSeconds: 25,
    },
    {
      id: 'scenario-default',
      type: 'scenario',
      prompt: 'The route, the queue, and the tests are done. The staged diff is sitting there. Your move?',
      options: [
        {
          id: 'commit-all',
          label: 'Commit all of it right now',
          feedback: 'Not that one. Agents sweep in generated files you never read.',
        },
        {
          id: 'review-split',
          label: 'Read the diff, split, commit one task',
          feedback: 'Yep. It costs you a minute, and it is still right.',
        },
        {
          id: 'keep-working',
          label: 'Let the agent keep working uncommitted',
          feedback: 'Not that one. Uncommitted work has no point to fall back to.',
        },
      ],
      correctOptionId: 'review-split',
      hint: 'What makes this snapshot safe to trust later?',
      estimatedSeconds: 45,
    },
    {
      id: 'gotcha-trap',
      type: 'gotcha',
      prompt: 'One of these rides along into the commit. Find it.',
      options: [
        {
          id: 'staged-diff',
          label: 'A staged diff you already read',
          feedback: 'Not that one. A reviewed diff is what belongs in a snapshot.',
        },
        {
          id: 'env-file',
          label: 'The env file holding your keys',
          feedback: 'Yep. Keep secrets and local env files out of snapshots.',
        },
        {
          id: 'tests',
          label: 'Test files for the change',
          feedback: 'Not that one. Tests belong with the change they cover.',
        },
      ],
      correctOptionId: 'env-file',
      hint: 'Two of these are fine. One is not.',
      estimatedSeconds: 25,
    },
    {
      id: 'default-commit',
      type: 'default',
      prompt: 'Commit one reviewed, tested task. Split unrelated changes first.',
      estimatedSeconds: 15,
    },
    {
      id: 'check-quiz',
      type: 'check',
      prompt: 'When should you create an agent-work checkpoint?',
      hint: 'One outcome you could recover on its own.',
      estimatedSeconds: 20,
    },
    {
      id: 'recap',
      type: 'recap',
      prompt: 'A commit is a save point you can go back to.',
      bullets: [
        'A commit records a snapshot of the whole project.',
        'Read the staged diff and split unrelated edits.',
        'A clean commit is not proof the code works.',
      ],
      estimatedSeconds: 20,
    },
  ],
};
