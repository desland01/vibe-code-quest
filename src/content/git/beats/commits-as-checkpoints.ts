import type { BeatSequence } from '../../beats/schema.ts';

// Pilot beat sequence for engagement-v2 (frozen DESIGN_CONTRACT §12).
// Copy loyalty: derived strictly from the canonical landmark file's fields —
// no new git or security facts beyond src/content/git/commits-as-checkpoints.ts.
export const sequence: BeatSequence = {
  regionId: 'git',
  landmarkId: 'commits-as-checkpoints',
  beats: [
    {
      id: 'hook',
      type: 'hook',
      prompt: 'A commit makes agent work inspectable and reversible.',
      estimatedSeconds: 10,
    },
    {
      id: 'predict-checkpoint',
      type: 'predict',
      prompt: 'Your agent just changed invoice reminders across a route, a queue, and tests. What belongs in the checkpoint?',
      options: [
        { id: 'one-reviewed', label: 'One reviewed change that passes its checks', feedback: 'That is the instinct the pros use. See why in the next cards.' },
        { id: 'everything', label: 'Everything it touched so far', feedback: 'Understandable guess — but a pile of unrelated edits hides mistakes. Keep going.' },
        { id: 'batch-later', label: 'Wait and batch more changes first', feedback: 'Tempting, but big batches bury the intent. Keep going.' },
      ],
      correctOptionId: 'one-reviewed',
      hint: 'Think about what you could inspect and undo on its own.',
      estimatedSeconds: 20,
    },
    {
      id: 'reveal-definition',
      type: 'reveal',
      prompt: 'What a commit actually is.',
      cards: [
        'A commit records a project snapshot with its parent history and a message.',
        'In an AI-assisted workflow, a focused commit gives you a boundary to inspect, test, compare, or undo.',
      ],
      estimatedSeconds: 25,
    },
    {
      id: 'scenario-diff',
      type: 'scenario',
      prompt: 'The agent finished the invoice reminders across the route, queue, and tests. The staged diff is ready. Your move?',
      options: [
        { id: 'commit-all', label: 'Commit everything right now', feedback: 'Agents can sweep generated files or unrelated edits into a snapshot. Review the staged diff first.' },
        { id: 'review-split', label: 'Stage, review the diff, split unrelated edits, commit one outcome', feedback: 'Right. Review the staged diff, split anything unrelated, then commit one tested outcome.' },
        { id: 'keep-working', label: 'Let the agent keep working uncommitted', feedback: 'Uncommitted work has no boundary to inspect, test, or undo. Checkpoint first.' },
      ],
      correctOptionId: 'review-split',
      hint: 'What would make this snapshot safe to trust?',
      estimatedSeconds: 45,
    },
    {
      id: 'gotcha-trap',
      type: 'gotcha',
      prompt: 'Spot the trap: which of these sneaks into agent commits if you are not watching?',
      options: [
        { id: 'staged-diff', label: 'A staged diff you already reviewed', feedback: 'A reviewed diff is exactly what belongs in a snapshot.' },
        { id: 'env-file', label: '.env.local with your keys', feedback: 'Caught it. Keep secrets, local environment files, and credentials out of every snapshot.' },
        { id: 'tests', label: 'Test files for the change', feedback: 'Tests belong with the change. They are not the trap.' },
      ],
      correctOptionId: 'env-file',
      hint: 'What should never appear in any snapshot?',
      estimatedSeconds: 25,
    },
    {
      id: 'default-commit',
      type: 'default',
      prompt: 'Commit one reviewed, tested task at a time with a message that states the outcome; split unrelated agent changes first.',
      estimatedSeconds: 15,
    },
    {
      id: 'check-quiz',
      type: 'check',
      prompt: 'Prove it: when should you create an agent-work checkpoint?',
      hint: 'One understandable, recoverable outcome.',
      estimatedSeconds: 20,
    },
    {
      id: 'recap',
      type: 'recap',
      prompt: 'Commits are your inspection and recovery points when agents do the typing.',
      bullets: [
        'A commit records a snapshot with history and a message.',
        'Review the staged diff and split unrelated edits before committing.',
        'A clean commit is not proof the behavior is correct — checks are.',
      ],
      estimatedSeconds: 20,
    },
  ],
};
