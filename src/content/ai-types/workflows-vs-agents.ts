import type { Landmark } from '../schema.ts';

export const landmark = {
  id: 'workflows-vs-agents',
  title: 'Workflows vs agents',
  draft: false,
  hook: 'Code the path when you already know it.',
  definition: 'A workflow follows steps and branches defined by your code. An agent chooses its next step from context, which helps with open-ended work but reduces predictability.',
  when_to_use: [
    'A business process has known stages, approvals, and retry rules.',
    'Each step needs clear logs and deterministic recovery.',
    'Open-ended research may require different searches and follow-up questions.',
    'The task can tolerate bounded exploration before a human review.'
  ],
  tradeoffs: {
    pros: [
      'Workflows are easier to observe, retry, and audit.',
      'Code-defined branches keep policy outside model judgment.',
      'Agents can adapt when the useful path depends on intermediate evidence.'
    ],
    cons: [
      'Workflows become cumbersome when valid paths vary widely.',
      'Agents make timing, cost, and outcomes less predictable.',
      'Both designs need explicit failure and cancellation handling.'
    ]
  },
  example: 'A refund request needs eligibility checks, manager approval, payment processing, and a receipt. Tell your agent to build that as a durable workflow, using a model only to summarize evidence for the reviewer.',
  gotchas: [
    'Keep approvals, money movement, and policy checks in deterministic code.',
    'Persist step state so retries do not repeat side effects.',
    'Bound any agent inside the workflow by tools, steps, time, and review gates.'
  ],
  vibe_coder_default: 'Start with a code-defined workflow and insert bounded model calls; use an agent only inside steps where the path cannot be specified reliably.',
  quiz: {
    question: 'How should an app handle a refund with fixed approval rules?',
    options: ['A durable code-defined workflow', 'An autonomous agent with payment credentials', 'One prompt that performs every side effect'],
    answer: 'A durable code-defined workflow',
    explanation: 'Known policy, approval, and payment stages need explicit state, retries, and human control.'
  },
  sources: [
    { url: 'https://platform.openai.com/docs/guides/agents', checked: '2026-07-17' },
    { url: 'https://ai-sdk.dev/docs/agents/workflows', checked: '2026-07-17' },
    { url: 'https://docs.anthropic.com/en/docs/build-with-claude/tool-use/overview', checked: '2026-07-17' }
  ]
} satisfies Landmark;
