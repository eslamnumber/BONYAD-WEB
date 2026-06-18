'use client';

import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { FieldHint, Label } from '@/components/ui';

/** Label + control + error-hint stack. `error` is a zod-emitted i18n key. Shared by the
 *  new-request and new-ticket forms. */
export function SupportField({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor} className="text-start">
        {label}
      </Label>
      {children}
      <FieldHint tone="error">{error ? t(error) : null}</FieldHint>
    </div>
  );
}
