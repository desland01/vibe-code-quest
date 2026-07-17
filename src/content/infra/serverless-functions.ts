import { createDraftLandmark } from '../draft.ts';

export const landmark = createDraftLandmark("serverless-functions", "Serverless functions", "Serverless functions run bounded backend work on demand without requiring the team to manage servers directly.", {
  "hook": "A low-operations shape for bounded request work.",
  "when_to_use": [
    "Backend work is request-response shaped.",
    "You do not need an always-on worker."
  ],
  "tradeoffs": {
    "pros": [
      "Low server-management burden",
      "Scales per request"
    ],
    "cons": [
      "Runtime and duration limits apply",
      "Long-running work needs another shape"
    ]
  },
  "example": "A route validates a form submission, writes a record, and returns a status.",
  "gotchas": [
    "Check platform limits.",
    "Move long-running jobs outside the request path."
  ],
  "vibe_coder_default": "Use bounded functions for ordinary request handlers and introduce workers only when requirements demand them.",
  "quiz": {
    "question": "What fits a serverless function?",
    "options": [
      "A short form handler",
      "A permanent process",
      "A long media render"
    ],
    "answer": "A short form handler",
    "explanation": "Functions fit bounded request-response work."
  },
  "sources": [
    {
      "url": "https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-concepts.html",
      "checked": "2026-07-17"
    }
  ]
});
