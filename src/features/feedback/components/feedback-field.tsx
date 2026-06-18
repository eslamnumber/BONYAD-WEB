'use client';

import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { FieldHint, Label } from '@/components/ui';

/**
 * Label + control + error-hint stack, with an optional trailing `counter` (e.g. the message
 * char count). `error` is a zod-emitted i18n key; `text-start` keeps labels at the reading-start
 * under this screen's conventional `dir` (no `dir="auto"` — empty fields don't default to LTR).
 */
export function FeedbackField({
  label,
  htmlFor,
  error,
  counter,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  counter?: string;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor} className="text-start">
        {label}
      </Label>
      {children}
      <div className="flex items-start justify-between gap-2">
        <FieldHint tone="error">{error ? t(error) : null}</FieldHint>
        {counter ? (
          <span className="text-muted-foreground shrink-0 text-xs tabular-nums">{counter}</span>
        ) : null}
      </div>
    </div>
  );
}
