import { mkdir, readdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildContentManifest } from '../src/content/manifest.ts';
import { regionMetas } from '../src/content/regions.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

async function verifyRegistryFiles() {
  for (const region of regionMetas) {
    const entries = (await readdir(resolve(root, 'src/content', region.id)))
      .filter((name) => name.endsWith('.ts'))
      .map((name) => name.slice(0, -3))
      .sort();
    const expected = [...region.landmarkIds].sort();
    if (JSON.stringify(entries) !== JSON.stringify(expected)) {
      throw new Error(`Registry/files mismatch for ${region.id}: expected ${expected.join(', ')}, got ${entries.join(', ')}`);
    }
  }
}

function generatedAt() {
  const epoch = process.env.SOURCE_DATE_EPOCH;
  if (epoch !== undefined) {
    const milliseconds = Number(epoch) * 1000;
    if (!Number.isFinite(milliseconds)) throw new Error('SOURCE_DATE_EPOCH must be a Unix timestamp');
    return new Date(milliseconds).toISOString();
  }
  return new Date().toISOString();
}

await verifyRegistryFiles();
const manifest = buildContentManifest(generatedAt());
if (process.argv.includes('--forbid-drafts')) {
  const drafts = manifest.regions.flatMap((region) =>
    region.landmarks.filter((landmark) => landmark.draft).map((landmark) => `${region.id}/${landmark.id}`)
  );
  if (drafts.length) throw new Error(`Draft landmarks are forbidden:\n${drafts.join('\n')}`);
}
const output = resolve(root, `public/content-manifest.v${manifest.version}.json`);
await mkdir(dirname(output), { recursive: true });
await writeFile(output, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(`Validated ${manifest.regions.length} regions and 48 landmarks; wrote ${output}`);
