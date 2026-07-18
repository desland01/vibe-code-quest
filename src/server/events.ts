import 'server-only';

export type EventName = 'account_upgraded' | 'profile_built' | 'profile_skipped';

export function recordEvent(name: EventName, properties: Record<string, unknown>): void {
  console.debug(`[event] ${name}`, properties);
}
