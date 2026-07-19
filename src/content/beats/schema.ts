import { z } from 'zod';

// Engagement-v2 beat grammar (frozen DESIGN_CONTRACT §4/§8).
// Beats are a typed projection of canonical landmark fields. Data-driven, deterministic,
// never LLM-generated. Progress persists a minimal monotonic state — never per-beat arrays.

export const BEAT_TYPES = [
  'hook',
  'predict',
  'reveal',
  'scenario',
  'tradeoff',
  'gotcha',
  'default',
  'check',
  'recap',
] as const;
export type BeatType = (typeof BEAT_TYPES)[number];

const nonEmpty = z.string().trim().min(1);
const beatId = nonEmpty.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

const baseBeat = z.object({
  id: beatId,
  type: z.enum(BEAT_TYPES),
  prompt: nonEmpty,
  hint: nonEmpty.optional(),
  estimatedSeconds: z.number().int().positive().max(180),
});

const choiceOption = z.object({
  id: nonEmpty,
  label: nonEmpty,
  feedback: nonEmpty,
});

const choiceBeat = baseBeat.extend({
  options: z.array(choiceOption).min(2).max(4),
  correctOptionId: nonEmpty,
});

export const beatSchema = z.discriminatedUnion('type', [
  baseBeat.extend({ type: z.literal('hook') }),
  choiceBeat.extend({ type: z.literal('predict') }),
  baseBeat.extend({ type: z.literal('reveal'), cards: z.array(nonEmpty).min(1).max(3) }),
  choiceBeat.extend({ type: z.literal('scenario') }),
  baseBeat.extend({
    type: z.literal('tradeoff'),
    items: z.array(z.object({ id: nonEmpty, label: nonEmpty, side: z.enum(['pro', 'con']) })).min(2).max(4),
  }),
  choiceBeat.extend({ type: z.literal('gotcha') }),
  baseBeat.extend({ type: z.literal('default') }),
  baseBeat.extend({ type: z.literal('check') }), // grading reuses the canonical landmark quiz
  baseBeat.extend({ type: z.literal('recap'), bullets: z.array(nonEmpty).min(2).max(4) }),
]);

export type Beat = z.infer<typeof beatSchema>;
export type ChoiceBeat = Extract<Beat, { options: unknown }>;

export const beatSequenceSchema = z
  .object({
    regionId: nonEmpty,
    landmarkId: beatId,
    beats: z.array(beatSchema).min(5).max(8),
  })
  .superRefine((sequence, ctx) => {
    const ids = sequence.beats.map((beat) => beat.id);
    if (new Set(ids).size !== ids.length) {
      ctx.addIssue({ code: 'custom', message: 'beat ids must be unique within the sequence' });
    }
    for (const beat of sequence.beats) {
      if ('options' in beat && !beat.options.some((option) => option.id === beat.correctOptionId)) {
        ctx.addIssue({ code: 'custom', message: `beat ${beat.id}: correctOptionId must match an option id` });
      }
    }
    if (sequence.beats.at(-1)?.type !== 'recap') {
      ctx.addIssue({ code: 'custom', message: 'final beat must be recap (stamp path)' });
    }
    if (!sequence.beats.some((beat) => beat.type === 'check')) {
      ctx.addIssue({ code: 'custom', message: 'sequence must include a check beat' });
    }
  });

export type BeatSequence = z.infer<typeof beatSequenceSchema>;

// Persisted progress state (frozen §8). `furthestBeatIndex` is the highest zero-based beat
// index the learner has reached; back-review is local UI state and writes nothing.
export const beatProgressStateSchema = z
  .object({
    v: z.literal(1),
    kind: z.literal('beat-sequence'),
    furthestBeatIndex: z.number().int().min(0),
    checked: z.boolean(),
    completed: z.boolean(),
    stampedAt: z.iso.datetime().nullable(),
  })
  .strict();

export type BeatProgressState = z.infer<typeof beatProgressStateSchema>;

export const initialBeatProgressState = (): BeatProgressState => ({
  v: 1,
  kind: 'beat-sequence',
  furthestBeatIndex: 0,
  checked: false,
  completed: false,
  stampedAt: null,
});

// ── Pure progress semantics (no server-only, no content-manifest import — DB-free tests) ──

// Monotonic merge — mirrors the SQL in server/beatProgress.ts exactly.
export function mergeBeatProgress(
  stored: BeatProgressState | null,
  incoming: BeatProgressState
): BeatProgressState {
  if (!stored) return { ...incoming };
  return {
    v: 1,
    kind: 'beat-sequence',
    furthestBeatIndex: Math.max(stored.furthestBeatIndex, incoming.furthestBeatIndex),
    checked: stored.checked || incoming.checked,
    completed: stored.completed || incoming.completed,
    stampedAt: stored.stampedAt ?? incoming.stampedAt,
  };
}

// Cross-field consistency rules (frozen §8). Sequence-shape-aware checks live in
// server/beatProgress.ts (terminal index, check-beat position).
export function validateBeatStateConsistency(state: BeatProgressState): { ok: true } | { ok: false; error: string } {
  if (state.completed && !state.checked) return { ok: false, error: 'completed requires checked' };
  if (state.completed && !state.stampedAt) return { ok: false, error: 'completed requires stampedAt' };
  if (!state.completed && state.stampedAt !== null) return { ok: false, error: 'stampedAt requires completed' };
  return { ok: true };
}
