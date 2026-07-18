import { describe, expect, it } from 'vitest';
import {
  ANALYTICS_EVENTS,
  createAnalyticsEvent,
  type AnalyticsEvent,
  type AnalyticsProps,
} from '@/lib/analytics';

const expected = [
  'profile_built', 'profile_skipped', 'region_click', 'landmark_open',
  'format_switched', 'quiz_completed', 'guide_chat_message',
  'guide_unavailable_shown', 'account_upgraded', 'trial_started',
  'subscribe_clicked', 'paywall_shown', 'share_card_created',
] as const;

const fixtures = {
  profile_built: { count: 5 },
  profile_skipped: { field: 'intent' },
  region_click: { region: 'databases' },
  landmark_open: { region: 'databases', landmark: 'sql' },
  format_switched: { region: 'databases', landmark: 'sql', format: 'quiz' },
  quiz_completed: { region: 'databases', landmark: 'sql', score: 1, correct: true },
  guide_chat_message: { region: 'databases', landmark: 'sql', role: 'assistant', model: 'executor', fallbackReason: null },
  guide_unavailable_shown: { region: 'databases', landmark: 'sql', fallbackReason: 'gateway_down' },
  account_upgraded: { kind: 'upgraded' },
  trial_started: { trialDays: 14 },
  subscribe_clicked: { source: 'paywall' },
  paywall_shown: { reason: 'subscription_required' },
  share_card_created: { regionsStarted: 2, landmarksCompleted: 4 },
} satisfies { [E in AnalyticsEvent]: AnalyticsProps[E] };

const expectedKeys: { [E in AnalyticsEvent]: readonly (keyof AnalyticsProps[E])[] } = {
  profile_built: ['count'], profile_skipped: ['field'], region_click: ['region'],
  landmark_open: ['region', 'landmark'], format_switched: ['region', 'landmark', 'format'],
  quiz_completed: ['region', 'landmark', 'score', 'correct'],
  guide_chat_message: ['region', 'landmark', 'role', 'model', 'fallbackReason'],
  guide_unavailable_shown: ['region', 'landmark', 'fallbackReason'], account_upgraded: ['kind'],
  trial_started: ['trialDays'], subscribe_clicked: ['source'], paywall_shown: ['reason'],
  share_card_created: ['regionsStarted', 'landmarksCompleted'],
};

const piiKeys = new Set(['email', 'text', 'message', 'token', 'profileid', 'userid', 'sourceuserid']);
function keysDeep(value: unknown): string[] {
  if (!value || typeof value !== 'object') return [];
  return Object.entries(value).flatMap(([key, nested]) => [key, ...keysDeep(nested)]);
}

describe('analytics event contract', () => {
  it('contains exactly the reconciled 13 names', () => {
    expect(ANALYTICS_EVENTS).toEqual(expected);
    expect(new Set(ANALYTICS_EVENTS).size).toBe(13);
  });

  for (const name of expected) {
    it(`constructs ${name} with its expected non-PII properties`, () => {
      const event = createAnalyticsEvent(name, fixtures[name]);
      expect(ANALYTICS_EVENTS).toContain(event.name);
      expect(Object.keys(event.properties).sort()).toEqual([...expectedKeys[name]].sort());
      expect(keysDeep(event.properties).filter((key) => piiKeys.has(key.toLowerCase()))).toEqual([]);
    });
  }

  it('rejects unknown event names at compile time and runtime', () => {
    if (false) {
      // @ts-expect-error unknown analytics names are not emittable
      createAnalyticsEvent('unknown_event', {});
    }
    expect(() => createAnalyticsEvent('unknown' as AnalyticsEvent, {} as never)).toThrow('Unknown analytics event');
  });
});
