import { afterEach, describe, expect, it, vi } from 'vitest';

import { issueSessionToken, verifySessionToken } from '../lib/auth/session';

describe('anonymous session tokens', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('round-trips a user id and rejects a tampered token', async () => {
    vi.stubEnv('AUTH_SECRET', 'unit-test-secret-with-enough-entropy');
    const userId = crypto.randomUUID();
    const token = await issueSessionToken(userId);

    await expect(verifySessionToken(token)).resolves.toEqual({ userId });

    const finalCharacter = token.at(-1);
    const tamperedToken = `${token.slice(0, -1)}${finalCharacter === 'a' ? 'b' : 'a'}`;
    await expect(verifySessionToken(tamperedToken)).resolves.toBeNull();
  });
});
