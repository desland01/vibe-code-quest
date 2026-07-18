import type { Landmark } from '../schema.ts';

export const landmark = {
  id: 'types-and-contracts', title: 'Types and contracts', draft: false,
  hook: 'Make important assumptions visible and enforceable.',
  definition: 'Types describe the values code expects inside a program. Runtime contracts validate data where trust changes, such as forms, APIs, files, and model output.',
  when_to_use: ['Several components share the same records.', 'Untrusted data enters through an API or form.', 'Your agent changes code across module boundaries.', 'A failure would corrupt data or expose access.'],
  tradeoffs: {
    pros: ['Explicit shapes make generated changes easier to review.', 'Static checks catch many mismatches early.', 'Runtime validation stops invalid external data at boundaries.'],
    cons: ['Duplicate static and runtime definitions can drift.', 'Overly broad or forced types can create false confidence.']
  },
  example: 'A billing webhook updates subscriptions from an external payload. Tell your agent to define one shared contract, validate the payload before database writes, and test missing fields, unknown values, and repeated events.',
  gotchas: ['Ban unchecked casts that silence errors without proving a value.', 'Validate every external boundary even when the client is typed.', 'Review optional and nullable fields against actual business rules.'],
  vibe_coder_default: 'Use strict static types plus runtime schemas at trust boundaries; relax types only around a documented, tested integration constraint.',
  quiz: {
    question: 'Where is runtime validation most important?',
    options: ['Where external data enters your system', 'Inside a constant with a known value', 'Only in editor autocomplete'],
    answer: 'Where external data enters your system',
    explanation: 'Static types cannot prove that network, user, file, or model data matches your assumptions at runtime.'
  },
  sources: [
    { url: 'https://www.typescriptlang.org/docs/handbook/2/everyday-types.html', checked: '2026-07-17' },
    { url: 'https://www.typescriptlang.org/docs/handbook/2/narrowing.html', checked: '2026-07-17' },
    { url: 'https://docs.python.org/3/library/typing.html', checked: '2026-07-17' }
  ]
} satisfies Landmark;
