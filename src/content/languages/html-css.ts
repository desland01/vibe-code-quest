import type { Landmark } from '../schema.ts';

export const landmark = {
  id: 'html-css', title: 'HTML and CSS', draft: false,
  hook: 'Structure carries meaning; styles should respect it.',
  definition: 'HTML describes the meaning and structure of web content. CSS controls its presentation, layout, and adaptation across screens without replacing that semantic foundation.',
  when_to_use: ['You are building any browser-based interface.', 'You need content that works with keyboards and assistive technology.', 'You need layouts that adapt across viewport sizes.', 'You want presentation separated from document meaning.'],
  tradeoffs: {
    pros: ['Semantic HTML gives browsers and assistive tools useful structure.', 'CSS adapts one document to many screen sizes.', 'Both are native web standards with no framework dependency.'],
    cons: ['The cascade can create surprising interactions in large stylesheets.', 'Visual correctness requires testing across content, inputs, and viewports.']
  },
  example: 'A service dashboard needs navigation, filters, a results table, and clear errors. Tell your agent to start with semantic landmarks and labeled controls, then add responsive CSS and test keyboard flow at narrow and wide widths.',
  gotchas: ['Reject clickable divs when a button or link expresses the action.', 'Test focus, zoom, overflow, and reduced-motion behavior in the rendered page.', 'Inspect generated heading order and form labels, not only the screenshot.'],
  vibe_coder_default: 'Start with semantic HTML and ordinary responsive CSS; add component abstractions only when repeated patterns justify them.',
  quiz: {
    question: 'What should your agent establish before polishing a web page?',
    options: ['Semantic document structure', 'A large animation library', 'Pixel-perfect fixed widths'],
    answer: 'Semantic document structure',
    explanation: 'Meaningful HTML provides the durable base for accessibility, interaction, and styling.'
  },
  sources: [
    { url: 'https://developer.mozilla.org/en-US/docs/Web/HTML', checked: '2026-07-17' },
    { url: 'https://developer.mozilla.org/en-US/docs/Web/CSS', checked: '2026-07-17' },
    { url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/HTML', checked: '2026-07-17' }
  ]
} satisfies Landmark;
