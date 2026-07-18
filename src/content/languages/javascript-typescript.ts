import type { Landmark } from '../schema.ts';

export const landmark = {
  id: 'javascript-typescript',
  title: 'JavaScript and TypeScript',
  draft: false,
  hook: 'One web runtime, with contracts when you need them.',
  definition: 'JavaScript is the web\'s native programming language and also runs on servers. TypeScript adds static types, then compiles to JavaScript, helping you catch mismatched assumptions before execution.',
  when_to_use: [
    'You are building an interactive web interface.',
    'You want one language across a browser app and its server.',
    'Your agent is changing a growing codebase with shared data shapes.',
    'You need the broad JavaScript package ecosystem.'
  ],
  tradeoffs: {
    pros: ['Runs directly in every modern browser.', 'TypeScript catches many interface mistakes before runtime.', 'One ecosystem can cover frontend, backend, and tooling.'],
    cons: ['Types do not validate untrusted runtime data.', 'Tooling and package choices can add substantial complexity.']
  },
  example: 'A booking app shares appointment shapes between its React interface and API. Tell your agent to use strict TypeScript, validate incoming JSON at the API boundary, and keep browser-only code separate from server secrets.',
  gotchas: ['Require runtime validation for forms, webhooks, and API responses.', 'Review generated asynchronous code for missing awaits and swallowed errors.', 'Keep secrets and privileged package calls out of browser bundles.'],
  vibe_coder_default: 'Use strict TypeScript for agent-written web apps; choose plain JavaScript only for a small script where type tooling adds more weight than safety.',
  quiz: {
    question: 'What should protect a TypeScript API from malformed incoming JSON?',
    options: ['A runtime schema at the boundary', 'A TypeScript interface alone', 'A browser console warning'],
    answer: 'A runtime schema at the boundary',
    explanation: 'TypeScript checks code during development, but external data still needs validation while the app runs.'
  },
  sources: [
    { url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript', checked: '2026-07-17' },
    { url: 'https://www.typescriptlang.org/docs/', checked: '2026-07-17' },
    { url: 'https://www.typescriptlang.org/docs/handbook/typescript-from-scratch.html', checked: '2026-07-17' }
  ]
} satisfies Landmark;
