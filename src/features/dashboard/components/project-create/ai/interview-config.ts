/**
 * Omdah Q&A interview (Figma 1597:3378) — the 7 local questions mirror the iOS
 * `userAnswers` keys (backend doc Step 2). Presented as a chat transcript: the
 * assistant asks each question, the user's typed answer is the next message. Fully
 * local; SOW generation is later.
 */
export type QuestionType = 'text' | 'number';

export type InterviewQuestion = {
  /** Stored answer key (mirrors the iOS `userAnswers` map) + i18n question suffix. */
  key: string;
  type: QuestionType;
};

export const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  { key: 'project_name', type: 'text' },
  { key: 'description', type: 'text' },
  { key: 'property_area', type: 'text' },
  { key: 'location', type: 'text' },
  { key: 'quality_tier', type: 'text' },
  { key: 'budget', type: 'number' },
  { key: 'duration_days', type: 'number' },
];
