import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  AI_MODELS,
  generateWithGateway,
  hasGatewayCredentials,
  type GatewayTransport,
} from '@/server/ai';
import {
  buildDrillHeader,
  drillForUser,
  parseDrillHeader,
  type DrillPayload,
} from '@/server/aiDrill';

const OTHER_USER_ID = '90000000-0000-4000-8000-000000000009';
const NOW = 1_800_000_000;
const SECRET = 'local-test-secret';

// The drill harness needs only a stable canary identity; production seeding belongs
// to the later deployment drill, so this helper keeps unit tests database-free.
function seedCanaryAccount() {
  return { id: '80000000-0000-4000-8000-000000000008' } as const;
}

const CANARY_USER_ID = seedCanaryAccount().id;

function request(transport: GatewayTransport, drill?: 'force_429' | 'force_5xx') {
  return generateWithGateway({
    surface: 'guide',
    prompt: 'Explain this landmark.',
    system: 'Be concise.',
    maxOutputTokens: 200,
    transport,
    drill,
  });
}

function httpError(statusCode: number): Error & { statusCode: number } {
  return Object.assign(new Error(`HTTP ${statusCode}`), { statusCode });
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('AI model configuration', () => {
  it('uses valid gateway model ids', () => {
    for (const model of Object.values(AI_MODELS)) {
      expect(model).toMatch(/^[a-z0-9-]+\/[a-z0-9.-]+$/);
    }
  });

  it('does not use a dash between version digits', () => {
    for (const model of Object.values(AI_MODELS)) {
      expect(model).not.toMatch(/\d-\d/);
    }
  });

  it('keeps exactly the three non-empty model roles', () => {
    expect(Object.keys(AI_MODELS).sort()).toEqual(['advisor', 'executor', 'fallback']);
    for (const model of Object.values(AI_MODELS)) {
      expect(model).not.toBe('');
    }
  });
});

describe('AI Gateway transport', () => {
  it('reports no credentials and does not attempt a network call when neither is set', async () => {
    vi.stubEnv('AI_GATEWAY_API_KEY', '');
    vi.stubEnv('VERCEL_OIDC_TOKEN', '');
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    expect(hasGatewayCredentials()).toBe(false);
    await expect(
      generateWithGateway({
        surface: 'guide',
        prompt: 'Explain this landmark.',
        maxOutputTokens: 200,
      })
    ).resolves.toEqual({ kind: 'gateway_down' });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('accepts an explicit gateway API key', () => {
    vi.stubEnv('AI_GATEWAY_API_KEY', 'test-key');
    vi.stubEnv('VERCEL_OIDC_TOKEN', '');

    expect(hasGatewayCredentials()).toBe(true);
  });

  it('accepts the Vercel-injected OIDC token', () => {
    vi.stubEnv('AI_GATEWAY_API_KEY', '');
    vi.stubEnv('VERCEL_OIDC_TOKEN', 'test-oidc-token');

    expect(hasGatewayCredentials()).toBe(true);
  });

  it('lets an injected transport bypass the credential check', async () => {
    vi.stubEnv('AI_GATEWAY_API_KEY', '');
    vi.stubEnv('VERCEL_OIDC_TOKEN', '');
    const transport = vi.fn<GatewayTransport>().mockResolvedValue({ text: 'Transport answer' });

    await expect(request(transport)).resolves.toMatchObject({
      kind: 'ok',
      text: 'Transport answer',
    });
    expect(transport).toHaveBeenCalledTimes(1);
  });

  it('returns text and SDK usage on the executor success path', async () => {
    const transport = vi.fn<GatewayTransport>().mockResolvedValue({
      text: 'Executor answer',
      usage: { inputTokens: 12, outputTokens: 7 },
    });

    await expect(request(transport)).resolves.toEqual({
      kind: 'ok',
      text: 'Executor answer',
      usage: { inputTokens: 12, outputTokens: 7 },
    });
    expect(transport).toHaveBeenCalledTimes(1);
    expect(transport.mock.calls[0][0].model).toBe(AI_MODELS.executor);
  });

  it('retries a 429 once with the fallback model', async () => {
    const transport = vi
      .fn<GatewayTransport>()
      .mockRejectedValueOnce(httpError(429))
      .mockResolvedValueOnce({ text: 'Fallback answer' });

    await expect(request(transport)).resolves.toEqual({
      kind: 'rate_limited_fallback',
      text: 'Fallback answer',
      usage: { inputTokens: 0, outputTokens: 0 },
    });
    expect(transport).toHaveBeenCalledTimes(2);
    expect(transport.mock.calls.map(([call]) => call.model)).toEqual([
      AI_MODELS.executor,
      AI_MODELS.fallback,
    ]);
  });

  it('uses Opus for advisor tier and still falls back to Haiku on 429', async () => {
    const transport = vi.fn<GatewayTransport>()
      .mockRejectedValueOnce(httpError(429))
      .mockResolvedValueOnce({ text: 'Advisor fallback' });
    await generateWithGateway({ surface: 'guide', tier: 'advisor', prompt: 'Review', maxOutputTokens: 200, transport });
    expect(transport.mock.calls.map(([call]) => call.model)).toEqual([
      AI_MODELS.advisor,
      AI_MODELS.fallback,
    ]);
  });

  it('stops after the fallback is also rate limited', async () => {
    const transport = vi.fn<GatewayTransport>().mockRejectedValue(httpError(429));
    await expect(request(transport)).resolves.toEqual({ kind: 'gateway_down' });
    expect(transport).toHaveBeenCalledTimes(2);
  });

  it('returns gateway_down for 5xx without attempting fallback', async () => {
    const transport = vi.fn<GatewayTransport>().mockRejectedValue(httpError(503));
    await expect(request(transport)).resolves.toEqual({ kind: 'gateway_down' });
    expect(transport).toHaveBeenCalledTimes(1);
  });

  it('returns gateway_down for a network error without attempting fallback', async () => {
    const transport = vi.fn<GatewayTransport>().mockRejectedValue(new TypeError('fetch failed'));
    await expect(request(transport)).resolves.toEqual({ kind: 'gateway_down' });
    expect(transport).toHaveBeenCalledTimes(1);
  });
});

describe('signed drill harness', () => {
  const payload: DrillPayload = {
    mode: 'force_429',
    canaryUserId: CANARY_USER_ID,
    exp: NOW + 300,
  };

  it('builds and parses a signed header round-trip', () => {
    const header = buildDrillHeader(payload, SECRET);
    expect(parseDrillHeader(header, SECRET, NOW)).toEqual({ kind: 'valid', payload });
  });

  it('forces the executor 429 path without an executor network call', async () => {
    const directive = drillForUser(
      buildDrillHeader(payload, SECRET),
      SECRET,
      CANARY_USER_ID,
      NOW
    );
    const transport = vi.fn<GatewayTransport>().mockResolvedValue({ text: 'Drilled fallback' });

    await expect(request(transport, directive)).resolves.toMatchObject({
      kind: 'rate_limited_fallback',
      text: 'Drilled fallback',
    });
    expect(transport).toHaveBeenCalledTimes(1);
    expect(transport.mock.calls[0][0].model).toBe(AI_MODELS.fallback);
  });

  it('forces the 5xx path without any network call', async () => {
    const force5xx = buildDrillHeader({ ...payload, mode: 'force_5xx' }, SECRET);
    const directive = drillForUser(force5xx, SECRET, CANARY_USER_ID, NOW);
    const transport = vi.fn<GatewayTransport>();
    await expect(request(transport, directive)).resolves.toEqual({ kind: 'gateway_down' });
    expect(transport).not.toHaveBeenCalled();
  });

  it('ignores a valid header for a different requesting user', async () => {
    const directive = drillForUser(
      buildDrillHeader(payload, SECRET),
      SECRET,
      OTHER_USER_ID,
      NOW
    );
    const transport = vi.fn<GatewayTransport>().mockResolvedValue({ text: 'Normal' });
    await expect(request(transport, directive)).resolves.toMatchObject({ kind: 'ok' });
    expect(transport.mock.calls[0][0].model).toBe(AI_MODELS.executor);
  });

  it.each([
    ['bad signature', () => `${buildDrillHeader(payload, SECRET)}tampered`],
    [
      'expired payload',
      () => buildDrillHeader({ ...payload, exp: NOW }, SECRET),
    ],
  ])('ignores a %s', async (_label, headerFactory) => {
    const directive = drillForUser(headerFactory(), SECRET, CANARY_USER_ID, NOW);
    const transport = vi.fn<GatewayTransport>().mockResolvedValue({ text: 'Normal' });
    await expect(request(transport, directive)).resolves.toMatchObject({ kind: 'ok' });
    expect(transport).toHaveBeenCalledTimes(1);
  });

  it('rejects expiry more than fifteen minutes ahead', () => {
    const header = buildDrillHeader({ ...payload, exp: NOW + 901 }, SECRET);
    expect(parseDrillHeader(header, SECRET, NOW)).toEqual({ kind: 'ignored' });
  });

  it('returns ignored for malformed input instead of throwing', () => {
    expect(parseDrillHeader('not-a-header', SECRET, NOW)).toEqual({ kind: 'ignored' });
  });

  it('rejects persistent forced-failure config at production import time', async () => {
    vi.resetModules();
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('AI_DRILL_FORCE', 'force_5xx');
    await expect(import('@/server/aiDrill')).rejects.toThrow(
      'AI_DRILL_FORCE must not be set in production'
    );
  });
});
