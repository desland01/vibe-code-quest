import 'server-only';

import { createAnalyticsEvent, type AnalyticsEvent, type AnalyticsProps, type AnalyticsSink } from '@/lib/analytics';

export type { AnalyticsEvent, AnalyticsProps } from '@/lib/analytics';

const consoleSink: AnalyticsSink = (name, properties) => {
  console.debug(`[analytics] ${name} ${JSON.stringify(properties)}`);
};

let sink: AnalyticsSink = consoleSink;

export function setServerAnalyticsSink(next: AnalyticsSink): () => void {
  const previous = sink;
  sink = next;
  return () => { sink = previous; };
}

export function recordEvent<E extends AnalyticsEvent>(name: E, properties: AnalyticsProps[E]): void {
  const event = createAnalyticsEvent(name, properties);
  sink(event.name, event.properties);
}
