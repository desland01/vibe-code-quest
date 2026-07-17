import { createDraftLandmark } from '../draft.ts';

export const landmark = createDraftLandmark("containers", "Containers", "Containers package an application and its runtime into a repeatable unit for workers and long-running services.", {
  "hook": "A repeatable runtime unit for work that needs more control.",
  "when_to_use": [
    "You need a long-running service or worker.",
    "Runtime binaries and dependencies must be explicit."
  ],
  "tradeoffs": {
    "pros": [
      "Repeatable runtime",
      "Suitable for workers and services"
    ],
    "cons": [
      "Adds operational surface",
      "Scaling remains a separate concern"
    ]
  },
  "example": "A media worker processes uploads outside the web request path.",
  "gotchas": [
    "Keep secrets outside images.",
    "Define persistence and networking explicitly."
  ],
  "vibe_coder_default": "Reach for containers when runtime or execution requirements no longer fit bounded functions.",
  "quiz": {
    "question": "What suggests a container may be useful?",
    "options": [
      "Long-running background processing",
      "A static heading",
      "A button hover"
    ],
    "answer": "Long-running background processing",
    "explanation": "Containers suit controlled, long-lived runtime processes."
  },
  "sources": [
    {
      "url": "https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-container/",
      "checked": "2026-07-17"
    }
  ]
});
