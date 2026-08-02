import { pathToFileURL } from 'node:url';
import { spawn } from 'node:child_process';

const command = process.argv[2];
const commandArgs = process.argv.slice(3);

function runCaptured(file, args, includeStderr = true) {
  return new Promise((resolve, reject) => {
    const child = spawn(file, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';

    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (chunk) => {
      stdout += chunk;
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });
    child.on('error', reject);
    child.on('close', (code, signal) => {
      if (code === 0) resolve(stdout);
      else {
        const stderrDetails = includeStderr && stderr.trim() ? `: ${stderr.trim()}` : '';
        reject(new Error(`${file} failed${signal ? ` with ${signal}` : ` with exit code ${code}`}${stderrDetails}`));
      }
    });
  });
}

function runInherited(file, args, env, onSignal) {
  return new Promise((resolve, reject) => {
    const child = spawn(file, args, { stdio: 'inherit', env });
    let signalHandled = false;
    const signalHandlers = new Map();

    for (const signal of ['SIGINT', 'SIGTERM']) {
      const handler = async () => {
        if (signalHandled) return;
        signalHandled = true;
        child.kill(signal);
        await onSignal?.(signal);
      };
      signalHandlers.set(signal, handler);
      process.once(signal, handler);
    }

    child.on('error', reject);
    child.on('close', (code, signal) => {
      for (const [handledSignal, handler] of signalHandlers) {
        process.removeListener(handledSignal, handler);
      }
      resolve(signal ? 128 + (signal === 'SIGINT' ? 2 : 15) : code ?? 1);
    });
  });
}


/**
 * ISSUE-010 preflight (VAL-064).
 *
 * Without this, running `npm run test:db` with no TEST_DATABASE_URL silently
 * creates a REAL Neon branch against a hard-coded org and project. That is a
 * live external mutation, and an unattended agent must not be able to trigger it
 * by running what looks like an ordinary test command.
 *
 * A run is permitted only when one of these is true:
 *   1. TEST_DATABASE_URL points at a PROVEN disposable or local target — a
 *      localhost/127.0.0.1 host, or a Neon branch whose name marks it ephemeral.
 *   2. The owner recorded approval for THIS run via
 *      NEON_EPHEMERAL_BRANCH_APPROVED=1, which authorises creating one
 *      disposable branch.
 * Anything else exits non-zero BEFORE any branch is created.
 */
const DISPOSABLE_HOST = /^(localhost|127\.0\.0\.1|\[::1\]|host\.docker\.internal)$/i;
const DISPOSABLE_BRANCH = /(^|[-_.])(ephemeral|disposable|test|ci|preview)([-_.]|$)/i;

export function classifyTestTarget(rawUrl) {
  const value = rawUrl?.trim();
  if (!value) return { kind: 'absent' };
  let url;
  try {
    url = new URL(value);
  } catch {
    return { kind: 'unparseable' };
  }
  if (DISPOSABLE_HOST.test(url.hostname)) {
    return { kind: 'disposable', reason: `local host ${url.hostname}` };
  }
  // Neon encodes the branch in the endpoint id, e.g. ep-ephemeral-test-123-....
  const [endpoint] = url.hostname.split('.');
  if (endpoint && DISPOSABLE_BRANCH.test(endpoint)) {
    return { kind: 'disposable', reason: `disposable endpoint ${endpoint}` };
  }
  return { kind: 'unproven', reason: `host ${url.hostname} is not a proven disposable target` };
}

export function preflight(env = process.env) {
  const target = classifyTestTarget(env.TEST_DATABASE_URL);
  if (target.kind === 'disposable') {
    return { ok: true, mode: 'existing', reason: target.reason };
  }
  if (target.kind === 'unparseable') {
    return { ok: false, reason: 'TEST_DATABASE_URL is set but is not a valid URL.' };
  }
  if (target.kind === 'unproven') {
    return {
      ok: false,
      reason:
        `Refusing to run database tests: ${target.reason}. ` +
        'Point TEST_DATABASE_URL at a local or clearly-named ephemeral database, ' +
        'or set NEON_EPHEMERAL_BRANCH_APPROVED=1 to authorise creating one disposable branch.',
    };
  }
  if (env.NEON_EPHEMERAL_BRANCH_APPROVED === '1') {
    return { ok: true, mode: 'create', reason: 'owner approved one ephemeral Neon branch for this run' };
  }
  return {
    ok: false,
    reason:
      'Refusing to run database tests: TEST_DATABASE_URL is unset, so this command would ' +
      'CREATE A REAL NEON BRANCH. Set TEST_DATABASE_URL to a proven disposable target, or set ' +
      'NEON_EPHEMERAL_BRANCH_APPROVED=1 to authorise creating one for this run.',
  };
}

// Module-scoped so the exit code can reflect a teardown failure that happens in
// main()'s finally block, after its return value is already computed.
let cleanupFailed = false;

function normalizeChildExit(code) {
  if (code === 78) {
    console.error('NOTE: child exited with 78; remapping to 1 to distinguish it from setup failure.');
    return 1;
  }
  return code;
}

async function main() {
  if (!command) {
    console.error('Usage: node scripts/with-neon-branch.mjs <command> [args...]');
    return 2;
  }

  const gate = preflight(process.env);
  if (!gate.ok) {
    console.error(gate.reason);
    // 78 is this repo's "the gate could not RUN" code (see README Development and
    // ~/.claude/bin/pr-review leg 3). A refused preflight is exactly that: no test
    // failed, the suite was never allowed to start. Returning 1 here would make
    // every unrelated push unpushable on a machine with no disposable database,
    // which is a different failure from a real test failure and must stay
    // distinguishable from it.
    return 78;
  }
  console.error(`preflight: ${gate.reason}`);

  if (gate.mode === 'existing') {
    return normalizeChildExit(await runInherited(command, commandArgs, process.env));
  }

  const orgId = process.env.NEON_ORG_ID || 'org-soft-forest-80534150';
  const projectId = process.env.NEON_PROJECT_ID || 'rapid-haze-29688965';
  const branchName = `ephemeral-test-${Date.now()}-${process.pid}`;
  const neonArgs = ['--org-id', orgId, '--project-id', projectId];
  let createAttempted = false;
  let createPromise;
  let teardownStarted = false;
  let signalReceived = false;
  let signalExitCode;
  const branchSignalHandlers = new Map();

  const teardown = async () => {
    if (!createAttempted || teardownStarted) return;
    teardownStarted = true;
    if (createPromise) {
      try {
        await createPromise;
      } catch {
        // Creation may have failed before Neon provisioned the branch.
      }
    }
    try {
      await runCaptured('neonctl', ['branches', 'delete', branchName, ...neonArgs]);
    } catch (error) {
      if (/(?:not found|does not exist)/i.test(error.message)) return;
      // VAL-064: a leaked branch is a real external resource. Failing to delete
      // it FAILS the gate rather than warning — a warning in a passing run is a
      // leak nobody reads.
      cleanupFailed = true;
      console.error(`ERROR: failed to delete Neon branch ${branchName}; remove it by hand.`);
    }
  };

  for (const signal of ['SIGINT', 'SIGTERM']) {
    const handler = () => {
      signalReceived = true;
      signalExitCode = signal === 'SIGINT' ? 130 : 143;
      void teardown();
    };
    branchSignalHandlers.set(signal, handler);
    process.once(signal, handler);
  }

  try {
    createAttempted = true;
    createPromise = runCaptured('neonctl', [
      'branches',
      'create',
      ...neonArgs,
      '--name',
      branchName,
      '--output',
      'json',
    ]);
    const createOutput = await createPromise;

    let connectionString;
    try {
      const payload = JSON.parse(createOutput);
      connectionString = payload?.connection_uris?.[0]?.connection_uri;
    } catch {
      connectionString = undefined;
    }

    if (!connectionString) {
      connectionString = await runCaptured('neonctl', [
        'connection-string',
        branchName,
        ...neonArgs,
        '--role-name',
        'neondb_owner',
      ], false).then((value) => value.trim());
    }

    for (const [signal, handler] of branchSignalHandlers) process.removeListener(signal, handler);
    if (signalReceived) return signalExitCode;
    if (!connectionString) throw new Error('Neon did not return a connection string');

    const childEnv = { ...process.env, TEST_DATABASE_URL: connectionString };
    // Keep this await: finally must wait for the child before tearing down the branch.
    return normalizeChildExit(await runInherited(command, commandArgs, childEnv, teardown));
  } catch (error) {
    console.error(`Neon test branch setup failed: ${error.message}`);
    // 78 means setup could not run; child failures keep their own exit code distinct.
    return 78;
  } finally {
    for (const [signal, handler] of branchSignalHandlers) process.removeListener(signal, handler);
    await teardown();
  }
}

// Only self-execute. The preflight and target classifier are exported so their
// contract can be unit-tested without spawning anything.
const invokedDirectly =
  process.argv[1] !== undefined &&
  pathToFileURL(process.argv[1]).href === import.meta.url;

if (invokedDirectly) main().then((code) => {
  if (cleanupFailed) {
    console.error('Gate FAILED: a Neon test branch was left behind. Delete it before re-running.');
    process.exitCode = code === 0 ? 1 : code;
    return;
  }
  process.exitCode = code;
});
