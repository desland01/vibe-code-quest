#!/usr/bin/env node
/**
 * L-004 orchestrator — disposable Neon branch leaderboard proof.
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
const branchName = `vibe-launch-l004-${stamp}`;
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
        first?.connection_string || first?.connectionString || first?.uri || first?.url || first?.cs || '',
      ).trim();
    }
    return String(
      parsed.connection_string ||
        parsed.connectionString ||
        parsed.uri ||
        parsed.url ||
        parsed.cs ||
        '',
    ).trim();
  } catch {
    const m = text.match(/postgres(?:ql)?:\/\/\S+/i);
    return m ? m[0].replace(/["']+$/, '') : '';
  }
}

let branchId = null;
let parentId = null;
let parentName = 'main';
let lbStdout = '';
let lbStderr = '';
let lbStatus = 1;
let xpStdout = '';
let xpStderr = '';
let xpStatus = 1;
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
      `connection-string failed (status ${csRes.status}): ${sanitize(csRes.stderr || csRes.stdout).slice(0, 300)}`,
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
    ? `exit 0 — ${(mig.stdout || '').includes('0010_leaderboard') ? 'applied 0010_leaderboard.sql' : 'already-present / no-op'}`
    : `exit ${mig.status}`;
  console.log(migTail || migrateSummary);
  if (!migOk) {
    throw new Error(`migrate failed: ${migrateSummary}`);
  }

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
    to_regclass('public.leaderboard_entries') AS leaderboard_entries,
    EXISTS(SELECT 1 FROM schema_migrations WHERE name = '0010_leaderboard.sql') AS migrated_0010,
    (SELECT count(*)::int FROM schema_migrations) AS mig_count,
    has_table_privilege('app_user', 'leaderboard_entries', 'SELECT') AS can_select,
    has_table_privilege('app_user', 'leaderboard_entries', 'INSERT') AS can_insert,
    has_table_privilege('app_user', 'leaderboard_entries', 'UPDATE') AS can_update,
    has_table_privilege('app_user', 'leaderboard_entries', 'DELETE') AS can_delete,
    (SELECT relrowsecurity FROM pg_class WHERE relname = 'leaderboard_entries') AS rls_enabled,
    EXISTS(
      SELECT 1 FROM pg_indexes
      WHERE tablename = 'leaderboard_entries'
        AND indexname = 'leaderboard_entries_handle_lower_uidx'
        AND indexdef ILIKE '%opted_in%true%'
    ) AS partial_unique_index,
    (
      SELECT p.prosecdef
      FROM pg_proc p
      WHERE p.oid = to_regprocedure('public.leaderboard_board(text,integer)')
    ) AS security_definer,
    has_function_privilege(
      'app_user',
      'public.leaderboard_board(text,integer)',
      'EXECUTE'
    ) AS app_user_exec,
    COALESCE((
      SELECT bool_or(a.privilege_type = 'EXECUTE' AND a.grantee = 0)
      FROM pg_proc p
      CROSS JOIN LATERAL aclexplode(COALESCE(p.proacl, acldefault('f', p.proowner))) AS a
      WHERE p.oid = to_regprocedure('public.leaderboard_board(text,integer)')
    ), false) AS public_exec,
    to_regclass('public.leaderboard_write_limits') AS leaderboard_write_limits,
    (SELECT relrowsecurity FROM pg_class WHERE oid = 'public.leaderboard_write_limits'::regclass) AS wl_rls_enabled,
    has_table_privilege('app_user', 'public.leaderboard_write_limits', 'SELECT') AS wl_can_select,
    has_table_privilege('app_user', 'public.leaderboard_write_limits', 'INSERT') AS wl_can_insert,
    has_table_privilege('app_user', 'public.leaderboard_write_limits', 'UPDATE') AS wl_can_update,
    has_table_privilege('app_user', 'public.leaderboard_write_limits', 'DELETE') AS wl_can_delete,
    (
      SELECT p.prosecdef
      FROM pg_proc p
      WHERE p.oid = to_regprocedure('public.leaderboard_register_write(text,integer)')
    ) AS wl_security_definer,
    has_function_privilege(
      'app_user',
      'public.leaderboard_register_write(text,integer)',
      'EXECUTE'
    ) AS wl_app_user_exec,
    COALESCE((
      SELECT bool_or(a.privilege_type = 'EXECUTE' AND a.grantee = 0)
      FROM pg_proc p
      CROSS JOIN LATERAL aclexplode(COALESCE(p.proacl, acldefault('f', p.proowner))) AS a
      WHERE p.oid = to_regprocedure('public.leaderboard_register_write(text,integer)')
    ), false) AS wl_public_exec,
    EXISTS(
      SELECT 1 FROM pg_indexes
      WHERE tablename = 'leaderboard_write_limits'
        AND indexname = 'leaderboard_write_limits_window_start_idx'
    ) AS wl_window_index
\`);
console.log(JSON.stringify(r.rows[0]));
await c.end();
`,
    ],
    { env: { CS: connectionString } },
  );
  if (probe.status !== 0) {
    throw new Error(`post-migrate probe failed: ${sanitize(probe.stderr || probe.stdout).slice(0, 400)}`);
  }
  postMigrateProbe = JSON.parse((probe.stdout || '{}').trim() || '{}');
  console.log('Post-migrate probe:', JSON.stringify(postMigrateProbe));
  if (!postMigrateProbe.leaderboard_entries || !postMigrateProbe.migrated_0010) {
    throw new Error('leaderboard_entries missing or 0010 not recorded after migrate');
  }
  if (postMigrateProbe.mig_count !== 10) {
    throw new Error(`mig_count expected 10 got ${postMigrateProbe.mig_count}`);
  }
  if (
    !postMigrateProbe.can_select ||
    !postMigrateProbe.can_insert ||
    !postMigrateProbe.can_update ||
    postMigrateProbe.can_delete
  ) {
    throw new Error(`app_user privileges wrong: ${JSON.stringify(postMigrateProbe)}`);
  }
  if (!postMigrateProbe.rls_enabled) throw new Error('RLS not enabled on leaderboard_entries');
  if (!postMigrateProbe.partial_unique_index) throw new Error('partial unique index missing');
  if (!postMigrateProbe.security_definer) throw new Error('leaderboard_board not SECURITY DEFINER');
  if (!postMigrateProbe.app_user_exec) throw new Error('app_user cannot EXECUTE leaderboard_board');
  if (postMigrateProbe.public_exec) throw new Error('PUBLIC still has EXECUTE on leaderboard_board');
  if (!postMigrateProbe.leaderboard_write_limits) throw new Error('leaderboard_write_limits missing');
  if (!postMigrateProbe.wl_rls_enabled) throw new Error('write_limits RLS not enabled');
  if (
    postMigrateProbe.wl_can_select ||
    postMigrateProbe.wl_can_insert ||
    postMigrateProbe.wl_can_update ||
    postMigrateProbe.wl_can_delete
  ) {
    throw new Error(`app_user has unexpected write_limits privileges: ${JSON.stringify(postMigrateProbe)}`);
  }
  if (!postMigrateProbe.wl_security_definer) throw new Error('leaderboard_register_write not SECURITY DEFINER');
  if (!postMigrateProbe.wl_app_user_exec) throw new Error('app_user cannot EXECUTE leaderboard_register_write');
  if (postMigrateProbe.wl_public_exec) throw new Error('PUBLIC still has EXECUTE on leaderboard_register_write');
  if (!postMigrateProbe.wl_window_index) throw new Error('write_limits window_start index missing');

  console.log('Running leaderboard.integration.test.ts…');
  const lbTest = run(
    './node_modules/.bin/vitest',
    ['run', 'src/__tests__/leaderboard.integration.test.ts'],
    { env: { TEST_DATABASE_URL: connectionString } },
  );
  lbStatus = lbTest.status ?? 1;
  lbStdout = lbTest.stdout || '';
  lbStderr = lbTest.stderr || '';
  console.log(sanitize(lbStdout + '\n' + lbStderr));
  if (lbStatus !== 0) {
    failureReason = `leaderboard.integration failed with status ${lbStatus}`;
  }

  console.log('Running xp.integration.test.ts regression…');
  const xpTest = run(
    './node_modules/.bin/vitest',
    ['run', 'src/__tests__/xp.integration.test.ts'],
    { env: { TEST_DATABASE_URL: connectionString } },
  );
  xpStatus = xpTest.status ?? 1;
  xpStdout = xpTest.stdout || '';
  xpStderr = xpTest.stderr || '';
  console.log(sanitize(xpStdout + '\n' + xpStderr));
  if (xpStatus !== 0 && !failureReason) {
    failureReason = `xp.integration regression failed with status ${xpStatus}`;
  }
} catch (err) {
  failureReason = err instanceof Error ? err.message : String(err);
  console.error('L-004 failure:', failureReason);
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
        purpose: 'L-004 disposable leaderboard proof cleanup',
      }),
    ]);
    console.log((chk.stdout || '').split('\n')[0] || 'check done');
    if (chk.status !== 0) {
      console.error('Constance delete check failed — refusing branch delete');
      if (!failureReason) {
        failureReason = `constance check failed status ${chk.status}`;
      }
    } else {
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
          deleted
            ? 'Verified: branch no longer listed.'
            : 'WARNING: branch still listed after delete',
        );
      } catch (e) {
        console.error('post-delete list failed:', e instanceof Error ? e.message : e);
      }
    }
  }

  const lbCombined = lbStdout + '\n' + lbStderr;
  const xpCombined = xpStdout + '\n' + xpStderr;
  const lbPass = lbCombined.match(/Tests\s+(\d+)\s+passed/) || lbCombined.match(/(\d+)\s+passed/);
  const xpPass = xpCombined.match(/Tests\s+(\d+)\s+passed/) || xpCombined.match(/(\d+)\s+passed/);
  const ok = lbStatus === 0 && xpStatus === 0 && deleted && !failureReason;

  const evidence = [
    '# L-004 — Disposable Neon leaderboard proof',
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
    '1. `src/__tests__/leaderboard.integration.test.ts` — table, privileges, RLS, SECURITY DEFINER, partial unique index, weekly/all-time, soft opt-out, reclaim, cooldown, concurrent mutate',
    '2. `src/__tests__/xp.integration.test.ts` — regression that 0010 did not break XP awards',
    '',
    '## Results',
    '',
    `- leaderboard.integration exit: ${lbStatus}`,
    `- leaderboard.integration passed: ${lbPass?.[1] ?? 'unknown'}`,
    `- xp.integration exit: ${xpStatus}`,
    `- xp.integration passed: ${xpPass?.[1] ?? 'unknown'}`,
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

  writeFileSync(resolve(evidenceDir, 'L-004-branch-proof.md'), evidence);
  console.log(
    'Evidence written: docs/missions/2026-07-20-vibe-code-quest-launch/evidence/L-004-branch-proof.md',
  );
  process.exitCode = ok ? 0 : 1;
}
