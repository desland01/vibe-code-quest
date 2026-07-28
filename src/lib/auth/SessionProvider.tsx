'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type SessionContextValue = {
  userId: string | null;
  hosted: boolean | null;
  status: 'loading' | 'authenticated' | 'error';
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionContextValue>({
    userId: null,
    hosted: null,
    status: 'loading'
  });

  useEffect(() => {
    const controller = new AbortController();

    void fetch('/api/session', { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error('Unable to create session');
        const body = (await response.json()) as { userId: string; hosted: boolean };
        setSession({ userId: body.userId, hosted: body.hosted, status: 'authenticated' });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setSession({ userId: null, hosted: null, status: 'error' });
      });

    return () => controller.abort();
  }, []);

  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const session = useContext(SessionContext);
  if (!session) throw new Error('useSession must be used within SessionProvider');
  return session;
}
