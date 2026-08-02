import { z } from 'zod';

const nonEmptyString = z.string().trim().min(1);

// ── Level identity (arcade rebuild, DATA_MODEL §1) ────────────────────────────
// Every landmark is played as three ordered runs: l1 vocabulary, l2 one agent
// decision, l3 tradeoffs. Level is identity, never content: it never appears
// inside a persisted progress JSON value.

export const LEVEL_IDS = ['l1', 'l2', 'l3'] as const;
export const levelIdSchema = z.enum(LEVEL_IDS);
export type LevelId = z.infer<typeof levelIdSchema>;

/**
 * One graded assessment. Exactly one canonical source per level — the player no
 * longer grades a check beat from a single top-level landmark quiz.
 */
export const assessmentSchema = z
  .object({
    question: nonEmptyString,
    options: z.array(nonEmptyString).min(2).max(4),
    answer: nonEmptyString,
    explanation: nonEmptyString,
  })
  .strict()
  .refine((assessment) => assessment.options.includes(assessment.answer), {
    message: 'assessment.answer must exactly match one assessment.options entry',
    path: ['answer'],
  });

/** The instructional payload for one level of one landmark. */
export const levelContentSchema = z
  .object({
    hook: nonEmptyString,
    definition: nonEmptyString,
    when_to_use: z.array(nonEmptyString).min(1),
    tradeoffs: z
      .object({
        pros: z.array(nonEmptyString).min(1),
        cons: z.array(nonEmptyString).min(1),
      })
      .strict(),
    example: nonEmptyString,
    gotchas: z.array(nonEmptyString).min(1),
    vibe_coder_default: nonEmptyString,
    assessment: assessmentSchema,
  })
  .strict();

export const landmarkLevelsSchema = z
  .object({
    l1: levelContentSchema,
    l2: levelContentSchema,
    l3: levelContentSchema,
  })
  .strict();

export type Assessment = z.infer<typeof assessmentSchema>;
export type LevelContent = z.infer<typeof levelContentSchema>;
export type LandmarkLevels = z.infer<typeof landmarkLevelsSchema>;

// ── Landmark ─────────────────────────────────────────────────────────────────
// M1a compatibility window (EXECUTION_PLAN "no production content in M1a"):
// `levels` is OPTIONAL here so the validators can run against the checked-in
// fixture corpus while the 48 production landmark files still carry the legacy
// top-level fields. The island content issues (M4–M6) author `levels` per
// landmark; ISSUE-033 flips this to required and activates the 144-count gate.

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
  levels: landmarkLevelsSchema.optional(),
  sources: z.array(z.object({
    url: z.url(),
    checked: z.iso.date()
  }))
});

/**
 * The fully tier-aware landmark. `levels` is REQUIRED here. Content authored for
 * the arcade is validated against this schema; VAL-001 asserts that a landmark
 * missing its tier fields is rejected.
 */
export const canonicalLandmarkSchema = z
  .object({
    id: nonEmptyString.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    title: nonEmptyString,
    draft: z.boolean(),
    levels: landmarkLevelsSchema,
    sources: z.array(z.object({ url: z.url(), checked: z.iso.date() }).strict()),
  })
  .strict();

export type CanonicalLandmark = z.infer<typeof canonicalLandmarkSchema>;

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

// ── Public projection (manifest v2, DATA_MODEL §8) ────────────────────────────
// The public manifest carries region/map metadata plus a slim landmark overview.
// It never contains `levels`, assessments, beats, answer keys, or the registry
// inventory. Those stay in server-only modules.

export const publicLandmarkSchema = z
  .object({
    id: nonEmptyString.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    title: nonEmptyString,
    draft: z.boolean(),
  })
  .strict();

export const publicRegionSchema = regionMetaSchema
  .omit({ landmarkIds: true })
  .extend({ landmarks: z.array(publicLandmarkSchema).length(6) });

export const publicManifestSchema = z.object({
  version: z.literal(2),
  generatedAt: z.iso.datetime(),
  regions: z.array(publicRegionSchema).length(8),
});

export type PublicLandmark = z.infer<typeof publicLandmarkSchema>;
export type PublicRegion = z.infer<typeof publicRegionSchema>;
export type PublicContentManifest = z.infer<typeof publicManifestSchema>;

export type Landmark = z.infer<typeof landmarkSchema>;
export type MapArea = z.infer<typeof mapAreaSchema>;
export type RegionMeta = z.infer<typeof regionMetaSchema>;
export type Region = z.infer<typeof regionSchema>;
export type ContentManifest = z.infer<typeof manifestSchema>;
