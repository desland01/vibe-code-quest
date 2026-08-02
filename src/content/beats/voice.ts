import type { Beat, BeatSequence } from './schema.ts';

// ISSUE-008: the copy enforcement suite (CREATIVE_BIBLE §6).
//
// "Enforcement before content" — these checks exist and are armed BEFORE any
// island is authored, so drift fails a build rather than surviving into 144 runs
// and needing a sweep afterwards. They deliberately have no opinion about
// meaning: they measure length, match banned strings, and score reading level.
// Taste is the owner's gate (ISSUE-023), not a regex's.

// ── 1. Word budgets (§6.3) ───────────────────────────────────────────────────

export const WORD_BUDGETS = {
  hook: 14,
  predictPrompt: 16,
  revealCard: 18,
  scenarioPrompt: 28,
  optionLabel: 9,
  gotchaPrompt: 14,
  defaultPrompt: 20,
  checkQuestion: 16,
  checkOptionLabel: 8,
  recapBullet: 10,
  feedbackAfterVerdict: 12,
  levelSubtitle: 14,
  fallbackPrompt: 20,
} as const;

export const MAX_REVEAL_CARDS = 3;
export const MAX_RECAP_BULLETS = 4;
export const MAX_OPTIONS = 4;

/** The entire allowlisted verdict vocabulary (§6.1 rule 8). */
export const VERDICT_LEADS = ['Yep.', 'Not that one.', 'Noted.'] as const;

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * A feedback line is budgeted AFTER its verdict lead: the lead is fixed
 * vocabulary and must not eat the author's twelve words.
 */
export function stripVerdictLead(feedback: string): string {
  for (const lead of VERDICT_LEADS) {
    if (feedback.startsWith(lead)) return feedback.slice(lead.length).trim();
  }
  return feedback;
}

function promptBudget(beat: Beat): number {
  switch (beat.type) {
    case 'hook':
      return WORD_BUDGETS.hook;
    case 'predict':
      return WORD_BUDGETS.predictPrompt;
    case 'scenario':
      return WORD_BUDGETS.scenarioPrompt;
    case 'gotcha':
      return WORD_BUDGETS.gotchaPrompt;
    case 'default':
      return WORD_BUDGETS.defaultPrompt;
    case 'check':
      return WORD_BUDGETS.checkQuestion;
    case 'recap':
      return WORD_BUDGETS.recapBullet;
    default:
      return WORD_BUDGETS.fallbackPrompt;
  }
}

export function wordBudgetViolations(beat: Beat): string[] {
  const out: string[] = [];
  const budget = promptBudget(beat);
  // The recap PROMPT is not a bullet; §6.4 item 5 deletes its suffix entirely, so
  // it is held to the hook budget rather than the per-bullet one.
  const effective = beat.type === 'recap' ? WORD_BUDGETS.hook : budget;
  if (countWords(beat.prompt) > effective) {
    out.push(`beat ${beat.id}: prompt is ${countWords(beat.prompt)} words, budget ${effective}`);
  }

  if ('cards' in beat) {
    if (beat.cards.length > MAX_REVEAL_CARDS) {
      out.push(`beat ${beat.id}: ${beat.cards.length} reveal cards, max ${MAX_REVEAL_CARDS}`);
    }
    for (const card of beat.cards) {
      if (countWords(card) > WORD_BUDGETS.revealCard) {
        out.push(`beat ${beat.id}: reveal card is ${countWords(card)} words, budget ${WORD_BUDGETS.revealCard}`);
      }
    }
  }

  if ('bullets' in beat) {
    if (beat.bullets.length > MAX_RECAP_BULLETS) {
      out.push(`beat ${beat.id}: ${beat.bullets.length} recap bullets, max ${MAX_RECAP_BULLETS}`);
    }
    for (const bullet of beat.bullets) {
      if (countWords(bullet) > WORD_BUDGETS.recapBullet) {
        out.push(`beat ${beat.id}: recap bullet is ${countWords(bullet)} words, budget ${WORD_BUDGETS.recapBullet}`);
      }
    }
  }

  if ('options' in beat) {
    if (beat.options.length > MAX_OPTIONS) {
      out.push(`beat ${beat.id}: ${beat.options.length} options, max ${MAX_OPTIONS}`);
    }
    // Check beats carry no options in this grammar — the assessment does — so
    // every option label here is a predict/scenario/gotcha label.
    const labelBudget = WORD_BUDGETS.optionLabel;
    for (const option of beat.options) {
      if (countWords(option.label) > labelBudget) {
        out.push(`beat ${beat.id}: option ${option.id} label is ${countWords(option.label)} words, budget ${labelBudget}`);
      }
      const body = stripVerdictLead(option.feedback);
      if (countWords(body) > WORD_BUDGETS.feedbackAfterVerdict) {
        out.push(
          `beat ${beat.id}: option ${option.id} feedback is ${countWords(body)} words after the verdict lead, budget ${WORD_BUDGETS.feedbackAfterVerdict}`,
        );
      }
    }
  }

  return out;
}

// ── 2. Banned phrases (§6.2) ─────────────────────────────────────────────────

/** Exact substrings that must never appear, case-insensitively. */
export const BANNED_PHRASES: readonly string[] = [
  'this approach',
  'holds up under real use',
  'which move fits best',
  'keep this default close',
  'operating discipline',
  'deliberate maintenance',
  'tell your agent to',
  "it's important to note",
  'it is important to note',
  'in the world of',
  'when it comes to',
  'prove it:',
  "let's find out",
];

/** Hedge adverbs and filler words, matched as whole words (§6.2). */
export const BANNED_WORDS: readonly string[] = [
  'often',
  'quite',
  'generally',
  'typically',
  'arguably',
  'leverage',
  'robust',
  'utilize',
  'comprehensive',
  'crucial',
  'seamless',
  'seamlessly',
  'simply',
  'journey',
  'explore',
  'dive',
  'empower',
];

export function bannedPhraseViolations(text: string, where: string): string[] {
  const out: string[] = [];
  const lower = text.toLowerCase();
  for (const phrase of BANNED_PHRASES) {
    if (lower.includes(phrase)) out.push(`${where}: banned phrase "${phrase}"`);
  }
  for (const word of BANNED_WORDS) {
    if (new RegExp(`\\b${word}\\b`, 'i').test(text)) out.push(`${where}: banned word "${word}"`);
  }
  // Semicolon splices doing two sentences' work.
  if (text.includes(';')) out.push(`${where}: semicolon splice`);
  // Em-dash chains — two per sentence — like this.
  if ((text.match(/—/g)?.length ?? 0) >= 2) out.push(`${where}: em-dash chain`);
  // No hype in prompts, options, feedback or recaps (§6.1 rule 6). Furniture is
  // not routed through this checker.
  if (text.includes('!')) out.push(`${where}: exclamation point outside furniture`);
  return out;
}

// ── 3. Reading level (§6, grade 8 ceiling) ───────────────────────────────────

function countSyllables(word: string): number {
  const cleaned = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!cleaned) return 0;
  if (cleaned.length <= 3) return 1;
  const groups = cleaned
    .replace(/(?:es|ed|[^laeiouy]e)$/, '')
    .match(/[aeiouy]{1,2}/g);
  return Math.max(1, groups?.length ?? 1);
}

/**
 * Flesch-Kincaid grade level, implemented locally rather than pulled in as a
 * dependency: the arcade adds no runtime dependencies, and a scoring formula is
 * a dozen lines that would otherwise be a supply-chain surface.
 */
export function readingGrade(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 0;
  const sentences = Math.max(1, (text.match(/[.!?]+/g) ?? []).length);
  const syllables = words.reduce((sum, word) => sum + countSyllables(word), 0);
  return 0.39 * (words.length / sentences) + 11.8 * (syllables / words.length) - 15.59;
}

export const READING_GRADE_CEILING = 8;

/**
 * Very short strings score wildly under Flesch-Kincaid — a four-word option
 * label is not "grade 14" prose — so the ceiling applies to lines long enough
 * for the formula to mean anything.
 */
export const READING_GRADE_MIN_WORDS = 12;

export function readingLevelViolations(text: string, where: string): string[] {
  if (countWords(text) < READING_GRADE_MIN_WORDS) return [];
  const grade = readingGrade(text);
  if (grade > READING_GRADE_CEILING) {
    return [`${where}: reading grade ${grade.toFixed(1)} exceeds ceiling ${READING_GRADE_CEILING}`];
  }
  return [];
}

// ── Whole-sequence check ─────────────────────────────────────────────────────

/** Every author-visible string in a beat, with a label for the error message. */
export function beatProse(beat: Beat): Array<{ where: string; text: string }> {
  const out = [{ where: `beat ${beat.id} prompt`, text: beat.prompt }];
  if (beat.hint) out.push({ where: `beat ${beat.id} hint`, text: beat.hint });
  if ('cards' in beat) {
    beat.cards.forEach((card, i) => out.push({ where: `beat ${beat.id} card ${i}`, text: card }));
  }
  if ('bullets' in beat) {
    beat.bullets.forEach((b, i) => out.push({ where: `beat ${beat.id} bullet ${i}`, text: b }));
  }
  if ('options' in beat) {
    for (const option of beat.options) {
      out.push({ where: `beat ${beat.id} option ${option.id} label`, text: option.label });
      out.push({ where: `beat ${beat.id} option ${option.id} feedback`, text: option.feedback });
    }
  }
  return out;
}

export function sequenceVoiceViolations(sequence: BeatSequence): string[] {
  const where = `${sequence.regionId}/${sequence.landmarkId}/${sequence.level}`;
  const out: string[] = [];
  for (const beat of sequence.beats) {
    for (const violation of wordBudgetViolations(beat)) out.push(`${where} ${violation}`);
    for (const { where: field, text } of beatProse(beat)) {
      out.push(...bannedPhraseViolations(text, `${where} ${field}`));
      out.push(...readingLevelViolations(text, `${where} ${field}`));
    }
  }
  return out;
}
