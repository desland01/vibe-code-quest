import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  NATIVE,
  PALETTE,
  SUDO_REACTIONS,
  drawSudo,
  reactionFrames,
  silhouette,
} from '@/sprites/sudo';

// ISSUE-017 — the sprite contract (REQ-011, REQ-025, VAL-017, VAL-018).

const ROOT = resolve(import.meta.dirname, '../..');

function shipped(name: string): Buffer {
  return readFileSync(resolve(ROOT, `public/sprites/sudo-${name}.png`));
}

/** Zero-padded 32x32 bounding box of the drawn shape. */
function bounds(mask: boolean[]) {
  let top = NATIVE;
  let bottom = -1;
  let left = NATIVE;
  let right = -1;
  for (let y = 0; y < NATIVE; y += 1) {
    for (let x = 0; x < NATIVE; x += 1) {
      if (!mask[y * NATIVE + x]) continue;
      top = Math.min(top, y);
      bottom = Math.max(bottom, y);
      left = Math.min(left, x);
      right = Math.max(right, x);
    }
  }
  return { top, bottom, left, right };
}

describe('SUDO sprite strips', () => {
  it('ships a strip for every shipped reaction, and none for the v1.1 cuts', () => {
    expect(SUDO_REACTIONS.map((reaction) => reaction.name)).toEqual([
      'idle',
      'thinking',
      'correct',
      'wrong',
      'level-clear',
      'island-clear',
    ]);
    // The long-idle easter egg is a v1.1 cut (§8.1) and must not be shipped.
    expect(SUDO_REACTIONS.some((reaction) => reaction.name.includes('long-idle'))).toBe(false);
    for (const reaction of SUDO_REACTIONS) {
      expect(shipped(reaction.name).length, reaction.name).toBeGreaterThan(0);
    }
  });

  it('matches the frame counts and durations the creative bible specifies', () => {
    const spec: Record<string, { frames: number; durationMs: number }> = {
      idle: { frames: 2, durationMs: 1200 },
      thinking: { frames: 2, durationMs: 900 },
      correct: { frames: 4, durationMs: 360 },
      wrong: { frames: 3, durationMs: 270 },
      'level-clear': { frames: 6, durationMs: 720 },
      'island-clear': { frames: 8, durationMs: 960 },
    };
    for (const reaction of SUDO_REACTIONS) {
      expect(reaction.poses.length, `${reaction.name} frames`).toBe(spec[reaction.name]!.frames);
      expect(reaction.durationMs, `${reaction.name} duration`).toBe(spec[reaction.name]!.durationMs);
    }
  });

  it('is regenerable — the committed PNGs match a fresh build byte for byte', async () => {
    // The strips are generated and committed. If those can drift apart, the
    // committed art stops being reviewable, because the source of truth becomes
    // whichever one someone happened to look at.
    const { encodePng } = await import('../../scripts/lib/png.ts');
    for (const reaction of SUDO_REACTIONS) {
      const frames = reactionFrames(reaction);
      const width = NATIVE * frames.length;
      const pixels = new Array(width * NATIVE);
      for (let y = 0; y < NATIVE; y += 1) {
        for (let f = 0; f < frames.length; f += 1) {
          for (let x = 0; x < NATIVE; x += 1) {
            pixels[y * width + f * NATIVE + x] = frames[f]![y * NATIVE + x]!;
          }
        }
      }
      expect(encodePng(width, NATIVE, pixels).equals(shipped(reaction.name)), reaction.name).toBe(true);
    }
  });

  it('stays inside the 32x32 native grid on every frame', () => {
    for (const reaction of SUDO_REACTIONS) {
      for (const [index, grid] of reactionFrames(reaction).entries()) {
        expect(grid.length, `${reaction.name}#${index}`).toBe(NATIVE * NATIVE);
      }
    }
  });

  it('uses at most five fills plus the shared ink outline', () => {
    const seen = new Set<string>();
    for (const reaction of SUDO_REACTIONS) {
      for (const grid of reactionFrames(reaction)) {
        for (const pixel of grid) {
          if (pixel[3] === 0) continue;
          seen.add(pixel.join(','));
        }
      }
    }
    // Palette rule: max 5 colours per character + the 1px ink outline.
    expect(seen.size).toBeLessThanOrEqual(6);
    expect(seen.has(PALETTE.ink.join(','))).toBe(true);
  });

  // The bible's silhouette rule, run rather than asserted in prose: the verdict
  // has to survive with no colour and no sound, so correct and wrong must be
  // DIFFERENT SHAPES, not the same shape in two moods.
  it('gives correct and wrong distinguishable pure-black silhouettes', () => {
    const correct = SUDO_REACTIONS.find((r) => r.name === 'correct')!;
    const wrong = SUDO_REACTIONS.find((r) => r.name === 'wrong')!;
    const correctPose = silhouette(reactionFrames(correct).at(-1)!);
    const wrongPose = silhouette(reactionFrames(wrong).at(-1)!);

    const differing = correctPose.reduce(
      (count, filled, index) => count + (filled === wrongPose[index] ? 0 : 1),
      0,
    );
    // A handful of differing pixels would technically "differ" while reading as
    // the same dog. Require a substantial share of the drawn area.
    const drawn = correctPose.filter(Boolean).length;
    expect(differing / drawn).toBeGreaterThan(0.2);

    // And specifically: ears up reaches higher than ears flat.
    expect(bounds(correctPose).top).toBeLessThan(bounds(wrongPose).top);
  });

  it('keeps the asymmetric flop ear that distinguishes SUDO at rest', () => {
    // "LEFT EAR permanently flopped over; right ear stands" is the feature that
    // makes the resting silhouette read as a dog rather than a generic blob.
    const rest = silhouette(drawSudo({}));
    const leftTop = bounds(rest.map((v, i) => v && i % NATIVE < NATIVE / 2)).top;
    const rightTop = bounds(rest.map((v, i) => v && i % NATIVE >= NATIVE / 2)).top;
    expect(rightTop).toBeLessThan(leftTop);
  });

  it('mirrors the second half of the zoomies run', () => {
    const island = SUDO_REACTIONS.find((r) => r.name === 'island-clear')!;
    const frames = reactionFrames(island);
    const unmirrored = drawSudo(island.poses[4]!);
    expect(frames[4]).not.toEqual(unmirrored);
  });
});
