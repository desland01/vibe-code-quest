import type { LegalDocument } from './types';

export const termsContent = {
  title: 'Terms of Service',
  lastUpdated: '2026-07-28',
  sections: [
    {
      heading: '1. Who we are and what these terms cover',
      paragraphs: [
        'These Terms of Service govern your use of code-tutor, “A Map for Post-AI Builders,” operated by Truline, a trade name of Desmond Landry (“Truline,” “we,” “us,” or “our”). code-tutor is a free, open-source educational service with an interactive learning map, progress tools, quizzes, and AI-assisted explanations for people building software with AI agents.',
        'By using code-tutor, you agree to these Terms. If you do not agree, do not use the service.'
      ]
    },
    {
      heading: '2. The service is free',
      paragraphs: [
        'code-tutor is free to use. We do not charge you, offer a paid tier, run a trial that later becomes paid, provide a checkout, collect a payment card, or create a billing account.',
        'Using the service does not create any present or future obligation to pay Truline.'
      ]
    },
    {
      heading: '3. Fair-use limits for AI features',
      paragraphs: [
        'AI calls cost Truline money, so AI features have fair-use daily limits per profile, per device, and across the service. We may adjust those limits to keep the free service reliable and available.',
        'Reaching an AI limit never blocks learning. The landmark falls back to its canonical written explanation, and you can still finish every landmark, quiz, and stamp.'
      ]
    },
    {
      heading: '4. Eligibility',
      paragraphs: [
        'You must be able to form a binding contract under the laws of the State of Florida, United States, to use the service. If you use code-tutor for an organization, you represent that you have authority to accept these Terms for that organization.',
        'The service is not directed to children under 13. A higher minimum age may apply where you live.'
      ]
    },
    {
      heading: '5. Anonymous use and optional email',
      paragraphs: [
        'You may use code-tutor anonymously. An app-issued anonymous session identity lets the service save progress on that device.',
        'You may optionally provide an email address and verify it with a one-time passcode so your progress follows you across devices. Email does not provide a paid tier. You are responsible for access to your email and for activity under your profile.',
        'Do not share verification codes or try to access another person’s profile. Contact admin@truline.io if you believe your profile has been compromised.'
      ]
    },
    {
      heading: '6. Public leaderboard handles and share links',
      paragraphs: [
        'Joining the leaderboard is optional. If you join, the handle you choose and your server-derived rank and points are visible to anyone who views the leaderboard. Do not use a real name, email address, phone number, or anything else you would not want shown publicly.',
        'A share card creates an unguessable public link showing a snapshot of progress totals. Anyone with the link can view it without signing in. You can revoke the link, but copies already taken by other people cannot be recalled.'
      ]
    },
    {
      heading: '7. Acceptable use',
      paragraphs: ['You agree not to misuse code-tutor or help anyone else do so. In particular, you must not:'],
      items: [
        'break the law, infringe another person’s rights, or submit harmful or unlawful material;',
        'probe, bypass, disable, or interfere with security, fair-use limits, access controls, or service operation;',
        'use automated means to scrape, overload, or extract the service or its content without written permission;',
        'impersonate another person or mislead people about your identity through a leaderboard handle;',
        'submit secrets, credentials, confidential code, or sensitive personal data to the AI guide;',
        'reverse engineer the hosted service except where applicable law expressly permits it; or',
        'misrepresent AI-generated material as verified professional guidance.'
      ]
    },
    {
      heading: '8. Educational and AI-generated content',
      paragraphs: [
        'code-tutor is an educational tool, not a substitute for professional advice. Explanations, recommendations, quizzes, and other material—including content generated or adapted by AI—may be incomplete, outdated, or inaccurate. Always review outputs, test code, verify important claims against authoritative sources, and use qualified professionals when legal, financial, medical, security, or other high-stakes advice is needed.',
        'You are responsible for decisions, code, systems, and outcomes produced using information from the service.'
      ]
    },
    {
      heading: '9. Availability and warranties',
      paragraphs: [
        'To the maximum extent permitted by law, code-tutor is provided “as is” and “as available.” Truline disclaims all warranties, express or implied, including merchantability, fitness for a particular purpose, non-infringement, accuracy, and uninterrupted availability. Some jurisdictions do not allow certain disclaimers, so parts of this section may not apply to you.'
      ]
    },
    {
      heading: '10. Limitation of liability',
      paragraphs: [
        'To the maximum extent permitted by law, Truline and its service providers will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages, or for lost profits, data, goodwill, or business opportunities arising from the service. Total liability for all claims relating to the service will not exceed one hundred US dollars (US $100).',
        'Applicable law may not permit some limitations. In that case, liability is limited only to the extent the law permits.'
      ]
    },
    {
      heading: '11. Changes to the service or these Terms',
      paragraphs: [
        'We may change, suspend, or discontinue parts of the service, and we may update these Terms. If a change is material, we will provide notice by a reasonable method and update the date above. Continued use after the effective date means you accept the revised Terms, where permitted by law.'
      ]
    },
    {
      heading: '12. Governing law and contact',
      paragraphs: [
        'These Terms are governed by the laws of the State of Florida, United States, without regard to conflict-of-law rules. Florida courts and dispute procedures apply, subject to rights you cannot waive under local law.',
        'Questions about these Terms may be sent to admin@truline.io.'
      ]
    }
  ]
} satisfies LegalDocument;
