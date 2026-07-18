import { describe, expect, it } from 'vitest';
import { getLandmark, regions } from '@/lib/content';
import { gradeQuiz } from '../../app/api/quiz/route';
import { buildOverview } from '@/components/landmark/OverviewFormat';

describe('deterministic quiz grading', () => {
  const landmark = getLandmark('databases', 'sql')!;
  it('grades correct and incorrect choices from the canonical answer', () => {
    expect(gradeQuiz('databases', 'sql', landmark.quiz.answer)).toEqual({ correct: true, answer: landmark.quiz.answer, explanation: landmark.quiz.explanation });
    expect(gradeQuiz('databases', 'sql', landmark.quiz.options.find((option) => option !== landmark.quiz.answer)!)).toMatchObject({ correct: false, answer: landmark.quiz.answer, explanation: landmark.quiz.explanation });
  });
  it('cannot be influenced by a forged client correct field', () => {
    const forged = { choice: 'forged', correct: true };
    expect(gradeQuiz('databases', 'sql', forged.choice)?.correct).toBe(false);
  });
  it('guards every real landmark answer as one of its options', () => {
    for (const region of regions) for (const item of region.landmarks) expect(item.quiz.options).toContain(item.quiz.answer);
  });
});

describe('VAL-033 deterministic overview', () => {
  it('snapshots canonical fields in about 80 words', () => {
    const overview = buildOverview(getLandmark('databases', 'sql')!);
    expect(overview.trim().split(/\s+/).length).toBeGreaterThanOrEqual(70);
    expect(overview.trim().split(/\s+/).length).toBeLessThanOrEqual(90);
    expect(overview).toMatchInlineSnapshot(`"The durable database choice that is often right. SQL databases store durable records in tables with explicit relationships. They are a strong default when your app needs transactions, constraints, and flexible queries across connected data. Use it when You need related records such as users, teams, projects, and invoices.; Several writes must succeed or fail together.;… Vibe coder default: Start with PostgreSQL for application records, and keep it until a measured need proves another store fits better."`);
  });
});
