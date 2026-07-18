import type { Landmark } from '../schema.ts';

export const landmark = {
  id: 'ai-evals',
  title: 'AI evals',
  draft: false,
  hook: 'Turn “looks good” into repeatable evidence.',
  definition: 'AI evals are repeatable tests that measure model behavior on representative cases. They help you compare prompts, models, and system changes, but their results are only as useful as the test set and graders.',
  when_to_use: [
    'You are choosing between prompts or models for one product task.',
    'A change could regress correctness, safety, tone, or tool selection.',
    'Production failures need to become reproducible test cases.',
    'You need a release threshold for an AI feature.'
  ],
  tradeoffs: {
    pros: [
      'A fixed dataset makes changes comparable over time.',
      'Task-specific criteria reveal failures broad benchmarks miss.',
      'Production examples can improve coverage after review and redaction.'
    ],
    cons: [
      'Test sets become stale as users and data change.',
      'Model-based graders can be biased or inconsistent.',
      'Passing offline tests does not replace production monitoring.'
    ]
  },
  example: 'A support drafter must cite the correct policy and avoid promised refunds. Tell your agent to build a versioned set of real, redacted tickets with citation, policy, and refusal criteria, then run it before each prompt change.',
  gotchas: [
    'Keep a human-reviewed holdout set outside prompt-tuning work.',
    'Inspect failures by category instead of trusting one aggregate score.',
    'Require your agent to version prompts, datasets, graders, and model settings together.'
  ],
  vibe_coder_default: 'Start with 20 to 50 representative cases, deterministic checks where possible, and human review of model-graded failures before expanding the suite.',
  quiz: {
    question: 'What should you do after a production answer cites the wrong policy?',
    options: ['Add a redacted case to the eval set', 'Tune the prompt and rely on memory', 'Replace all human review with one model grader'],
    answer: 'Add a redacted case to the eval set',
    explanation: 'A reviewed production failure should become a repeatable regression case for future changes.'
  },
  sources: [
    { url: 'https://platform.openai.com/docs/guides/evals', checked: '2026-07-17' },
    { url: 'https://docs.anthropic.com/en/docs/test-and-evaluate/define-success', checked: '2026-07-17' },
    { url: 'https://docs.anthropic.com/en/docs/test-and-evaluate/develop-tests', checked: '2026-07-17' }
  ]
} satisfies Landmark;
