import type { Landmark } from '../schema.ts';
import { beatSequenceSchema, type Beat, type BeatSequence } from './schema.ts';

// L-002 deterministic factory. Copy loyalty: every claim-bearing string is a verbatim
// canonical field of THIS landmark only (no sibling-landmark text). Fixed framing /
// feedback phrases are the only non-canonical strings and are allowlisted in tests.
// Grammar matches the pilot/transfer hand-authored sequences (8 beats, no tradeoff).
//
// Instructional rule: predict does NOT use the quiz. Quiz is reserved for the check beat
// so the assessment is not spoiled before grading.
//
// Per-option feedback: each choice carries source-classified feedback built from
// (a) a fixed allowlisted frame for that source class and (b) the exact canonical
// label text. No invented facts.

export const FACTORY_FRAMING = {
  // Neutral task frames — never name the source field of the correct answer.
  predictPrompt: 'Before the reveal: which of these is a real strength of this approach?',
  predictHint: 'Pick the option that holds up under real use.',
  scenarioPromptPrefix: 'This is the situation. Which move fits best?',
  scenarioHint: 'Pick the safest default for this situation.',
  gotchaPrompt: 'Which of these can burn you if you are not watching?',
  gotchaHint: 'Pick the real risk, not a safe practice.',
  checkHint: 'Trust the default you just locked in.',
  // Correct leads (fixed)
  predictCorrectLead: 'That strength holds.',
  scenarioCorrectLead: 'Right — that is the default to keep.',
  gotchaCorrectLead: 'Caught it.',
  // Wrong-feedback frames (fixed). Each is completed with the exact canonical label.
  predictWrongConPrefix: 'That is a tradeoff to plan for, not the strength: ',
  predictWrongGotchaPrefix: 'That is a risk to watch, not the strength: ',
  scenarioWrongGotchaPrefix: 'That is a risk to avoid here, not the default move: ',
  scenarioWrongConPrefix: 'That is a tradeoff, not the default move: ',
  scenarioWrongWhenPrefix: 'That describes when it fits, not the move itself: ',
  gotchaWrongProPrefix: 'That is a benefit, not the trap: ',
  gotchaWrongWhenPrefix: 'That describes when it fits, not the trap: ',
  checkPromptPrefix: 'Prove it: ',
  recapPromptSuffix: ' Keep this default close.',
} as const;

export type OptionSource = 'pro' | 'con' | 'gotcha' | 'when_to_use' | 'default';

type LabeledSource = { label: string; source: OptionSource };

function sentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function optionId(prefix: string, index: number): string {
  return `${prefix}-${index + 1}`;
}

function uniqueLabeled(items: LabeledSource[]): LabeledSource[] {
  const seen = new Set<string>();
  const out: LabeledSource[] = [];
  for (const item of items) {
    const key = item.label.trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push({ label: key, source: item.source });
  }
  return out;
}

function uniqueLabels(labels: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const label of labels) {
    const key = label.trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(key);
  }
  return out;
}

/** Stable 0..mod-1 position from landmark/beat key so correct answer is not always A. */
export function stableSlot(key: string, mod: number): number {
  if (mod <= 0) return 0;
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return hash % mod;
}

/**
 * Build source-classified wrong feedback. Uses fixed frames + exact canonical label.
 * Throws if the source class has no allowed frame for this beat (programming error).
 */
export function wrongFeedbackFor(
  beat: 'predict' | 'scenario' | 'gotcha',
  source: OptionSource,
  label: string,
): string {
  if (beat === 'predict') {
    if (source === 'con') return `${FACTORY_FRAMING.predictWrongConPrefix}${label}`;
    if (source === 'gotcha') return `${FACTORY_FRAMING.predictWrongGotchaPrefix}${label}`;
  }
  if (beat === 'scenario') {
    if (source === 'gotcha') return `${FACTORY_FRAMING.scenarioWrongGotchaPrefix}${label}`;
    if (source === 'con') return `${FACTORY_FRAMING.scenarioWrongConPrefix}${label}`;
    if (source === 'when_to_use') return `${FACTORY_FRAMING.scenarioWrongWhenPrefix}${label}`;
  }
  if (beat === 'gotcha') {
    if (source === 'pro') return `${FACTORY_FRAMING.gotchaWrongProPrefix}${label}`;
    if (source === 'when_to_use') return `${FACTORY_FRAMING.gotchaWrongWhenPrefix}${label}`;
  }
  throw new Error(`No wrong-feedback frame for ${beat}/${source}`);
}

/**
 * Build choice options from current-landmark labeled sources only.
 * Correct label is placed at a deterministic non-fixed slot.
 * Each option gets source-classified feedback (correct lead or wrong frame + label).
 */
function choiceOptions(
  landmarkKey: string,
  beat: 'predict' | 'scenario' | 'gotcha',
  prefix: string,
  labeled: LabeledSource[],
  correctLabel: string,
  correctFeedback: string,
): { options: { id: string; label: string; feedback: string }[]; correctOptionId: string } {
  const unique = uniqueLabeled(labeled);
  if (!unique.some((item) => item.label === correctLabel)) {
    unique.unshift({ label: correctLabel, source: 'default' });
  }
  const distractors = unique.filter((item) => item.label !== correctLabel);
  if (distractors.length < 1) {
    throw new Error(
      `Need at least one distinct distractor for ${landmarkKey}/${prefix} (correct="${correctLabel}")`,
    );
  }
  const ordered = [
    unique.find((item) => item.label === correctLabel)!,
    ...distractors,
  ].slice(0, 4);

  const slot = stableSlot(`${landmarkKey}/${prefix}`, ordered.length);
  const withoutCorrect = ordered.filter((item) => item.label !== correctLabel);
  const placed: LabeledSource[] = [];
  let distractorIndex = 0;
  for (let i = 0; i < ordered.length; i += 1) {
    if (i === slot) {
      placed.push(ordered.find((item) => item.label === correctLabel)!);
    } else {
      placed.push(withoutCorrect[distractorIndex]!);
      distractorIndex += 1;
    }
  }

  const options = placed.map((item, index) => ({
    id: optionId(prefix, index),
    label: item.label,
    feedback:
      item.label === correctLabel
        ? correctFeedback
        : wrongFeedbackFor(beat, item.source, item.label),
  }));
  const correct = options.find((option) => option.label === correctLabel);
  if (!correct) {
    throw new Error(`correct label missing after option build: ${landmarkKey}/${prefix}`);
  }
  return { options, correctOptionId: correct.id };
}

export function deriveBeatSequence(regionId: string, landmark: Landmark): BeatSequence {
  const landmarkKey = `${regionId}/${landmark.id}`;
  const defCards = sentences(landmark.definition).slice(0, 3);
  const revealCards = defCards.length > 0 ? defCards : [landmark.definition];

  // Predict: benefit from tradeoffs.pros — NEVER the quiz (check owns the quiz).
  // Distractors: cons + gotchas (source-tagged for per-option feedback).
  const predictCorrect = landmark.tradeoffs.pros[0]!;
  const predictLabeled: LabeledSource[] = [
    { label: predictCorrect, source: 'pro' },
    ...landmark.tradeoffs.cons.map((label) => ({ label, source: 'con' as const })),
    ...landmark.gotchas.map((label) => ({ label, source: 'gotcha' as const })),
  ];
  const predict = choiceOptions(
    landmarkKey,
    'predict',
    'predict',
    predictLabeled,
    predictCorrect,
    FACTORY_FRAMING.predictCorrectLead,
  );

  // Scenario: neutral frame + example; correct = vibe_coder_default.
  // Distractors: remaining gotchas, cons, when_to_use (source-tagged).
  const scenarioLabeled: LabeledSource[] = [
    { label: landmark.vibe_coder_default, source: 'default' },
    ...landmark.gotchas.slice(1).map((label) => ({ label, source: 'gotcha' as const })),
    ...landmark.tradeoffs.cons.map((label) => ({ label, source: 'con' as const })),
    ...landmark.when_to_use.map((label) => ({ label, source: 'when_to_use' as const })),
  ];
  const scenario = choiceOptions(
    landmarkKey,
    'scenario',
    'scenario',
    scenarioLabeled,
    landmark.vibe_coder_default,
    FACTORY_FRAMING.scenarioCorrectLead,
  );

  // Gotcha: correct = first gotcha; distractors = pros + when_to_use (safe practices).
  const gotchaTrap = landmark.gotchas[0]!;
  const gotchaLabeled: LabeledSource[] = [
    { label: gotchaTrap, source: 'gotcha' },
    ...landmark.tradeoffs.pros.map((label) => ({ label, source: 'pro' as const })),
    ...landmark.when_to_use.map((label) => ({ label, source: 'when_to_use' as const })),
  ];
  const gotcha = choiceOptions(
    landmarkKey,
    'gotcha',
    'gotcha',
    gotchaLabeled,
    gotchaTrap,
    FACTORY_FRAMING.gotchaCorrectLead,
  );

  const firstDefinition = sentences(landmark.definition)[0] ?? landmark.definition;
  const recapBullets = uniqueLabels([
    firstDefinition,
    landmark.vibe_coder_default,
    landmark.gotchas[0]!,
    landmark.tradeoffs.pros[0]!,
  ]).slice(0, 4);
  while (recapBullets.length < 2) {
    recapBullets.push(landmark.hook);
  }

  const beats: Beat[] = [
    {
      id: 'hook',
      type: 'hook',
      prompt: landmark.hook,
      estimatedSeconds: 10,
    },
    {
      id: 'predict-core',
      type: 'predict',
      prompt: FACTORY_FRAMING.predictPrompt,
      options: predict.options,
      correctOptionId: predict.correctOptionId,
      hint: FACTORY_FRAMING.predictHint,
      estimatedSeconds: 20,
    },
    {
      id: 'reveal-definition',
      type: 'reveal',
      prompt: landmark.title,
      cards: revealCards,
      estimatedSeconds: 25,
    },
    {
      id: 'scenario-default',
      type: 'scenario',
      prompt: `${FACTORY_FRAMING.scenarioPromptPrefix} ${landmark.example}`,
      options: scenario.options,
      correctOptionId: scenario.correctOptionId,
      hint: FACTORY_FRAMING.scenarioHint,
      estimatedSeconds: 45,
    },
    {
      id: 'gotcha-trap',
      type: 'gotcha',
      prompt: FACTORY_FRAMING.gotchaPrompt,
      options: gotcha.options,
      correctOptionId: gotcha.correctOptionId,
      hint: FACTORY_FRAMING.gotchaHint,
      estimatedSeconds: 25,
    },
    {
      id: 'default-commit',
      type: 'default',
      prompt: landmark.vibe_coder_default,
      estimatedSeconds: 15,
    },
    {
      id: 'check-quiz',
      type: 'check',
      prompt: `${FACTORY_FRAMING.checkPromptPrefix}${landmark.quiz.question}`,
      hint: FACTORY_FRAMING.checkHint,
      estimatedSeconds: 20,
    },
    {
      id: 'recap',
      type: 'recap',
      prompt: `${landmark.hook}${FACTORY_FRAMING.recapPromptSuffix}`,
      bullets: recapBullets,
      estimatedSeconds: 20,
    },
  ];

  return beatSequenceSchema.parse({
    regionId,
    landmarkId: landmark.id,
    beats,
  });
}

/** Flatten FACTORY_FRAMING values for provenance allowlist tests. */
export function factoryFramingValues(): string[] {
  return Object.values(FACTORY_FRAMING);
}

/** Exact allowed wrong-feedback composites for a landmark (provenance lock). */
export function allowedWrongFeedbacks(landmark: Landmark): string[] {
  const out: string[] = [];
  for (const label of landmark.tradeoffs.cons) {
    out.push(`${FACTORY_FRAMING.predictWrongConPrefix}${label}`);
    out.push(`${FACTORY_FRAMING.scenarioWrongConPrefix}${label}`);
  }
  for (const label of landmark.gotchas) {
    out.push(`${FACTORY_FRAMING.predictWrongGotchaPrefix}${label}`);
    out.push(`${FACTORY_FRAMING.scenarioWrongGotchaPrefix}${label}`);
  }
  for (const label of landmark.when_to_use) {
    out.push(`${FACTORY_FRAMING.scenarioWrongWhenPrefix}${label}`);
    out.push(`${FACTORY_FRAMING.gotchaWrongWhenPrefix}${label}`);
  }
  for (const label of landmark.tradeoffs.pros) {
    out.push(`${FACTORY_FRAMING.gotchaWrongProPrefix}${label}`);
  }
  return out;
}

/** Collect every claim-bearing string from a landmark for provenance checks. */
export function landmarkCorpus(landmark: Landmark): string[] {
  return [
    landmark.hook,
    landmark.title,
    landmark.definition,
    landmark.example,
    landmark.vibe_coder_default,
    ...landmark.when_to_use,
    ...landmark.gotchas,
    ...landmark.tradeoffs.pros,
    ...landmark.tradeoffs.cons,
    landmark.quiz.question,
    landmark.quiz.answer,
    landmark.quiz.explanation,
    ...landmark.quiz.options,
    ...sentences(landmark.definition),
  ];
}

export function definitionSentences(text: string): string[] {
  return sentences(text);
}
