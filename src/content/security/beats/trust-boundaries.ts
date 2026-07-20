import type { BeatSequence } from '../../beats/schema.ts';

// E-005 transfer landmark (frozen DESIGN_CONTRACT §12 transfer gate).
// Copy loyalty: derived strictly from src/content/security/trust-boundaries.ts —
// no new security facts. Same grammar as the pilot; zero landmark-specific UI branches.
export const sequence: BeatSequence = {
  regionId: 'security',
  landmarkId: 'trust-boundaries',
  beats: [
    {
      id: 'hook',
      type: 'hook',
      prompt: 'Every boundary turns assumptions into checks.',
      estimatedSeconds: 10,
    },
    {
      id: 'predict-boundary',
      type: 'predict',
      prompt: 'Your agent can read customer documents and issue refunds through a tool. Where should trust stop?',
      options: [
        { id: 'at-tool', label: 'At the tool call — validate arguments and authorize before acting', feedback: 'That instinct is right. Model output crosses a boundary and cannot replace application checks.' },
        { id: 'at-prompt', label: 'At the prompt — clear instructions are enough', feedback: 'Prompts help, but instructions are not a boundary check. Keep going.' },
        { id: 'at-model', label: 'Inside the model — it already chose carefully', feedback: 'Models do not own authz. Treat their output as untrusted until verified.' },
      ],
      correctOptionId: 'at-tool',
      hint: 'Who verifies identity, amount, and authority before money moves?',
      estimatedSeconds: 20,
    },
    {
      id: 'reveal-definition',
      type: 'reveal',
      prompt: 'What a trust boundary actually is.',
      cards: [
        'A trust boundary is where data or control crosses between differently trusted actors or systems.',
        'Browsers, webhooks, uploaded files, retrieved documents, and model output stay untrusted until the receiving boundary verifies them.',
      ],
      estimatedSeconds: 25,
    },
    {
      id: 'scenario-refund',
      type: 'scenario',
      prompt: 'A support agent reads customer documents and can issue refunds through a tool. Your move before the refund fires?',
      options: [
        { id: 'trust-doc', label: 'Follow document instructions and call the refund tool', feedback: 'Retrieved text can carry prompt injection. Treat documents as data, not authority.' },
        { id: 'validate-authz', label: 'Validate tool arguments, authorize the customer and amount, require confirmation', feedback: 'Right. Authenticate, authorize, and validate every crossing before privileged actions.' },
        { id: 'prompt-only', label: 'Add a stronger system prompt and let the agent proceed', feedback: 'Prompts are not a substitute for boundary checks. Validate and authorize in code.' },
      ],
      correctOptionId: 'validate-authz',
      hint: 'What would stop a forged or injected refund request?',
      estimatedSeconds: 45,
    },
    {
      id: 'gotcha-trap',
      type: 'gotcha',
      prompt: 'Spot the trap: which of these skips a real boundary check?',
      options: [
        { id: 'verify-webhook', label: 'Verify webhook signatures and replay protections before changing state', feedback: 'That is a real boundary check — keep it.' },
        { id: 'trust-model-args', label: 'Treat model-chosen tool arguments as trusted because the model selected them', feedback: 'Caught it. Model output crosses a trust boundary and needs validation and authorization.' },
        { id: 'schema-validate', label: 'Schema-validate uploaded content before parsers or models see it', feedback: 'Validation at the boundary is correct practice.' },
      ],
      correctOptionId: 'trust-model-args',
      hint: 'What replaces application checks with model confidence?',
      estimatedSeconds: 25,
    },
    {
      id: 'default-boundaries',
      type: 'default',
      prompt: 'Draw browser, server, database, third-party, and model/tool boundaries, then authenticate, authorize, and validate every crossing.',
      estimatedSeconds: 15,
    },
    {
      id: 'check-quiz',
      type: 'check',
      prompt: 'Prove it: how should a model tool handler treat arguments produced by the model?',
      hint: 'Model output is not authority.',
      estimatedSeconds: 20,
    },
    {
      id: 'recap',
      type: 'recap',
      prompt: 'Trust boundaries turn assumptions into checks when agents move fast.',
      bullets: [
        'A trust boundary is where data or control crosses differently trusted systems.',
        'Browsers, webhooks, uploads, retrieved docs, and model output stay untrusted until verified.',
        'Authenticate, authorize, and validate every crossing — prompts are not enough.',
      ],
      estimatedSeconds: 20,
    },
  ],
};
