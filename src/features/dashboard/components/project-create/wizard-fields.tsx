'use client';

import { type ReactNode } from 'react';
import { type UseFormRegisterReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { FieldHint, Input } from '@/components/ui';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const FRAME =
  'bg-background border-slate-300 rounded-md border text-base placeholder:text-input-placeholder focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none';
// `[direction:inherit]` anchors placeholder + value to the document/locale side
// (defeats the UA `direction: ltr`); placeholders use the app convention of
// leading weak punctuation so a trailing "…" stays after the text — see
// docs/i18n-and-rtl.md rule 5 + src/features/dashboard/components/customer/customer-search.tsx.
const INPUT = `${FRAME} text-end h-12 px-3 [direction:inherit]`;
const AREA = `${FRAME} text-end min-h-[118px] px-3 py-2 [direction:inherit]`;
const LABEL = 'text-foreground w-full text-end text-sm leading-5 font-medium';
const ADORNED =
  'bg-background border-slate-300 focus-within:ring-ring flex h-12 items-center justify-end gap-2 rounded-md border px-3 focus-within:ring-2';
const BARE =
  'text-foreground placeholder:text-input-placeholder min-w-0 flex-1 bg-transparent text-end text-base outline-none [direction:inherit] disabled:opacity-50';

type ShellProps = { id: string; label: string; error?: string; children: ReactNode };

/** Label + control + inline error. Fields are `text-end` and inherit `<html dir>`
 * (`[direction:inherit]`) — NOT `dir="auto"`, which mis-aligns an empty input against
 * its label under the inverted en→rtl mapping. Trailing punctuation in a placeholder
 * is handled by the leading-weak-punctuation copy convention, not by `dir`. */
export function WizardFieldShell({ id, label, error, children }: ShellProps) {
  const { t } = useTranslation();
  return (
    <div className="flex w-full flex-col items-end gap-1.5">
      <Label htmlFor={id} className={LABEL}>
        {label}
      </Label>
      {children}
      <FieldHint tone="error">{error ? t(error) : undefined}</FieldHint>
    </div>
  );
}

type FieldProps = {
  id: string;
  label: string;
  placeholder?: string;
  field: UseFormRegisterReturn;
  error?: string;
};

export function WizardTextField({ id, label, placeholder, field, error }: FieldProps) {
  return (
    <WizardFieldShell id={id} label={label} error={error}>
      <Input id={id} placeholder={placeholder} className={INPUT} {...field} />
    </WizardFieldShell>
  );
}

export function WizardTextArea({ id, label, placeholder, field, error }: FieldProps) {
  return (
    <WizardFieldShell id={id} label={label} error={error}>
      <Textarea id={id} placeholder={placeholder} className={AREA} {...field} />
    </WizardFieldShell>
  );
}

/** Native date field (Figma 1394:7560 — the offer-deadline picker). */
export function WizardDateField({
  id,
  label,
  field,
}: {
  id: string;
  label: string;
  field: UseFormRegisterReturn;
}) {
  return (
    <WizardFieldShell id={id} label={label}>
      <input id={id} type="date" className={`${INPUT} w-full`} {...field} />
    </WizardFieldShell>
  );
}

/** Numeric field with a fixed inline-end adornment (the SAR glyph or a "weeks :"
 * unit). The typed value right-aligns against the adornment (Figma 1394:8016 / 8031). */
export function WizardAdornedField({
  id,
  label,
  placeholder,
  field,
  error,
  adornment,
  disabled,
}: FieldProps & { adornment: ReactNode; disabled?: boolean }) {
  return (
    <WizardFieldShell id={id} label={label} error={error}>
      <div className={ADORNED}>
        <input
          id={id}
          inputMode="numeric"
          placeholder={placeholder}
          disabled={disabled}
          className={BARE}
          {...field}
        />
        <span className="text-foreground shrink-0">{adornment}</span>
      </div>
    </WizardFieldShell>
  );
}

/** Checkbox + trailing label, checkbox at the inline-end (Figma 1394:8043). */
export function WizardCheckbox({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label htmlFor={id} className="flex w-full items-center justify-end gap-2">
      <span className="text-foreground/60 text-xs">{label}</span>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-brand-dark-navy size-4 shrink-0"
      />
    </label>
  );
}
