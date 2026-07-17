import 'server-only';

import { generateText } from 'ai';

import type { DrillMode } from '@/server/aiDrill';

export type AiSurface = 'onboarding' | 'guide' | 'renderer';
export type GatewayUsage = { inputTokens: number; outputTokens: number };
export type GatewayResult =
  | { kind: 'ok'; text: string; usage: GatewayUsage }
  | { kind: 'rate_limited_fallback'; text: string; usage: GatewayUsage }
  | { kind: 'gateway_down' };

export const AI_MODELS = Object.freeze({
  executor: process.env.AI_MODEL_EXECUTOR || 'anthropic/claude-sonnet-4-5',
  fallback: process.env.AI_MODEL_FALLBACK || 'anthropic/claude-haiku-4-5',
  advisor: process.env.AI_MODEL_ADVISOR || 'anthropic/claude-opus-4-6',
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
  prompt: string;
  system?: string;
  maxOutputTokens: number;
  drill?: DrillMode;
  transport?: GatewayTransport;
};

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
  const transport = params.transport ?? sdkTransport;
  const drill = params.drill ?? persistentDrill();

  if (drill === 'force_5xx') return { kind: 'gateway_down' };

  try {
    if (drill === 'force_429') throw Object.assign(new Error('drill rate limit'), { statusCode: 429 });
    const result = await transport({ ...params, model: AI_MODELS.executor });
    return { kind: 'ok', text: result.text, usage: usageOf(result) };
  } catch (error) {
    if (!isRateLimited(error)) return { kind: 'gateway_down' };
  }

  try {
    const result = await transport({ ...params, model: AI_MODELS.fallback });
    return { kind: 'rate_limited_fallback', text: result.text, usage: usageOf(result) };
  } catch {
    return { kind: 'gateway_down' };
  }
}
