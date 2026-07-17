import type { Landmark } from '../schema.ts';

export const landmark = {
  id: 'nosql-document',
  title: 'NoSQL document',
  draft: false,
  hook: 'Keep one thing together when rows would pull it apart.',
  definition: 'A document database stores records as nested, JSON-like documents instead of related tables. It works well when each document is usually read as a whole and shapes vary, but it shifts more consistency work into your application.',
  when_to_use: [
    'Each record is a self-contained catalog item, form response, or content entry.',
    'Different records legitimately have different optional fields.',
    'Your access patterns mostly fetch one document by its ID or a known field.',
    'You need Firebase Firestore client sync for a mobile or web experience.'
  ],
  tradeoffs: {
    pros: [
      'Nested data can match the object your interface already uses.',
      'Flexible fields make uneven record shapes easier to represent.',
      'MongoDB and Firestore provide managed document-database options.'
    ],
    cons: [
      'Duplicated data can drift across documents.',
      'Cross-document relationships and reporting become awkward sooner than agents expect.',
      'Flexible shape does not remove the need for validation and migrations.'
    ]
  },
  example: 'A field-inspection app stores one report with its answers, photos, device details, and optional equipment fields. Tell your agent to keep the report self-contained, validate every write, and document which fields are queryable.',
  gotchas: [
    'Make your agent design access patterns before choosing document keys and indexes.',
    'Validate document shape at every write boundary; schema flexibility is not permission for random fields.',
    'Do not embed unbounded arrays that grow forever.'
  ],
  vibe_coder_default: 'Use PostgreSQL by default; choose MongoDB for genuinely document-shaped server data or Firebase Firestore when its client sync is the deciding requirement.',
  quiz: {
    question: 'Which workload best fits a document database?',
    options: ['Self-contained inspection reports with varying fields', 'A ledger requiring many relational constraints', 'A page with no persistent data'],
    answer: 'Self-contained inspection reports with varying fields',
    explanation: 'Each report is usually handled as one nested record, and optional fields can vary by inspection type.'
  },
  sources: [
    { url: 'https://www.mongodb.com/docs/manual/core/document/', checked: '2026-07-17' },
    { url: 'https://www.mongodb.com/docs/manual/data-modeling/', checked: '2026-07-17' },
    { url: 'https://firebase.google.com/docs/firestore/data-model', checked: '2026-07-17' },
    { url: 'https://firebase.google.com/docs/firestore/query-data/indexing', checked: '2026-07-17' }
  ]
} satisfies Landmark;
