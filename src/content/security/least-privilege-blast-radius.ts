import type { Landmark } from '../schema.ts';

export const landmark = {
  id: 'least-privilege-blast-radius',
  title: 'Least privilege and blast radius',
  draft: false,
  hook: 'Limit what one mistake can reach.',
  definition: 'Least privilege gives each user, service, token, and agent only the authority its current job needs. Smaller scopes, separate environments, and short-lived credentials reduce the blast radius of mistakes or compromise.',
  when_to_use: ['You issue API tokens or cloud roles.', 'An agent can call tools or change external systems.', 'A background worker accesses customer data.', 'Development, preview, and production share infrastructure.'],
  tradeoffs: {
    pros: ['Scoped credentials reduce reachable data and actions.', 'Separate roles make access easier to audit.', 'Short lifetimes limit exposure after theft.'],
    cons: ['Fine-grained policies require maintenance and testing.', 'Overly narrow permissions can interrupt legitimate work.']
  },
  example: 'A media worker needs to read one upload bucket and write thumbnails. Tell your agent to create a worker-specific role for those paths, without database administration or access to unrelated buckets.',
  gotchas: [
    'Reject agent-generated use of owner, admin, wildcard, or production tokens when a narrower role can do the task.',
    'Separate preview and production credentials because agents often reuse the first working token everywhere.',
    'Require confirmation and audit logs for destructive tool actions; model intent is not an authorization policy.'
  ],
  vibe_coder_default: 'Issue separate, short-lived, narrowly scoped tokens per service and environment, with explicit approval for destructive or production actions.',
  quiz: {
    question: 'Which credential should a thumbnail worker receive?',
    options: ['A role limited to required upload and thumbnail paths', 'The cloud account owner token', 'The production database administrator password'],
    answer: 'A role limited to required upload and thumbnail paths',
    explanation: 'The narrow role completes the job while limiting damage from bugs or compromise.'
  },
  sources: [
    { url: 'https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html', checked: '2026-07-17' },
    { url: 'https://docs.github.com/en/actions/security-for-github-actions/security-guides/automatic-token-authentication', checked: '2026-07-17' },
    { url: 'https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions', checked: '2026-07-17' }
  ]
} satisfies Landmark;
