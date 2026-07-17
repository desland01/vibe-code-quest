import { afterEach, describe, expect, it, vi } from 'vitest';

import { sendOtpEmail } from '../server/email';
import { hashOtpCode, InvalidEmailError, normalizeEmail } from '../server/upgrade';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('OTP upgrade helpers', () => {
  it('normalizes valid email addresses', () => {
    expect(normalizeEmail('  Learner@Example.COM ')).toBe('learner@example.com');
  });

  it.each(['missing-at.example.com', 'a@b', 'a b@example.com', '@example.com'])(
    'rejects invalid email %s',
    (email) => expect(() => normalizeEmail(email)).toThrow(InvalidEmailError)
  );

  it('hashes codes deterministically with AUTH_SECRET', () => {
    vi.stubEnv('AUTH_SECRET', 'unit-test-auth-secret');
    expect(hashOtpCode('123456')).toBe(hashOtpCode('123456'));
    expect(hashOtpCode('123456')).not.toBe(hashOtpCode('654321'));
  });

  it('fails loudly in production without a configured transport', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('OTP_EMAIL_TRANSPORT', '');
    await expect(sendOtpEmail({ to: 'learner@example.com', code: '123456' })).rejects.toThrow(
      'No email transport configured'
    );
  });
});
