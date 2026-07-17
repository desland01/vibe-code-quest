import type { Landmark } from '../schema.ts';

export const landmark = {
  id: 'sql',
  title: 'SQL',
  draft: false,
  hook: 'The durable database choice that is often right.',
  definition: 'SQL databases store durable records in tables with explicit relationships. They are a strong default when your app needs transactions, constraints, and flexible queries across connected data.',
  when_to_use: [
    'You need related records such as users, teams, projects, and invoices.',
    'Several writes must succeed or fail together.',
    'You need reporting or filters that cross multiple kinds of records.',
    'Your data rules matter more than accepting any document shape.'
  ],
  tradeoffs: {
    pros: [
      'Transactions protect multi-step changes.',
      'Constraints catch invalid data at the database boundary.',
      'Joins support questions you did not predict when designing the schema.'
    ],
    cons: [
      'Schema changes require reviewed migrations.',
      'Indexes and slow queries still need deliberate maintenance.'
    ]
  },
  example: 'A client portal relates users, companies, projects, invoices, and messages. Tell your agent to model those relationships in PostgreSQL, enforce ownership with constraints, and wrap invoice creation in a transaction.',
  gotchas: [
    'Keep database credentials and privileged queries server-side.',
    'Require your agent to generate and review migrations; never let it edit production tables ad hoc.',
    'Add indexes from measured query patterns, not guesses.'
  ],
  vibe_coder_default: 'Start with PostgreSQL for application records, and keep it until a measured need proves another store fits better.',
  quiz: {
    question: 'Which app is the cleanest fit for SQL?',
    options: ['A client portal with related records and invoices', 'A static landing page with no saved data', 'A local image cropper'],
    answer: 'A client portal with related records and invoices',
    explanation: 'Related records, constraints, and transactional billing changes are core SQL strengths.'
  },
  sources: [
    { url: 'https://www.postgresql.org/docs/current/tutorial-concepts.html', checked: '2026-07-17' },
    { url: 'https://www.postgresql.org/docs/current/tutorial-transactions.html', checked: '2026-07-17' },
    { url: 'https://www.postgresql.org/docs/current/ddl-constraints.html', checked: '2026-07-17' }
  ]
} satisfies Landmark;
