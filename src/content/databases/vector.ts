import { createDraftLandmark } from '../draft.ts';

export const landmark = createDraftLandmark("vector", "Vector", "Vector storage supports meaning-based retrieval over embedded content for search and AI context.", {
  "hook": "The retrieval shape for semantic search.",
  "when_to_use": [
    "You need meaning-based search over documents.",
    "You need retrieved context for an AI answer."
  ],
  "tradeoffs": {
    "pros": [
      "Supports semantic recall",
      "Can complement relational storage"
    ],
    "cons": [
      "Does not replace relational data",
      "Quality depends on chunking and evaluation"
    ]
  },
  "example": "A proposal assistant retrieves relevant call notes before drafting an answer.",
  "gotchas": [
    "Evaluate retrieval quality.",
    "Preserve source links when retrieved text supports an answer."
  ],
  "vibe_coder_default": "Keep primary records in their natural store and add vector retrieval only for a measured semantic-search need.",
  "quiz": {
    "question": "When are vectors relevant?",
    "options": [
      "Meaning-based document retrieval",
      "A contact form",
      "A CSS hover state"
    ],
    "answer": "Meaning-based document retrieval",
    "explanation": "Vectors support similarity retrieval rather than generic application storage."
  },
  "sources": [
    {
      "url": "https://github.com/pgvector/pgvector",
      "checked": "2026-07-17"
    }
  ]
});
