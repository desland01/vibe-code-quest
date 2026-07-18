import 'server-only';

import { randomBytes } from 'node:crypto';
import type { QueryResultRow } from 'pg';

import { regions as contentRegions } from '@/lib/content';
import { pool, queryAsUser } from '@/lib/db';
import { recordEvent } from '@/server/events';

export type ShareSnapshotPayload = {
  version: 1;
  createdAt: string;
  regions: Array<{
    id: string;
    title: string;
    landmarksTotal: number;
    landmarksCompleted: number;
  }>;
  totals: {
    regionsStarted: number;
    landmarksCompleted: number;
    landmarksTotal: number;
  };
};

type ProgressRow = QueryResultRow & {
  region: string;
  landmark: string;
  state: unknown;
};

type ShareRow = QueryResultRow & { payload: unknown };

type ShareDependencies = {
  queryForUser: (userId: string, text: string, values?: unknown[]) => Promise<{ rows: QueryResultRow[] }>;
  privilegedQuery: (text: string, values?: unknown[]) => Promise<{ rows: ShareRow[]; rowCount?: number | null }>;
  manifestRegions: ReadonlyArray<{ id: string; title: string; landmarks: ReadonlyArray<{ id: string }> }>;
  now: () => Date;
  tokenBytes: () => Buffer;
  emit: typeof recordEvent;
};

const defaultDependencies: ShareDependencies = {
  queryForUser: queryAsUser,
  privilegedQuery: (text, values) => pool.query(text, values),
  manifestRegions: contentRegions,
  now: () => new Date(),
  tokenBytes: () => randomBytes(24),
  emit: recordEvent
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function isShareSnapshotPayload(value: unknown): value is ShareSnapshotPayload {
  if (!isRecord(value) || value.version !== 1 || typeof value.createdAt !== 'string') return false;
  if (!Array.isArray(value.regions) || !isRecord(value.totals)) return false;
  const totals = value.totals;
  if (!['regionsStarted', 'landmarksCompleted', 'landmarksTotal'].every((key) => Number.isInteger(totals[key]) && Number(totals[key]) >= 0)) return false;
  return value.regions.every((region) => isRecord(region)
    && typeof region.id === 'string'
    && typeof region.title === 'string'
    && Number.isInteger(region.landmarksTotal)
    && Number(region.landmarksTotal) >= 0
    && Number.isInteger(region.landmarksCompleted)
    && Number(region.landmarksCompleted) >= 0);
}

export function createShareService(overrides: Partial<ShareDependencies> = {}) {
  const deps = { ...defaultDependencies, ...overrides };

  return {
    async createSnapshot(userId: string): Promise<{ token: string }> {
      const progress = await deps.queryForUser(
        userId,
        'SELECT region, landmark, state FROM progress WHERE profile_id = $1',
        [userId]
      );
      const progressRows = progress.rows as ProgressRow[];
      const rowsByLandmark = new Map(progressRows.map((row) => [`${row.region}\0${row.landmark}`, row]));
      const startedRegions = new Set<string>();
      let completedTotal = 0;
      const snapshotRegions = deps.manifestRegions.map((region) => {
        let completed = 0;
        for (const landmark of region.landmarks) {
          const row = rowsByLandmark.get(`${region.id}\0${landmark.id}`);
          if (row) startedRegions.add(region.id);
          if (row && isRecord(row.state) && row.state.completed === true) completed += 1;
        }
        completedTotal += completed;
        return {
          id: region.id,
          title: region.title,
          landmarksTotal: region.landmarks.length,
          landmarksCompleted: completed
        };
      });
      const payload: ShareSnapshotPayload = {
        version: 1,
        createdAt: deps.now().toISOString(),
        regions: snapshotRegions,
        totals: {
          regionsStarted: startedRegions.size,
          landmarksCompleted: completedTotal,
          landmarksTotal: snapshotRegions.reduce((sum, region) => sum + region.landmarksTotal, 0)
        }
      };
      const token = deps.tokenBytes().toString('base64url');
      if (token.length < 22) throw new Error('Share token entropy is insufficient');
      await deps.queryForUser(
        userId,
        'INSERT INTO share_snapshots (token, profile_id, payload) VALUES ($1, $2, $3::jsonb)',
        [token, userId, JSON.stringify(payload)]
      );
      deps.emit('share_card_created', {
        regionsStarted: payload.totals.regionsStarted,
        landmarksCompleted: payload.totals.landmarksCompleted
      });
      return { token };
    },

    async getSnapshotByToken(token: string): Promise<ShareSnapshotPayload | null> {
      const result = await deps.privilegedQuery(
        'SELECT payload FROM share_snapshots WHERE token = $1 AND revoked_at IS NULL LIMIT 1',
        [token]
      );
      const payload = result.rows[0]?.payload;
      return isShareSnapshotPayload(payload) ? payload : null;
    },

    async revokeSnapshot(userId: string, token: string): Promise<boolean> {
      const result = await deps.queryForUser(
        userId,
        'UPDATE share_snapshots SET revoked_at = now() WHERE token = $1 AND profile_id = $2 AND revoked_at IS NULL RETURNING payload',
        [token, userId]
      );
      return result.rows.length > 0;
    }
  };
}

const shareService = createShareService();
export const createSnapshot = shareService.createSnapshot;
export const getSnapshotByToken = shareService.getSnapshotByToken;
export const revokeSnapshot = shareService.revokeSnapshot;
