import type { Landmark } from '../schema.ts';

export const landmark = {
  id: 'input-validation-and-injection',
  title: 'Input validation and injection',
  draft: false,
  hook: 'Validate meaning, then use APIs that preserve it.',
  definition: 'Input validation checks untrusted data against an expected type, shape, length, and range. Injection happens when data is interpreted as commands, so safe APIs must keep values separate from SQL, HTML, shell, and other executable syntax.',
  when_to_use: ['A route accepts forms, JSON, query strings, or headers.', 'User values reach database queries or rendered HTML.', 'Uploads or URLs trigger parsers and network requests.', 'Model output becomes a query, command, or tool call.'],
  tradeoffs: {
    pros: ['Schema validation rejects malformed data early.', 'Parameterized queries separate SQL values from syntax.', 'Allowlisted formats make boundary behavior testable.'],
    cons: ['Schemas must evolve with legitimate inputs.', 'Validation alone cannot make dangerous interpreters safe.']
  },
  example: 'A reporting endpoint filters invoices by customer and date. Tell your agent to parse the request with a server schema, enforce allowed ranges, and bind values through parameterized queries.',
  gotchas: [
    'Reject agent-generated string concatenation for SQL or shell commands, even when earlier validation looks strict.',
    'Validate again at the server boundary because client schemas and hidden fields are not security controls.',
    'Constrain model-generated tool arguments with schemas and allowlists; prompt instructions do not prevent injection.'
  ],
  vibe_coder_default: 'Validate every server boundary with a shared schema, use parameterized queries, and avoid invoking shells or interpreters with untrusted values.',
  quiz: {
    question: 'What is the safe default for a user value in a SQL query?',
    options: ['Bind it as a query parameter', 'Concatenate it after escaping quotes', 'Ask the model whether it looks safe'],
    answer: 'Bind it as a query parameter',
    explanation: 'Parameters preserve the boundary between SQL syntax and untrusted values.'
  },
  sources: [
    { url: 'https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html', checked: '2026-07-17' },
    { url: 'https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html', checked: '2026-07-17' },
    { url: 'https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/XSS', checked: '2026-07-17' }
  ]
} satisfies Landmark;
