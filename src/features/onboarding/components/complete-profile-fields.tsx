'use client';

import { type UseFormRegisterReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { FieldHint, Select, type SelectOption } from '@/components/ui';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export type { SelectOption };

// Auth-screen field surface (mirrors the login/register inputs) so the onboarding
// step reads as the same flow.
const LABEL = 'text-foreground text-end text-sm font-medium';
const INPUT = 'bg-login-bg focus-visible:ring-primary h-12 rounded-[6px] border-input text-base';

type TextFieldProps = {
  id: string;
  label: string;
  field: UseFormRegisterReturn;
  error?: string;
  required?: boolean;
  /**
   * Writing direction for the field. Single-language free-text fields pass
   * `conventionalDirection(locale)` (ar→rtl, en→ltr) so the empty Arabic
   * placeholder/caret anchor correctly; omit for email (the primitive inherits
   * `<html dir>` via `[direction:inherit]`). Never `'auto'` here — see i18n rule 4.
   */
  dir?: 'ltr' | 'rtl';
  align?: 'start' | 'end';
  type?: string;
  inputMode?: 'numeric' | 'email';
  autoComplete?: string;
  placeholder?: string;
};

export function TextField({
  id,
  label,
  field,
  error,
  required,
  dir,
  align = 'start',
  type = 'text',
  inputMode,
  autoComplete,
  placeholder,
}: TextFieldProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className={LABEL}>
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        dir={dir}
        inputMode={inputMode}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-required={required}
        aria-invalid={Boolean(error)}
        className={`${INPUT} ${align === 'end' ? 'text-end' : 'text-start'}`}
        {...field}
      />
      <FieldHint tone="error">{error ? t(error) : undefined}</FieldHint>
    </div>
  );
}

type TextareaFieldProps = {
  id: string;
  label: string;
  field: UseFormRegisterReturn;
  error?: string;
  required?: boolean;
  placeholder?: string;
  maxLength?: number;
  /** Writing direction — `conventionalDirection(locale)`, never `'auto'` (i18n rule 4). */
  dir: 'ltr' | 'rtl';
};

/** Free-text multi-line field (bio) — single-language content, so `dir={conventionalDirection}` + `text-start`. */
export function TextareaField({
  id,
  label,
  field,
  error,
  required,
  placeholder,
  maxLength,
  dir,
}: TextareaFieldProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className={LABEL}>
        {label}
      </Label>
      <Textarea
        id={id}
        dir={dir}
        placeholder={placeholder}
        maxLength={maxLength}
        aria-required={required}
        aria-invalid={Boolean(error)}
        className="bg-login-bg border-input min-h-28 rounded-[6px] text-start text-base"
        {...field}
      />
      <FieldHint tone="error">{error ? t(error) : undefined}</FieldHint>
    </div>
  );
}

type SelectFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder: string;
  error?: string;
};

/** Single-select (years of experience) — the shared RTL-correct custom {@link Select}. */
export function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  placeholder,
  error,
}: SelectFieldProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className={LABEL}>
        {label}
      </Label>
      <Select
        id={id}
        value={value}
        onChange={onChange}
        options={options}
        placeholder={placeholder}
      />
      <FieldHint tone="error">{error ? t(error) : undefined}</FieldHint>
    </div>
  );
}
