import type { Landmark } from '../schema.ts';

export const landmark = {
  id: 'python', title: 'Python', draft: false,
  hook: 'A practical language for data, AI, and automation.',
  definition: 'Python is a general-purpose language designed around readable code and a large standard library. Its package ecosystem makes it a common fit for scripts, data work, AI services, and backend APIs.',
  when_to_use: ['You need a data-processing or machine-learning workflow.', 'You are automating files, reports, or operational tasks.', 'Your team already depends on Python libraries.', 'You need a small service around an AI or data model.'],
  tradeoffs: {
    pros: ['Readable syntax makes generated code easier to inspect.', 'A broad ecosystem supports data and AI workloads.', 'The standard library covers many scripting tasks.'],
    cons: ['Environment and dependency drift can break reproducibility.', 'Dynamic behavior can hide type errors until execution.']
  },
  example: 'A support team needs to classify exported tickets and produce a reviewed CSV. Tell your agent to use Python, pin dependencies, preserve the original rows, and add tests for missing or malformed fields.',
  gotchas: ['Create an isolated environment and lock direct dependencies.', 'Review generated file operations before running them on valuable data.', 'Validate model outputs and external data instead of trusting expected shapes.'],
  vibe_coder_default: 'Choose Python for data, AI, and focused automation; choose TypeScript when the main product is an end-to-end web application.',
  quiz: {
    question: 'Which task most strongly favors Python as the default?',
    options: ['Cleaning a dataset before model evaluation', 'Styling a responsive landing page', 'Adding browser-native form behavior'],
    answer: 'Cleaning a dataset before model evaluation',
    explanation: 'Python has mature data tooling and keeps this kind of processing workflow direct and inspectable.'
  },
  sources: [
    { url: 'https://docs.python.org/3/tutorial/', checked: '2026-07-17' },
    { url: 'https://docs.python.org/3/library/', checked: '2026-07-17' },
    { url: 'https://packaging.python.org/en/latest/tutorials/installing-packages/', checked: '2026-07-17' }
  ]
} satisfies Landmark;
