import type { Beat, BeatSequence, ChoiceBeat } from '@/content/beats/schema';

// Pure BeatPlayer state machine (frozen DESIGN_CONTRACT §4/§8).
// displayIndex = local navigation (back-review writes NOTHING).
// furthestBeatIndex/checked/completed/stampedAt = monotonic progress facts that
// mirror to localStorage + PUT /api/progress (server merges atomically).
// Analytics edges are detected in BeatPlayer via refs — never from reducer state.

export type Feedback = { kind: 'correct' | 'wrong' | 'info'; optionId: string; text: string } | null;

export type PlayerState = {
  displayIndex: number;
  furthestBeatIndex: number;
  revealCount: number;              // how many reveal cards are visible on the current reveal beat
  classifications: Record<string, 'pro' | 'con'>; // tradeoff item id -> picked side (current beat)
  feedback: Feedback;
  checked: boolean;
  completed: boolean;
  stampedAt: string | null;
};

export type PlayerAction =
  | { type: 'advance' }                                   // resolve current beat → next beat
  | { type: 'reveal_next' }                               // show one more reveal card (does NOT advance)
  | { type: 'choose'; optionId: string }                  // predict/scenario/gotcha option pick
  | { type: 'classify'; itemId: string; side: 'pro' | 'con' } // tradeoff pick
  | { type: 'grade_check'; correct: boolean }             // check beat graded against landmark.quiz
  | { type: 'back' }                                      // review previous beat (local only)
  | { type: 'stamp'; stampedAt: string }                  // recap stamp pressed (only completion path)
  | { type: 'resume'; furthestBeatIndex: number; checked: boolean; completed: boolean; stampedAt: string | null };

export function isChoiceBeat(beat: Beat): beat is ChoiceBeat {
  return 'options' in beat;
}

// Entry rule for any beat: a reveal beat shows its first card immediately.
// Applied everywhere displayIndex lands on a beat (init, advance, back, resume).
function revealCountOnEntry(beat: Beat | undefined): number {
  return beat?.type === 'reveal' ? 1 : 0;
}

export function initialPlayerState(sequence: BeatSequence): PlayerState {
  return {
    displayIndex: 0,
    furthestBeatIndex: 0,
    revealCount: revealCountOnEntry(sequence.beats[0]),
    classifications: {},
    feedback: null,
    checked: false,
    completed: false,
    stampedAt: null,
  };
}

// Can the current beat resolve and advance?
// predict: ANY pick resolves (recorded, never penalized).
// scenario/gotcha: correct pick required (fail-soft retry).
// reveal: all cards shown. tradeoff: all items classified correctly.
// check: passed. hook/default: always. recap: NEVER (stamp-only).
export function canAdvance(beat: Beat, state: PlayerState): boolean {
  switch (beat.type) {
    case 'recap':
      return false; // terminal: stamp is the only resolution
    case 'predict':
      return state.feedback !== null; // any pick counts
    case 'scenario':
    case 'gotcha':
      return state.feedback?.kind === 'correct';
    case 'reveal':
      return state.revealCount >= beat.cards.length;
    case 'tradeoff':
      return beat.items.every((item) => state.classifications[item.id] === item.side);
    case 'check':
      return state.feedback?.kind === 'correct';
    default:
      return true; // hook, default
  }
}

export function playerReducer(sequence: BeatSequence, state: PlayerState, action: PlayerAction): PlayerState {
  const beat = sequence.beats[state.displayIndex];
  if (!beat) return state;

  switch (action.type) {
    case 'advance': {
      // Review-mode forward is unconditional below the frontier; back-review writes nothing,
      // and shouldPersist stays false because furthest does not grow.
      const belowFrontier = state.displayIndex < state.furthestBeatIndex;
      if (!belowFrontier && !canAdvance(beat, state)) return state;
      const nextIndex = Math.min(state.displayIndex + 1, sequence.beats.length - 1);
      if (nextIndex === state.displayIndex) return state; // already terminal; stamp-only from here
      // NEVER sets completed — only stamp does.
      return {
        ...state,
        displayIndex: nextIndex,
        furthestBeatIndex: Math.max(state.furthestBeatIndex, nextIndex),
        revealCount: revealCountOnEntry(sequence.beats[nextIndex]),
        classifications: {},
        feedback: null,
      };
    }

    case 'reveal_next': {
      if (beat.type !== 'reveal') return state;
      return { ...state, revealCount: Math.min(state.revealCount + 1, beat.cards.length) };
    }

    case 'choose': {
      if (!isChoiceBeat(beat)) return state;
      const option = beat.options.find((candidate) => candidate.id === action.optionId);
      if (!option) return state;
      if (beat.type === 'predict') {
        // Recorded, never penalized: any pick resolves with informational feedback.
        return { ...state, feedback: { kind: 'info', optionId: option.id, text: option.feedback } };
      }
      // scenario/gotcha: fail-soft retry — wrong → feedback + reselect, no lockout.
      const correct = option.id === beat.correctOptionId;
      return {
        ...state,
        feedback: { kind: correct ? 'correct' : 'wrong', optionId: option.id, text: option.feedback },
      };
    }

    case 'classify': {
      if (beat.type !== 'tradeoff') return state;
      if (!beat.items.some((item) => item.id === action.itemId)) return state; // ignore unknown ids
      return {
        ...state,
        classifications: { ...state.classifications, [action.itemId]: action.side },
        feedback: null,
      };
    }

    case 'grade_check': {
      if (beat.type !== 'check') return state;
      if (action.correct) {
        return {
          ...state,
          feedback: { kind: 'correct', optionId: 'quiz', text: 'Correct.' },
          checked: true,
        };
      }
      return {
        ...state,
        feedback: { kind: 'wrong', optionId: 'quiz', text: 'Not quite — try again.' },
      };
    }

    case 'back': {
      if (state.displayIndex === 0) return state;
      // LOCAL ONLY: displayIndex moves, furthest/progress facts untouched. No write fires.
      return {
        ...state,
        displayIndex: state.displayIndex - 1,
        revealCount: revealCountOnEntry(sequence.beats[state.displayIndex - 1]),
        classifications: {},
        feedback: null,
      };
    }

    case 'stamp': {
      // The ONLY completion path. Requires terminal + checked; idempotent.
      if (!state.checked) return state;
      if (state.displayIndex !== sequence.beats.length - 1) return state;
      if (state.completed) return state; // idempotent: completed always carries stampedAt
      return { ...state, completed: true, stampedAt: action.stampedAt };
    }

    case 'resume': {
      // Merge monotonically: saved progress can only raise furthest/flags, never lower.
      const furthest = Math.max(state.furthestBeatIndex, Math.min(action.furthestBeatIndex, sequence.beats.length - 1));
      return {
        ...state,
        displayIndex: furthest,
        furthestBeatIndex: furthest,
        revealCount: revealCountOnEntry(sequence.beats[furthest]),
        checked: state.checked || action.checked,
        completed: state.completed || action.completed,
        stampedAt: state.stampedAt ?? action.stampedAt,
      };
    }

    default:
      return state;
  }
}

// Facts that persist. Only these ever reach localStorage / the server.
export function persistentFacts(state: PlayerState) {
  return {
    furthestBeatIndex: state.furthestBeatIndex,
    checked: state.checked,
    completed: state.completed,
    stampedAt: state.stampedAt,
  };
}

// Should this transition fire a progress write? Advance (furthest grew),
// check pass (checked flipped), stamp (completed/stampedAt set). Back-review: never.
export function shouldPersist(prev: PlayerState, next: PlayerState): boolean {
  return (
    next.furthestBeatIndex > prev.furthestBeatIndex ||
    (!prev.checked && next.checked) ||
    (!prev.completed && next.completed) ||
    (prev.stampedAt === null && next.stampedAt !== null)
  );
}
