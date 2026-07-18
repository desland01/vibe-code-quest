import type { Landmark } from '../schema.ts';

export const landmark = {
  id: 'trust-boundaries',
  title: 'Trust boundaries',
  draft: false,
  hook: 'Every boundary turns assumptions into checks.',
  definition: 'A trust boundary is where data or control crosses between differently trusted actors or systems. Browsers, webhooks, uploaded files, retrieved documents, and model output stay untrusted until the receiving boundary verifies them.',
  when_to_use: ['You accept browser or mobile requests.', 'A webhook or partner service triggers work.', 'Your agent retrieves documents or calls tools.', 'Uploaded content reaches parsers, storage, or models.'],
  tradeoffs: {
    pros: ['Explicit boundaries reveal missing checks.', 'Layered verification limits one compromised component.', 'Typed contracts make failures easier to test.'],
    cons: ['Boundary checks add code and failure handling.', 'Distributed workflows require careful identity and freshness checks.']
  },
  example: 'A support agent reads customer documents and can issue refunds through a tool. Tell your agent to treat document instructions as data, validate tool arguments, authorize the customer and amount, and require confirmation for the refund.',
  gotchas: [
    'Do not let agent-generated model output select privileged tools or arguments without validation and authorization.',
    'Verify webhook signatures and replay protections before changing state; agents often trust a familiar JSON shape.',
    'Keep retrieved text untrusted because prompt injection can arrive through documents, pages, or messages.'
  ],
  vibe_coder_default: 'Draw browser, server, database, third-party, and model/tool boundaries, then authenticate, authorize, and validate every crossing.',
  quiz: {
    question: 'How should a model tool handler treat arguments produced by the model?',
    options: ['As untrusted input requiring validation and authorization', 'As trusted because the model chose them', 'As safe after prompt instructions'],
    answer: 'As untrusted input requiring validation and authorization',
    explanation: 'Model output crosses a trust boundary and cannot replace application checks.'
  },
  sources: [
    { url: 'https://owasp.org/www-project-threat-modeling/', checked: '2026-07-17' },
    { url: 'https://genai.owasp.org/llmrisk/llm01-prompt-injection/', checked: '2026-07-17' },
    { url: 'https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html', checked: '2026-07-17' }
  ]
} satisfies Landmark;
