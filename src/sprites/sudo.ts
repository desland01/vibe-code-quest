// SUDO — pixel dog, default avatar (ISSUE-017, CREATIVE_BIBLE §1).
//
// The sprite is DRAWN, not stored as a blob of hand-placed pixels. Every
// reaction in the bible is described as a delta from the sitting pose — "crouch
// 2 px", "ears drop 2 px", "eyes become closed 2 px lines" — so the frames are
// expressed the same way: one `drawSudo(pose)` and a list of poses. That keeps
// the twenty-odd frames reviewable (you read the poses, not a pixel dump), keeps
// them consistent with each other by construction, and makes the silhouette test
// something a unit test can actually run.
//
// Palette rule (§ shared technical spec): five colours plus the shared 1px ink
// outline. Fills come from the existing surface tokens so SUDO sits on any
// island without restyling. No third-party product branding anywhere (REQ-025).

export const NATIVE = 32;

export const PALETTE = {
  ink: [0x1a, 0x1a, 0x1a, 0xff],
  gold: [0xe8, 0xb0, 0x4b, 0xff],
  goldShade: [0xc4, 0x8e, 0x33, 0xff],
  paper: [0xff, 0xf8, 0xe9, 0xff],
  collar: [0xd9, 0x6c, 0x6c, 0xff],
  clear: [0x00, 0x00, 0x00, 0x00],
} as const;

export type Rgba = readonly [number, number, number, number];

export type Grid = Rgba[];

function blank(): Grid {
  return Array.from({ length: NATIVE * NATIVE }, () => PALETTE.clear as Rgba);
}

function put(grid: Grid, x: number, y: number, colour: Rgba) {
  if (x < 0 || y < 0 || x >= NATIVE || y >= NATIVE) return;
  grid[y * NATIVE + x] = colour;
}

function rect(grid: Grid, x0: number, y0: number, x1: number, y1: number, colour: Rgba) {
  for (let y = y0; y <= y1; y += 1) for (let x = x0; x <= x1; x += 1) put(grid, x, y, colour);
}

/** Filled ellipse, inclusive bounds. The body language is all round shapes. */
function ellipse(grid: Grid, cx: number, cy: number, rx: number, ry: number, colour: Rgba) {
  for (let y = cy - ry; y <= cy + ry; y += 1) {
    for (let x = cx - rx; x <= cx + rx; x += 1) {
      const dx = (x - cx) / (rx + 0.5);
      const dy = (y - cy) / (ry + 0.5);
      if (dx * dx + dy * dy <= 1) put(grid, x, y, colour);
    }
  }
}

/** 1px ink outline around every non-transparent pixel — the shared silhouette rule. */
function outline(grid: Grid): Grid {
  const out = grid.slice();
  for (let y = 0; y < NATIVE; y += 1) {
    for (let x = 0; x < NATIVE; x += 1) {
      if (grid[y * NATIVE + x]![3] !== 0) continue;
      const neighbour =
        (x > 0 && grid[y * NATIVE + x - 1]![3] !== 0) ||
        (x < NATIVE - 1 && grid[y * NATIVE + x + 1]![3] !== 0) ||
        (y > 0 && grid[(y - 1) * NATIVE + x]![3] !== 0) ||
        (y < NATIVE - 1 && grid[(y + 1) * NATIVE + x]![3] !== 0);
      if (neighbour) out[y * NATIVE + x] = PALETTE.ink as Rgba;
    }
  }
  return out;
}

export function mirror(grid: Grid): Grid {
  const out = blank();
  for (let y = 0; y < NATIVE; y += 1) {
    for (let x = 0; x < NATIVE; x += 1) out[y * NATIVE + (NATIVE - 1 - x)] = grid[y * NATIVE + x]!;
  }
  return out;
}

/**
 * One drawable pose. Every field is a delta the bible names by hand, so a frame
 * list reads as the animation description it came from.
 */
export type Pose = {
  /** Whole-body vertical offset. Negative is airborne, positive is a crouch. */
  bodyY?: number;
  /** Head offset, on top of bodyY. */
  headX?: number;
  headY?: number;
  /** 'flop' is the resting silhouette: left ear over, right ear up. */
  ears?: 'flop' | 'up' | 'down' | 'overEye';
  eyes?: 'open' | 'closed' | 'wide';
  /** Tail nub angle in rough px terms; 'blur' draws the 3-position landing smear. */
  tail?: 'rest' | 'up' | 'wag' | 'blur';
  /** Shoulders raised — the shrug. */
  shoulders?: number;
  /** Chest rise, 1px, for idle breathing. */
  chest?: number;
  /** Quarter-turn count for the level-clear backflip. */
  spin?: 0 | 1 | 2 | 3;
  /** Landing dust puff, 8x4, lives inside the strip per the spec. */
  dust?: boolean;
  /** Collar tag flashes one white pixel (island-clear frame 6). */
  tagFlash?: boolean;
};

function drawUpright(pose: Pose): Grid {
  const g = blank();
  const by = pose.bodyY ?? 0;
  const hx = pose.headX ?? 0;
  const hy = (pose.headY ?? 0) + by;
  const shoulders = pose.shoulders ?? 0;
  const chest = pose.chest ?? 0;

  // Haunches and front legs — a sitting quadruped, wide at the base so the
  // silhouette reads as "dog sitting" and not "blob".
  ellipse(g, 16, 25 + by, 8, 5, PALETTE.goldShade);
  rect(g, 10, 25 + by, 12, 29 + by, PALETTE.gold);
  rect(g, 20, 25 + by, 22, 29 + by, PALETTE.gold);

  // Body / chest.
  ellipse(g, 16, 21 + by - shoulders, 7, 6, PALETTE.gold);
  ellipse(g, 16, 23 + by - chest, 3, 4, PALETTE.paper);

  // Collar sits where the head meets the body, with a 3x3 tag.
  rect(g, 10, 17 + by - shoulders, 22, 18 + by - shoulders, PALETTE.collar);
  rect(g, 15, 19 + by - shoulders, 17, 21 + by - shoulders, PALETTE.collar);
  put(g, 16, 20 + by - shoulders, pose.tagFlash ? PALETTE.paper : PALETTE.goldShade);

  // Tail nub.
  if (pose.tail === 'blur') {
    rect(g, 23, 20 + by, 27, 21 + by, PALETTE.gold);
    rect(g, 23, 23 + by, 27, 24 + by, PALETTE.gold);
    rect(g, 23, 26 + by, 27, 27 + by, PALETTE.gold);
  } else {
    const tailY = pose.tail === 'up' ? 18 : pose.tail === 'wag' ? 22 : 24;
    ellipse(g, 25, tailY + by, 3, 2, PALETTE.gold);
  }

  // Head.
  ellipse(g, 16 + hx, 11 + hy, 8, 7, PALETTE.gold);

  // Ears. The LEFT ear is permanently flopped in the resting silhouette; that
  // asymmetry is SUDO's distinguishing feature and survives the black-shape test.
  const ears = pose.ears ?? 'flop';
  if (ears === 'up') {
    rect(g, 7 + hx, 1 + hy, 10 + hx, 9 + hy, PALETTE.gold);
    rect(g, 22 + hx, 1 + hy, 25 + hx, 9 + hy, PALETTE.gold);
  } else if (ears === 'down') {
    ellipse(g, 8 + hx, 15 + hy, 3, 4, PALETTE.goldShade);
    ellipse(g, 24 + hx, 15 + hy, 3, 4, PALETTE.goldShade);
  } else if (ears === 'overEye') {
    ellipse(g, 11 + hx, 10 + hy, 4, 5, PALETTE.goldShade);
    rect(g, 22 + hx, 2 + hy, 25 + hx, 10 + hy, PALETTE.gold);
  } else {
    ellipse(g, 8 + hx, 13 + hy, 3, 5, PALETTE.goldShade);
    rect(g, 22 + hx, 2 + hy, 25 + hx, 10 + hy, PALETTE.gold);
  }

  // Muzzle + nose.
  ellipse(g, 16 + hx, 14 + hy, 5, 3, PALETTE.paper);
  rect(g, 15 + hx, 12 + hy, 17 + hx, 13 + hy, PALETTE.ink);

  // Eyes.
  const eyes = pose.eyes ?? 'open';
  if (eyes === 'closed') {
    rect(g, 11 + hx, 10 + hy, 13 + hx, 10 + hy, PALETTE.ink);
    rect(g, 19 + hx, 10 + hy, 21 + hx, 10 + hy, PALETTE.ink);
  } else if (eyes === 'wide') {
    rect(g, 11 + hx, 8 + hy, 13 + hx, 10 + hy, PALETTE.ink);
    rect(g, 19 + hx, 8 + hy, 21 + hx, 10 + hy, PALETTE.ink);
  } else {
    rect(g, 12 + hx, 9 + hy, 13 + hx, 10 + hy, PALETTE.ink);
    rect(g, 19 + hx, 9 + hy, 20 + hx, 10 + hy, PALETTE.ink);
  }

  if (pose.dust) {
    rect(g, 4, 28, 11, 29, PALETTE.paper);
    rect(g, 21, 28, 28, 29, PALETTE.paper);
  }

  return outline(g);
}

/** Rotate a drawn grid by whole quarter turns — the backflip, on the pixel grid. */
function rotate(grid: Grid, quarters: 0 | 1 | 2 | 3): Grid {
  if (quarters === 0) return grid;
  let out = grid;
  for (let step = 0; step < quarters; step += 1) {
    const next = blank();
    for (let y = 0; y < NATIVE; y += 1) {
      for (let x = 0; x < NATIVE; x += 1) {
        next[x * NATIVE + (NATIVE - 1 - y)] = out[y * NATIVE + x]!;
      }
    }
    out = next;
  }
  return out;
}

export function drawSudo(pose: Pose): Grid {
  return rotate(drawUpright(pose), pose.spin ?? 0);
}

/**
 * Every shipped reaction, with the frame counts and durations from §1. The
 * long-idle easter egg is deliberately absent — it is a v1.1 cut (§8.1).
 */
export type Reaction = {
  name: string;
  durationMs: number;
  /** CSS animation-iteration-count. */
  iterations: number | 'infinite';
  poses: Pose[];
};

export const SUDO_REACTIONS: readonly Reaction[] = [
  {
    name: 'idle',
    durationMs: 1200,
    iterations: 'infinite',
    poses: [{ tail: 'rest' }, { tail: 'wag', chest: 1 }],
  },
  {
    name: 'thinking',
    durationMs: 900,
    iterations: 'infinite',
    poses: [
      { headX: -2, ears: 'flop' },
      { headX: 2, ears: 'overEye' },
    ],
  },
  {
    // Ears UP plus airtime is the correct verdict, readable with no colour and
    // no sound (§1 "verdict legibility"). The final frame is the static pose.
    name: 'correct',
    durationMs: 360,
    iterations: 1,
    poses: [
      { bodyY: 2, ears: 'up', eyes: 'wide' },
      { bodyY: -4, ears: 'up', eyes: 'wide', tail: 'up' },
      { bodyY: -2, ears: 'up', eyes: 'wide', tail: 'blur' },
      { bodyY: -4, ears: 'up', eyes: 'wide', tail: 'up' },
    ],
  },
  {
    // Ears FLAT plus closed eyes is the wrong verdict — a different silhouette,
    // not a different colour. Resigned, never sad, and never mocking the player.
    name: 'wrong',
    durationMs: 270,
    iterations: 1,
    poses: [
      { shoulders: 1, ears: 'down' },
      { shoulders: 2, ears: 'down', eyes: 'closed' },
      { shoulders: 2, ears: 'down', eyes: 'closed', tail: 'rest' },
    ],
  },
  {
    name: 'level-clear',
    durationMs: 720,
    iterations: 2,
    poses: [
      { bodyY: 2, ears: 'up' },
      { bodyY: -3, ears: 'up', spin: 1 },
      { bodyY: -4, ears: 'up', spin: 2 },
      { bodyY: -3, ears: 'up', spin: 3 },
      { bodyY: -1, ears: 'up', tail: 'up' },
      { bodyY: 1, ears: 'up', tail: 'blur', dust: true },
    ],
  },
  {
    name: 'island-clear',
    durationMs: 960,
    iterations: 'infinite',
    poses: [
      { ears: 'up', tail: 'up' },
      { ears: 'up', tail: 'blur', bodyY: -1 },
      { ears: 'up', tail: 'up', headX: 1 },
      { ears: 'up', tail: 'blur', bodyY: -1, headX: 1 },
      { ears: 'up', tail: 'up', headX: -1 },
      { ears: 'up', tail: 'blur', bodyY: -1, tagFlash: true },
      { ears: 'up', tail: 'up', headX: -1 },
      { ears: 'up', tail: 'blur', bodyY: -1 },
    ],
  },
];

/** Frames 5-8 of the zoomies run mirrored, per §1. */
export function reactionFrames(reaction: Reaction): Grid[] {
  return reaction.poses.map((pose, index) => {
    const grid = drawSudo(pose);
    return reaction.name === 'island-clear' && index >= 4 ? mirror(grid) : grid;
  });
}

/** Binary silhouette — the pure-black shape test the bible requires. */
export function silhouette(grid: Grid): boolean[] {
  return grid.map((pixel) => pixel[3] !== 0);
}
