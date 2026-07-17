import { z } from 'zod';

const nonEmptyString = z.string().trim().min(1);

export const landmarkSchema = z.object({
  id: nonEmptyString.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: nonEmptyString,
  draft: z.boolean(),
  hook: nonEmptyString,
  definition: nonEmptyString,
  when_to_use: z.array(nonEmptyString).min(1),
  tradeoffs: z.object({
    pros: z.array(nonEmptyString).min(1),
    cons: z.array(nonEmptyString).min(1)
  }),
  example: nonEmptyString,
  gotchas: z.array(nonEmptyString).min(1),
  vibe_coder_default: nonEmptyString,
  quiz: z.object({
    question: nonEmptyString,
    options: z.array(nonEmptyString).min(2),
    answer: nonEmptyString,
    explanation: nonEmptyString
  }).refine((quiz) => quiz.options.includes(quiz.answer), {
    message: 'quiz.answer must exactly match one quiz.options entry',
    path: ['answer']
  }),
  sources: z.array(z.object({
    url: z.url(),
    checked: z.iso.date()
  }))
});

export const mapAreaSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number().positive(),
  height: z.number().positive()
});

export const regionMetaSchema = z.object({
  id: nonEmptyString,
  title: nonEmptyString,
  label: nonEmptyString,
  description: nonEmptyString,
  mapArea: mapAreaSchema,
  landmarkIds: z.array(nonEmptyString).length(6)
});

export const regionSchema = regionMetaSchema.omit({ landmarkIds: true }).extend({
  landmarks: z.array(landmarkSchema).length(6)
});
export const regionsSchema = z.array(regionSchema).length(8);
export const manifestSchema = z.object({
  version: z.number().int().positive(),
  generatedAt: z.iso.datetime(),
  regions: regionsSchema
});

export type Landmark = z.infer<typeof landmarkSchema>;
export type MapArea = z.infer<typeof mapAreaSchema>;
export type RegionMeta = z.infer<typeof regionMetaSchema>;
export type Region = z.infer<typeof regionSchema>;
export type ContentManifest = z.infer<typeof manifestSchema>;
