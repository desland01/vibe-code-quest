import { spawn } from 'node:child_process';

const command = process.argv[2];
const commandArgs = process.argv.slice(3);

function runCaptured(file, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(file, args, { stdio: ['ignore', 'pipe', 'ignore'] });
    let stdout = '';

    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (chunk) => {
      stdout += chunk;
    });
    child.on('error', reject);
    child.on('close', (code, signal) => {
      if (code === 0) resolve(stdout);
      else reject(new Error(`${file} failed${signal ? ` with ${signal}` : ` with exit code ${code}`}`));
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

async function main() {
  if (!command) {
    console.error('Usage: node scripts/with-neon-branch.mjs <command> [args...]');
    return 2;
  }

  if (process.env.TEST_DATABASE_URL?.trim()) {
    return runInherited(command, commandArgs, process.env);
  }

  const orgId = process.env.NEON_ORG_ID || 'org-soft-forest-80534150';
  const projectId = process.env.NEON_PROJECT_ID || 'rapid-haze-29688965';
  const branchName = `ephemeral-test-${Date.now()}-${process.pid}`;
  const neonArgs = ['--org-id', orgId, '--project-id', projectId];
  let branchCreated = false;
  let teardownStarted = false;
  let signalReceived = false;
  let signalExitCode;
  const branchSignalHandlers = new Map();

  const teardown = async () => {
    if (!branchCreated || teardownStarted) return;
    teardownStarted = true;
    try {
      await runCaptured('neonctl', ['branches', 'delete', branchName, ...neonArgs]);
    } catch {
      console.error(`WARNING: failed to delete Neon branch ${branchName}; remove it by hand.`);
    }
  };

  try {
    const createOutput = await runCaptured('neonctl', [
      'branches',
      'create',
      ...neonArgs,
      '--name',
      branchName,
      '--output',
      'json',
    ]);
    branchCreated = true;
    for (const signal of ['SIGINT', 'SIGTERM']) {
      const handler = () => {
        signalReceived = true;
        signalExitCode = signal === 'SIGINT' ? 130 : 143;
        void teardown();
      };
      branchSignalHandlers.set(signal, handler);
      process.once(signal, handler);
    }

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
      ]).then((value) => value.trim());
    }

    for (const [signal, handler] of branchSignalHandlers) process.removeListener(signal, handler);
    if (signalReceived) return signalExitCode;
    if (!connectionString) throw new Error('Neon did not return a connection string');

    const childEnv = { ...process.env, TEST_DATABASE_URL: connectionString };
    // Keep this await: finally must wait for the child before tearing down the branch.
    return await runInherited(command, commandArgs, childEnv, teardown);
  } catch (error) {
    console.error(`Neon test branch setup failed: ${error.message}`);
    return 1;
  } finally {
    for (const [signal, handler] of branchSignalHandlers) process.removeListener(signal, handler);
    await teardown();
  }
}

main().then((code) => {
  process.exitCode = code;
});
