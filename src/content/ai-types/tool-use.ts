import type { Landmark } from '../schema.ts';

export const landmark = {
  id: 'tool-use',
  title: 'Tool use',
  draft: false,
  hook: 'Give models narrow handles, not broad authority.',
  definition: 'Tool use lets a model request a function through a defined input schema. Your application still validates the request, runs the code, and decides what result returns to the model.',
  when_to_use: [
    'The model needs current data from an approved API or database query.',
    'A user request should create a draft in another system.',
    'A calculation needs deterministic application code.',
    'One assistant must choose among a small set of bounded capabilities.'
  ],
  tradeoffs: {
    pros: [
      'Schemas make available actions and arguments explicit.',
      'Application code can enforce authorization and validation.',
      'Deterministic tools can handle work models should not improvise.'
    ],
    cons: [
      'The model can select the wrong tool or supply bad arguments.',
      'Every tool expands the security and testing surface.',
      'External APIs introduce latency, failures, and side effects.'
    ]
  },
  example: 'A project assistant can search tasks and draft a status update. Tell your agent to expose separate read and draft tools with strict schemas, while requiring user confirmation before sending any message.',
  gotchas: [
    'Authorize every tool call against the current user and resource.',
    'Validate arguments server-side even when the provider enforces a schema.',
    'Keep secrets out of tool descriptions, results, and model-visible errors.'
  ],
  vibe_coder_default: 'Start with two or three read-only tools using strict schemas; add write tools only with idempotency and confirmation for material side effects.',
  quiz: {
    question: 'Who should enforce access before a model-requested task lookup runs?',
    options: ['Your server-side tool handler', 'The model prompt alone', 'The tool result after it reaches the model'],
    answer: 'Your server-side tool handler',
    explanation: 'A tool request is untrusted input, so the application must enforce authorization before accessing data.'
  },
  sources: [
    { url: 'https://platform.openai.com/docs/guides/function-calling', checked: '2026-07-17' },
    { url: 'https://docs.anthropic.com/en/docs/build-with-claude/tool-use/overview', checked: '2026-07-17' },
    { url: 'https://modelcontextprotocol.io/docs/getting-started/intro', checked: '2026-07-17' }
  ]
} satisfies Landmark;
