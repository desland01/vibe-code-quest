import 'server-only';

import { createHmac, timingSafeEqual } from 'node:crypto';

export const DRILL_HEADER_NAME = 'x-ct-drill';
export const MAX_DRILL_WINDOW_SECONDS = 15 * 60;

export type DrillMode = 'force_429' | 'force_5xx';
export type DrillPayload = {
  mode: DrillMode;
  canaryUserId: string;
  exp: number;
};
export type DrillParseResult =
  | { kind: 'valid'; payload: DrillPayload }
  | { kind: 'ignored' };

if (process.env.NODE_ENV === 'production' && process.env.AI_DRILL_FORCE) {
  throw new Error('AI_DRILL_FORCE must not be set in production');
}

function signature(payloadB64: string, secret: string): Buffer {
  return createHmac('sha256', secret).update(payloadB64).digest();
}

function isDrillPayload(value: unknown): value is DrillPayload {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<DrillPayload>;
  return (
    (candidate.mode === 'force_429' || candidate.mode === 'force_5xx') &&
    typeof candidate.canaryUserId === 'string' &&
    candidate.canaryUserId.length > 0 &&
    Number.isSafeInteger(candidate.exp)
  );
}

export function buildDrillHeader(payload: DrillPayload, secret: string): string {
  if (!secret) throw new Error('A drill secret is required');
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${payloadB64}.${signature(payloadB64, secret).toString('base64url')}`;
}

export function parseDrillHeader(
  headerValue: string | null | undefined,
  secret: string,
  now = Math.floor(Date.now() / 1000)
): DrillParseResult {
  try {
    if (!headerValue || !secret || !Number.isSafeInteger(now)) return { kind: 'ignored' };
    const parts = headerValue.split('.');
    if (parts.length !== 2 || !parts[0] || !parts[1]) return { kind: 'ignored' };

    const received = Buffer.from(parts[1], 'base64url');
    const expected = signature(parts[0], secret);
    if (received.length !== expected.length || !timingSafeEqual(received, expected)) {
      return { kind: 'ignored' };
    }

    const payload: unknown = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
    if (!isDrillPayload(payload)) return { kind: 'ignored' };
    if (payload.exp <= now || payload.exp > now + MAX_DRILL_WINDOW_SECONDS) {
      return { kind: 'ignored' };
    }
    return { kind: 'valid', payload };
  } catch {
    return { kind: 'ignored' };
  }
}

export function drillForUser(
  headerValue: string | null | undefined,
  secret: string,
  requestingUserId: string,
  now = Math.floor(Date.now() / 1000)
): DrillMode | undefined {
  const parsed = parseDrillHeader(headerValue, secret, now);
  return parsed.kind === 'valid' && parsed.payload.canaryUserId === requestingUserId
    ? parsed.payload.mode
    : undefined;
}
