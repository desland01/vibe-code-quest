import type { Landmark } from '../schema.ts';

export const landmark = {
  id: 'secrets-and-environment',
  title: 'Secrets and environment',
  draft: false,
  hook: 'A secret copied into code is already exposed.',
  definition: 'Secrets are credentials that grant access to systems or data. Keep them out of source, browsers, prompts, and logs, then load them server-side from protected environment or secret stores.',
  when_to_use: [
    'You connect a server to a database or paid API.',
    'You sign sessions, webhooks, or encrypted data.',
    'Your build or deployment needs provider credentials.',
    'You give an agent access to test or production services.'
  ],
  tradeoffs: {
    pros: ['Secret stores separate credentials from code.', 'Rotation can limit damage after exposure.', 'Environment-specific credentials keep development away from production.'],
    cons: ['Rotation and access policies require operating discipline.', 'Missing or mis-scoped secrets can break builds and deployments.']
  },
  example: 'A booking app needs database and email credentials. Tell your agent to read named environment variables only in server code, fail closed when they are absent, and document rotation without printing values.',
  gotchas: [
    'Reject agent-generated examples that hardcode real credentials or expose server secrets through public environment prefixes.',
    'Review logs, error payloads, prompts, and build output because agents often add debugging that leaks values.',
    'Rotate an exposed credential and inspect its use; deleting it from the latest commit does not erase history.'
  ],
  vibe_coder_default: 'Use environment variables backed by your deployment platform secret manager, with separate scoped credentials for development, preview, and production.',
  quiz: {
    question: 'Where should a production database credential be available?',
    options: ['Only in server-side runtime configuration', 'In a public browser environment variable', 'Inside the repository README'],
    answer: 'Only in server-side runtime configuration',
    explanation: 'The server needs the credential, while browsers, source history, and documentation are disclosure paths.'
  },
  sources: [
    { url: 'https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html', checked: '2026-07-17' },
    { url: 'https://vercel.com/docs/environment-variables', checked: '2026-07-17' },
    { url: 'https://docs.github.com/en/code-security/secret-scanning/introduction/about-secret-scanning', checked: '2026-07-17' }
  ]
} satisfies Landmark;
