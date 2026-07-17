import type { Landmark } from '../schema.ts';

export const landmark = {
  id: 'vector',
  title: 'Vector',
  draft: false,
  hook: 'Find what means the same thing, not only what uses the same words.',
  definition: 'A vector store indexes numeric embeddings so you can retrieve items by similarity. It powers semantic search and retrieval for AI context, but it does not replace your primary database or prove an answer is correct.',
  when_to_use: [
    'Users search documents with concepts instead of exact keywords.',
    'An AI assistant needs relevant source passages before answering.',
    'You need recommendations based on content similarity.',
    'Keyword search has a measured recall problem that embeddings can address.'
  ],
  tradeoffs: {
    pros: [
      'Semantic retrieval can match related wording.',
      'Metadata filters can narrow retrieval to the right tenant or content type.',
      'pgvector can keep embeddings beside PostgreSQL records.'
    ],
    cons: [
      'Retrieval quality depends on chunking, embeddings, filters, and evaluation.',
      'Embedding and index updates add cost and synchronization work.',
      'Similarity scores are not truth or authorization checks.'
    ]
  },
  example: 'A support copilot searches product manuals before drafting a cited response. Tell your agent to chunk by meaningful sections, filter by product version, return source IDs, and test retrieval against a labeled question set.',
  gotchas: [
    'Keep canonical records in their natural store; index only the text needed for retrieval.',
    'Require tenant and permission filters before similarity search.',
    'Make your agent evaluate missed and irrelevant results before tuning top-k.'
  ],
  vibe_coder_default: 'Start with pgvector inside PostgreSQL; move to Pinecone when a measured scale or managed-vector requirement justifies another service.',
  quiz: {
    question: 'What should a vector index store for a support copilot?',
    options: ['Retrievable manual passages linked to their sources', 'The only copy of customer billing records', 'User passwords for similarity matching'],
    answer: 'Retrievable manual passages linked to their sources',
    explanation: 'Vector search is useful for finding relevant text, while source links preserve traceability.'
  },
  sources: [
    { url: 'https://github.com/pgvector/pgvector', checked: '2026-07-17' },
    { url: 'https://docs.pinecone.io/guides/get-started/overview', checked: '2026-07-17' },
    { url: 'https://docs.pinecone.io/guides/search/filter-by-metadata', checked: '2026-07-17' }
  ]
} satisfies Landmark;
