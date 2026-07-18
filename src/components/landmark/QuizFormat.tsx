'use client';

import { useState } from 'react';
import type { Landmark } from '@/content/schema';
import { recordClientEvent } from './clientEvents';

type Grade = { correct: boolean; answer: string; explanation: string };

export function QuizFormat({ landmark, regionId }: { landmark: Landmark; regionId: string }) {
  const [choice, setChoice] = useState('');
  const [grade, setGrade] = useState<Grade | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  async function submit() {
    if (!choice || pending) return;
    setPending(true);
    setError('');
    try {
      const response = await fetch('/api/quiz', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ regionId, landmarkId: landmark.id, choice }) });
      if (!response.ok) throw new Error('Quiz grading failed');
      const result = await response.json() as Grade;
      setGrade(result);
      recordClientEvent('quiz_completed', { regionId, landmarkId: landmark.id, correct: result.correct });
    } catch {
      setError('We could not grade that answer. Please try again.');
    } finally { setPending(false); }
  }
  return (
    <section className="landmark-quiz" aria-labelledby="quiz-heading">
      <h3 id="quiz-heading">Quiz</h3>
      <p>{landmark.quiz.question}</p>
      <fieldset disabled={pending}><legend className="sr-only">Choose one answer</legend>
        {landmark.quiz.options.map((option) => <label key={option}><input type="radio" name="landmark-answer" value={option} checked={choice === option} onChange={() => { setChoice(option); setGrade(null); }} /> {option}</label>)}
      </fieldset>
      <button type="button" onClick={submit} disabled={!choice || pending}>{pending ? 'Checking…' : 'Check answer'}</button>
      {grade && <div role="status"><strong>{grade.correct ? 'Correct!' : 'Not quite.'}</strong> <span>{grade.explanation}</span>{!grade.correct && <p>Answer: {grade.answer}</p>}</div>}
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
