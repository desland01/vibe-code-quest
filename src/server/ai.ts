import 'server-only';

import { generateText } from 'ai';

import type { DrillMode } from '@/server/aiDrill';

export type AiSurface = 'onboarding' | 'guide' | 'renderer';
export type GatewayUsage = { inputTokens: number; outputTokens: number };
export type GatewayResult =
  | { kind: 'ok'; text: string; usage: GatewayUsage }
  | { kind: 'rate_limited_fallback'; text: string; usage: GatewayUsage }
  | { kind: 'gateway_down' };

/**
 * The gateway authenticates with an explicit API key or, on a Vercel deployment,
 * the automatically-injected OIDC token. Checking only for the key would disable
 * the guide in production even where OIDC would have worked.
 * https://vercel.com/docs/ai-gateway/authentication-and-byok
 */
export function hasGatewayCredentials(): boolean {
  return Boolean(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN);
}

// Gateway ids use dots in version numbers; scripts/check-gateway-models.mjs verifies them.
export const AI_MODELS = Object.freeze({
  executor: process.env.AI_MODEL_EXECUTOR || 'openai/gpt-5.6-luna',
  fallback: process.env.AI_MODEL_FALLBACK || 'openai/gpt-5.4-nano',
  advisor: process.env.AI_MODEL_ADVISOR || 'openai/gpt-5.6-sol',
});

export type GatewayTransportResult = {
  text: string;
  usage?: { inputTokens?: number; outputTokens?: number };
};
export type GatewayTransport = (params: {
  model: string;
  surface: AiSurface;
  prompt: string;
  system?: string;
  maxOutputTokens: number;
}) => Promise<GatewayTransportResult>;

export type GenerateWithGatewayParams = {
  surface: AiSurface;
  tier?: 'executor' | 'advisor';
  prompt: string;
  system?: string;
  maxOutputTokens: number;
  drill?: DrillMode;
  transport?: GatewayTransport;
};

/**
 * Server-side per-attempt gateway timeout.
 *
 * Must stay meaningfully below GuideChat's 12_000 ms client abort, so the server
 * wins the race and returns the graceful offline fallback rather than the browser
 * failing generically. Raise it deliberately — and raise the client abort with it —
 * if a slower or reasoning-heavy model is ever configured.
 */
const configuredRealModelTimeoutMs = Number(process.env.AI_REAL_MODEL_TIMEOUT_MS);
const REAL_MODEL_TIMEOUT_MS =
  Number.isFinite(configuredRealModelTimeoutMs) && configuredRealModelTimeoutMs > 0
    ? configuredRealModelTimeoutMs
    : 8_000;

function usageOf(result: GatewayTransportResult): GatewayUsage {
  return {
    inputTokens: result.usage?.inputTokens ?? 0,
    outputTokens: result.usage?.outputTokens ?? 0,
  };
}

function statusCode(error: unknown): number | undefined {
  if (!error || typeof error !== 'object') return undefined;
  const candidate = error as { statusCode?: unknown; status?: unknown };
  if (typeof candidate.statusCode === 'number') return candidate.statusCode;
  return typeof candidate.status === 'number' ? candidate.status : undefined;
}

function isRateLimited(error: unknown): boolean {
  if (statusCode(error) === 429) return true;
  if (!error || typeof error !== 'object') return false;
  const name = (error as { name?: unknown }).name;
  return typeof name === 'string' && /rate.?limit/i.test(name);
}

const sdkTransport: GatewayTransport = async ({
  model,
  prompt,
  system,
  maxOutputTokens,
}) => {
  const result = await generateText({
    model,
    prompt,
    system,
    maxOutputTokens,
    maxRetries: 0,
  });
  return {
    text: result.text,
    usage: {
      inputTokens: result.usage.inputTokens,
      outputTokens: result.usage.outputTokens,
    },
  };
};

function persistentDrill(): DrillMode | undefined {
  if (process.env.NODE_ENV === 'production') return undefined;
  const forced = process.env.AI_DRILL_FORCE;
  return forced === 'force_429' || forced === 'force_5xx' ? forced : undefined;
}

export async function generateWithGateway(
  params: GenerateWithGatewayParams
): Promise<GatewayResult> {
  const drill = params.drill ?? persistentDrill();

  if (drill === 'force_5xx') return { kind: 'gateway_down' };
  if (!params.transport && !hasGatewayCredentials()) return { kind: 'gateway_down' };

  const transport = params.transport ?? sdkTransport;
  const callTransport = (model: string) => {
    const call = transport({ ...params, model });
    if (params.transport) return call;

    return new Promise<GatewayTransportResult>((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error('AI gateway timeout')),
        REAL_MODEL_TIMEOUT_MS
      );
      call.then(
        (result) => {
          clearTimeout(timer);
          resolve(result);
        },
        (error) => {
          clearTimeout(timer);
          reject(error);
        }
      );
    });
  };

  try {
    if (drill === 'force_429') throw Object.assign(new Error('drill rate limit'), { statusCode: 429 });
    const result = await callTransport(
      params.tier === 'advisor' ? AI_MODELS.advisor : AI_MODELS.executor
    );
    return { kind: 'ok', text: result.text, usage: usageOf(result) };
  } catch (error) {
    if (!isRateLimited(error)) return { kind: 'gateway_down' };
  }

  try {
    const result = await callTransport(AI_MODELS.fallback);
    return { kind: 'rate_limited_fallback', text: result.text, usage: usageOf(result) };
  } catch {
    return { kind: 'gateway_down' };
  }
}
