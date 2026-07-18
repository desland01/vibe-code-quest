import type { Landmark } from '../schema.ts';

export const landmark = {
  id: 'prd-lite',
  title: 'PRD-lite',
  draft: false,
  hook: 'Shared context keeps separate issues building one product.',
  definition: 'A PRD-lite is a short product brief covering the user, problem, promise, constraints, and success signal. It holds shared context that would become inconsistent if copied into every issue.',
  when_to_use: [
    'Several issues contribute to one user outcome.',
    'Agents need stable product constraints across separate work sessions.',
    'You need to record what success means before choosing implementation details.',
    'Stakeholders agree on the problem but need a compact scope boundary.'
  ],
  tradeoffs: {
    pros: [
      'One brief keeps shared product context consistent.',
      'A success signal exposes disagreements before implementation.',
      'Linked issues can stay focused on their own deliverables.'
    ],
    cons: [
      'The brief becomes misleading when decisions change without an update.',
      'Too much detail turns a lightweight anchor into a maintenance burden.'
    ]
  },
  example: 'A team is adding saved searches through separate database, API, and interface issues. Write a one-page brief naming the target user, retention goal, privacy boundary, and non-goals, then tell each agent to link its issue back to that brief.',
  gotchas: [
    'Keep solution details out unless they are genuine constraints.',
    'Name an owner who updates the brief when a decision changes.',
    'Require your agent to flag conflicts between an issue and the shared brief.'
  ],
  vibe_coder_default: 'Keep a one-page PRD-lite beside the work in GitHub or Linear, and link every related issue to it; expand it only when repeated ambiguity appears.',
  quiz: {
    question: 'What belongs in a PRD-lite shared across several issues?',
    options: ['The user problem, constraints, non-goals, and success signal', 'A transcript of every planning conversation', 'A fixed implementation plan for every file'],
    answer: 'The user problem, constraints, non-goals, and success signal',
    explanation: 'The brief preserves stable product context while each issue owns its specific implementation and evidence.'
  },
  sources: [
    { url: 'https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects/about-projects', checked: '2026-07-17' },
    { url: 'https://linear.app/docs/project-overview', checked: '2026-07-17' },
    { url: 'https://linear.app/docs/project-documents', checked: '2026-07-17' }
  ]
} satisfies Landmark;
