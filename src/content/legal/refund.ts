import type { LegalDocument } from './types';

export const refundContent = {
  title: 'Cancellation & Refund Policy',
  lastUpdated: '[LAST UPDATED DATE]',
  sections: [
    {
      heading: '1. Free trial',
      paragraphs: [
        'code-tutor’s 14-day trial requires no payment card. Starting the trial does not authorize a charge, and there is no automatic charge when it ends. If you do not explicitly subscribe, paid access ends after the trial and you owe nothing. You may end or leave the trial at any time through the available account controls.'
      ]
    },
    {
      heading: '2. Starting a paid subscription',
      paragraphs: [
        'A monthly paid subscription starts only when you explicitly choose to subscribe, review the displayed price and billing interval, and complete Stripe Checkout with a payment method. The current test-mode placeholder is $9 per month; the final launch price may differ and must be shown before confirmation.'
      ]
    },
    {
      heading: '3. How to cancel',
      paragraphs: [
        'Before the trial ends, you can use the self-service account controls to stop the trial; because no card is required, there will be no charge. After subscribing, you may cancel at any time through the self-service billing controls. Cancellation stops future renewals, and access ordinarily continues through the end of the already-paid monthly billing period.',
        'If self-service cancellation is unavailable, contact [CONTACT EMAIL] before your renewal date and include enough account information for us to locate the subscription. Do not send full payment-card details.'
      ]
    },
    {
      heading: '4. Refunds',
      paragraphs: [
        'Because code-tutor is a monthly digital subscription with access provided immediately, payments are generally non-refundable once a billing period begins, and we do not ordinarily provide prorated refunds for unused time. This does not limit any refund, cancellation, cooling-off, or other rights that cannot be waived under applicable law.',
        'If you believe you were charged in error, experienced a duplicate charge, could not access the paid service, or have another exceptional circumstance, contact [CONTACT EMAIL] within [REFUND REQUEST WINDOW] days of the charge. We will review the request and respond under applicable law and the facts of the case. Approved refunds are returned through the original payment method where possible.'
      ]
    },
    {
      heading: '5. Billing issues and changes',
      paragraphs: [
        'For billing help, contact [CONTACT EMAIL] (launch placeholder: support@code-tutor.example). Include the email associated with the account and the date and amount of the charge, but never send a full card number or security code.',
        'We may update this Policy. Changes apply prospectively unless applicable law requires otherwise. The final entity name, governing jurisdiction, refund-request window, and contact details must be completed before launch.'
      ]
    }
  ]
} satisfies LegalDocument;
