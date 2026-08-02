// The documented vocabulary gap (ISSUE-013, REQ-003, VAL-006).
//
// These are not terms we think a beginner should know — they are terms real
// people building software with AI tools said, in public, that they did not
// understand. Each carries the thread it came from so a later author can read
// the actual confusion instead of guessing at it.
//
// VAL-006 is a COVERAGE gate, not an allowlist: an L1 author may teach more
// vocabulary than this list, but may not skip a term documented for their
// island. Adding a term here therefore makes the build fail until some L1
// sequence on that island teaches it. That is the intended direction — the
// research leads the content, not the other way around.

export type UgcTerm = Readonly<{
  /** The word as a player would say it. Matched whole-word, case-insensitively. */
  term: string;
  /** Other spellings that count as teaching the same term. */
  aliases: readonly string[];
  /** The island whose L1 runs must cover this term. */
  regionId: string;
  /** The finding id in the UGC research corpus. */
  finding: string;
  /** The public thread the confusion was observed in. */
  source: string;
}>;

export const UGC_TERMS: readonly UgcTerm[] = [
  {
    term: 'repo',
    aliases: ['repository'],
    regionId: 'git',
    finding: 'A3',
    source:
      'https://www.reddit.com/r/vibecoding/comments/1u51jhv/whats_the_most_confusing_difficult_thing_about/',
  },
  {
    term: 'git',
    aliases: [],
    regionId: 'git',
    finding: 'A4',
    source: 'https://www.reddit.com/r/vibecoding/comments/1l2z8r1/git_for_what/',
  },
  {
    term: 'commit',
    aliases: ['commits'],
    regionId: 'git',
    finding: 'A4',
    source: 'https://www.reddit.com/r/vibecoding/comments/1l2z8r1/git_for_what/',
  },
  {
    term: 'commit history',
    aliases: ['history'],
    regionId: 'git',
    finding: 'A16',
    source:
      'https://www.reddit.com/r/vibecoding/comments/1ncdq39/accidentally_deleted_commit_history_from_github/',
  },
  {
    term: 'version control',
    aliases: [],
    regionId: 'git',
    finding: 'A16',
    source:
      'https://www.reddit.com/r/vibecoding/comments/1ncdq39/accidentally_deleted_commit_history_from_github/',
  },
  {
    term: 'branch',
    aliases: ['branches'],
    regionId: 'git',
    finding: 'B14',
    source:
      'https://community.vercel.com/t/v0-keeps-creating-a-new-git-branch-each-time-i-deploy-and-new-vercel-v0-project-each-time-i-fork/30221',
  },
  {
    term: 'merge',
    aliases: ['merging', 'merges'],
    regionId: 'git',
    finding: 'B13',
    source:
      'https://www.reddit.com/r/replit/comments/1msji8l/best_practices_ffor_major_revisions_to_take_my/',
  },
  {
    term: 'pull request',
    aliases: [],
    regionId: 'git',
    finding: 'A20',
    source: 'https://www.reddit.com/r/vibecoding/comments/1tbriyp/github_repo_explanation/',
  },
];

export function ugcTermsForRegion(regionId: string): UgcTerm[] {
  return UGC_TERMS.filter((entry) => entry.regionId === regionId);
}

function escapeForRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Whole-word, case-insensitive. Substring matching would let "branches as
 * isolation" in a landmark TITLE satisfy the term without a single sentence
 * teaching what a branch is, and whole-word matching keeps "commit" from being
 * claimed by "commitment".
 */
export function textCoversTerm(text: string, entry: UgcTerm): boolean {
  return [entry.term, ...entry.aliases].some((form) =>
    new RegExp(`\\b${escapeForRegExp(form)}\\b`, 'i').test(text),
  );
}
