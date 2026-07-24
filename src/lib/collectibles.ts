/** Browser-safe L-005 collectible registry + ownership helpers. */
export type Collectible = {
  id: string;
  regionId: string;
  landmarkId: string;
  name: string;
  sigil: string;
};

export const COLLECTIBLES = [
  {
    id: 'languages/javascript-typescript',
    regionId: 'languages',
    landmarkId: 'javascript-typescript',
    name: 'Script Seal',
    sigil: 'JS',
  },
  {
    id: 'languages/python',
    regionId: 'languages',
    landmarkId: 'python',
    name: 'Python Pin',
    sigil: 'PY',
  },
  {
    id: 'languages/html-css',
    regionId: 'languages',
    landmarkId: 'html-css',
    name: 'Markup Medal',
    sigil: 'HC',
  },
  {
    id: 'languages/types-and-contracts',
    regionId: 'languages',
    landmarkId: 'types-and-contracts',
    name: 'Contract Crest',
    sigil: 'TC',
  },
  {
    id: 'languages/runtimes-and-packages',
    regionId: 'languages',
    landmarkId: 'runtimes-and-packages',
    name: 'Runtime Ring',
    sigil: 'RP',
  },
  {
    id: 'languages/reading-generated-code',
    regionId: 'languages',
    landmarkId: 'reading-generated-code',
    name: 'Reader Relic',
    sigil: 'RG',
  },
  {
    id: 'databases/sql',
    regionId: 'databases',
    landmarkId: 'sql',
    name: 'Query Quill',
    sigil: 'SQ',
  },
  {
    id: 'databases/nosql-document',
    regionId: 'databases',
    landmarkId: 'nosql-document',
    name: 'Document Disc',
    sigil: 'ND',
  },
  {
    id: 'databases/vector',
    regionId: 'databases',
    landmarkId: 'vector',
    name: 'Vector Vial',
    sigil: 'VC',
  },
  {
    id: 'databases/graph',
    regionId: 'databases',
    landmarkId: 'graph',
    name: 'Graph Gem',
    sigil: 'GR',
  },
  {
    id: 'databases/orm-vs-raw-sql',
    regionId: 'databases',
    landmarkId: 'orm-vs-raw-sql',
    name: 'ORM Orb',
    sigil: 'OR',
  },
  {
    id: 'databases/hosted-vs-self-hosted-databases',
    regionId: 'databases',
    landmarkId: 'hosted-vs-self-hosted-databases',
    name: 'Hosted Helm',
    sigil: 'HS',
  },
  {
    id: 'infra/serverless-functions',
    regionId: 'infra',
    landmarkId: 'serverless-functions',
    name: 'Function Flag',
    sigil: 'SF',
  },
  {
    id: 'infra/vps-single-server',
    regionId: 'infra',
    landmarkId: 'vps-single-server',
    name: 'Server Stone',
    sigil: 'VP',
  },
  {
    id: 'infra/containers',
    regionId: 'infra',
    landmarkId: 'containers',
    name: 'Container Coin',
    sigil: 'CT',
  },
  {
    id: 'infra/edge-compute',
    regionId: 'infra',
    landmarkId: 'edge-compute',
    name: 'Edge Emblem',
    sigil: 'ED',
  },
  {
    id: 'infra/static-cdn',
    regionId: 'infra',
    landmarkId: 'static-cdn',
    name: 'CDN Crest',
    sigil: 'CD',
  },
  {
    id: 'infra/managed-platforms',
    regionId: 'infra',
    landmarkId: 'managed-platforms',
    name: 'Platform Plume',
    sigil: 'MP',
  },
  {
    id: 'ai-types/model-call-vs-agent',
    regionId: 'ai-types',
    landmarkId: 'model-call-vs-agent',
    name: 'Call Coin',
    sigil: 'MC',
  },
  {
    id: 'ai-types/retrieval-augmented-generation',
    regionId: 'ai-types',
    landmarkId: 'retrieval-augmented-generation',
    name: 'Retrieval Ring',
    sigil: 'RA',
  },
  {
    id: 'ai-types/tool-use',
    regionId: 'ai-types',
    landmarkId: 'tool-use',
    name: 'Tool Token',
    sigil: 'TU',
  },
  {
    id: 'ai-types/workflows-vs-agents',
    regionId: 'ai-types',
    landmarkId: 'workflows-vs-agents',
    name: 'Workflow Wing',
    sigil: 'WA',
  },
  {
    id: 'ai-types/ai-evals',
    regionId: 'ai-types',
    landmarkId: 'ai-evals',
    name: 'Eval Emblem',
    sigil: 'EV',
  },
  {
    id: 'ai-types/model-selection-routing',
    regionId: 'ai-types',
    landmarkId: 'model-selection-routing',
    name: 'Routing Relic',
    sigil: 'MR',
  },
  {
    id: 'pm-tools/issues-as-specs',
    regionId: 'pm-tools',
    landmarkId: 'issues-as-specs',
    name: 'Spec Seal',
    sigil: 'IS',
  },
  {
    id: 'pm-tools/prd-lite',
    regionId: 'pm-tools',
    landmarkId: 'prd-lite',
    name: 'PRD Pin',
    sigil: 'PR',
  },
  {
    id: 'pm-tools/vertical-slices',
    regionId: 'pm-tools',
    landmarkId: 'vertical-slices',
    name: 'Slice Stone',
    sigil: 'VS',
  },
  {
    id: 'pm-tools/dependencies-and-work-graphs',
    regionId: 'pm-tools',
    landmarkId: 'dependencies-and-work-graphs',
    name: 'Work Web',
    sigil: 'DG',
  },
  {
    id: 'pm-tools/decision-logs',
    regionId: 'pm-tools',
    landmarkId: 'decision-logs',
    name: 'Decision Disc',
    sigil: 'DL',
  },
  {
    id: 'pm-tools/backlog-vs-now',
    regionId: 'pm-tools',
    landmarkId: 'backlog-vs-now',
    name: 'Now Needle',
    sigil: 'BN',
  },
  {
    id: 'git/commits-as-checkpoints',
    regionId: 'git',
    landmarkId: 'commits-as-checkpoints',
    name: 'Checkpoint Coin',
    sigil: 'CK',
  },
  {
    id: 'git/branches-as-isolation',
    regionId: 'git',
    landmarkId: 'branches-as-isolation',
    name: 'Branch Badge',
    sigil: 'BR',
  },
  {
    id: 'git/pull-requests-and-review',
    regionId: 'git',
    landmarkId: 'pull-requests-and-review',
    name: 'Review Ribbon',
    sigil: 'RV',
  },
  {
    id: 'git/merge-conflicts',
    regionId: 'git',
    landmarkId: 'merge-conflicts',
    name: 'Merge Marker',
    sigil: 'MG',
  },
  {
    id: 'git/working-tree-hygiene',
    regionId: 'git',
    landmarkId: 'working-tree-hygiene',
    name: 'Hygiene Charm',
    sigil: 'HY',
  },
  {
    id: 'git/revert-and-recovery',
    regionId: 'git',
    landmarkId: 'revert-and-recovery',
    name: 'Revert Relic',
    sigil: 'RR',
  },
  {
    id: 'security/secrets-and-environment',
    regionId: 'security',
    landmarkId: 'secrets-and-environment',
    name: 'Secret Shield',
    sigil: 'SE',
  },
  {
    id: 'security/authentication-vs-authorization',
    regionId: 'security',
    landmarkId: 'authentication-vs-authorization',
    name: 'Auth Amulet',
    sigil: 'AA',
  },
  {
    id: 'security/trust-boundaries',
    regionId: 'security',
    landmarkId: 'trust-boundaries',
    name: 'Boundary Badge',
    sigil: 'TB',
  },
  {
    id: 'security/input-validation-and-injection',
    regionId: 'security',
    landmarkId: 'input-validation-and-injection',
    name: 'Input Insignia',
    sigil: 'IV',
  },
  {
    id: 'security/dependency-supply-chain',
    regionId: 'security',
    landmarkId: 'dependency-supply-chain',
    name: 'Supply Seal',
    sigil: 'SC',
  },
  {
    id: 'security/least-privilege-blast-radius',
    regionId: 'security',
    landmarkId: 'least-privilege-blast-radius',
    name: 'Privilege Pin',
    sigil: 'LP',
  },
  {
    id: 'design/design-tokens',
    regionId: 'design',
    landmarkId: 'design-tokens',
    name: 'Token Tile',
    sigil: 'DT',
  },
  {
    id: 'design/component-libraries',
    regionId: 'design',
    landmarkId: 'component-libraries',
    name: 'Component Coin',
    sigil: 'CL',
  },
  {
    id: 'design/layout-and-spacing-rhythm',
    regionId: 'design',
    landmarkId: 'layout-and-spacing-rhythm',
    name: 'Rhythm Ring',
    sigil: 'LS',
  },
  {
    id: 'design/typography-and-hierarchy',
    regionId: 'design',
    landmarkId: 'typography-and-hierarchy',
    name: 'Type Trophy',
    sigil: 'TH',
  },
  {
    id: 'design/accessibility-floor',
    regionId: 'design',
    landmarkId: 'accessibility-floor',
    name: 'A11y Amulet',
    sigil: 'AF',
  },
  {
    id: 'design/consistency-vs-novelty',
    regionId: 'design',
    landmarkId: 'consistency-vs-novelty',
    name: 'Consistency Crest',
    sigil: 'CN',
  },
] as const satisfies readonly Collectible[];

export type CollectibleId = (typeof COLLECTIBLES)[number]['id'];

const BY_ID = new Map<string, Collectible>(
  COLLECTIBLES.map((item) => [item.id, item]),
);

export const COLLECTIBLE_GLOW_STORAGE_KEY = 'ct-l005-glow-v1';
/** Browser event after a server-confirmed stamp — closes stamp→map race. */
export const COLLECTIBLE_CONFIRMED_EVENT = 'ct:collectible-confirmed';
/** Abandoned markers older than this never animate. */
export const COLLECTIBLE_GLOW_TTL_MS = 30 * 60 * 1000;

export type ProgressLikeItem = {
  region?: unknown;
  landmark?: unknown;
  state?: unknown;
};

export type CollectibleGlowMarker = {
  regionId: string;
  landmarkId: string;
  at: number;
};

export function collectibleKey(regionId: string, landmarkId: string): string {
  return `${regionId}/${landmarkId}`;
}

export function collectibleFor(
  regionId: string,
  landmarkId: string,
): Collectible | null {
  return BY_ID.get(collectibleKey(regionId, landmarkId)) ?? null;
}

export function collectiblesForRegion(regionId: string): Collectible[] {
  return COLLECTIBLES.filter((item) => item.regionId === regionId).map((item) => item);
}

/** Ownership is server `state.completed === true` only. */
export function isServerConfirmedCompletion(state: unknown): boolean {
  if (!state || typeof state !== 'object' || Array.isArray(state)) return false;
  return (state as { completed?: unknown }).completed === true;
}

export function completedLandmarkIds(
  items: readonly ProgressLikeItem[] | null | undefined,
  regionId: string,
): Set<string> {
  const out = new Set<string>();
  if (!Array.isArray(items)) return out;
  for (const item of items) {
    if (item?.region !== regionId) continue;
    if (typeof item.landmark !== 'string' || item.landmark.length === 0) continue;
    if (!isServerConfirmedCompletion(item.state)) continue;
    out.add(item.landmark);
  }
  return out;
}

export function readCollectibleGlowMarkers(
  raw: string | null | undefined,
  now: number = Date.now(),
): CollectibleGlowMarker[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const out: CollectibleGlowMarker[] = [];
    for (const row of parsed) {
      if (!row || typeof row !== 'object' || Array.isArray(row)) continue;
      const regionId = (row as { regionId?: unknown }).regionId;
      const landmarkId = (row as { landmarkId?: unknown }).landmarkId;
      const at = (row as { at?: unknown }).at;
      if (typeof regionId !== 'string' || regionId.length === 0) continue;
      if (typeof landmarkId !== 'string' || landmarkId.length === 0) continue;
      if (typeof at !== 'number' || !Number.isFinite(at)) continue;
      if (now - at > COLLECTIBLE_GLOW_TTL_MS) continue;
      if (now < at) continue;
      out.push({ regionId, landmarkId, at });
    }
    return out;
  } catch {
    return [];
  }
}

export function writeCollectibleGlowMarkers(markers: readonly CollectibleGlowMarker[]): string {
  return JSON.stringify(markers);
}

/** Add or refresh a just-confirmed stamp glow marker. */
export function upsertCollectibleGlowMarker(
  raw: string | null | undefined,
  regionId: string,
  landmarkId: string,
  now: number = Date.now(),
): string {
  const next = readCollectibleGlowMarkers(raw, now).filter(
    (m) => !(m.regionId === regionId && m.landmarkId === landmarkId),
  );
  next.push({ regionId, landmarkId, at: now });
  return writeCollectibleGlowMarkers(next);
}

/**
 * Consume one region/landmark marker if present and still fresh.
 * Returns { marker, nextRaw } where nextRaw is null when empty.
 */
export function consumeCollectibleGlowMarker(
  raw: string | null | undefined,
  regionId: string,
  landmarkId: string,
  now: number = Date.now(),
): { marker: CollectibleGlowMarker | null; nextRaw: string | null } {
  const markers = readCollectibleGlowMarkers(raw, now);
  const idx = markers.findIndex(
    (m) => m.regionId === regionId && m.landmarkId === landmarkId,
  );
  if (idx < 0) {
    const next = writeCollectibleGlowMarkers(markers);
    return { marker: null, nextRaw: markers.length ? next : null };
  }
  const marker = markers[idx]!;
  const rest = markers.filter((_, i) => i !== idx);
  return {
    marker,
    nextRaw: rest.length ? writeCollectibleGlowMarkers(rest) : null,
  };
}

export const COLLECTIBLE_SHAME_TERMS = [
  'lost',
  'dropped',
  'fell',
  'behind',
  'shame',
  'missing',
  'debt',
  'loss',
  'worst',
  'slipped',
] as const;

export function collectibleStaticCopyValues(): string[] {
  return [
    ...COLLECTIBLES.map((c) => c.name),
    'Earned',
    'Open',
    'Still on the path',
    'Stamped',
    'Your keepsakes',
    'Your shelf keeps it for the next visit.',
    'A new keepsake joins your shelf when the stamp lands.',
    'Stamp a landmark to earn your first keepsake.',
    'Stamp another landmark whenever you want another keepsake.',
  ];
}
