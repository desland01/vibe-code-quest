// Type surface for the parts of the Neon branch harness that are unit-tested.
// The script itself stays plain ESM JavaScript so it can run under bare `node`
// with no build step, which is what makes it usable from a git hook.

export type TestTargetClassification =
  | { kind: 'absent' }
  | { kind: 'unparseable' }
  | { kind: 'disposable'; reason: string }
  | { kind: 'unproven'; reason: string };

export type PreflightResult =
  | { ok: true; mode: 'existing' | 'create'; reason: string }
  | { ok: false; reason: string };

export function classifyTestTarget(rawUrl: string | undefined): TestTargetClassification;
export function preflight(env?: Record<string, string | undefined>): PreflightResult;
