import 'server-only';

export type EventName = 'account_upgraded' | 'profile_built' | 'profile_skipped' | 'landmark_open' | 'format_switched' | 'quiz_completed' | 'trial_started' | 'subscribe_clicked' | 'paywall_shown';

export function recordEvent(name: EventName, properties: Record<string, unknown>): void {
  console.debug(`[event] ${name}`, properties);
}
