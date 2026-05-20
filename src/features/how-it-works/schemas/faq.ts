/**
 * Mirrors FaqItem from website-bonyad/src/screens/misc/HowItWorksScreen.tsx (line 28).
 * Permissive — optional fields may grow as the backend evolves.
 */
export type Faq = {
  id: number;
  questionEn: string;
  questionAr: string;
  answerEn: string;
  answerAr: string;
  displayOrder?: number;
};
