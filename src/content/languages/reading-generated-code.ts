import type { Landmark } from '../schema.ts';

export const landmark = {
  id: 'reading-generated-code', title: 'Reading code you did not write', draft: false,
  hook: 'Syntax is the road sign, not the road.',
  definition: 'Reading code means tracing what enters, what changes, what leaves, and how failure behaves. Agents reduce the need to memorize syntax, but they increase your need to verify generated behavior.',
  when_to_use: ['Your agent proposes code before you merge it.', 'A change touches authentication, money, or stored data.', 'Tests pass but the behavior still surprises you.', 'Generated code calls an unfamiliar API or package.'],
  tradeoffs: {
    pros: ['Behavior-first reading works across programming languages.', 'Focused tracing exposes hidden side effects and trust boundaries.', 'Verification lets you delegate implementation without delegating ownership.'],
    cons: ['Careful review takes time and domain context.', 'Plausible code can hide failures outside the tested path.']
  },
  example: 'An agent adds a route that deletes a project. Ask it to mark authentication, authorization, database writes, and error paths; then trace one allowed request and one forbidden request before running the tests.',
  gotchas: ['Trace inputs through validation, authorization, side effects, and outputs.', 'Check unfamiliar APIs against official documentation; agents can invent plausible methods.', 'Read the tests for missing failure paths instead of treating green checks as complete proof.'],
  vibe_coder_default: 'Read generated code by behavior and risk: inspect every trust boundary and side effect, then use tests and official docs to verify your model.',
  quiz: {
    question: 'What is the strongest first pass over an unfamiliar generated function?',
    options: ['Trace inputs, side effects, outputs, and failures', 'Memorize every keyword it uses', 'Assume passing syntax means correct behavior'],
    answer: 'Trace inputs, side effects, outputs, and failures',
    explanation: 'This reveals the function\'s real contract and risks even when the language syntax is unfamiliar.'
  },
  sources: [
    { url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/What_is_JavaScript', checked: '2026-07-17' },
    { url: 'https://www.typescriptlang.org/docs/handbook/2/functions.html', checked: '2026-07-17' },
    { url: 'https://docs.python.org/3/tutorial/errors.html', checked: '2026-07-17' }
  ]
} satisfies Landmark;
