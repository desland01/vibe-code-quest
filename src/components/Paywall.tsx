'use client';

import { useEffect, useState } from 'react';

export function Paywall({ verifiedEmail }: { verifiedEmail: boolean }) {
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { console.debug('[event] paywall_shown'); }, []);
  async function billing(action: 'trial' | 'subscribe') {
    setBusy(true); setMessage(null);
    try {
      const response = await fetch('/api/billing/checkout', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action }) });
      const data = await response.json() as { url?: string; error?: string };
      if (!response.ok) { setMessage(data.error ?? 'Billing is unavailable'); return; }
      if (data.url) window.location.assign(data.url); else window.location.reload();
    } catch { setMessage('Billing is unavailable right now. Your lessons are still readable.'); }
    finally { setBusy(false); }
  }
  return <section aria-label="Guide paywall" data-testid="guide-paywall">
    <h3>Keep learning with the live guide</h3>
    <p>Your overview, lessons, and quizzes stay readable. Start a 14-day trial or subscribe to unlock the live guide.</p>
    {!verifiedEmail ? <p>Verify your email from the save-progress prompt before starting a trial.</p> : <div>
      <button type="button" disabled={busy} onClick={() => billing('trial')}>Start free trial</button>
      <button type="button" disabled={busy} onClick={() => billing('subscribe')}>Subscribe (test mode)</button>
    </div>}
    {message && <p role="alert">{message}</p>}
  </section>;
}
