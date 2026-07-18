import type { Landmark } from '../schema.ts';

export const landmark = {
  id: 'dependency-supply-chain',
  title: 'Dependency and supply-chain risk',
  draft: false,
  hook: 'Every install extends who can ship your code.',
  definition: 'Your software supply chain includes dependencies, registries, build actions, and update tooling. Each addition brings code and maintainers into your build, so provenance, pinning, review, and timely patching matter.',
  when_to_use: ['Your agent proposes a new package.', 'A workflow runs third-party build actions.', 'Automated updates change lockfiles.', 'A security advisory affects a direct or transitive dependency.'],
  tradeoffs: {
    pros: ['Maintained dependencies avoid rebuilding mature capabilities.', 'Lockfiles make resolved versions reviewable and reproducible.', 'Automated alerts expose known vulnerable versions.'],
    cons: ['Updates can introduce regressions or compromised code.', 'Audits report known issues, not proof that a package is safe.']
  },
  example: 'An agent proposes a small package to parse one configuration value. Ask it to justify the dependency, inspect maintenance and permissions, preserve the lockfile, and prefer existing platform code when the package adds little value.',
  gotchas: [
    'Do not approve agent-generated install commands until you verify the exact package name, source, version, and need.',
    'Review lockfile and workflow changes because agents often add transitive code or broad third-party action permissions.',
    'Run audits and patch deliberately, but investigate impact instead of applying breaking upgrades blindly.'
  ],
  vibe_coder_default: 'Keep dependencies minimal, commit the lockfile, review additions and update diffs, enable vulnerability alerts, and pin third-party automation to reviewed revisions.',
  quiz: {
    question: 'What should happen before accepting an agent-proposed package?',
    options: ['Verify its identity, need, provenance, and maintenance', 'Install it because the name matches the task', 'Delete the lockfile to get newer transitive versions'],
    answer: 'Verify its identity, need, provenance, and maintenance',
    explanation: 'A dependency executes within your supply chain, so convenience does not replace provenance review.'
  },
  sources: [
    { url: 'https://owasp.org/www-project-software-component-verification-standard/', checked: '2026-07-17' },
    { url: 'https://docs.github.com/en/code-security/dependabot/dependabot-alerts/about-dependabot-alerts', checked: '2026-07-17' },
    { url: 'https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions', checked: '2026-07-17' }
  ]
} satisfies Landmark;
