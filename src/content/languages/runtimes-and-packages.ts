import type { Landmark } from '../schema.ts';

export const landmark = {
  id: 'runtimes-and-packages', title: 'Runtimes and packages', draft: false,
  hook: 'Your code ships with an environment and a supply chain.',
  definition: 'A runtime executes your code and defines available APIs. Packages add reusable code, but each dependency also brings versions, permissions, maintenance, and supply-chain risk.',
  when_to_use: ['Your app needs server APIs unavailable in the browser.', 'A maintained package solves a complex standard problem.', 'You must reproduce development behavior in deployment.', 'Your agent proposes adding or upgrading a dependency.'],
  tradeoffs: {
    pros: ['Runtimes provide stable execution APIs.', 'Packages can avoid rebuilding mature, tested capabilities.', 'Lockfiles make resolved dependency versions reproducible.'],
    cons: ['Runtime differences can cause deployment-only failures.', 'Dependencies add security, upgrade, and abandonment risk.']
  },
  example: 'A Node.js service generates invoices and sends them through a provider API. Tell your agent to target the deployed Node version, choose maintained packages sparingly, commit the lockfile, and keep credentials in server environment variables.',
  gotchas: ['Confirm every generated API exists in the deployed runtime version.', 'Review package ownership, maintenance, permissions, and transitive dependencies before adding it.', 'Run security checks and tests before accepting an automated upgrade.'],
  vibe_coder_default: 'Use the deployment platform\'s supported Node.js LTS line and npm lockfiles for web services; add a package only when its maintenance cost beats owning the code.',
  quiz: {
    question: 'What should you verify when an agent adds a package?',
    options: ['Its need, maintenance, permissions, and locked version', 'Only whether its name sounds familiar', 'Only whether installation succeeds'],
    answer: 'Its need, maintenance, permissions, and locked version',
    explanation: 'A dependency becomes part of your operational and security surface, not merely a convenient import.'
  },
  sources: [
    { url: 'https://nodejs.org/en/learn/getting-started/introduction-to-nodejs', checked: '2026-07-17' },
    { url: 'https://docs.npmjs.com/about-packages-and-modules', checked: '2026-07-17' },
    { url: 'https://docs.npmjs.com/cli/commands/npm-ci', checked: '2026-07-17' },
    { url: 'https://docs.npmjs.com/auditing-package-dependencies-for-security-vulnerabilities', checked: '2026-07-17' }
  ]
} satisfies Landmark;
