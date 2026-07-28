import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { OnboardingState } from '@/server/onboarding';

const { db, parseAnswerMock } = vi.hoisted(() => ({
  db: { profile: {} as Record<string, unknown>, state: null as OnboardingState | null },
  parseAnswerMock: vi.fn(async (_id: string, _field: string, text: string) => text),
}));

vi.mock('next/headers', () => ({ cookies: async () => ({ get: () => ({ value: 'token' }) }) }));
vi.mock('@/lib/auth/session', () => ({ SESSION_COOKIE_NAME: 'ct_session', verifySessionToken: async () => ({ userId: 'user-1' }) }));
vi.mock('@/server/events', () => ({ recordEvent: vi.fn() }));
vi.mock('@/lib/db', () => {
  const query = async (text: string, values: unknown[] = []) => {
    if (text.includes('SELECT onboarding_state')) return { rows: [{ onboarding_state: db.state }] };
    if (text.includes('SET onboarding_state')) { db.state = JSON.parse(values[0] as string) as OnboardingState; return { rows: [] }; }
    const column = /^UPDATE profiles SET (\w+) = \$1/.exec(text);
    if (column) { db.profile[column[1]] = values[0]; return { rows: [] }; }
    return { rows: [] };
  };
  return {
    queryAsUser: (_id: string, text: string, values?: unknown[]) => query(text, values),
    withUserTransaction: (_id: string, operation: (client: { query: typeof query }) => Promise<unknown>) => operation({ query }),
  } as unknown as typeof import('@/lib/db');
});
vi.mock('@/server/onboarding', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/server/onboarding')>();
  return {
    ...actual,
    parseAnswer: (id: string, field: string, text: string) => parseAnswerMock(id, field, text),
    generateQuestionText: async () => 'Next question?',
  };
});

import { POST } from '../../app/api/onboarding/route';

function post(body: Record<string, unknown>) {
  return new Request('http://localhost/api/onboarding', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
}

beforeEach(() => {
  vi.stubEnv('DATABASE_URL', 'test');
  db.profile = {};
  db.state = null;
  parseAnswerMock.mockClear();
  parseAnswerMock.mockImplementation(async (_id, _field, text) => text);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('onboarding route atomic state transition', () => {
  it('persists the answer and advanced state together', async () => {
    const response = await POST(post({ action: 'answer', text: 'student' }));
    expect(response.status).toBe(200);
    const payload = await response.json() as { count: number; step: string };
    expect(payload.count).toBe(1);
    expect(payload.step).toBe('interests');
    expect(db.profile.persona).toBe('student');
    expect(db.state?.count).toBe(1);
    expect(db.state?.profile.persona).toBe('student');
  });

  it('rejects a stale concurrent submission with 409 and keeps the winner intact', async () => {
    let releaseFirst!: (value: string) => void;
    parseAnswerMock.mockImplementationOnce(() => new Promise<string>((resolve) => { releaseFirst = resolve; }));

    // Request A reads count=0, then stalls in the model parse before taking the lock.
    const requestA = POST(post({ action: 'answer', text: 'student' }));
    await vi.waitFor(() => expect(parseAnswerMock).toHaveBeenCalledTimes(1));

    // Request B for the same step completes fully while A is stalled.
    const responseB = await POST(post({ action: 'answer', text: 'owner' }));
    expect(responseB.status).toBe(200);
    expect(db.profile.persona).toBe('owner');
    expect(db.state?.count).toBe(1);

    releaseFirst('student');
    const responseA = await requestA;
    expect(responseA.status).toBe(409);
    expect(db.profile.persona).toBe('owner');
    expect(db.state?.count).toBe(1);
    expect(db.state?.profile.persona).toBe('owner');
  });

  it('skip and finish still advance and complete against the locked state', async () => {
    const skipped = await POST(post({ action: 'skip' }));
    expect(skipped.status).toBe(200);
    expect(db.state?.count).toBe(1);
    const finished = await POST(post({ action: 'finish' }));
    expect(finished.status).toBe(200);
    expect((await finished.json() as { done: boolean }).done).toBe(true);
    expect(db.state?.finished).toBe(true);
  });
});
