import type { Landmark } from '../schema.ts';

export const landmark = {
  id: 'hosted-vs-self-hosted-databases',
  title: 'Hosted vs self-hosted',
  draft: false,
  hook: 'Pay with money or pay with operational attention.',
  definition: 'A hosted database delegates backups, updates, and much of availability work to a provider. Self-hosting gives you deeper control, but your team owns patching, recovery, monitoring, and every late-night failure.',
  when_to_use: [
    'Choose hosted when a small team needs to ship without a database operator.',
    'Choose hosted when managed backups and easy branch environments reduce delivery risk.',
    'Consider self-hosting when regulation, networking, or specialized extensions require it.',
    'Consider self-hosting when proven scale economics outweigh staffing and reliability costs.'
  ],
  tradeoffs: {
    pros: [
      'Hosted services reduce routine operational work.',
      'Neon provides managed serverless Postgres with database branching.',
      'Self-hosting offers control over placement, versions, and infrastructure.'
    ],
    cons: [
      'Hosted services introduce provider limits, pricing exposure, and migration friction.',
      'Self-hosting makes backups, upgrades, failover, and monitoring your responsibility.',
      'Either option still needs restore drills and least-privilege access.'
    ]
  },
  example: 'A two-person SaaS team launches on Neon and creates a database branch for risky migration tests. Tell your agent to keep connection strings server-side, configure pooled connections, and document a restore drill before launch.',
  gotchas: [
    'Verify backups by restoring them; a dashboard checkbox is not recovery proof.',
    'Make your agent respect connection limits and use the provider-recommended pooling path.',
    'Do not self-host because a container starts locally; assign patching, alerts, failover, and recovery first.'
  ],
  vibe_coder_default: 'Use managed PostgreSQL on Neon for new apps; consider Supabase when its broader platform is required, and self-host only with a written operational owner and recovery plan.',
  quiz: {
    question: 'What is the sensible database choice for a two-person SaaS team?',
    options: ['Managed PostgreSQL with tested backups', 'Self-hosted PostgreSQL with no on-call owner', 'No persistence because operations are difficult'],
    answer: 'Managed PostgreSQL with tested backups',
    explanation: 'A managed service removes routine work, while restore testing confirms the backup can actually recover data.'
  },
  sources: [
    { url: 'https://neon.com/docs/introduction', checked: '2026-07-17' },
    { url: 'https://neon.com/docs/introduction/branching', checked: '2026-07-17' },
    { url: 'https://neon.com/docs/connect/connection-pooling', checked: '2026-07-17' },
    { url: 'https://supabase.com/docs/guides/database/overview', checked: '2026-07-17' }
  ]
} satisfies Landmark;
