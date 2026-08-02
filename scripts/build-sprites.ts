import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { encodePng, type Rgba } from './lib/png.ts';
import { NATIVE, SUDO_REACTIONS, reactionFrames } from '../src/sprites/sudo.ts';

// ISSUE-017 — build the SUDO sprite strips.
//
// The PNGs are generated and committed rather than generated at runtime: the
// browser must not need a build step to show an avatar, and a committed strip is
// something a reviewer can open. Regenerate with `npm run build:sprites`; the
// output is byte-stable, so a diff means the poses actually changed.

const root = resolve(import.meta.dirname, '..');
const outDir = resolve(root, 'public/sprites');
mkdirSync(outDir, { recursive: true });

for (const reaction of SUDO_REACTIONS) {
  const frames = reactionFrames(reaction);
  const width = NATIVE * frames.length;
  const pixels: Rgba[] = new Array(width * NATIVE);
  for (let y = 0; y < NATIVE; y += 1) {
    for (let frame = 0; frame < frames.length; frame += 1) {
      for (let x = 0; x < NATIVE; x += 1) {
        pixels[y * width + frame * NATIVE + x] = frames[frame]![y * NATIVE + x]!;
      }
    }
  }
  const file = resolve(outDir, `sudo-${reaction.name}.png`);
  writeFileSync(file, encodePng(width, NATIVE, pixels));
  console.log(`sudo-${reaction.name}: ${frames.length} frames, ${width}x${NATIVE} -> ${file}`);
}
