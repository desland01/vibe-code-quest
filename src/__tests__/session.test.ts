import { afterEach, describe, expect, it, vi } from 'vitest';

import { issueSessionToken, verifySessionToken } from '../lib/auth/session';

describe('anonymous session tokens', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('round-trips a user id and rejects a tampered token', async () => {
    vi.stubEnv('AUTH_SECRET', 'unit-test-secret-with-enough-entropy');
    const userId = crypto.randomUUID();
    const token = await issueSessionToken(userId);

    await expect(verifySessionToken(token)).resolves.toEqual({ userId });

    // Tamper the payload segment (not the last signature char). A 32-byte HMAC
    // base64url-encodes to 43 chars; the final char can carry only padding bits,
    // so a↔b on the last char is not a reliable invalidation.
    const [header, payload, signature] = token.split('.');
    expect(header && payload && signature).toBeTruthy();
    const tamperedPayload = `${payload!.slice(0, -1)}${payload!.at(-1) === 'a' ? 'b' : 'a'}`;
    const tamperedToken = `${header}.${tamperedPayload}.${signature}`;
    await expect(verifySessionToken(tamperedToken)).resolves.toBeNull();
  });

  it('rejects when AUTH_SECRET is not configured', async () => {
    const originalSecret = process.env.AUTH_SECRET;
    try {
      delete process.env.AUTH_SECRET;
      await expect(verifySessionToken('garbage')).rejects.toThrow('AUTH_SECRET is required');
    } finally {
      if (originalSecret === undefined) delete process.env.AUTH_SECRET;
      else process.env.AUTH_SECRET = originalSecret;
    }
  });

  it('returns null for a garbage token with AUTH_SECRET configured', async () => {
    const originalSecret = process.env.AUTH_SECRET;
    try {
      process.env.AUTH_SECRET = 'unit-test-secret-with-enough-entropy';
      await expect(verifySessionToken('garbage')).resolves.toBeNull();
    } finally {
      if (originalSecret === undefined) delete process.env.AUTH_SECRET;
      else process.env.AUTH_SECRET = originalSecret;
    }
  });
});
