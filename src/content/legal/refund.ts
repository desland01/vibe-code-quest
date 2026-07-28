import type { LegalDocument } from './types';

export const refundContent = {
  title: 'Cancellation & Refund Policy',
  lastUpdated: '2026-07-28',
  sections: [
    {
      heading: '1. Vibe Code Quest is free',
      paragraphs: [
        'Vibe Code Quest is free. We do not charge you, offer a paid tier, run a trial that later becomes paid, provide a checkout, collect a payment card, or create a billing account.',
        'Because nothing is ever billed, there is nothing to cancel and nothing to refund.'
      ]
    },
    {
      heading: '2. If you see a charge',
      paragraphs: [
        'If a bank or card statement shows a charge from something claiming to be Vibe Code Quest, treat it as possible fraud. Contact your bank or card issuer promptly. We take no payments, so we cannot return money for a charge we did not make.',
        'You may also tell us about the charge at admin@truline.io so we can investigate possible misuse of the Vibe Code Quest name.'
      ]
    },
    {
      heading: '3. Stopping use and deleting data',
      paragraphs: [
        'You can stop using Vibe Code Quest at any time. There is no billing relationship to end.',
        'To ask us to delete data linked to your profile, contact admin@truline.io. The Privacy Policy explains what we keep, how long we keep it, and why a purely anonymous profile may be impossible to locate without its session cookie.'
      ]
    },
    {
      heading: '4. Any future paid offering',
      paragraphs: [
        'If Vibe Code Quest ever introduces a paid offering, we will announce it in advance with separate terms. An existing free account would never become a paying account automatically.'
      ]
    }
  ]
} satisfies LegalDocument;
