'use client';

import { useState } from 'react';

import { INTERVIEW_QUESTIONS, type InterviewQuestion } from './interview-config';

/** A rendered transcript row — AI rows resolve via i18n; user rows are the typed answer. */
export type TranscriptRow = { role: 'ai'; tkey: string } | { role: 'user'; text: string };

/**
 * Derive the chat transcript from the step + gathered answers: a greeting, then each
 * asked question with its answer, the current (unanswered) question last, and a closing
 * once finished. Pure — recomputed each render, no stored message objects.
 */
export function buildTranscript(
  step: number,
  answers: Record<string, string>,
  done: boolean,
): TranscriptRow[] {
  const rows: TranscriptRow[] = [{ role: 'ai', tkey: 'greeting' }];
  const upTo = done ? INTERVIEW_QUESTIONS.length : step + 1;
  for (let i = 0; i < upTo; i++) {
    const q = INTERVIEW_QUESTIONS[i] as InterviewQuestion;
    rows.push({ role: 'ai', tkey: `questions.${q.key}` });
    if (done || i < step) rows.push({ role: 'user', text: answers[q.key] ?? '' });
  }
  if (done) rows.push({ role: 'ai', tkey: 'closing' });
  return rows;
}

/**
 * Local state for the Omdah chat interview: the current question `step`, gathered
 * `answers`, and the composer `input`. `send` records the answer and advances (or
 * finishes after the last question). No network — SOW generation is later.
 */
export function useOmdahInterview() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [input, setInput] = useState('');
  const [done, setDone] = useState(false);

  const total = INTERVIEW_QUESTIONS.length;
  const currentType = (INTERVIEW_QUESTIONS[step] as InterviewQuestion).type;
  const canSend = input.trim().length > 0 && !done;

  const send = () => {
    const text = input.trim();
    if (!text || done) return;
    const q = INTERVIEW_QUESTIONS[step] as InterviewQuestion;
    setAnswers((a) => ({ ...a, [q.key]: text }));
    setInput('');
    if (step + 1 >= total) setDone(true);
    else setStep((s) => s + 1);
  };

  const restart = () => {
    setStep(0);
    setAnswers({});
    setInput('');
    setDone(false);
  };

  return { step, total, answers, input, setInput, send, canSend, currentType, done, restart };
}
