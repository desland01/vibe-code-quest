import { afterEach, describe, expect, it, vi } from 'vitest';

import { isHostedMode } from '@/server/hosting';

describe('hosting mode', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('is true when a database is configured', () => {
    vi.stubEnv('DATABASE_URL', 'configured');
    expect(isHostedMode()).toBe(true);
  });

  it('is false when a database is not configured', () => {
    vi.stubEnv('DATABASE_URL', '');
    expect(isHostedMode()).toBe(false);
  });
});
