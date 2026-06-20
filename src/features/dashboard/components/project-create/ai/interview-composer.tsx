'use client';

import { useId } from 'react';

import { ArrowUpIcon } from '@/components/icons';

import { type QuestionType } from './interview-config';

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  type: QuestionType;
  placeholder: string;
  /** Accessible label for the input. */
  label: string;
  sendLabel: string;
  canSend: boolean;
};

const PILL =
  'bg-dashboard-search-bg border-ai-input-border flex w-full items-center justify-between gap-2 rounded-full border ps-2 pe-6 py-2 backdrop-blur-[8px]';
const FIELD =
  'text-foreground placeholder:text-input-placeholder min-w-0 flex-1 bg-transparent text-base text-end [direction:inherit] focus-visible:outline-none';

/**
 * The glass pill input (Figma 1597:3381) — a navy circular send button at the inline
 * start and the answer field at the inline end. Submitting sends the answer as a chat
 * message and advances the interview.
 */
export function InterviewComposer({
  value,
  onChange,
  onSubmit,
  type,
  placeholder,
  label,
  sendLabel,
  canSend,
}: Props) {
  const id = useId();
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className={PILL}
    >
      <button
        type="submit"
        disabled={!canSend}
        aria-label={sendLabel}
        className="bg-brand-dark-navy text-on-media focus-visible:outline-ring flex size-10 shrink-0 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-40 motion-safe:transition-opacity motion-safe:enabled:hover:opacity-90"
      >
        <ArrowUpIcon className="h-[18px] w-3.5" aria-hidden />
      </button>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        type="text"
        inputMode={type === 'number' ? 'numeric' : 'text'}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            onSubmit();
          }
        }}
        placeholder={placeholder}
        className={FIELD}
      />
    </form>
  );
}
