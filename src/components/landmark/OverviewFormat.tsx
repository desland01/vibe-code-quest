import type { Landmark } from '@/content/schema';

function takeWords(value: string, limit: number): string {
  const words = value.trim().split(/\s+/);
  return words.length <= limit ? value.trim() : `${words.slice(0, limit).join(' ')}…`;
}

export function buildOverview(landmark: Landmark): string {
  return [
    takeWords(landmark.hook, 14),
    takeWords(landmark.definition, 30),
    `Use it when ${takeWords(landmark.when_to_use.join('; '), 18)}`,
    `Vibe coder default: ${takeWords(landmark.vibe_coder_default, 18)}`,
  ].join(' ');
}

export function OverviewFormat({ landmark }: { landmark: Landmark }) {
  return (
    <section aria-labelledby="overview-heading" data-testid="landmark-overview">
      <h3 id="overview-heading">Overview</h3>
      <p>{buildOverview(landmark)}</p>
    </section>
  );
}
