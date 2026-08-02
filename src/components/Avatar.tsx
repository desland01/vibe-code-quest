'use client';

import styles from './Avatar.module.css';

// ISSUE-017 — SUDO on the stage (REQ-011, VAL-017, VAL-018).
//
// `reaction` is the SEMANTIC outcome, not a sprite name. VAL-018 asserts
// `data-reaction="celebrate"` on a correct answer and `"shrug"` on a wrong one,
// and those names have to survive a future character swap: NULL celebrates with
// a tail-check, not a hop, but it is still `celebrate`. The sprite file is an
// implementation detail behind that mapping.

export type AvatarReaction =
  | 'idle'
  | 'thinking'
  | 'celebrate'
  | 'shrug'
  | 'level-clear'
  | 'island-clear';

/** Semantic reaction → shipped sprite strip and its frame count. */
const SPRITES: Record<AvatarReaction, { file: string; frames: number; loops: boolean }> = {
  idle: { file: 'sudo-idle', frames: 2, loops: true },
  thinking: { file: 'sudo-thinking', frames: 2, loops: true },
  celebrate: { file: 'sudo-correct', frames: 4, loops: false },
  shrug: { file: 'sudo-wrong', frames: 3, loops: false },
  'level-clear': { file: 'sudo-level-clear', frames: 6, loops: false },
  'island-clear': { file: 'sudo-island-clear', frames: 8, loops: true },
};

const FRAME_CLASS: Record<number, string> = {
  2: styles.f2,
  3: styles.f3,
  4: styles.f4,
  6: styles.f6,
  8: styles.f8,
};

export function Avatar({
  reaction,
  scale = 2,
  label,
}: {
  reaction: AvatarReaction;
  /** Integer scale only — ×2 in HUD and trail, ×3 on the stamp panel. */
  scale?: 2 | 3;
  label?: string;
}) {
  const sprite = SPRITES[reaction];

  // The element is keyed by reaction so a CSS animation restarts when the
  // reaction changes. A REPEATED identical outcome — two wrong picks on the same
  // beat — holds the shrug pose rather than replaying it. That is a deliberate
  // trade: the alternative is a render-time counter whose only job is to bump a
  // key, and a held pose still says exactly what a replayed one says.
  return (
    <span
      key={reaction}
      className={`${styles.avatar} ${FRAME_CLASS[sprite.frames] ?? styles.f2} ${sprite.loops ? styles.loop : styles.once}`}
      data-avatar="sudo"
      data-reaction={reaction}
      style={
        // CSS custom properties drive the strip: the sheet holds one keyframe
        // pair and only the step count varies per reaction.
        { '--sprite': `url(/sprites/${sprite.file}.png)`, '--px': `${32 * scale}px` } as React.CSSProperties
      }
      role="img"
      aria-label={label ?? 'SUDO'}
    />
  );
}
