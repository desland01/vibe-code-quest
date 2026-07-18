import type { LegalDocument } from './types';

export const termsContent = {
  title: 'Terms of Service',
  lastUpdated: '[LAST UPDATED DATE]',
  sections: [
    {
      heading: '1. Who we are and what these terms cover',
      paragraphs: [
        'These Terms of Service govern your use of code-tutor, “A Map for Post-AI Builders,” operated by [COMPANY LEGAL NAME] (“code-tutor,” “we,” “us,” or “our”). code-tutor provides an interactive learning map, progress tools, quizzes, and AI-assisted educational explanations for people building software with AI agents.',
        'By using code-tutor, you agree to these Terms. If you do not agree, do not use the service.'
      ]
    },
    {
      heading: '2. Eligibility',
      paragraphs: [
        'You must be able to form a binding contract in [JURISDICTION] to use the service. If you use code-tutor for an organization, you represent that you have authority to accept these Terms for that organization. The service is not directed to children under 13, or a higher minimum age where local law requires it.'
      ]
    },
    {
      heading: '3. Anonymous use and account upgrades',
      paragraphs: [
        'You may begin using code-tutor anonymously. We assign an anonymous session identity so the service can remember progress. You may later provide an email address and verify it with a one-time passcode to upgrade that anonymous profile. You are responsible for access to your email account and for activity under your profile.',
        'Do not share verification codes or try to access another person’s profile. Contact [CONTACT EMAIL] if you believe your profile has been compromised.'
      ]
    },
    {
      heading: '4. Acceptable use',
      paragraphs: ['You agree not to misuse code-tutor or help anyone else do so. In particular, you must not:'],
      items: [
        'break the law, infringe another person’s rights, or submit harmful or unlawful material;',
        'probe, bypass, disable, or interfere with security, access controls, usage limits, or service operation;',
        'use automated means to scrape, overload, or extract the service or its content without written permission;',
        'reverse engineer the service except where applicable law expressly permits it; or',
        'misrepresent AI-generated material as verified professional guidance.'
      ]
    },
    {
      heading: '5. Trial, subscription, and payment',
      paragraphs: [
        'code-tutor offers a 14-day free trial that does not require a payment card. Starting a trial does not authorize a charge and does not automatically convert into a paid subscription. When the trial ends, paid features may become unavailable unless you explicitly choose to subscribe.',
        'The current test-mode placeholder price is $9 per month. Before launch, the checkout screen must show the final price, billing interval, and any taxes before you confirm. A paid monthly subscription begins only after you explicitly subscribe and provide a payment method through Stripe. Subscriptions renew monthly until canceled. Cancellation and refund details appear in our Cancellation & Refund Policy.'
      ]
    },
    {
      heading: '6. Educational and AI-generated content',
      paragraphs: [
        'code-tutor is an educational tool, not a substitute for professional advice. Explanations, recommendations, quizzes, and other material—including content generated or adapted by AI—may be incomplete, outdated, or inaccurate. Always review outputs, test code, verify important claims against authoritative sources, and use qualified professionals when legal, financial, medical, security, or other high-stakes advice is needed.',
        'You are responsible for decisions, code, systems, and outcomes produced using information from the service.'
      ]
    },
    {
      heading: '7. Availability and warranties',
      paragraphs: [
        'To the maximum extent permitted by law, code-tutor is provided “as is” and “as available.” [COMPANY LEGAL NAME] disclaims all warranties, express or implied, including merchantability, fitness for a particular purpose, non-infringement, accuracy, and uninterrupted availability. Some jurisdictions do not allow certain disclaimers, so parts of this section may not apply to you.'
      ]
    },
    {
      heading: '8. Limitation of liability',
      paragraphs: [
        'To the maximum extent permitted by law, [COMPANY LEGAL NAME] and its suppliers will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages, or for lost profits, data, goodwill, or business opportunities arising from the service. Our total liability for claims relating to the service will not exceed the greater of the amount you paid us during the three months before the claim or [LIABILITY CAP].',
        'Applicable law may not permit some limitations. In that case, liability is limited only to the extent the law permits.'
      ]
    },
    {
      heading: '9. Changes to the service or these Terms',
      paragraphs: [
        'We may change the service and these Terms. If a change is material, we will provide notice by a reasonable method and update the date above. Continued use after the effective date means you accept the revised Terms, where permitted by law.'
      ]
    },
    {
      heading: '10. Governing law and contact',
      paragraphs: [
        'These Terms are governed by the laws of [JURISDICTION], without regard to conflict-of-law rules. Courts or dispute procedures for [JURISDICTION] will apply, subject to rights you cannot waive under local law.',
        'Questions about these Terms may be sent to [CONTACT EMAIL] (launch placeholder: support@code-tutor.example).'
      ]
    }
  ]
} satisfies LegalDocument;
