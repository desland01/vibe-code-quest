'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';

import { useSession } from '@/lib/auth/SessionProvider';

type Reply = { questionText: string | null; count: number; mapUnlocked: boolean; done: boolean };

export function OnboardingChat() {
  const session = useSession();
  const started = useRef(false);
  const [reply, setReply] = useState<Reply | null>(null);
  const [text, setText] = useState('');
  const [open, setOpen] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function act(action: 'start' | 'answer' | 'skip' | 'finish', answer?: string) {
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/onboarding', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action, ...(answer ? { text: answer } : {}) }) });
      if (!response.ok) throw new Error('Could not continue onboarding');
      const next = await response.json() as Reply;
      setReply(next);
      setText('');
      if (next.done) setOpen(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not continue onboarding');
    } finally { setBusy(false); }
  }

  useEffect(() => {
    if (session.status !== 'authenticated' || started.current) return;
    started.current = true;
    void act('start');
  }, [session.status]);
  if (!open) return null;

  function submit(event: FormEvent) {
    event.preventDefault();
    if (text.trim()) void act('answer', text.trim());
  }

  return (
    <section className="onboarding-chat" role="dialog" aria-modal="false" aria-labelledby="onboarding-title" data-testid="onboarding-panel">
      <div className="onboarding-chat__header">
        <div><strong id="onboarding-title">Make this map yours</strong><span>{reply?.count ?? 0}/5</span></div>
        <button type="button" aria-label="Dismiss onboarding" onClick={() => setOpen(false)}>×</button>
      </div>
      {reply?.mapUnlocked && <p role="status">Map unlocked — keep exploring while we finish.</p>}
      <p>{reply?.questionText ?? 'Getting your first question…'}</p>
      <form onSubmit={submit}>
        <label htmlFor="onboarding-answer" className="sr-only">Your answer</label>
        <input id="onboarding-answer" value={text} onChange={(event) => setText(event.target.value)} disabled={busy || !reply} maxLength={1000} />
        <button type="submit" disabled={busy || !text.trim()}>Send</button>
      </form>
      <div className="onboarding-chat__actions">
        <button type="button" disabled={busy || !reply} onClick={() => void act('skip')}>Skip</button>
        <button type="button" disabled={busy || !reply} onClick={() => void act('finish')}>Finish</button>
      </div>
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
