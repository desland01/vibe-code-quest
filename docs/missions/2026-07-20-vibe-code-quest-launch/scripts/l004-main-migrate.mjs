#!/usr/bin/env node
/**
 * L-004 main Neon migrate + probe. No secrets printed.
 * Usage:
 *   node .../l004-main-migrate.mjs precheck
 *   node .../l004-main-migrate.mjs migrate
 *   node .../l004-main-migrate.mjs postcheck
 *   node .../l004-main-migrate.mjs all
 */
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

const ROOT = '/Users/thebeast/code-tutor';
const require = createRequire(resolve(ROOT, 'package.json'));
require('dotenv').config({ path: resolve(ROOT, '.env.local'), override: false, quiet: true });

const PATH = `${process.env.HOME}/.bun/bin:${process.env.PATH}`;
const projectId = process.env.NEON_PROJECT_ID;
const pooled = process.env.DATABASE_URL || '';
const unpooled = process.env.DATABASE_URL_UNPOOLED || '';

function die(msg, code = 1) {
  console.error(msg);
  process.exit(code);
}

function hostInfo(raw) {
  const text = String(raw || '').trim();
  let cs = text;
  try {
    const parsed = JSON.parse(text);
    if (typeof parsed === 'string') cs = parsed;
    else if (Array.isArray(parsed)) {
      const first = parsed[0];
      cs =
        typeof first === 'string'
          ? first
          : first?.connection_string || first?.connectionString || first?.uri || first?.url || '';
    } else {
      cs = parsed.connection_string || parsed.connectionString || parsed.uri || parsed.url || '';
    }
  } catch {
    // plain connection string
  }
  cs = String(cs).trim().replace(/^"|"$/g, '');
  const line = cs.split(/\n/).find((l) => /postgres(ql)?:\/\//i.test(l)) || cs;
  try {
    const u = new URL(line);
    const host = u.hostname;
    const endpoint = (host.match(/^(ep-[^.]+)/) || [])[1] || null;
    const base = endpoint ? endpoint.replace(/-pooler$/, '') : null;
    return {
      host,
      endpoint,
      base,
      db: u.pathname.replace(/^\//, ''),
      user: u.username,
    };
  } catch {
    return null;
  }
}

function run(cmd, args, opts = {}) {
  return spawnSync(cmd, args, {
    encoding: 'utf8',
    cwd: ROOT,
    env: { ...process.env, PATH, NO_COLOR: '1', FORCE_COLOR: '0', ...(opts.env || {}) },
  });
}

if (!projectId) die('NEON_PROJECT_ID missing');
if (!pooled) die('DATABASE_URL missing');
if (!unpooled) die('DATABASE_URL_UNPOOLED missing');

const pooledInfo = hostInfo(pooled);
const unpooledInfo = hostInfo(unpooled);
if (!pooledInfo?.base || !unpooledInfo?.base) die('Could not parse endpoint ids');
if (pooledInfo.base !== unpooledInfo.base) {
  die(`ENDPOINT_BASE_MISMATCH pooled=${pooledInfo.base} unpooled=${unpooledInfo.base}`, 2);
}
if (pooledInfo.db !== 'neondb' || unpooledInfo.db !== 'neondb') die('Unexpected db name');
if (pooledInfo.user !== 'neondb_owner' || unpooledInfo.user !== 'neondb_owner') {
  die('Unexpected role');
}

const csRes = run('bunx', [
  'neonctl',
  'connection-string',
  'main',
  '--project-id',
  projectId,
  '--role-name',
  'neondb_owner',
  '--no-color',
]);
if (csRes.status !== 0) {
  die(`connection-string failed: ${(csRes.stderr || csRes.stdout || '').slice(0, 300)}`);
}
const mainInfo = hostInfo(csRes.stdout);
if (!mainInfo?.base) die('Could not parse main connection-string host');
if (mainInfo.base !== unpooledInfo.base) {
  die(`MAIN_ENDPOINT_MISMATCH main=${mainInfo.base} unpooled=${unpooledInfo.base}`, 2);
}

const brRes = run('bunx', [
  'neonctl',
  'branches',
  'list',
  '--project-id',
  projectId,
  '--output',
  'json',
  '--no-color',
]);
if (brRes.status !== 0) die(`branches list failed: ${(brRes.stderr || '').slice(0, 300)}`);
let branches;
try {
  const raw = JSON.parse((brRes.stdout || '').trim() || '[]');
  branches = Array.isArray(raw) ? raw : raw.branches || [];
} catch {
  die('branches parse failed');
}
const main = branches.find((b) => b.name === 'main');
const disposable = branches.find((b) => String(b.name || '').includes('vibe-launch-l004-'));
if (!main || main.id !== 'br-raspy-bread-atcew3is') die('MAIN_BRANCH_UNEXPECTED');
if (disposable) die(`DISPOSABLE_STILL_PRESENT ${disposable.name}|${disposable.id}`, 3);

const { Client } = require('pg');

async function probe(label, connectionString) {
  const client = new Client({ connectionString });
  await client.connect();
  try {
    const mig = await client.query(
      `SELECT count(*)::int AS mig_count,
              EXISTS(SELECT 1 FROM schema_migrations WHERE name = '0010_leaderboard.sql') AS migrated_0010,
              coalesce(json_agg(name ORDER BY name), '[]'::json) AS files
         FROM schema_migrations`,
    );
    const reg = await client.query(
      `SELECT to_regclass('public.leaderboard_entries')::text AS leaderboard_entries`,
    );
    let details = null;
    if (reg.rows[0].leaderboard_entries) {
      const d = await client.query(`
        SELECT
          has_table_privilege('app_user', 'public.leaderboard_entries', 'SELECT') AS can_select,
          has_table_privilege('app_user', 'public.leaderboard_entries', 'INSERT') AS can_insert,
          has_table_privilege('app_user', 'public.leaderboard_entries', 'UPDATE') AS can_update,
          has_table_privilege('app_user', 'public.leaderboard_entries', 'DELETE') AS can_delete,
          (SELECT relrowsecurity FROM pg_class WHERE oid = 'public.leaderboard_entries'::regclass) AS rls_enabled,
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
          to_regclass('public.leaderboard_write_limits')::text AS leaderboard_write_limits,
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
      `);
      details = d.rows[0];
    }
    const out = {
      label,
      endpointBase: hostInfo(connectionString)?.base || null,
      leaderboard_entries: reg.rows[0].leaderboard_entries,
      migrated_0010: mig.rows[0].migrated_0010,
      mig_count: mig.rows[0].mig_count,
      files: mig.rows[0].files,
      details,
    };
    console.log(JSON.stringify(out, null, 2));
    return out;
  } finally {
    await client.end();
  }
}

const phase = process.argv[2] || 'all';

if (phase === 'precheck' || phase === 'all') {
  console.log('=== PRECHECK ===');
  console.log(
    JSON.stringify(
      {
        pooledBase: pooledInfo.base,
        unpooledBase: unpooledInfo.base,
        mainBase: mainInfo.base,
        mainBranchId: main.id,
        disposableGone: true,
        rlsTestPresent: branches.some((b) => b.name === 'rls-test'),
      },
      null,
      2,
    ),
  );
  const before = await probe('before-unpooled', unpooled);
  if (before.migrated_0010) {
    console.log('ALREADY_MIGRATED');
    if (phase === 'precheck') process.exit(0);
  } else if (before.mig_count !== 9) {
    die(`UNEXPECTED_MIG_COUNT_BEFORE=${before.mig_count}`, 5);
  } else if (before.leaderboard_entries) {
    die('leaderboard_entries exists without migration record', 5);
  } else {
    console.log('PRECHECK_OK — ready to apply 0010 only');
  }
}

if (phase === 'migrate' || phase === 'all') {
  const check = run('node', [
    '/Users/thebeast/Constance/dist/constance.mjs',
    'check',
    'Apply additive migration 0010_leaderboard.sql to main Neon after disposable branch proof PASS and verified deletion',
    '--field',
    'unverified_destructive_sql',
    '--value',
    'false',
  ]);
  console.log('constance_check_status', check.status);
  if ((check.stdout || '').trim()) console.log(check.stdout.trim().slice(0, 300));
  if (check.status !== 0) die('constance check failed', 6);

  console.log('=== MIGRATE ===');
  const mig = run('npm', ['run', 'db:migrate']);
  const out = `${mig.stdout || ''}\n${mig.stderr || ''}`
    .split('\n')
    .filter((l) => !/postgres(ql)?:\/\//i.test(l) && !/password|pwd=/i.test(l))
    .join('\n')
    .trim();
  console.log(out.slice(0, 2000));
  if (mig.status !== 0) die(`migrate failed status=${mig.status}`, 6);
}

if (phase === 'postcheck' || phase === 'all' || phase === 'migrate') {
  console.log('=== POSTCHECK ===');
  const after = await probe('after-unpooled', unpooled);
  await probe('after-pooled', pooled);
  if (!after.leaderboard_entries) die('leaderboard_entries missing after migrate', 7);
  if (!after.migrated_0010) die('0010 not recorded in schema_migrations', 7);
  if (after.mig_count !== 10) die(`mig_count expected 10 got ${after.mig_count}`, 7);
  const d = after.details || {};
  if (!d.can_select || !d.can_insert || !d.can_update) die('app_user missing select/insert/update', 7);
  if (d.can_delete) die('app_user has unexpected delete', 7);
  if (!d.rls_enabled) die('RLS not enabled', 7);
  if (!d.partial_unique_index) die('partial unique index missing', 7);
  if (!d.security_definer) die('leaderboard_board not SECURITY DEFINER', 7);
  if (!d.app_user_exec) die('app_user cannot EXECUTE leaderboard_board', 7);
  if (d.public_exec) die('PUBLIC still has EXECUTE on leaderboard_board', 7);
  if (!d.leaderboard_write_limits) die('leaderboard_write_limits missing', 7);
  if (!d.wl_rls_enabled) die('write_limits RLS not enabled', 7);
  if (d.wl_can_select || d.wl_can_insert || d.wl_can_update || d.wl_can_delete) {
    die('app_user has unexpected write_limits privileges', 7);
  }
  if (!d.wl_security_definer) die('leaderboard_register_write not SECURITY DEFINER', 7);
  if (!d.wl_app_user_exec) die('app_user cannot EXECUTE leaderboard_register_write', 7);
  if (d.wl_public_exec) die('PUBLIC still has EXECUTE on leaderboard_register_write', 7);
  if (!d.wl_window_index) die('write_limits window_start index missing', 7);
  console.log('POSTCHECK_OK');
}
