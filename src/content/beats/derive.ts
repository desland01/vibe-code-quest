import type { Landmark, LevelContent, LevelId } from '../schema.ts';
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
  // Re-voiced per CREATIVE_BIBLE §6.4. The old set was the single largest source
  // of banned-phrase violations in the corpus ("this approach", "holds up under
  // real use", "Which move fits best?", the "Prove it:" colon crutch, the
  // trailing "Keep this default close." coach-ism). Framing is not landmark
  // content, so replacing it changes voice without touching a single fact.
  predictPrompt: 'One of these actually helps. Which?',
  predictHint: 'One of these survives contact with reality.',
  scenarioPromptPrefix: "Here's the spot you're in. What do you do?",
  scenarioHint: 'Pick the safest default here.',
  gotchaPrompt: 'One of these bites you later. Find it.',
  gotchaHint: 'Two of these are fine. One is not.',
  checkHint: 'Trust the default you just locked in.',
  // Correct leads. §6.1 rule 8 fixes the verdict vocabulary to three strings;
  // these are the correct-answer lead plus its flat fact.
  predictCorrectLead: 'Noted.',
  scenarioCorrectLead: 'Yep.',
  gotchaCorrectLead: 'Yep.',
  // Wrong-feedback frames. Each opens with the fixed wrong verdict and is
  // completed with the exact canonical label.
  // These are kept to three words after the verdict lead ON PURPOSE. §6.3 budgets
  // a feedback line at 12 words after the lead, and an option label at 9; a
  // derived feedback is frame + label, so any longer frame makes the two budgets
  // mutually unsatisfiable for real canonical labels.
  predictWrongConPrefix: "Not that one. That's the cost: ",
  predictWrongGotchaPrefix: "Not that one. That's a risk: ",
  scenarioWrongGotchaPrefix: "Not that one. That's the risk: ",
  scenarioWrongConPrefix: "Not that one. That's the cost: ",
  scenarioWrongWhenPrefix: "Not that one. That's when, not what: ",
  gotchaWrongProPrefix: "Not that one. That's a benefit: ",
  gotchaWrongWhenPrefix: "Not that one. That's when it fits: ",
  // The colon crutch is gone; the check beat asks the question plainly.
  checkPromptPrefix: '',
  // §6.4 item 5: the suffix is deleted. The recap earns its exit.
  recapPromptSuffix: '',
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

/** Identity a derived sequence needs beyond its level content. */
export type LandmarkIdentity = Readonly<{ id: string; title: string }>;

/**
 * Project one level's canonical content into one playable sequence (REQ-007).
 *
 * This replaces the level-blind `deriveBeatSequence()`: the factory now reads a
 * single `LevelContent` source and carries `level` and `assessment` through to
 * the sequence, so every claim in the run is provenance-checkable against that
 * one tier's fields. An l3 projection emits the pinned `L3_SHAPE` tuple.
 */
export function deriveLevelSequence(
  regionId: string,
  landmark: LandmarkIdentity,
  level: LevelId,
  content: LevelContent,
): BeatSequence {
  // Slot stability key stays two-part on purpose: correct-option placement is a
  // presentation concern with no level semantics, and holding it fixed keeps
  // every existing L3 projection byte-identical across this rebuild.
  const landmarkKey = `${regionId}/${landmark.id}`;
  const defCards = sentences(content.definition).slice(0, 3);
  const revealCards = defCards.length > 0 ? defCards : [content.definition];

  // Predict: benefit from tradeoffs.pros — NEVER the quiz (check owns the quiz).
  // Distractors: cons + gotchas (source-tagged for per-option feedback).
  const predictCorrect = content.tradeoffs.pros[0]!;
  const predictLabeled: LabeledSource[] = [
    { label: predictCorrect, source: 'pro' },
    ...content.tradeoffs.cons.map((label) => ({ label, source: 'con' as const })),
    ...content.gotchas.map((label) => ({ label, source: 'gotcha' as const })),
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
    { label: content.vibe_coder_default, source: 'default' },
    ...content.gotchas.slice(1).map((label) => ({ label, source: 'gotcha' as const })),
    ...content.tradeoffs.cons.map((label) => ({ label, source: 'con' as const })),
    ...content.when_to_use.map((label) => ({ label, source: 'when_to_use' as const })),
  ];
  const scenario = choiceOptions(
    landmarkKey,
    'scenario',
    'scenario',
    scenarioLabeled,
    content.vibe_coder_default,
    FACTORY_FRAMING.scenarioCorrectLead,
  );

  // Gotcha: correct = first gotcha; distractors = pros + when_to_use (safe practices).
  const gotchaTrap = content.gotchas[0]!;
  const gotchaLabeled: LabeledSource[] = [
    { label: gotchaTrap, source: 'gotcha' },
    ...content.tradeoffs.pros.map((label) => ({ label, source: 'pro' as const })),
    ...content.when_to_use.map((label) => ({ label, source: 'when_to_use' as const })),
  ];
  const gotcha = choiceOptions(
    landmarkKey,
    'gotcha',
    'gotcha',
    gotchaLabeled,
    gotchaTrap,
    FACTORY_FRAMING.gotchaCorrectLead,
  );

  const firstDefinition = sentences(content.definition)[0] ?? content.definition;
  const recapBullets = uniqueLabels([
    firstDefinition,
    content.vibe_coder_default,
    content.gotchas[0]!,
    content.tradeoffs.pros[0]!,
  ]).slice(0, 4);
  while (recapBullets.length < 2) {
    recapBullets.push(content.hook);
  }

  const beats: Beat[] = [
    {
      id: 'hook',
      type: 'hook',
      prompt: content.hook,
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
      prompt: `${FACTORY_FRAMING.scenarioPromptPrefix} ${content.example}`,
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
      prompt: content.vibe_coder_default,
      estimatedSeconds: 15,
    },
    {
      id: 'check-quiz',
      type: 'check',
      prompt: `${FACTORY_FRAMING.checkPromptPrefix}${content.assessment.question}`,
      hint: FACTORY_FRAMING.checkHint,
      estimatedSeconds: 20,
    },
    {
      id: 'recap',
      type: 'recap',
      prompt: `${content.hook}${FACTORY_FRAMING.recapPromptSuffix}`,
      bullets: recapBullets,
      estimatedSeconds: 20,
    },
  ];

  return beatSequenceSchema.parse({
    regionId,
    landmarkId: landmark.id,
    level,
    assessment: content.assessment,
    beats,
  });
}

/**
 * Re-home a legacy landmark's top-level instructional fields as its L3 level
 * content.
 *
 * This is a lossless projection of already-authored production content, not
 * placeholder content: the arcade's L3 tier IS the tradeoffs tier the legacy
 * landmark files already carry, and its `quiz` IS that tier's assessment. It
 * keeps all 48 landmark URLs playable through the L3-only compatibility window
 * (DATA_MODEL §6 step 1) while M4–M6 author real `levels` per landmark. A
 * landmark that declares `levels` never goes through this path.
 */
export function legacyLevelContent(landmark: Landmark): LevelContent {
  return {
    hook: landmark.hook,
    definition: landmark.definition,
    when_to_use: [...landmark.when_to_use],
    tradeoffs: {
      pros: [...landmark.tradeoffs.pros],
      cons: [...landmark.tradeoffs.cons],
    },
    example: landmark.example,
    gotchas: [...landmark.gotchas],
    vibe_coder_default: landmark.vibe_coder_default,
    assessment: {
      question: landmark.quiz.question,
      // The legacy quiz allowed unbounded options; the assessment schema caps at 4.
      options: landmark.quiz.options.slice(0, 4),
      answer: landmark.quiz.answer,
      explanation: landmark.quiz.explanation,
    },
  };
}

/** Every level a landmark can currently be played at, keyed by level id. */
export function landmarkLevelSources(landmark: Landmark): ReadonlyMap<LevelId, LevelContent> {
  if (landmark.levels) {
    return new Map<LevelId, LevelContent>([
      ['l1', landmark.levels.l1],
      ['l2', landmark.levels.l2],
      ['l3', landmark.levels.l3],
    ]);
  }
  return new Map<LevelId, LevelContent>([['l3', legacyLevelContent(landmark)]]);
}

/** Flatten FACTORY_FRAMING values for provenance allowlist tests. */
export function factoryFramingValues(): string[] {
  return Object.values(FACTORY_FRAMING);
}

/** Exact allowed wrong-feedback composites for one level (provenance lock). */
export function allowedWrongFeedbacks(content: LevelContent): string[] {
  const out: string[] = [];
  for (const label of content.tradeoffs.cons) {
    out.push(`${FACTORY_FRAMING.predictWrongConPrefix}${label}`);
    out.push(`${FACTORY_FRAMING.scenarioWrongConPrefix}${label}`);
  }
  for (const label of content.gotchas) {
    out.push(`${FACTORY_FRAMING.predictWrongGotchaPrefix}${label}`);
    out.push(`${FACTORY_FRAMING.scenarioWrongGotchaPrefix}${label}`);
  }
  for (const label of content.when_to_use) {
    out.push(`${FACTORY_FRAMING.scenarioWrongWhenPrefix}${label}`);
    out.push(`${FACTORY_FRAMING.gotchaWrongWhenPrefix}${label}`);
  }
  for (const label of content.tradeoffs.pros) {
    out.push(`${FACTORY_FRAMING.gotchaWrongProPrefix}${label}`);
  }
  return out;
}

/**
 * Collect every claim-bearing string for one level, for tier-aware provenance
 * checks (VAL-012). A fact that is absent from THIS level's canonical fields is
 * a leak even when it appears elsewhere in the same landmark.
 */
export function levelCorpus(title: string, content: LevelContent): string[] {
  return [
    content.hook,
    title,
    content.definition,
    content.example,
    content.vibe_coder_default,
    ...content.when_to_use,
    ...content.gotchas,
    ...content.tradeoffs.pros,
    ...content.tradeoffs.cons,
    content.assessment.question,
    content.assessment.answer,
    content.assessment.explanation,
    ...content.assessment.options,
    ...sentences(content.definition),
  ];
}

export function definitionSentences(text: string): string[] {
  return sentences(text);
}

/**
 * Tier-aware provenance enforcement (REQ-007, VAL-012).
 *
 * `beatSequenceSchema` can only see structure — it has no canonical content to
 * compare against, so on its own it will happily accept a beat carrying a fact
 * that appears nowhere in the landmark. This is the check that makes provenance
 * a real rejection boundary: every claim-bearing string in the sequence must be
 * an exact member of THIS level's corpus or of the fixed framing allowlist.
 * Exact membership only — no prefix/suffix matching, which would let an invented
 * clause ride along behind an allowlisted frame.
 *
 * Scoping to one level is the point: a fact that is canonical for L2 is a leak
 * inside an L1 run, because the player has not been taught it yet.
 *
 * Returns every violation rather than throwing, so a content author sees the
 * whole list at once.
 */
export function sequenceProvenanceViolations(
  sequence: BeatSequence,
  title: string,
  content: LevelContent,
): string[] {
  const corpus = new Set(levelCorpus(title, content));
  const framing = new Set(factoryFramingValues());
  const wrongAllowed = new Set(allowedWrongFeedbacks(content));
  const correctLeads = new Set<string>([
    FACTORY_FRAMING.predictCorrectLead,
    FACTORY_FRAMING.scenarioCorrectLead,
    FACTORY_FRAMING.gotchaCorrectLead,
  ]);
  const composites = new Set<string>([
    `${FACTORY_FRAMING.scenarioPromptPrefix} ${content.example}`,
    `${FACTORY_FRAMING.checkPromptPrefix}${content.assessment.question}`,
    `${content.hook}${FACTORY_FRAMING.recapPromptSuffix}`,
  ]);

  const allowedProse = new Set<string>([...corpus, ...framing, ...composites]);
  const violations: string[] = [];
  const where = `${sequence.regionId}/${sequence.landmarkId}/${sequence.level}`;

  for (const beat of sequence.beats) {
    if (!allowedProse.has(beat.prompt)) {
      violations.push(`${where} beat ${beat.id}: prompt not in level corpus: ${beat.prompt}`);
    }
    if (beat.hint && !allowedProse.has(beat.hint)) {
      violations.push(`${where} beat ${beat.id}: hint not in level corpus: ${beat.hint}`);
    }
    if ('cards' in beat) {
      for (const card of beat.cards) {
        if (!corpus.has(card)) {
          violations.push(`${where} beat ${beat.id}: card not in level corpus: ${card}`);
        }
      }
    }
    if ('bullets' in beat) {
      for (const bullet of beat.bullets) {
        if (!corpus.has(bullet)) {
          violations.push(`${where} beat ${beat.id}: bullet not in level corpus: ${bullet}`);
        }
      }
    }
    if ('options' in beat) {
      for (const option of beat.options) {
        if (!corpus.has(option.label)) {
          violations.push(`${where} beat ${beat.id}: option label not in level corpus: ${option.label}`);
        }
        const isCorrect = option.id === beat.correctOptionId;
        const allowedFeedback = isCorrect ? correctLeads : wrongAllowed;
        if (!allowedFeedback.has(option.feedback)) {
          violations.push(
            `${where} beat ${beat.id}: option ${option.id} feedback not allowlisted: ${option.feedback}`,
          );
        }
      }
    }
  }

  return violations;
}
