import type { Landmark } from '../schema.ts';

export const landmark = {
  id: 'model-selection-routing',
  title: 'Model selection and routing',
  draft: false,
  hook: 'Route by measured need, not model prestige.',
  definition: 'Model selection matches a product task to needed quality, speed, cost, context, and modality. Routing applies that choice per request using explicit rules or a tested classifier.',
  when_to_use: [
    'A cheap model meets quality targets for common requests.',
    'Some inputs need vision, long context, or stronger reasoning.',
    'Latency targets differ between interactive and background work.',
    'A fallback must preserve service during a provider or model failure.'
  ],
  tradeoffs: {
    pros: [
      'Task-specific routing can reduce cost and latency.',
      'Fallbacks can improve availability during bounded failures.',
      'Evals can tie model choices to product quality targets.'
    ],
    cons: [
      'More models multiply prompts, tests, and operational paths.',
      'A bad router can send difficult work to an inadequate model.',
      'Fallbacks can change behavior, output shape, or safety characteristics.'
    ]
  },
  example: 'A document app extracts fields from routine forms and reviews ambiguous scans. Tell your agent to use one default model, escalate only low-confidence cases to a vision-capable model, and record route, latency, cost, and eval outcome.',
  gotchas: [
    'Verify every routed model against the same output contract and safety checks.',
    'Set finite retry and fallback rules to prevent loops and surprise spend.',
    'Do not let your agent invent capability, price, or model identifiers; verify provider documentation.'
  ],
  vibe_coder_default: 'Start with one model that passes your evals; add an explicit second route only when measured quality, latency, modality, or cost data supports it.',
  quiz: {
    question: 'When should you add a second model route?',
    options: ['When measured task data shows a useful tradeoff', 'When a new model gets attention online', 'Before you have a baseline eval set'],
    answer: 'When measured task data shows a useful tradeoff',
    explanation: 'Routing earns its complexity when task-level evidence shows a meaningful quality, latency, modality, or cost benefit.'
  },
  sources: [
    { url: 'https://platform.openai.com/docs/models', checked: '2026-07-17' },
    { url: 'https://docs.anthropic.com/en/docs/about-claude/models/overview', checked: '2026-07-17' },
    { url: 'https://ai-sdk.dev/docs/ai-sdk-core/provider-management', checked: '2026-07-17' }
  ]
} satisfies Landmark;
