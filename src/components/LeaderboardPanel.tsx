'use client';

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';

import { useSession } from '@/lib/auth/SessionProvider';
import {
  LEADERBOARD_COPY,
  LEADERBOARD_HANDLE_MAX,
  LEADERBOARD_HANDLE_MIN,
  type LeaderboardBoardPayload,
  type LeaderboardPeriod,
} from '@/lib/leaderboard';

const EMPTY: LeaderboardBoardPayload = {
  period: 'weekly',
  entries: [],
  own: null,
  optedIn: false,
  handle: null,
  tone: LEADERBOARD_COPY.defaultToneWeekly,
};

export function LeaderboardPanel() {
  const session = useSession();
  const [period, setPeriod] = useState<LeaderboardPeriod>('weekly');
  const [board, setBoard] = useState<LeaderboardBoardPayload>(EMPTY);
  const [handleInput, setHandleInput] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const requestGen = useRef(0);

  // Imperative refresh for submit/leave handlers (event-driven setState is fine).
  const refreshBoard = useCallback(async (nextPeriod: LeaderboardPeriod) => {
    const gen = ++requestGen.current;
    setLoadState('loading');
    try {
      const response = await fetch(`/api/leaderboard?period=${nextPeriod}`, {
        credentials: 'same-origin',
      });
      if (gen !== requestGen.current) return;
      if (!response.ok) {
        setLoadState('error');
        setBoard({
          ...EMPTY,
          period: nextPeriod,
          tone: LEADERBOARD_COPY.breath,
        });
        return;
      }
      const body = (await response.json()) as LeaderboardBoardPayload;
      if (gen !== requestGen.current) return;
      setBoard(body);
      if (body.handle) setHandleInput(body.handle);
      setLoadState('ready');
    } catch {
      if (gen !== requestGen.current) return;
      setLoadState('error');
      setBoard({
        ...EMPTY,
        period: nextPeriod,
        tone: LEADERBOARD_COPY.breath,
      });
    }
  }, []);

  // Effect-local fetch: setState only in promise callbacks (lint-safe).
  useEffect(() => {
    const controller = new AbortController();
    const gen = ++requestGen.current;

    fetch(`/api/leaderboard?period=${period}`, {
      credentials: 'same-origin',
      signal: controller.signal,
    })
      .then(async (response) => {
        if (gen !== requestGen.current) return;
        if (!response.ok) {
          setLoadState('error');
          setBoard({
            ...EMPTY,
            period,
            tone: LEADERBOARD_COPY.breath,
          });
          return;
        }
        const body = (await response.json()) as LeaderboardBoardPayload;
        if (gen !== requestGen.current) return;
        setBoard(body);
        if (body.handle) setHandleInput(body.handle);
        setLoadState('ready');
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        if (gen !== requestGen.current) return;
        setLoadState('error');
        setBoard({
          ...EMPTY,
          period,
          tone: LEADERBOARD_COPY.breath,
        });
      });

    return () => {
      controller.abort();
    };
  }, [period, session.status]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setStatus(null);
    try {
      const response = await fetch('/api/leaderboard', {
        method: 'PUT',
        credentials: 'same-origin',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ handle: handleInput }),
      });
      const body = (await response.json()) as LeaderboardBoardPayload & {
        error?: string;
        handle?: string;
      };
      if (response.status === 409) {
        setStatus(body.error ?? LEADERBOARD_COPY.takenFallback);
        return;
      }
      if (response.status === 429) {
        setStatus(body.error ?? LEADERBOARD_COPY.cooldownFallback);
        return;
      }
      if (!response.ok) {
        setStatus(body.error ?? LEADERBOARD_COPY.saveFail);
        return;
      }
      if (body.handle) setHandleInput(body.handle);
      await refreshBoard(period);
      setStatus(LEADERBOARD_COPY.joined);
    } catch {
      setStatus(LEADERBOARD_COPY.saveFail);
    } finally {
      setBusy(false);
    }
  }

  async function onLeave() {
    if (busy) return;
    setBusy(true);
    setStatus(null);
    try {
      const response = await fetch('/api/leaderboard', {
        method: 'DELETE',
        credentials: 'same-origin',
      });
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      if (response.status === 429) {
        setStatus(body.error ?? LEADERBOARD_COPY.cooldownFallback);
        return;
      }
      if (!response.ok) {
        setStatus(LEADERBOARD_COPY.leaveFail);
        return;
      }
      setHandleInput('');
      await refreshBoard(period);
      setStatus(LEADERBOARD_COPY.left);
    } catch {
      setStatus(LEADERBOARD_COPY.leaveFail);
    } finally {
      setBusy(false);
    }
  }

  const ownOutsideTop =
    board.own && !board.entries.some((row) => row.isSelf && row.handle === board.own?.handle);

  return (
    <main className="leaderboard-page" id="main-content" data-testid="leaderboard-page">
      <header className="leaderboard-header">
        <div>
          <p className="leaderboard-kicker">
            <Link href="/map">{LEADERBOARD_COPY.kickerBack}</Link>
          </p>
          <h1>{LEADERBOARD_COPY.pageTitle}</h1>
          <p className="leaderboard-sub">{LEADERBOARD_COPY.subtitle}</p>
        </div>
      </header>

      <div className="leaderboard-tabs" role="group" aria-label="Board period">
        <button
          type="button"
          aria-pressed={period === 'weekly'}
          className={period === 'weekly' ? 'is-active' : undefined}
          data-testid="leaderboard-tab-weekly"
          onClick={() => {
            setStatus(null);
            setPeriod('weekly');
          }}
        >
          {LEADERBOARD_COPY.tabWeekly}
        </button>
        <button
          type="button"
          aria-pressed={period === 'all_time'}
          className={period === 'all_time' ? 'is-active' : undefined}
          data-testid="leaderboard-tab-all-time"
          onClick={() => {
            setStatus(null);
            setPeriod('all_time');
          }}
        >
          {LEADERBOARD_COPY.tabAllTime}
        </button>
      </div>

      <p className="leaderboard-tone" data-testid="leaderboard-tone" role="status">
        {board.tone}
      </p>

      {session.status === 'authenticated' && !board.unavailable && (
        <section className="leaderboard-optin" aria-label="Join the board">
          <form onSubmit={onSubmit} className="leaderboard-form">
            <label htmlFor="leaderboard-handle">
              {LEADERBOARD_COPY.handleLabel}
              <span className="leaderboard-help">{LEADERBOARD_COPY.handleHelp}</span>
              <input
                id="leaderboard-handle"
                name="handle"
                data-testid="leaderboard-handle-input"
                value={handleInput}
                onChange={(event) => setHandleInput(event.target.value)}
                minLength={LEADERBOARD_HANDLE_MIN}
                maxLength={LEADERBOARD_HANDLE_MAX}
                autoComplete="username"
                spellCheck={false}
                placeholder={LEADERBOARD_COPY.handlePlaceholder}
                disabled={busy}
              />
            </label>
            <div className="leaderboard-form-actions">
              <button type="submit" data-testid="leaderboard-optin" disabled={busy}>
                {board.optedIn ? LEADERBOARD_COPY.update : LEADERBOARD_COPY.join}
              </button>
              {board.optedIn && (
                <button
                  type="button"
                  className="leaderboard-leave"
                  data-testid="leaderboard-leave"
                  onClick={() => void onLeave()}
                  disabled={busy}
                >
                  {LEADERBOARD_COPY.leave}
                </button>
              )}
            </div>
          </form>
          {status && (
            <p className="leaderboard-status" data-testid="leaderboard-status" role="status">
              {status}
            </p>
          )}
        </section>
      )}

      {session.status !== 'authenticated' && (
        <p className="leaderboard-anon-note" data-testid="leaderboard-anon-note">
          {LEADERBOARD_COPY.anonNote}
        </p>
      )}

      {board.unavailable && (
        <p className="leaderboard-status" data-testid="leaderboard-unavailable">
          {LEADERBOARD_COPY.unavailable}
        </p>
      )}

      {loadState === 'loading' && (
        <p className="leaderboard-status" data-testid="leaderboard-loading">
          {LEADERBOARD_COPY.loading}
        </p>
      )}

      {ownOutsideTop && board.own && (
        <section
          className="leaderboard-own-card"
          data-testid="leaderboard-own-card"
          aria-label="Your rank"
        >
          <p>
            <strong>{LEADERBOARD_COPY.yourSpot}</strong> rank {board.own.rank} · {board.own.handle} ·{' '}
            {board.own.points} XP
          </p>
        </section>
      )}

      <div className="leaderboard-table-wrap" aria-busy={loadState === 'loading'}>
        <table className="leaderboard-table" data-testid="leaderboard-table">
          <thead>
            <tr>
              <th scope="col">{LEADERBOARD_COPY.colRank}</th>
              <th scope="col">{LEADERBOARD_COPY.colHandle}</th>
              <th scope="col">{LEADERBOARD_COPY.colXp}</th>
            </tr>
          </thead>
          <tbody>
            {board.entries.length === 0 && loadState === 'ready' && !board.unavailable && (
              <tr>
                <td colSpan={3} data-testid="leaderboard-empty">
                  {LEADERBOARD_COPY.empty}
                </td>
              </tr>
            )}
            {board.entries.map((row) => (
              <tr
                key={`${row.rank}-${row.handle}`}
                data-testid={row.isSelf ? 'leaderboard-row-self' : 'leaderboard-row'}
                className={row.isSelf ? 'is-self' : undefined}
              >
                <td>{row.rank}</td>
                <td>
                  {row.handle}
                  {row.isSelf ? (
                    <span className="leaderboard-you">{LEADERBOARD_COPY.youSuffix}</span>
                  ) : null}
                </td>
                <td>{row.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
