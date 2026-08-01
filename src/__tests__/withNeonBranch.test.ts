import { afterEach, describe, expect, it } from 'vitest';
import { chmod, mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';

const wrapperPath = join(process.cwd(), 'scripts/with-neon-branch.mjs');
const fakeNeonctl = `#!/usr/bin/env node
import { appendFile, readFile } from 'node:fs/promises';

const args = process.argv.slice(2);
await appendFile(process.env.NEONCTL_LOG, JSON.stringify(args) + '\\n');

if (args[0] === 'branches' && args[1] === 'create') {
  if (process.env.NEONCTL_CREATE_ERROR === 'true') {
    console.error('neon unavailable');
    process.exitCode = 1;
  }
  const name = args[args.indexOf('--name') + 1];
  const sleepMs = Number(process.env.NEONCTL_CREATE_SLEEP_MS || 0);
  if (sleepMs > 0) await new Promise((resolve) => setTimeout(resolve, sleepMs));
  console.log(JSON.stringify({
    branch: { id: 'br-fake', name },
    connection_uris: [{ connection_uri: 'postgres://u:p@fake.host/db' }],
  }));
} else if (args[0] === 'branches' && args[1] === 'delete') {
  const errorMode = process.env.NEONCTL_DELETE_ERROR;
  if (errorMode === 'not-found') {
    console.error('branch not found');
    process.exitCode = 1;
  } else if (errorMode === 'other') {
    console.error('permission denied');
    process.exitCode = 1;
  }
} else if (args[0] === 'connection-string') {
  console.log('postgres://u:p@fake.host/db');
}
`;

const childScript = `require('node:fs').writeFileSync(
  process.env.OBSERVED_ENV_FILE,
  process.env.TEST_DATABASE_URL ?? '',
);
process.exit(Number(process.env.CHILD_EXIT_CODE || 0));`;

type RunResult = { code: number | null; signal: NodeJS.Signals | null; stderr: string };

const tempDirs: string[] = [];

async function setup(): Promise<{
  root: string;
  logFile: string;
  observedEnvFile: string;
  env: NodeJS.ProcessEnv;
}> {
  const root = await mkdtemp(join(tmpdir(), 'with-neon-branch-'));
  tempDirs.push(root);
  const binDir = join(root, 'bin');
  await mkdir(binDir);
  const executable = join(binDir, 'neonctl');
  await writeFile(executable, fakeNeonctl, { mode: 0o755 });
  await chmod(executable, 0o755);
  return {
    root,
    logFile: join(root, 'calls.log'),
    observedEnvFile: join(root, 'observed-env.txt'),
    env: {
      ...process.env,
      PATH: `${binDir}:${process.env.PATH ?? ''}`,
      NEONCTL_LOG: join(root, 'calls.log'),
      OBSERVED_ENV_FILE: join(root, 'observed-env.txt'),
    },
  };
}

function runWrapper(env: NodeJS.ProcessEnv, childExitCode = 0) {
  const child = spawn(process.execPath, [wrapperPath, process.execPath, '-e', childScript], {
    env: { ...env, CHILD_EXIT_CODE: String(childExitCode) },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let stderr = '';
  child.stderr.setEncoding('utf8');
  child.stderr.on('data', (chunk: string) => {
    stderr += chunk;
  });
  const result = new Promise<RunResult>((resolve, reject) => {
    child.once('error', reject);
    child.once('close', (code, signal) => resolve({ code, signal, stderr }));
  });
  return { child, result };
}

async function callsAt(logFile: string) {
  try {
    const contents = await readFile(logFile, 'utf8');
    return contents
      .trim()
      .split('\n')
      .filter(Boolean)
      .map((line) => JSON.parse(line) as string[]);
  } catch {
    return [] as string[][];
  }
}

async function waitForCalls(logFile: string, predicate: (calls: string[][]) => boolean) {
  const deadline = Date.now() + 5000;
  while (Date.now() < deadline) {
    const calls = await callsAt(logFile);
    if (predicate(calls)) return calls;
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  throw new Error(`Timed out waiting for neonctl calls in ${logFile}`);
}

function createCalls(calls: string[][]) {
  return calls.filter((args) => args[0] === 'branches' && args[1] === 'create');
}

function deleteCalls(calls: string[][]) {
  return calls.filter((args) => args[0] === 'branches' && args[1] === 'delete');
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

describe('with-neon-branch', () => {
  it('creates a branch, passes its URI to the child, and deletes the same branch', async () => {
    const fixture = await setup();
    delete fixture.env.TEST_DATABASE_URL;
    const run = runWrapper(fixture.env);
    const result = await run.result;
    const calls = await callsAt(fixture.logFile);
    const created = createCalls(calls)[0];
    const branchName = created[created.indexOf('--name') + 1];

    expect(result.code).toBe(0);
    expect(await readFile(fixture.observedEnvFile, 'utf8')).toBe('postgres://u:p@fake.host/db');
    expect(deleteCalls(calls)).toContainEqual(expect.arrayContaining(['branches', 'delete', branchName]));
  });

  it('propagates the child exit code and still deletes the branch', async () => {
    const fixture = await setup();
    delete fixture.env.TEST_DATABASE_URL;
    const run = runWrapper(fixture.env, 3);
    const result = await run.result;
    const calls = await callsAt(fixture.logFile);
    const created = createCalls(calls)[0];
    const branchName = created[created.indexOf('--name') + 1];

    expect(result.code).toBe(3);
    expect(deleteCalls(calls)).toContainEqual(expect.arrayContaining(['branches', 'delete', branchName]));
  });

  it('returns 78 when branch creation cannot run', async () => {
    const fixture = await setup();
    delete fixture.env.TEST_DATABASE_URL;
    fixture.env.NEONCTL_CREATE_ERROR = 'true';

    const result = await runWrapper(fixture.env).result;

    expect(result.code).toBe(78);
  });

  it('remaps a child exit code of 78 to 1', async () => {
    const fixture = await setup();
    delete fixture.env.TEST_DATABASE_URL;

    const result = await runWrapper(fixture.env, 78).result;

    expect(result.code).toBe(1);
    expect(result.stderr).toContain('child exited with 78; remapping to 1');
  });

  it('uses a non-empty existing TEST_DATABASE_URL without creating a branch', async () => {
    const fixture = await setup();
    fixture.env.TEST_DATABASE_URL = 'postgres://existing.example/db';
    const result = await runWrapper(fixture.env).result;
    const calls = await callsAt(fixture.logFile);

    expect(result.code).toBe(0);
    expect(createCalls(calls)).toHaveLength(0);
    expect(await readFile(fixture.observedEnvFile, 'utf8')).toBe('postgres://existing.example/db');
  });

  it('remaps an inherited child exit code of 78 to 1 without creating a branch', async () => {
    const fixture = await setup();
    fixture.env.TEST_DATABASE_URL = 'postgres://existing.example/db';

    const result = await runWrapper(fixture.env, 78).result;
    const calls = await callsAt(fixture.logFile);

    expect(result.code).toBe(1);
    expect(result.stderr).toContain('child exited with 78; remapping to 1');
    expect(createCalls(calls)).toHaveLength(0);
  });

  it('creates a branch when TEST_DATABASE_URL is set to an empty string', async () => {
    const fixture = await setup();
    fixture.env.TEST_DATABASE_URL = '';
    const result = await runWrapper(fixture.env).result;

    expect(result.code).toBe(0);
    expect(createCalls(await callsAt(fixture.logFile))).toHaveLength(1);
  });

  it('deletes the branch when SIGINT arrives during branch creation', async () => {
    const fixture = await setup();
    delete fixture.env.TEST_DATABASE_URL;
    fixture.env.NEONCTL_CREATE_SLEEP_MS = '500';
    const run = runWrapper(fixture.env);
    const calls = await waitForCalls(fixture.logFile, (current) => createCalls(current).length === 1);
    const branchName = createCalls(calls)[0][createCalls(calls)[0].indexOf('--name') + 1];
    run.child.kill('SIGINT');
    const result = await run.result;
    const finalCalls = await waitForCalls(fixture.logFile, (current) => deleteCalls(current).length === 1);

    expect(result.code).toBe(130);
    expect(deleteCalls(finalCalls)).toContainEqual(expect.arrayContaining(['branches', 'delete', branchName]));
  });

  it('prints a warning naming the branch when deletion fails for another reason', async () => {
    const fixture = await setup();
    delete fixture.env.TEST_DATABASE_URL;
    fixture.env.NEONCTL_DELETE_ERROR = 'other';
    const run = runWrapper(fixture.env);
    const result = await run.result;
    const created = createCalls(await callsAt(fixture.logFile))[0];
    const branchName = created[created.indexOf('--name') + 1];

    expect(result.code).toBe(0);
    expect(result.stderr).toContain(`WARNING: failed to delete Neon branch ${branchName}`);
  });

  it('quietly ignores a not-found deletion failure', async () => {
    const fixture = await setup();
    delete fixture.env.TEST_DATABASE_URL;
    fixture.env.NEONCTL_DELETE_ERROR = 'not-found';
    const result = await runWrapper(fixture.env).result;

    expect(result.code).toBe(0);
    expect(result.stderr).not.toContain('WARNING: failed to delete Neon branch');
  });
});
