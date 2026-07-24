/** Browser-safe leaderboard constants, types, and static UI copy (no server-only imports). */

export const LEADERBOARD_HANDLE_MIN = 3;
export const LEADERBOARD_HANDLE_MAX = 24;
export const LEADERBOARD_TOP_N = 25;

export type LeaderboardPeriod = 'weekly' | 'all_time';

export type LeaderboardRow = {
  rank: number;
  handle: string;
  points: number;
  isSelf: boolean;
};

export type LeaderboardBoardPayload = {
  period: LeaderboardPeriod;
  entries: LeaderboardRow[];
  own: LeaderboardRow | null;
  optedIn: boolean;
  handle: string | null;
  tone: string;
  unavailable?: boolean;
  error?: string;
};

/** Static UI strings — single source for component + shame-copy regression tests. */
export const LEADERBOARD_COPY = {
  pageTitle: 'Quest board',
  pageDescription: 'Friendly ranks from real stamps. Join with a public quest handle.',
  kickerBack: '← Back to map',
  subtitle: 'Friendly ranks from real stamps. Handles only; emails stay private.',
  tabWeekly: 'This week',
  tabAllTime: 'All time',
  handleLabel: 'Your handle',
  handleHelp: 'Public handle; use a nickname rather than personal contact information.',
  handlePlaceholder: 'VibeCoder',
  join: 'Join board',
  update: 'Update handle',
  leave: 'Leave board',
  anonNote: 'Browse the board freely. Sign in on the map if you want a handle of your own.',
  unavailable: 'Leaderboard stays quiet in no-database mode. Play the map anytime.',
  loading: 'Loading board…',
  empty: 'No quests on this board yet — first stamp gets the glory.',
  joined: 'You’re on the board. Nice.',
  left: 'Left the board. Come back any time.',
  breath: 'Board is taking a breath. Try again soon.',
  takenFallback: 'That handle is taken — try a small twist.',
  saveFail: 'Could not save handle.',
  leaveFail: 'Could not leave the board.',
  cooldownFallback: 'Easy there — give it a few seconds, then try again.',
  yourSpot: 'Your spot:',
  youSuffix: ' (you)',
  colRank: 'Rank',
  colHandle: 'Handle',
  colXp: 'XP',
  mapNav: 'Quest board',
  defaultToneWeekly:
    'Opt in with a handle to join this week’s quest board — every point counts.',
  defaultToneAllTime:
    'Opt in with a handle to join the all-time quest board — every point counts.',
} as const;

export type LeaderboardCopyKey = keyof typeof LEADERBOARD_COPY;
