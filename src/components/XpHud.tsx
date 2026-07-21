'use client';

import { useEffect, useState } from 'react';

import { useSession } from '@/lib/auth/SessionProvider';

/**
 * L-003 personal XP counter for the map HUD.
 * Server total only — never client-authoritative.
 * Quiet failure: hide on network/DB errors (A4.9 no-DB self-host story).
 */
export function XpHud() {
  const session = useSession();
  if (session.status !== 'authenticated') return null;
  return <AuthenticatedXpHud />;
}

function AuthenticatedXpHud() {
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    void fetch('/api/progress', { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) return null;
        return response.json() as Promise<{ xp?: { total?: number } }>;
      })
      .then((body) => {
        if (!body || typeof body.xp?.total !== 'number') {
          setTotal(null);
          return;
        }
        setTotal(body.xp.total);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setTotal(null);
      });

    return () => controller.abort();
  }, []);

  if (total === null) return null;

  return (
    <div
      className="xp-hud"
      data-testid="xp-hud"
      aria-label={`${total} experience points`}
    >
      <span className="xp-hud__value" data-testid="xp-hud-total">
        {total}
      </span>
      <span className="xp-hud__unit" aria-hidden="true">
        XP
      </span>
    </div>
  );
}
