'use client';

import { type ChangeEvent } from 'react';
import { type UseFormRegisterReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { FieldHint, Select, type SelectOption } from '@/components/ui';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export type { SelectOption };

const LABEL = 'text-foreground text-end text-sm font-medium';
const SURFACE = 'bg-field-surface h-11 text-[15px]';

type FieldProps = {
  id: string;
  label: string;
  field: UseFormRegisterReturn;
  error?: string;
  /** 'auto' for free text (name, address); omit for email/numeric. */
  dir?: 'auto';
  align?: 'start' | 'end';
  type?: string;
  inputMode?: 'numeric';
  placeholder?: string;
  /** Live input filter (e.g. digits-only) — applied before RHF's onChange (rule 12). */
  filter?: (v: string) => string;
};

export function TextField({
  id,
  label,
  field,
  error,
  dir,
  align = 'start',
  type = 'text',
  inputMode,
  placeholder,
  filter,
}: FieldProps) {
  const { t } = useTranslation();
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (filter) e.target.value = filter(e.target.value);
    field.onChange(e);
  };
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
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        className={`${SURFACE} ${align === 'end' ? 'text-end' : 'text-start'}`}
        {...field}
        onChange={onChange}
      />
      <FieldHint tone="error">{error ? t(error) : undefined}</FieldHint>
    </div>
  );
}

/** Free-text multi-line field (bio) — user content, so `dir="auto"` + `text-start`. */
export function TextareaField({
  id,
  label,
  field,
  placeholder,
}: {
  id: string;
  label: string;
  field: UseFormRegisterReturn;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className={LABEL}>
        {label}
      </Label>
      <Textarea
        id={id}
        dir="auto"
        placeholder={placeholder}
        className="bg-field-surface min-h-24 text-start text-[15px]"
        {...field}
      />
    </div>
  );
}

/** Zone picker — the shared custom {@link Select} (RTL-correct, dark-safe, animated). */
export function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder: string;
}) {
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
    </div>
  );
}
