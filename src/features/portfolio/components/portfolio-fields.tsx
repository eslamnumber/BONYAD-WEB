'use client';

import { type UseFormRegisterReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { FieldHint, Input, Label } from '@/components/ui';
import { Textarea } from '@/components/ui/textarea';

const LABEL = 'text-foreground text-start text-sm font-medium';

/** Labelled single-line field. `error` is an i18n key (resolved here). */
export function TextField({
  id,
  label,
  register,
  error,
  placeholder,
  type = 'text',
  inputMode,
}: {
  id: string;
  label: string;
  register: UseFormRegisterReturn;
  error?: string;
  placeholder?: string;
  type?: 'text' | 'date' | 'number';
  inputMode?: 'numeric' | 'decimal';
}) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className={LABEL}>
        {label}
      </Label>
      {/* Single-line field: inherit the document dir (no `dir="auto"`) and align
          `text-start` — the app's form convention (edit-profile / company-registration),
          so the value sits on the same side as the end-aligned label in both locales. */}
      <Input
        id={id}
        type={type}
        inputMode={inputMode}
        placeholder={placeholder}
        className="text-start"
        {...register}
      />
      <FieldHint tone="error">{error ? t(error) : undefined}</FieldHint>
    </div>
  );
}

/** Labelled multi-line field. */
export function TextAreaField({
  id,
  label,
  register,
  error,
  placeholder,
}: {
  id: string;
  label: string;
  register: UseFormRegisterReturn;
  error?: string;
  placeholder?: string;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className={LABEL}>
        {label}
      </Label>
      <Textarea
        id={id}
        dir="auto"
        placeholder={placeholder}
        className="bg-field-surface border-border text-foreground min-h-[96px] rounded-lg text-start text-[15px]"
        {...register}
      />
      <FieldHint tone="error">{error ? t(error) : undefined}</FieldHint>
    </div>
  );
}

/** Public/private visibility switch row. */
export function VisibilityToggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  hint: string;
}) {
  return (
    <div className="border-border flex items-center justify-between gap-3 rounded-lg border p-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`focus-visible:outline-ring relative h-5 w-9 shrink-0 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${checked ? 'bg-primary' : 'bg-muted-foreground/30'}`}
      >
        <span
          className={`absolute top-0.5 size-4 rounded-full bg-white transition-all ${checked ? 'end-0.5' : 'start-0.5'}`}
        />
      </button>
      <span className="min-w-0 flex-1">
        <span className="text-foreground block text-start text-sm font-medium">{label}</span>
        <span dir="auto" className="text-muted-foreground block text-start text-xs">
          {hint}
        </span>
      </span>
    </div>
  );
}
