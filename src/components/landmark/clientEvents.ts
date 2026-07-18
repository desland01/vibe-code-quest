import { createAnalyticsEvent, type AnalyticsEvent, type AnalyticsProps, type AnalyticsSink } from '@/lib/analytics';

export type ClientAnalyticsEvent = Extract<AnalyticsEvent,
  'region_click' | 'landmark_open' | 'format_switched' | 'quiz_completed' | 'paywall_shown'>;

const consoleSink: AnalyticsSink = (name, properties) => {
  console.debug(`[analytics] ${name} ${JSON.stringify(properties)}`);
};

let sink: AnalyticsSink = consoleSink;

export function setClientAnalyticsSink(next: AnalyticsSink): () => void {
  const previous = sink;
  sink = next;
  return () => { sink = previous; };
}

export function recordClientEvent<E extends ClientAnalyticsEvent>(name: E, properties: AnalyticsProps[E]): void {
  const event = createAnalyticsEvent(name, properties);
  sink(event.name, event.properties);
}
