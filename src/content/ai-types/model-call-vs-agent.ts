import type { Landmark } from '../schema.ts';

export const landmark = {
  id: 'model-call-vs-agent',
  title: 'Model call vs agent',
  draft: false,
  hook: 'Use the smallest loop that can finish the job.',
  definition: 'A model call maps one bounded input to one response. An agent adds a loop that can choose tools and next steps, which increases reach and failure modes.',
  when_to_use: [
    'You need one classification, extraction, rewrite, or generated object.',
    'You can express the output as a schema and validate it immediately.',
    'The task may require choosing among tools based on intermediate results.',
    'The number of steps cannot be known safely in advance.'
  ],
  tradeoffs: {
    pros: [
      'A single call is easier to test, price, and debug.',
      'Structured outputs can enforce the response shape.',
      'An agent can adapt when a task needs different tools or follow-up steps.'
    ],
    cons: [
      'A single call cannot inspect new evidence unless you provide it.',
      'Agent loops add latency, cost, and more paths to unsafe actions.',
      'An agent can stop early, repeat work, or pursue the wrong goal.'
    ]
  },
  example: 'A receipt importer needs merchant, date, currency, and line items. Tell your agent to start with one model call using a strict output schema, then add a bounded tool loop only if it must fetch missing records.',
  gotchas: [
    'Cap agent steps, time, and spend before the loop starts.',
    'Require confirmation before irreversible or externally visible tool calls.',
    'Make your agent validate structured output and handle refusals or missing fields.'
  ],
  vibe_coder_default: 'Start with one model call and structured outputs; add an agent only when the task truly needs dynamic tool or step selection.',
  quiz: {
    question: 'What should power a receipt importer with a fixed output shape?',
    options: ['One model call with a validated schema', 'An unbounded agent with every app tool', 'A multi-agent planning team'],
    answer: 'One model call with a validated schema',
    explanation: 'A fixed transformation does not need a planning loop, so one validated call is easier to control.'
  },
  sources: [
    { url: 'https://platform.openai.com/docs/guides/structured-outputs', checked: '2026-07-17' },
    { url: 'https://platform.openai.com/docs/guides/agents', checked: '2026-07-17' },
    { url: 'https://docs.anthropic.com/en/docs/build-with-claude/tool-use/overview', checked: '2026-07-17' }
  ]
} satisfies Landmark;
