import type { BeatType } from '@/content/beats/schema';

export const ANALYTICS_EVENTS = [
  'profile_built',
  'profile_skipped',
  'region_click',
  'landmark_open',
  'format_switched',
  'quiz_completed',
  'guide_chat_message',
  'guide_unavailable_shown',
  'account_upgraded',
  'trial_started',
  'subscribe_clicked',
  'paywall_shown',
  'share_card_created',
  'beat_started',
  'beat_completed',
  'landmark_stamped',
  'next_landmark_accepted',
  'resume_succeeded',
  'xp_awarded',
] as const;

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[number];

export type AnalyticsProps = {
  profile_built: { count: number };
  profile_skipped: { field: string | null };
  region_click: { region: string };
  landmark_open: { region: string; landmark: string };
  format_switched: { region: string; landmark: string; format: 'overview' | 'lesson' | 'quiz' };
  quiz_completed: { region: string; landmark: string; score: number; correct: boolean };
  guide_chat_message: { region: string; landmark: string; role: 'assistant'; model: 'executor' | 'advisor' | 'offline'; fallbackReason: string | null };
  guide_unavailable_shown: { region: string; landmark: string; fallbackReason: string };
  account_upgraded: { kind: 'upgraded' | 'merged' };
  trial_started: { trialDays: number };
  subscribe_clicked: { source: 'paywall' };
  paywall_shown: { reason: 'subscription_required' };
  share_card_created: { regionsStarted: number; landmarksCompleted: number };
  beat_started: { region: string; landmark: string; beat_id: string; type: BeatType };
  beat_completed: { region: string; landmark: string; beat_id: string; type: BeatType; ms: number };
  landmark_stamped: { region: string; landmark: string; ms_total: number };
  next_landmark_accepted: { region: string; from: string; to: string };
  resume_succeeded: { region: string; landmark: string; furthest_beat_index: number };
  // L-003: only emitted after server confirms newly inserted awards (newPoints > 0).
  xp_awarded: {
    region: string;
    landmark: string;
    points: number;
    total: number;
    award_count: number;
  };
};

const eventNames: ReadonlySet<string> = new Set(ANALYTICS_EVENTS);

export function isAnalyticsEvent(name: string): name is AnalyticsEvent {
  return eventNames.has(name);
}

export function createAnalyticsEvent<E extends AnalyticsEvent>(name: E, properties: AnalyticsProps[E]) {
  if (!isAnalyticsEvent(name)) throw new Error(`Unknown analytics event: ${name}`);
  return { name, properties } as const;
}

export type AnalyticsSink = <E extends AnalyticsEvent>(name: E, properties: AnalyticsProps[E]) => void;
