'use client';

import { type ChangeEvent } from 'react';
import { type UseFormRegisterReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { FieldHint, Input } from '@/components/ui';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const FIELD =
  'bg-field-surface border-border h-11 rounded-lg border text-end text-sm placeholder:text-foreground/60 disabled:opacity-50';
const AREA =
  'bg-field-surface border-border placeholder:text-foreground/60 min-h-[96px] rounded-lg text-start text-sm';

/** Input filters reused across numeric edit fields (budget, duration, cost). */
export const filters = {
  digits: (v: string) => v.replace(/[^\d]/g, ''),
  decimal: (v: string) => v.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1'),
};

type BaseProps = {
  id: string;
  label: string;
  placeholder?: string;
  field: UseFormRegisterReturn;
  error?: string;
};

type FieldProps = BaseProps & {
  inputMode?: 'numeric' | 'decimal' | 'text';
  filter?: (v: string) => string;
  disabled?: boolean;
};

/** Label + text/numeric Input + inline error hint. Mirrors the submit-offer field. */
export function EditField({
  id,
  label,
  placeholder,
  field,
  error,
  inputMode = 'text',
  filter,
  disabled,
}: FieldProps) {
  const { t } = useTranslation();
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (filter) e.target.value = filter(e.target.value);
    field.onChange(e);
  };
  return (
    <div className="flex w-full flex-col gap-2">
      <Label htmlFor={id} className="text-foreground text-end text-[13px] font-medium">
        {label}
      </Label>
      <Input
        id={id}
        inputMode={inputMode}
        placeholder={placeholder}
        disabled={disabled}
        className={FIELD}
        {...field}
        onChange={onChange}
      />
      <FieldHint tone="error">{error ? t(error) : undefined}</FieldHint>
    </div>
  );
}

/** Label + multiline Textarea + inline error hint (`dir="auto"` for typed content). */
export function EditTextArea({ id, label, placeholder, field, error }: BaseProps) {
  const { t } = useTranslation();
  return (
    <div className="flex w-full flex-col gap-2">
      <Label htmlFor={id} className="text-foreground text-end text-[13px] font-medium">
        {label}
      </Label>
      <Textarea id={id} dir="auto" placeholder={placeholder} className={AREA} {...field} />
      <FieldHint tone="error">{error ? t(error) : undefined}</FieldHint>
    </div>
  );
}
