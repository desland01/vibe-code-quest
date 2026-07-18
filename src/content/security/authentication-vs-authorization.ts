import type { Landmark } from '../schema.ts';

export const landmark = {
  id: 'authentication-vs-authorization',
  title: 'Authentication vs authorization',
  draft: false,
  hook: 'Knowing who is there does not grant access.',
  definition: 'Authentication establishes an actor’s identity. Authorization decides whether that actor may perform this action on this specific resource, and must be enforced server-side.',
  when_to_use: ['You add sign-in or session handling.', 'Users own private records or belong to teams.', 'Staff and customers have different capabilities.', 'An API accepts identifiers supplied by a browser or agent.'],
  tradeoffs: {
    pros: ['Separate checks make access rules explicit.', 'Server enforcement protects every client path.', 'Resource-level rules prevent users from crossing ownership boundaries.'],
    cons: ['Every route and background job needs policy coverage.', 'Roles alone may not express ownership or tenant boundaries.']
  },
  example: 'A project dashboard lets members view only their company’s projects. Tell your agent to authenticate the session, then authorize company membership and project access on every server route.',
  gotchas: [
    'Reject agent-generated code that hides a button but leaves its server action callable.',
    'Test another user’s valid record ID because agents often check login without checking ownership.',
    'Deny by default when identity, policy, or resource context is missing.'
  ],
  vibe_coder_default: 'Authenticate with a maintained server-side session system, then enforce authorization on every route and resource access with deny-by-default policies.',
  quiz: {
    question: 'A signed-in user requests another company’s invoice. What must the server do?',
    options: ['Check the user may access that invoice', 'Trust the hidden invoice link', 'Allow access because the user is authenticated'],
    answer: 'Check the user may access that invoice',
    explanation: 'Authentication identifies the user; resource-level authorization decides whether this invoice is permitted.'
  },
  sources: [
    { url: 'https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html', checked: '2026-07-17' },
    { url: 'https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html', checked: '2026-07-17' },
    { url: 'https://owasp.org/Top10/A01_2021-Broken_Access_Control/', checked: '2026-07-17' }
  ]
} satisfies Landmark;
