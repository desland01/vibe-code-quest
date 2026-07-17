import type { Landmark } from '../schema.ts';

export const landmark = {
  id: 'graph',
  title: 'Graph',
  draft: false,
  hook: 'Use a graph when the connections are the product.',
  definition: 'A graph database stores entities as nodes and their connections as relationships. It shines when your core questions follow several relationship hops and those paths would be painful to express or optimize as joins.',
  when_to_use: [
    'You are building fraud detection across accounts, devices, cards, and addresses.',
    'Recommendations depend on several degrees of connection.',
    'Permissions or dependencies form deep, changing networks.',
    'The product must explain the path connecting two entities.'
  ],
  tradeoffs: {
    pros: [
      'Relationship traversal is a first-class operation.',
      'The model maps naturally to networks and paths.',
      'Neo4j supports property graphs and Cypher queries.'
    ],
    cons: [
      'It adds a specialized query language and operational surface.',
      'Ordinary CRUD and tabular reporting may remain clearer in SQL.',
      'Keeping a graph synchronized with a primary store can create consistency work.'
    ]
  },
  example: 'A marketplace flags seller accounts connected through reused devices, payout accounts, and shipping addresses. Tell your agent to model those links explicitly in Neo4j and return the suspicious path, not only a risk score.',
  gotchas: [
    'Prove you need multi-hop traversal before adding a second database.',
    'Make your agent cap traversal depth and profile expensive queries.',
    'Define which store owns each fact before synchronizing SQL and graph data.'
  ],
  vibe_coder_default: 'Keep normal app data in PostgreSQL; add Neo4j only when multi-hop relationship queries are a proven core feature.',
  quiz: {
    question: 'Which feature most strongly suggests a graph database?',
    options: ['Explaining a fraud path across shared devices and accounts', 'Saving a user profile by ID', 'Rendering a static pricing page'],
    answer: 'Explaining a fraud path across shared devices and accounts',
    explanation: 'The value comes from traversing and explaining several kinds of connected entities.'
  },
  sources: [
    { url: 'https://neo4j.com/docs/getting-started/graph-database/', checked: '2026-07-17' },
    { url: 'https://neo4j.com/docs/cypher-manual/current/introduction/', checked: '2026-07-17' },
    { url: 'https://neo4j.com/docs/cypher-manual/current/patterns/', checked: '2026-07-17' }
  ]
} satisfies Landmark;
