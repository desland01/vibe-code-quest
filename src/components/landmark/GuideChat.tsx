'use client';

import { useState, type FormEvent } from 'react';
import type { Landmark } from '@/content/schema';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

export function GuideChat({ landmark, regionId }: { landmark: Landmark; regionId: string }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [offline, setOffline] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    const message = text.trim();
    if (!message || busy) return;
    setBusy(true); setText(''); setOffline(null);
    const history = [...messages, { role: 'user' as const, content: message }];
    setMessages(history);
    try {
      const response = await fetch('/api/guide', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ regionId, landmarkId: landmark.id, message }), signal: AbortSignal.timeout(12_000) });
      if (!response.ok) throw new Error('Guide unavailable');
      const data = await response.json() as { kind: 'ok' | 'offline'; message: string; banner?: string };
      setMessages([...history, { role: 'assistant', content: data.message }]);
      if (data.kind === 'offline') setOffline(data.banner ?? "The guide is offline — here's the canonical explanation");
    } catch {
      setOffline("The guide is offline — here's the canonical explanation");
      setMessages([...history, { role: 'assistant', content: landmark.definition }]);
    } finally { setBusy(false); }
  }
  return <aside aria-label="AI guide" data-testid="guide-chat">
    <button type="button" aria-expanded={open} aria-controls="guide-panel" onClick={() => setOpen((value) => !value)}>Ask the guide</button>
    {open && <div id="guide-panel"><h3>Landmark guide</h3>
      {offline && <p role="alert">{offline}</p>}
      <div role="log" aria-live="polite" aria-label="Guide conversation">{messages.map((item, index) => <p key={index}><strong>{item.role === 'user' ? 'You' : 'Guide'}:</strong> {item.content}</p>)}</div>
      <form onSubmit={submit}><label htmlFor="guide-message">Ask about {landmark.title}</label><textarea id="guide-message" value={text} maxLength={1000} disabled={busy} onChange={(event) => setText(event.target.value)} /><button type="submit" disabled={busy || !text.trim()}>{busy ? 'Asking…' : 'Send'}</button></form>
    </div>}
  </aside>;
}
