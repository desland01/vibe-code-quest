import type { Landmark } from '../schema.ts';

export const landmark = {
  id: 'managed-platforms',
  title: 'Managed platforms',
  draft: false,
  hook: 'Deploy the service without becoming its infrastructure team.',
  definition: 'A managed application platform builds and runs your service from source code or a container. It handles much of deployment and host operation, while you still own application security, data, scaling choices, and provider limits.',
  when_to_use: [
    'You need an API or worker that does not fit a function runtime.',
    'Your team wants managed deploys, logs, restarts, and service networking.',
    'You need attached databases or background services without operating hosts.',
    'Shipping product work matters more than tuning infrastructure.'
  ],
  tradeoffs: {
    pros: [
      'Source-based deploys reduce host setup and release scripting.',
      'Managed logs, health checks, and restarts cover common operating needs.',
      'Services and managed data products can share one platform workflow.'
    ],
    cons: [
      'Platform build rules, networking, and service contracts create lock-in.',
      'Costs can rise as always-on services and databases multiply.',
      'Deep operating-system or network control may be unavailable.'
    ]
  },
  example: 'A small team runs a web API, a queue worker, PostgreSQL, and a scheduled cleanup job. Tell your agent to declare each process separately, add health checks, keep secrets in platform settings, and prove database backups restore.',
  gotchas: [
    'Review sleep, restart, storage, region, and scaling behavior before launch.',
    'Require your agent to use documented platform configuration instead of invented deployment fields.',
    'Keep data exports and a provider-exit runbook even when deploys are managed.'
  ],
  vibe_coder_default: 'Start with Railway for a small API and worker stack; choose Render when its documented service model better matches your runtime or team workflow.',
  quiz: {
    question: 'Why choose a managed platform over one VPS?',
    options: ['You want managed deploy and service operations', 'You need unrestricted host control', 'You want to patch the operating system yourself'],
    answer: 'You want managed deploy and service operations',
    explanation: 'Managed platforms trade some infrastructure control for a smaller deployment and host-operations burden.'
  },
  sources: [
    { url: 'https://docs.railway.com/guides/services', checked: '2026-07-17' },
    { url: 'https://docs.railway.com/guides/deployments', checked: '2026-07-17' },
    { url: 'https://render.com/docs/web-services', checked: '2026-07-17' },
    { url: 'https://render.com/docs/background-workers', checked: '2026-07-17' }
  ]
} satisfies Landmark;
