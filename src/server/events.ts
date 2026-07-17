import 'server-only';

export type EventName = 'account_upgraded';

export function recordEvent(name: EventName, properties: Record<string, unknown>): void {
  console.debug(`[event] ${name}`, properties);
}
