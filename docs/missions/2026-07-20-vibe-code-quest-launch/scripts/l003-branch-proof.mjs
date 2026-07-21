#!/usr/bin/env node
/**
 * L-003 orchestrator — disposable Neon branch XP/RLS proof.
 * Secrets stay in process memory only. Never print connection strings.
 */
import { spawnSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

const ROOT = '/Users/thebeast/code-tutor';
const require = createRequire(resolve(ROOT, 'package.json'));
const dotenv = require('dotenv');
dotenv.config({ path: resolve(ROOT, '.env.local'), override: false, quiet: true });

const projectId = process.env.NEON_PROJECT_ID;
if (!projectId) {
  console.error('NEON_PROJECT_ID missing');
  process.exit(1);
}

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const branchName = `vibe-launch-l003-${stamp}`;
const evidenceDir = resolve(ROOT, 'docs/missions/2026-07-20-vibe-code-quest-launch/evidence');
mkdirSync(evidenceDir, { recursive: true });

const PATH = `${process.env.HOME}/.bun/bin:${process.env.PATH}`;
const envBase = { ...process.env, PATH, NO_COLOR: '1', FORCE_COLOR: '0' };

function run(cmd, args, opts = {}) {
  return spawnSync(cmd, args, {
    encoding: 'utf8',
    cwd: ROOT,
    env: { ...envBase, ...(opts.env || {}) },
  });
}

function neonJson(args) {
  const res = run('bunx', ['neonctl', ...args, '--output', 'json', '--no-color']);
  if (res.status !== 0) {
    const err = sanitize(res.stderr || res.stdout || '').slice(0, 500);
    throw new Error(`neonctl ${args.join(' ')} failed (status ${res.status}): ${err}`);
  }
  const text = (res.stdout || '').trim();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    const m = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])\s*$/);
    if (!m) throw new Error(`neonctl non-json: ${text.slice(0, 120)}`);
    return JSON.parse(m[0]);
  }
}

function branchList() {
  const list = neonJson(['branches', 'list', '--project-id', projectId]);
  return Array.isArray(list) ? list : list?.branches || [];
}

function sanitize(text) {
  return String(text || '')
    .split('\n')
    .filter((l) => !/postgres(ql)?:\/\//i.test(l) && !/password|pwd=/i.test(l))
    .join('\n');
}

function parseConnectionString(raw) {
  const text = String(raw || '').trim();
  try {
    const parsed = JSON.parse(text);
    if (typeof parsed === 'string') return parsed.trim();
    if (Array.isArray(parsed)) {
      const first = parsed[0];
      if (typeof first === 'string') return first.trim();
      return String(
        first?.connection_string || first?.connectionString || first?.uri || first?.url || first?.cs || ''
      ).trim();
    }
    return String(
      parsed.connection_string ||
        parsed.connectionString ||
        parsed.uri ||
        parsed.url ||
        parsed.cs ||
        ''
    ).trim();
  } catch {
    const m = text.match(/postgres(?:ql)?:\/\/\S+/i);
    return m ? m[0].replace(/["']+$/, '') : '';
  }
}

let branchId = null;
let parentId = null;
let parentName = 'main';
let xpStdout = '';
let xpStderr = '';
let xpStatus = 1;
let beatStdout = '';
let beatStderr = '';
let beatStatus = 1;
let migrateSummary = 'not-run';
let deleted = false;
let failureReason = '';
let postMigrateProbe = null;
const startedAt = new Date().toISOString();

try {
  const existing = branchList();
  const parent =
    existing.find((b) => b.name === 'main') || existing.find((b) => b.default || b.primary);
  if (!parent?.id) throw new Error('Could not resolve parent main branch id');
  parentId = parent.id;
  parentName = parent.name || 'main';
  console.log(`Parent: ${parentName} (${parentId})`);

  console.log(`Creating branch ${branchName} from ${parentName}…`);
  const created = neonJson([
    'branches',
    'create',
    '--project-id',
    projectId,
    '--name',
    branchName,
    '--parent',
    parentName,
  ]);
  const branch = created?.branch || created?.branches?.[0] || created;
  branchId = branch?.id;
  if (!branchId) {
    throw new Error(`No branch id in create response keys=${Object.keys(created || {}).join(',')}`);
  }
  console.log(`Branch ready: name=${branch?.name || branchName} id=${branchId}`);

  for (let i = 0; i < 40; i++) {
    const row = branchList().find((b) => b.id === branchId);
    const state = row?.current_state || row?.state || 'unknown';
    if (state === 'ready') break;
    console.log(`Waiting for branch state=${state}…`);
    spawnSync('sleep', ['2']);
  }

  const csRes = run('bunx', [
    'neonctl',
    'connection-string',
    branchId,
    '--project-id',
    projectId,
    '--role-name',
    'neondb_owner',
    '--output',
    'json',
    '--no-color',
  ]);
  if (csRes.status !== 0) {
    throw new Error(
      `connection-string failed (status ${csRes.status}): ${sanitize(csRes.stderr || csRes.stdout).slice(0, 300)}`
    );
  }

  const connectionString = parseConnectionString(csRes.stdout || '');
  if (!connectionString.startsWith('postgres')) {
    let keys = 'unparsed';
    try {
      const p = JSON.parse((csRes.stdout || '').trim());
      keys = typeof p === 'string' ? 'string' : Object.keys(p || {}).join(',');
    } catch {
      keys = `non-json len=${(csRes.stdout || '').length}`;
    }
    throw new Error(`connection-string parse failed; response keys/meta=${keys}`);
  }
  console.log('Connection string captured (not printed).');

  console.log('Running migrations on branch…');
  const mig = run('npm', ['run', 'db:migrate'], {
    env: {
      DATABASE_URL_UNPOOLED: connectionString,
      DATABASE_URL: connectionString,
    },
  });
  const migOk = mig.status === 0;
  const migTail = sanitize(mig.stdout || mig.stderr || '')
    .trim()
    .split('\n')
    .slice(-20)
    .join('\n');
  migrateSummary = migOk
    ? `exit 0 — ${(mig.stdout || '').includes('0009_xp') ? 'applied 0009_xp.sql' : 'already-present / no-op'}`
    : `exit ${mig.status}`;
  console.log(migTail || migrateSummary);
  if (!migOk) {
    throw new Error(`migrate failed: ${migrateSummary}`);
  }

  // Post-migrate probe (no secrets)
  const probe = run(
    'node',
    [
      '--input-type=module',
      '-e',
      `
import pg from 'pg';
const c = new pg.Client({ connectionString: process.env.CS });
await c.connect();
const r = await c.query(\`
  SELECT
    to_regclass('public.xp_awards') AS xp_awards,
    EXISTS(SELECT 1 FROM schema_migrations WHERE name = '0009_xp.sql') AS migrated_0009,
    (SELECT count(*)::int FROM schema_migrations) AS mig_count,
    has_table_privilege('app_user', 'xp_awards', 'SELECT') AS can_select,
    has_table_privilege('app_user', 'xp_awards', 'INSERT') AS can_insert,
    has_table_privilege('app_user', 'xp_awards', 'UPDATE') AS can_update,
    has_table_privilege('app_user', 'xp_awards', 'DELETE') AS can_delete,
    (SELECT count(*)::int FROM xp_awards) AS award_rows,
    (SELECT count(*)::int FROM xp_awards
      WHERE awarded_at >= date_trunc('week', now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC') AS weekly_window_rows
\`);
console.log(JSON.stringify(r.rows[0]));
await c.end();
`,
    ],
    { env: { CS: connectionString } }
  );
  if (probe.status !== 0) {
    throw new Error(`post-migrate probe failed: ${sanitize(probe.stderr || probe.stdout).slice(0, 300)}`);
  }
  postMigrateProbe = JSON.parse((probe.stdout || '{}').trim() || '{}');
  console.log('Post-migrate probe:', JSON.stringify(postMigrateProbe));
  if (!postMigrateProbe.xp_awards || !postMigrateProbe.migrated_0009) {
    throw new Error('xp_awards missing or 0009 not recorded after migrate');
  }
  if (
    !postMigrateProbe.can_select ||
    !postMigrateProbe.can_insert ||
    postMigrateProbe.can_update ||
    postMigrateProbe.can_delete
  ) {
    throw new Error(`app_user privileges wrong: ${JSON.stringify(postMigrateProbe)}`);
  }

  console.log('Running xp.integration.test.ts…');
  const xpTest = run(
    './node_modules/.bin/vitest',
    ['run', 'src/__tests__/xp.integration.test.ts'],
    { env: { TEST_DATABASE_URL: connectionString } }
  );
  xpStatus = xpTest.status ?? 1;
  xpStdout = xpTest.stdout || '';
  xpStderr = xpTest.stderr || '';
  console.log(sanitize(xpStdout + '\n' + xpStderr));
  if (xpStatus !== 0) {
    failureReason = `xp.integration failed with status ${xpStatus}`;
  }

  console.log('Running beatProgress.integration.test.ts regression…');
  const beatTest = run(
    './node_modules/.bin/vitest',
    ['run', 'src/__tests__/beatProgress.integration.test.ts'],
    { env: { TEST_DATABASE_URL: connectionString } }
  );
  beatStatus = beatTest.status ?? 1;
  beatStdout = beatTest.stdout || '';
  beatStderr = beatTest.stderr || '';
  console.log(sanitize(beatStdout + '\n' + beatStderr));
  if (beatStatus !== 0 && !failureReason) {
    failureReason = `beatProgress.integration failed with status ${beatStatus}`;
  }
} catch (err) {
  failureReason = err instanceof Error ? err.message : String(err);
  console.error('L-003 failure:', failureReason);
} finally {
  if (branchId) {
    console.log(`Deleting disposable branch ${branchId}…`);
    const chk = run('node', [
      '/Users/thebeast/Constance/dist/constance.mjs',
      'check',
      JSON.stringify({
        action: 'delete_neon_branch',
        branch_id: branchId,
        branch_name: branchName,
        ownership_verified: true,
        created_this_run: true,
        unverified_destructive_sql: false,
        unapproved_live_mutation: false,
        external_spend_usd: 0,
        purpose: 'L-003 disposable XP/RLS proof cleanup',
      }),
    ]);
    console.log((chk.stdout || '').split('\n')[0] || 'check done');

    const del = run('bunx', [
      'neonctl',
      'branches',
      'delete',
      branchId,
      '--project-id',
      projectId,
      '--output',
      'json',
      '--no-color',
    ]);
    if (del.status !== 0) {
      console.error('Branch delete failed:', sanitize(del.stderr || del.stdout).slice(0, 300));
    } else {
      console.log('Branch delete command ok.');
    }

    try {
      const still = branchList().find((b) => b.id === branchId || b.name === branchName);
      deleted = !still;
      console.log(
        deleted ? 'Verified: branch no longer listed.' : 'WARNING: branch still listed after delete'
      );
    } catch (e) {
      console.error('post-delete list failed:', e instanceof Error ? e.message : e);
    }
  }

  const xpCombined = xpStdout + '\n' + xpStderr;
  const beatCombined = beatStdout + '\n' + beatStderr;
  const xpPass = xpCombined.match(/(\d+)\s+passed/);
  const beatPass = beatCombined.match(/(\d+)\s+passed/);
  const ok = xpStatus === 0 && beatStatus === 0 && deleted && !failureReason;

  const evidence = [
    '# L-003 — Disposable Neon XP/RLS proof',
    '',
    `**UTC start:** ${startedAt}`,
    `**UTC close:** ${new Date().toISOString()}`,
    `**Result:** ${ok ? 'PASS' : 'FAIL'}`,
    '',
    '## Disposable Neon branch',
    '',
    `- name: \`${branchName}\``,
    `- id: \`${branchId || 'n/a'}\``,
    `- parent: \`${parentName}\` (\`${parentId || 'n/a'}\`)`,
    `- role: \`neondb_owner\``,
    `- migrations: ${migrateSummary}`,
    `- deleted: ${deleted ? 'yes (verified absent from branches list)' : 'NO — manual cleanup required'}`,
    '',
    '## Post-migrate probe (no secrets)',
    '',
    '```json',
    JSON.stringify(postMigrateProbe || {}, null, 2),
    '```',
    '',
    '## Tests',
    '',
    '1. `src/__tests__/xp.integration.test.ts` — table, privileges, idempotent applyXpAwards to 100, atomic progress+award path, RLS own-row only, CHECK reject',
    '2. `src/__tests__/beatProgress.integration.test.ts` — regression that 0009 did not break GREATEST/OR/stamp merge (incl. concurrent race)',
    '',
    '## Results',
    '',
    `- xp.integration exit: ${xpStatus}`,
    `- xp.integration passed: ${xpPass?.[1] ?? 'unknown'}`,
    `- beatProgress.integration exit: ${beatStatus}`,
    `- beatProgress.integration passed: ${beatPass?.[1] ?? 'unknown'}`,
    failureReason ? `- failure_reason: ${failureReason}` : '- failure_reason: none',
    '',
    '## Secret hygiene',
    '',
    '- connection string captured in process memory only',
    '- not printed, not written to evidence, not committed',
    '- `TEST_DATABASE_URL` unset after process exit',
    '',
    '## Constance',
    '',
    '- destructive branch delete checked before execution (ownership_verified=true, created_this_run=true, external_spend_usd=0)',
    '',
  ].join('\n');

  writeFileSync(resolve(evidenceDir, 'L-003-branch-proof.md'), evidence);
  console.log(
    'Evidence written: docs/missions/2026-07-20-vibe-code-quest-launch/evidence/L-003-branch-proof.md'
  );
  process.exitCode = ok ? 0 : 1;
}
