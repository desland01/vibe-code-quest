import type { Landmark } from '../schema.ts';

export const landmark = {
  id: 'edge-compute',
  title: 'Edge compute',
  draft: false,
  hook: 'Move small decisions closer to the request.',
  definition: 'Edge compute runs bounded logic across geographically distributed locations near users. It can reduce network delay, but remote data and limited runtimes can erase that benefit.',
  when_to_use: [
    'You need request routing or personalization before traffic reaches an origin.',
    'Users are globally distributed and the required data is also nearby.',
    'You need lightweight authentication or feature decisions on cached content.',
    'Measurements show network distance dominates response time.'
  ],
  tradeoffs: {
    pros: [
      'Nearby execution can reduce request travel time.',
      'Distributed capacity can absorb globally scattered traffic.',
      'Logic can run before a cached response or origin request.'
    ],
    cons: [
      'Remote database calls can cancel the latency gain.',
      'Runtime APIs, CPU time, and package support may be constrained.',
      'Distributed logs and region-specific failures complicate debugging.'
    ]
  },
  example: 'A documentation site chooses locale and access rules before serving cached pages worldwide. Tell your agent to keep the decision small, avoid a cross-ocean database call, and record the chosen region in traces.',
  gotchas: [
    'Measure end-to-end latency with real data placement before adopting edge execution.',
    'Require your agent to verify every runtime API and package against provider documentation.',
    'Keep authorization fail-closed when configuration or regional data is unavailable.'
  ],
  vibe_coder_default: 'Use Cloudflare Workers for small globally distributed request logic; keep database-heavy application code near its primary data.',
  quiz: {
    question: 'When is edge compute most likely to help?',
    options: ['Small request logic with nearby data', 'A transaction against one distant database', 'A long CPU-heavy video render'],
    answer: 'Small request logic with nearby data',
    explanation: 'Edge placement helps when both the computation and its required data avoid long network trips.'
  },
  sources: [
    { url: 'https://developers.cloudflare.com/workers/reference/how-workers-works/', checked: '2026-07-17' },
    { url: 'https://developers.cloudflare.com/workers/platform/limits/', checked: '2026-07-17' },
    { url: 'https://developers.cloudflare.com/workers/observability/', checked: '2026-07-17' }
  ]
} satisfies Landmark;
