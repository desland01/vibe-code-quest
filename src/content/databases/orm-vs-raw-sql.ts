import type { Landmark } from '../schema.ts';

export const landmark = {
  id: 'orm-vs-raw-sql',
  title: 'ORM vs raw SQL',
  draft: false,
  hook: 'Use the abstraction until the query needs to speak for itself.',
  definition: 'An ORM gives application code typed models, query builders, and migration workflows. Raw SQL gives direct access to database features and query shape; healthy projects often use both instead of treating the choice as permanent.',
  when_to_use: [
    'Use an ORM for routine create, read, update, and delete flows.',
    'Use raw SQL for complex reports, bulk operations, or database-specific features.',
    'Use an ORM when generated types reduce drift between code and schema.',
    'Drop to SQL when you need to inspect and tune the exact query plan.'
  ],
  tradeoffs: {
    pros: [
      'ORMs reduce repetitive mapping code.',
      'Typed query APIs catch many mistakes before runtime.',
      'Raw SQL exposes the database without abstraction leaks.'
    ],
    cons: [
      'Agents can generate inefficient ORM queries that look harmless.',
      'Raw SQL needs careful parameterization and result typing.',
      'ORM migrations still require human review.'
    ]
  },
  example: 'A subscription app uses Drizzle for accounts, plans, and ordinary updates, then uses a parameterized SQL query for a monthly retention report. Tell your agent to show the generated SQL and query plan before optimizing either path.',
  gotchas: [
    'Require parameterized queries; never interpolate user input into SQL strings.',
    'Make your agent inspect generated queries for N+1 reads and missing indexes.',
    'Review every generated migration before it touches shared data.'
  ],
  vibe_coder_default: 'Use Drizzle for TypeScript projects that want a SQL-shaped typed API; choose Prisma when its generated client and workflow fit the team, then allow reviewed raw SQL for exceptional queries.',
  quiz: {
    question: 'What is the best response to one complex reporting query in an ORM-based app?',
    options: ['Use reviewed parameterized SQL for that query', 'Replace the entire data layer immediately', 'Build the SQL by concatenating user input'],
    answer: 'Use reviewed parameterized SQL for that query',
    explanation: 'ORM and raw SQL can coexist, and a bounded escape hatch preserves clarity without a rewrite.'
  },
  sources: [
    { url: 'https://orm.drizzle.team/docs/overview', checked: '2026-07-17' },
    { url: 'https://orm.drizzle.team/docs/sql', checked: '2026-07-17' },
    { url: 'https://www.prisma.io/docs/orm', checked: '2026-07-17' },
    { url: 'https://www.prisma.io/docs/orm/prisma-client/using-raw-sql/raw-queries', checked: '2026-07-17' }
  ]
} satisfies Landmark;
