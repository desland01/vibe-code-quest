import type { Landmark } from '../schema.ts';

export const landmark = {
  id: 'serverless-functions',
  title: 'Serverless functions',
  draft: false,
  hook: 'Bounded backend work without an always-on server.',
  definition: 'Serverless functions run backend code when a request or event arrives. The provider manages the servers, but your code still owns timeouts, retries, data access, and cost.',
  when_to_use: [
    'You need short API handlers for forms, webhooks, or authenticated reads.',
    'Traffic is uneven and an idle server would add needless operating work.',
    'A scheduled task finishes within the provider\'s runtime limits.',
    'Your framework already maps backend routes to managed functions.'
  ],
  tradeoffs: {
    pros: [
      'You deploy handlers without patching an operating system.',
      'Capacity can follow request volume without a server-sizing step.',
      'Each function gives you a narrow deployment and permission boundary.'
    ],
    cons: [
      'Duration, memory, payload, and concurrency limits shape the design.',
      'Cold starts and remote database connections can add latency.',
      'Provider runtimes and event contracts create migration work.'
    ]
  },
  example: 'A booking app receives a payment webhook, verifies its signature, and records the event idempotently. Tell your agent to return quickly, reject unsigned requests, and move slow follow-up work to a durable queue.',
  gotchas: [
    'Check current runtime, duration, payload, and concurrency limits before choosing the request path.',
    'Require your agent to make retries idempotent and cap every outbound call.',
    'Keep functions near their database, and measure connection pressure under bursts.'
  ],
  vibe_coder_default: 'Start with Vercel Functions for bounded handlers in a Vercel web app; choose another runtime when limits or long-lived work conflict with the workload.',
  quiz: {
    question: 'Which workload is the cleanest fit for a serverless function?',
    options: ['A short signed webhook handler', 'A permanent queue consumer', 'A four-hour video encoder'],
    answer: 'A short signed webhook handler',
    explanation: 'Functions fit bounded event work; permanent or long-running processes need a different runtime shape.'
  },
  sources: [
    { url: 'https://vercel.com/docs/functions', checked: '2026-07-17' },
    { url: 'https://vercel.com/docs/functions/limitations', checked: '2026-07-17' },
    { url: 'https://docs.aws.amazon.com/lambda/latest/dg/welcome.html', checked: '2026-07-17' }
  ]
} satisfies Landmark;
