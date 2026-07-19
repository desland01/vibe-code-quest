'use client';

import { FormEvent, useState } from 'react';

type Step = 'email' | 'code' | 'success';

export function UpgradeAccountModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch(`/api/auth/otp/${step === 'email' ? 'request' : 'verify'}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(step === 'email' ? { email } : { code })
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setMessage(result.error ?? 'Something went wrong');
        return;
      }
      if (step === 'email') {
        setStep('code');
        setMessage('Check your email for the 6-digit code.');
      } else {
        setStep('success');
        setMessage('Your progress is now saved to your email.');
      }
    } catch {
      setMessage('Something went wrong. Try again.');
    } finally {
      setBusy(false);
    }
  }

  function close() {
    setOpen(false);
    setStep('email');
    setEmail('');
    setCode('');
    setMessage('');
    setBusy(false);
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>Save progress via email</button>
      {open && (
        <div role="dialog" aria-modal="true" aria-labelledby="upgrade-title">
          <h2 id="upgrade-title">Save your progress</h2>
          {step !== 'success' && (
            <form onSubmit={submit}>
              {step === 'email' ? (
                <label>Email <input type="email" required autoFocus value={email} onChange={(event) => setEmail(event.target.value)} /></label>
              ) : (
                <label>6-digit code <input inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required autoFocus value={code} onChange={(event) => setCode(event.target.value)} /></label>
              )}
              <button type="submit" disabled={busy}>{busy ? 'Working…' : step === 'email' ? 'Send code' : 'Verify code'}</button>
            </form>
          )}
          {message && <p role="status">{message}</p>}
          <button type="button" onClick={close}>Close</button>
        </div>
      )}
    </>
  );
}
