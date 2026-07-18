import type { LegalDocument } from './types';

export const privacyContent = {
  title: 'Privacy Policy',
  lastUpdated: '[LAST UPDATED DATE]',
  sections: [
    {
      heading: '1. Scope and privacy contact',
      paragraphs: [
        'This Privacy Policy explains how [COMPANY LEGAL NAME], operating as code-tutor, collects, uses, shares, and retains information when you use “A Map for Post-AI Builders.” Before launch, direct privacy requests to [CONTACT EMAIL]. The temporary product contact is support@code-tutor.example.'
      ]
    },
    {
      heading: '2. Information we collect',
      paragraphs: ['We collect only the information needed to operate, secure, understand, and improve code-tutor:'],
      items: [
        'Account information: an email address only if you choose to upgrade an anonymous profile, plus records needed to verify the one-time passcode and account status.',
        'Learning information: onboarding preferences, map and landmark progress, format choices, quiz results, and related learning state.',
        'Usage and cost telemetry: AI request counts, token or cost estimates, access decisions, timestamps, and technical identifiers used to enforce limits and investigate reliability or abuse.',
        'Minimal analytics events: activity from the 13-event product taxonomy, such as building or skipping a profile, opening regions or landmarks, switching formats, completing quizzes, using the guide, upgrading, starting a trial, viewing a paywall, subscribing, or creating a share card. Product analytics should not contain message text or email addresses.',
        'Technical information: an anonymous session identifier stored in a cookie, request metadata such as IP address and user agent where received by our systems or hosting providers, and basic error or security logs.',
        'Payment information: if you explicitly subscribe after the trial, Stripe collects and processes payment details. code-tutor does not intend to store full card numbers.'
      ]
    },
    {
      heading: '3. How we use information',
      paragraphs: ['We use information to:'],
      items: [
        'provide anonymous sessions, save progress, personalize learning formats, and merge progress when you verify an email;',
        'deliver AI-assisted features and account for usage and provider costs;',
        'start and manage trials and subscriptions that you request;',
        'secure the service, prevent abuse, enforce limits, debug failures, and maintain reliability;',
        'measure aggregate product use and improve the map, lessons, and user experience; and',
        'comply with law and enforce our agreements.'
      ]
    },
    {
      heading: '4. Service providers and disclosures',
      paragraphs: [
        'We disclose information to service providers only as needed for them to perform services for us. Current or planned providers include Neon for the Postgres database, Vercel for hosting and minimal web analytics, Stripe for test-mode payment and subscription workflows, and Vercel AI Gateway and its underlying model providers for AI-assisted explanations. AI prompts may include your message and relevant learning context, so do not submit secrets, sensitive personal data, or confidential code.',
        'Stripe is currently configured for test mode; test-mode payment data is still processed by Stripe. Provider roles, model routing, and subprocessors may change before launch and must be confirmed during legal review.',
        'We may also disclose information when required by law, to protect rights or safety, in connection with a business transaction, or with your direction or consent. We do not state that we sell personal information.'
      ]
    },
    {
      heading: '5. Cookies',
      paragraphs: [
        'code-tutor uses an essential, HTTP-only session cookie to assign and recognize an anonymous identity, protect the session, and associate saved progress with the correct profile. Disabling this cookie may prevent progress and account features from working. Before launch, this section must be updated if any non-essential cookies or additional tracking technologies are added.'
      ]
    },
    {
      heading: '6. Data retention and security',
      paragraphs: [
        'We retain profile and progress data while a profile is active and for [RETENTION PERIOD] afterward; usage, cost, analytics, security, and billing records are retained for [TELEMETRY RETENTION PERIOD] or as required for legitimate operational, tax, accounting, dispute, and legal needs. OTP verification records expire quickly, although limited security logs may remain for [SECURITY LOG RETENTION PERIOD]. Backups may persist for a limited recovery cycle.',
        'We use technical and organizational safeguards designed to protect information, but no system is completely secure. Final retention schedules and deletion behavior require review before launch.'
      ]
    },
    {
      heading: '7. Your choices and rights',
      paragraphs: [
        'Depending on where you live, you may have rights to access, correct, delete, receive, restrict, or object to certain processing of your personal information, or to appeal a decision. To make a request, contact [CONTACT EMAIL]. We may need to verify your identity before acting. You may also cancel a subscription as described in the Cancellation & Refund Policy.',
        'Anonymous profiles may be difficult to locate or verify without the session cookie or associated email. We will respond as required by applicable law.'
      ]
    },
    {
      heading: '8. Children',
      paragraphs: [
        'code-tutor is not directed to children under 13, and we do not knowingly collect personal information from children under 13. A higher age threshold may apply in [JURISDICTION]. If you believe a child provided information, contact [CONTACT EMAIL].'
      ]
    },
    {
      heading: '9. International use and policy changes',
      paragraphs: [
        'Our providers may process information in countries other than yours. Before launch, [COMPANY LEGAL NAME] must identify its operating location and add any required international transfer disclosures.',
        'We may update this Policy as the service or law changes. We will update the date above and provide additional notice for material changes when required.'
      ]
    },
    {
      heading: '10. Contact',
      paragraphs: [
        'Privacy questions and rights requests may be sent to [CONTACT EMAIL] (launch placeholder: support@code-tutor.example). Add the legal entity name, mailing address, jurisdiction-specific disclosures, and any required representative details before launch.'
      ]
    }
  ]
} satisfies LegalDocument;
