import { afterEach, describe, expect, it, vi } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { isHostedMode } from '@/server/hosting';

describe('hosting mode', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('is true when a database is configured', () => {
    vi.stubEnv('DATABASE_URL', 'configured');
    expect(isHostedMode()).toBe(true);
  });

  it('is false when a database is not configured', () => {
    vi.stubEnv('DATABASE_URL', '');
    expect(isHostedMode()).toBe(false);
  });
});

// ISSUE-018 — the "no audio files, no audio dependency, Web Audio only" guards
// (VAL-021, VAL-022, VAL-023). These live here because they are hosting facts:
// what the deployed bundle is allowed to contain.
describe('audio ships as code, never as assets (VAL-021, VAL-022, VAL-023)', () => {
  const ROOT = resolve(import.meta.dirname, '../..');

  function walk(dir: string): string[] {
    return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const full = resolve(dir, entry.name);
      return entry.isDirectory() ? walk(full) : [full];
    });
  }

  it('ships no audio file under public/ (VAL-021)', () => {
    const audioExtensions = /\.(mp3|wav|ogg|m4a|aac|flac|opus|weba|mid|midi|xm|mod)$/i;
    const offenders = walk(resolve(ROOT, 'public')).filter((file) => audioExtensions.test(file));
    expect(offenders).toEqual([]);
  });

  it('declares no audio library as a runtime dependency (VAL-022)', () => {
    const pkg = JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf8')) as {
      dependencies: Record<string, string>;
    };
    const audioLibraries = [
      'tone', 'howler', 'wad', 'pizzicato', 'soundfont-player', 'audiobuffer',
      'web-audio-daw', 'standardized-audio-context', 'gsap', 'framer-motion',
    ];
    const declared = Object.keys(pkg.dependencies);
    expect(declared.filter((name) => audioLibraries.includes(name))).toEqual([]);
  });

  it('uses AudioContext only — no HTMLAudioElement, no new Audio() (VAL-023)', () => {
    const sources = walk(resolve(ROOT, 'src/audio'));
    expect(sources.length).toBeGreaterThan(0);
    for (const file of sources) {
      // Comments are stripped first: a comment that NAMES the banned API is
      // documentation, not a use of it, and a guard that cannot tell the
      // difference teaches people to stop writing the documentation.
      const text = readFileSync(file, 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/.*$/gm, '');
      expect(text, file).not.toMatch(/new\s+Audio\s*\(/);
      expect(text, file).not.toMatch(/HTMLAudioElement/);
      expect(text, file).not.toMatch(/document\.createElement\(\s*['"]audio['"]/);
    }
    // And the engine really does reach for AudioContext.
    const engine = readFileSync(resolve(ROOT, 'src/audio/AudioEngine.ts'), 'utf8');
    expect(engine).toMatch(/new AudioContext\(\)/);
  });
});
