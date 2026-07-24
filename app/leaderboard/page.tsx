import type { Metadata } from 'next';

import { LeaderboardPanel } from '@/components/LeaderboardPanel';
import { LEADERBOARD_COPY } from '@/lib/leaderboard';

export const metadata: Metadata = {
  title: `${LEADERBOARD_COPY.pageTitle} — Vibe Code Quest`,
  description: LEADERBOARD_COPY.pageDescription,
};

export default function LeaderboardPage() {
  return <LeaderboardPanel />;
}
