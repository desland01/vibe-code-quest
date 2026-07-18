'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Landmark } from '@/content/schema';

type Message = { role: 'user' | 'assistant'; content: string };

export function LessonFormat({ landmark, regionId }: { landmark: Landmark; regionId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [pending, setPending] = useState(true);
  const started = useRef(false);
  const next = useCallback(async (history: Message[]) => {
    setPending(true);
    try {
      const response = await fetch('/api/lesson', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ regionId, landmarkId: landmark.id, messages: history }) });
      if (!response.ok) throw new Error('Lesson unavailable');
      const result = await response.json() as { message: string };
      setMessages([...history, { role: 'assistant', content: result.message }]);
    } catch { setMessages([...history, { role: 'assistant', content: 'The guided lesson is unavailable right now. The overview above is always available.' }]); }
    finally { setPending(false); }
  }, [landmark.id, regionId]);
  useEffect(() => { if (!started.current) { started.current = true; void next([]); } }, [next]);
  const send = async () => {
    const clean = text.trim();
    if (!clean || pending) return;
    const history = [...messages, { role: 'user' as const, content: clean }];
    setMessages(history); setText(''); await next(history);
  };
  const assistantTurns = messages.filter((message) => message.role === 'assistant').length;
  return <section aria-labelledby="lesson-heading"><h3 id="lesson-heading">Guided lesson</h3>
    <div aria-live="polite" data-testid="lesson-chat">{messages.map((message, index) => <p key={index}><strong>{message.role === 'assistant' ? 'Guide' : 'You'}:</strong> {message.content}</p>)}{pending && <p>Guide is thinking…</p>}</div>
    {assistantTurns < 5 && <div><label htmlFor="lesson-answer">Your answer</label><textarea id="lesson-answer" value={text} maxLength={1000} onChange={(event) => setText(event.target.value)} /><button type="button" disabled={pending || !text.trim()} onClick={send}>Send</button></div>}
  </section>;
}
