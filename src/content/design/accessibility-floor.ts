import type { Landmark } from '../schema.ts';

export const landmark = {
  id: 'accessibility-floor',
  title: 'Accessibility floor',
  draft: false,
  hook: 'Access is part of done.',
  definition: 'An accessibility floor is the minimum interaction contract every screen must meet. It covers semantic controls, keyboard access, visible focus, readable contrast, useful names, and motion preferences.',
  when_to_use: [
    'You are defining acceptance criteria for generated interface work.',
    'A workflow includes forms, dialogs, menus, drag actions, or status updates.',
    'Your product serves people using keyboards, screen readers, zoom, or reduced motion.',
    'You need a repeatable review bar across contributors and agents.'
  ],
  tradeoffs: {
    pros: [
      'A shared floor catches barriers before they spread across the product.',
      'Semantic controls work with more input and assistive technologies.',
      'Explicit acceptance criteria make agent output easier to review.'
    ],
    cons: [
      'Automated checks cannot prove a workflow is understandable or usable.',
      'Keyboard and screen-reader testing adds time and needs practiced reviewers.'
    ]
  },
  example: 'A booking flow uses date selection, validation, a confirmation dialog, and a live success message. Tell your agent that done means semantic controls, full keyboard completion, managed focus, named errors, and WCAG AA contrast, then verify the flow manually.',
  gotchas: [
    'Prefer native HTML before adding ARIA roles and behavior yourself.',
    'Test keyboard order, focus visibility, zoom, reduced motion, and screen-reader announcements.',
    'Reject generated controls that look correct but cannot be named or operated without a pointer.'
  ],
  vibe_coder_default: 'Set WCAG 2.2 Level AA as the floor, use native HTML and maintained accessible primitives, and require automated plus manual checks in every interface definition of done.',
  quiz: {
    question: 'An automated accessibility scan passes a new checkout flow. What remains?',
    options: ['Manually test the complete keyboard and assistive-technology workflow', 'Ship because the scan proves conformance', 'Remove semantic labels to reduce visual clutter'],
    answer: 'Manually test the complete keyboard and assistive-technology workflow',
    explanation: 'Automation catches specific rules, but it cannot establish that the complete workflow is understandable and operable.'
  },
  sources: [
    { url: 'https://www.w3.org/WAI/standards-guidelines/wcag/', checked: '2026-07-17' },
    { url: 'https://www.w3.org/WAI/ARIA/apg/', checked: '2026-07-17' },
    { url: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility', checked: '2026-07-17' }
  ]
} satisfies Landmark;
