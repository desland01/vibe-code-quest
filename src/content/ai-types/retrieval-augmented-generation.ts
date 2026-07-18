import type { Landmark } from '../schema.ts';

export const landmark = {
  id: 'retrieval-augmented-generation',
  title: 'Retrieval-augmented generation',
  draft: false,
  hook: 'Retrieve evidence before asking the model to answer.',
  definition: 'Retrieval-augmented generation, or RAG, finds relevant source material and includes it in a model request. It can ground answers in your data, but retrieval does not guarantee correctness.',
  when_to_use: [
    'Answers must use private documents that were not in model training.',
    'Your source material changes more often than a model release.',
    'Users need citations back to manuals, policies, or records.',
    'A measured search test shows semantic retrieval beats keyword search.'
  ],
  tradeoffs: {
    pros: [
      'You can update source content without training a model.',
      'Returned source IDs can make answers reviewable.',
      'Metadata filters can restrict retrieval by tenant, version, or permission.'
    ],
    cons: [
      'Bad chunking or ranking can hide the needed evidence.',
      'Retrieved text can contain hostile instructions or stale content.',
      'Embedding, indexing, and evaluation add operating cost.'
    ]
  },
  example: 'A benefits assistant answers from plan documents that change each year. Tell your agent to retrieve passages filtered by employer and plan year, cite source IDs, and say when the evidence is insufficient.',
  gotchas: [
    'Apply authorization filters before retrieval, not after generation.',
    'Treat retrieved text as untrusted data and keep it separate from system instructions.',
    'Test retrieval and final answers separately with labeled questions.'
  ],
  vibe_coder_default: 'Start with a small indexed corpus, metadata filters, citations, and a labeled retrieval test; add RAG only when supplied context no longer fits the need.',
  quiz: {
    question: 'What is the safest retrieval rule for a multi-tenant policy assistant?',
    options: ['Filter authorized documents before similarity search', 'Retrieve every tenant and hide citations later', 'Let the model decide which tenant owns a passage'],
    answer: 'Filter authorized documents before similarity search',
    explanation: 'Retrieval is a data-access boundary, so unauthorized passages must never enter the model context.'
  },
  sources: [
    { url: 'https://platform.openai.com/docs/guides/retrieval', checked: '2026-07-17' },
    { url: 'https://docs.pinecone.io/guides/search/filter-by-metadata', checked: '2026-07-17' },
    { url: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/long-context-tips', checked: '2026-07-17' }
  ]
} satisfies Landmark;
