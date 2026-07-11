import { z } from 'zod';

export const landmarkSchema = z.object({
  id: z.string(),
  title: z.string(),
  hook: z.string(),
  definition: z.string(),
  whenToUse: z.array(z.string()),
  tradeoffs: z.object({
    pros: z.array(z.string()),
    cons: z.array(z.string())
  }),
  example: z.string(),
  gotchas: z.array(z.string()),
  vibeCoderDefault: z.string(),
  quiz: z.object({
    question: z.string(),
    options: z.array(z.string()),
    answer: z.string(),
    explanation: z.string()
  })
});

export const regionStatusSchema = z.literal('deep');

export const regionSchema = z.object({
  id: z.string(),
  title: z.string(),
  label: z.string(),
  status: regionStatusSchema,
  description: z.string(),
  mapArea: z.object({
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number()
  }),
  landmarks: z.array(landmarkSchema)
});

export const regionsSchema = z.array(regionSchema);

export type Landmark = z.infer<typeof landmarkSchema>;
export type RegionStatus = z.infer<typeof regionStatusSchema>;
export type Region = z.infer<typeof regionSchema>;
