import { landmarkSchema, type Landmark } from './schema.ts';

type DraftOverrides = Partial<Omit<Landmark, 'id' | 'title' | 'draft'>>;

export function createDraftLandmark(
  id: string,
  title: string,
  rationale: string,
  overrides: DraftOverrides = {}
): Landmark {
  return landmarkSchema.parse({
    id,
    title,
    draft: true,
    hook: `A short starting point for understanding ${title}.`,
    definition: rationale,
    when_to_use: [`Use this lesson when ${title} affects a product or implementation decision.`],
    tradeoffs: {
      pros: ['Makes the relevant decision explicit.'],
      cons: ['This draft needs deeper examples and accuracy review before publication.']
    },
    example: `A builder asks an agent to explain how ${title} changes the proposed implementation.`,
    gotchas: ['Treat this draft as a map marker, not complete guidance.'],
    vibe_coder_default: `Ask the agent to state its ${title} assumptions and verify them before shipping.`,
    quiz: {
      question: `What is the safest current use of this ${title} draft?`,
      options: ['Use it as an orientation stub', 'Treat it as final expert guidance'],
      answer: 'Use it as an orientation stub',
      explanation: 'Every landmark remains draft content until the later authoring and review milestone.'
    },
    sources: [],
    ...overrides
  });
}
