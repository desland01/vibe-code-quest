import type { LegalDocument } from './types';

export const privacyContent = {
  title: 'Privacy Policy',
  lastUpdated: '2026-07-28',
  sections: [
    {
      heading: '1. Scope and privacy contact',
      paragraphs: [
        'This Privacy Policy explains how Truline, a trade name of Desmond Landry (“Truline,” “we,” “us,” or “our”), collects, uses, shares, and retains information when you use code-tutor, “A Map for Post-AI Builders.” Privacy, security, and rights requests may be sent to admin@truline.io.'
      ]
    },
    {
      heading: '2. Anonymous sessions and optional email',
      paragraphs: [
        'An essential HTTP-only cookie carries an app-issued anonymous session identity so code-tutor can save your progress. Disabling or clearing that cookie breaks saved progress and account features for the anonymous profile on that device.',
        'You may optionally provide an email address and verify it with a one-time passcode so progress follows you across devices. Email unlocks no paid tier. One-time-passcode challenge records expire within minutes.'
      ]
    },
    {
      heading: '3. Learning and public leaderboard data',
      paragraphs: [
        'We store onboarding preferences, map and landmark progress, chosen learning formats, quiz results, XP awards, and landmark stamps.',
        'The leaderboard is optional. If you join, you choose a public display handle of 3–24 characters. We sanitize handles and reject email addresses, URLs, and phone-like strings. Your handle, rank, and points are visible to anyone viewing the leaderboard. Scores are derived on the server from recorded progress and cannot be set by the browser. You can leave the leaderboard through the service’s self-service controls.',
        'Do not use your real name, email address, or anything else you would not want shown publicly as your handle.'
      ]
    },
    {
      heading: '4. Public share cards',
      paragraphs: [
        'Creating a share card mints an unguessable public link that shows a snapshot of your progress totals. Anyone with the link can view it without signing in.',
        'You can revoke a share link, but copies or screenshots already taken by other people cannot be recalled.'
      ]
    },
    {
      heading: '5. AI guide messages and usage telemetry',
      paragraphs: [
        'When you use the AI guide, your messages and relevant learning context are sent to Vercel AI Gateway and the model providers it routes to. Do not submit secrets, credentials, confidential code, or sensitive personal data.',
        'We record AI request counts, token and cost estimates, access decisions, and timestamps. We use this telemetry to enforce fair-use limits and investigate reliability or abuse.'
      ]
    },
    {
      heading: '6. Product analytics and abuse limits',
      paragraphs: [
        'We use a small, fixed event taxonomy to understand actions such as building or skipping a profile, opening a region or landmark, switching formats, completing a quiz, using the guide, starting or completing a beat, stamping a landmark, earning XP, and creating a share card. Analytics events contain no message text and no email addresses.',
        'To rate-limit leaderboard writes, we store a keyed HMAC hash of the client IP address and session. We never store a raw IP address in that rate-limit table.'
      ]
    },
    {
      heading: '7. How we use information',
      paragraphs: ['We use the information described above to:'],
      items: [
        'provide anonymous sessions, save and synchronize progress, and personalize learning formats;',
        'deliver AI-assisted features and apply fair-use limits;',
        'operate optional leaderboard and share-card features;',
        'secure the service, prevent abuse, debug failures, and maintain reliability;',
        'measure product use and improve the map, lessons, and user experience; and',
        'comply with law and enforce these terms.'
      ]
    },
    {
      heading: '8. Service providers and disclosures',
      paragraphs: [
        'Our current service providers are Neon for hosted Postgres; Vercel for hosting and minimal web analytics; and Vercel AI Gateway plus the model providers it routes to for AI features. We share information with them only as needed to provide those services.',
        'We may also disclose information when required by law, to protect rights or safety, in connection with a business transaction, or at your direction or with your consent. We do not sell personal information.'
      ]
    },
    {
      heading: '9. Essential cookie',
      paragraphs: [
        'code-tutor uses the essential HTTP-only session cookie to recognize your anonymous identity, protect the session, and associate saved progress with the correct profile. The service does not use that cookie to advertise to you.'
      ]
    },
    {
      heading: '10. Data retention and security',
      paragraphs: [
        'We keep profile and progress data while a profile is active and for 12 months after it becomes inactive. We keep usage, cost, analytics, and security logs for 12 months. One-time-passcode records expire within minutes, and backups roll off within 35 days.',
        'We use technical and organizational safeguards designed to protect information, but no system is completely secure.'
      ]
    },
    {
      heading: '11. Your choices and rights',
      paragraphs: [
        'Depending on where you live, you may have rights to access, correct, delete, export, or object to processing of your personal information. Contact admin@truline.io to make a request. We may need to verify your identity before acting.',
        'A purely anonymous profile may be impossible to locate or verify without its session cookie. We will respond to requests as required by applicable law.'
      ]
    },
    {
      heading: '12. Children',
      paragraphs: [
        'code-tutor is not directed to children under 13, and we do not knowingly collect personal information from children under 13. A higher age threshold may apply where you live. If you believe a child provided information, contact admin@truline.io.'
      ]
    },
    {
      heading: '13. International processing',
      paragraphs: [
        'Our service providers may process information outside your country. Privacy protections in those places may differ from the protections where you live.'
      ]
    },
    {
      heading: '14. Policy changes and contact',
      paragraphs: [
        'We may update this Policy as the service or law changes. We will update the date above and provide additional notice for material changes when required.',
        'Questions about this Policy, security reports, and privacy rights requests may be sent to admin@truline.io.'
      ]
    }
  ]
} satisfies LegalDocument;
