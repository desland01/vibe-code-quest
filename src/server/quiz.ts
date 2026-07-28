import { getLandmark } from '@/lib/content';

export function gradeQuiz(regionId: string, landmarkId: string, choice: string) {
  const landmark = getLandmark(regionId, landmarkId);
  if (!landmark) return null;
  return { correct: choice === landmark.quiz.answer, answer: landmark.quiz.answer, explanation: landmark.quiz.explanation };
}
