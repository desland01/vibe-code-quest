import { createDraftLandmark } from '../draft.ts';

export const landmark = createDraftLandmark("sql", "SQL", "SQL stores durable records in related tables and is a strong default for transactional applications.", {
  "hook": "The durable database choice that is often right.",
  "when_to_use": [
    "You need related records and transactions.",
    "You need predictable querying and migrations."
  ],
  "tradeoffs": {
    "pros": [
      "Mature relational model",
      "Strong transactional guarantees"
    ],
    "cons": [
      "Schema changes require migrations",
      "Operations still need care"
    ]
  },
  "example": "A client portal relates users, companies, projects, invoices, and messages.",
  "gotchas": [
    "Keep database credentials server-side.",
    "Apply reviewed migrations once users depend on the data."
  ],
  "vibe_coder_default": "Start with PostgreSQL for relational application data, then add abstractions only when they help.",
  "quiz": {
    "question": "Which app is the cleanest fit for SQL?",
    "options": [
      "A static landing page",
      "A client portal with related records",
      "A local image cropper"
    ],
    "answer": "A client portal with related records",
    "explanation": "Relational records and transactions are SQL strengths."
  },
  "sources": [
    {
      "url": "https://www.postgresql.org/docs/current/tutorial-relational.html",
      "checked": "2026-07-17"
    }
  ]
});
