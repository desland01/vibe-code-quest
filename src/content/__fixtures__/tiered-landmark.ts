import type { Landmark, LevelContent } from '../schema.ts';

// Fixture corpus for the arcade validators (ISSUE-003, M1a "enforcement before
// content"). These are NOT production content and are never registered: they
// exist so the schema, manifest, provenance, and copy guards can be proven
// against a complete three-level landmark before any island is authored.
//
// The subject is deliberately fictional infrastructure so no fixture string can
// ever be mistaken for a canonical claim about a real tool.

const l1: LevelContent = {
  hook: 'A widget is the smallest thing the crew can name.',
  definition: 'A widget is one named unit of work. The crew stores each widget in a bin.',
  when_to_use: ['You need a name for one unit of work'],
  tradeoffs: {
    pros: ['Everyone says the same word for the same thing'],
    cons: ['A name alone tells you nothing about cost'],
  },
  example: 'The crew points at a bin and asks what to call the thing inside it.',
  gotchas: ['Two crews use one word for two different things'],
  vibe_coder_default: 'Name the unit before you argue about it.',
  assessment: {
    question: 'What is a widget?',
    options: ['One named unit of work', 'A bin', 'A crew'],
    answer: 'One named unit of work',
    explanation: 'A widget is the unit; the bin is where it is stored.',
  },
};

const l2: LevelContent = {
  hook: 'The crew asks whether to open a second bin.',
  definition: 'Opening a bin costs setup time. One bin holds forty widgets.',
  when_to_use: ['A bin is full and more widgets are waiting'],
  tradeoffs: {
    pros: ['A second bin keeps waiting widgets moving'],
    cons: ['Every open bin costs setup time you cannot recover'],
  },
  example: 'Thirty-nine widgets sit in the bin and four more arrive.',
  gotchas: ['Opening a bin for one widget wastes the whole setup'],
  vibe_coder_default: 'Open a second bin only when the first is full.',
  assessment: {
    question: 'When should the crew open a second bin?',
    options: ['Only when the first is full', 'Whenever a widget arrives', 'Never'],
    answer: 'Only when the first is full',
    explanation: 'Setup time is unrecoverable, so it is spent only once the first bin is full.',
  },
};

const l3: LevelContent = {
  hook: 'Bins trade setup time for throughput.',
  definition: 'Bin count sets throughput. Each bin adds fixed setup cost and one more thing to watch.',
  when_to_use: ['Throughput matters more than setup cost'],
  tradeoffs: {
    pros: ['More bins move more widgets at once'],
    cons: ['Each bin adds fixed setup cost'],
  },
  example: 'The crew must clear two hundred widgets before the shift ends.',
  gotchas: ['Bin count grows past what one crew can watch'],
  vibe_coder_default: 'Add bins until the crew can no longer watch them all.',
  assessment: {
    question: 'What limits how many bins the crew should open?',
    options: ['What the crew can watch', 'The number of widgets', 'The shift length'],
    answer: 'What the crew can watch',
    explanation: 'Throughput stops improving once bins outrun the crew watching them.',
  },
};

/** A complete tier-aware landmark: all three levels present and valid. */
export const tieredLandmark: Landmark = {
  id: 'fixture-widget-bins',
  title: 'Widget Bins',
  draft: true,
  hook: l3.hook,
  definition: l3.definition,
  when_to_use: [...l3.when_to_use],
  tradeoffs: { pros: [...l3.tradeoffs.pros], cons: [...l3.tradeoffs.cons] },
  example: l3.example,
  gotchas: [...l3.gotchas],
  vibe_coder_default: l3.vibe_coder_default,
  quiz: {
    question: l3.assessment.question,
    options: [...l3.assessment.options],
    answer: l3.assessment.answer,
    explanation: l3.assessment.explanation,
  },
  levels: { l1, l2, l3 },
  sources: [{ url: 'https://example.com/widget-bins', checked: '2026-08-02' }],
};

/** The same landmark with its tier fields stripped — VAL-001 must reject this. */
export const untieredLandmark = (() => {
  const { levels: _levels, ...rest } = tieredLandmark;
  return rest;
})();

export const fixtureLevels = { l1, l2, l3 } as const;
