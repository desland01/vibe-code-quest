import type { Landmark } from '../schema.ts';

export const landmark = {
  id: 'static-cdn',
  title: 'Static + CDN',
  draft: false,
  hook: 'Prebuilt files make the safest backend unnecessary.',
  definition: 'Static hosting serves files built before a visitor requests them. A content delivery network caches those files near users, which suits public pages without request-time application logic.',
  when_to_use: [
    'You are publishing documentation, a portfolio, or a marketing site.',
    'Content changes during a deploy instead of per visitor.',
    'Pages can call separate APIs for the few dynamic actions they need.',
    'You want a small attack surface and globally cached assets.'
  ],
  tradeoffs: {
    pros: [
      'Prebuilt files need little request-time infrastructure.',
      'CDN caching can serve assets close to users.',
      'Versioned deploys make rollback straightforward.'
    ],
    cons: [
      'Personalized or private pages need another execution path.',
      'Large content sets can make builds slow or invalidation complex.',
      'Stale caches can hide updates without clear cache rules.'
    ]
  },
  example: 'A product handbook publishes versioned guides and release notes from a repository. Tell your agent to prebuild every public route, fingerprint assets, define cache headers, and send feedback forms to a separate authenticated endpoint.',
  gotchas: [
    'Exclude secrets and private records from build output and source maps.',
    'Require your agent to define cache invalidation and verify headers after deployment.',
    'Test direct navigation, missing pages, and old asset URLs after each release.'
  ],
  vibe_coder_default: 'Use Cloudflare Pages for public sites that build to static files; add server code only for a specific request-time need.',
  quiz: {
    question: 'Which project best fits static hosting with a CDN?',
    options: ['A public versioned product handbook', 'A private live trading dashboard', 'A stateful multiplayer game server'],
    answer: 'A public versioned product handbook',
    explanation: 'Public content that changes at build time can be prebuilt and cached without a request-time backend.'
  },
  sources: [
    { url: 'https://developers.cloudflare.com/pages/', checked: '2026-07-17' },
    { url: 'https://developers.cloudflare.com/cache/concepts/default-cache-behavior/', checked: '2026-07-17' },
    { url: 'https://vercel.com/docs/cdn-cache', checked: '2026-07-17' }
  ]
} satisfies Landmark;
