'use client';

import { useState } from 'react';
import { type UseFormRegisterReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { EyeIcon, LockIcon } from '@/components/icons';
import { FieldHint, Input } from '@/components/ui';
import { Label } from '@/components/ui/label';

export type AuthPasswordFieldProps = {
  id: string;
  label: string;
  placeholder: string;
  ariaLabel: string;
  autoComplete: string;
  field: UseFormRegisterReturn;
  /** i18n key for the field error, resolved here. */
  error?: string;
  toggleLabels: { show: string; hide: string };
};

/**
 * Auth-screen password input (login-bg styling) with a show/hide toggle and a
 * trailing lock glyph. Matches the register password field so the forgot-password
 * reset screen stays visually consistent.
 */
export function AuthPasswordField({
  id,
  label,
  placeholder,
  ariaLabel,
  autoComplete,
  field,
  error,
  toggleLabels,
}: AuthPasswordFieldProps) {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor={id} className="sr-only">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={show ? 'text' : 'password'}
          aria-label={ariaLabel}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          {...field}
          className="bg-login-bg focus-visible:ring-primary h-12 rounded-[6px] border-slate-300 ps-12 pe-11 text-end text-base"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? toggleLabels.hide : toggleLabels.show}
          className="text-foreground/60 hover:text-foreground focus-visible:outline-ring absolute start-3 top-1/2 -translate-y-1/2 transition-colors focus-visible:outline-2"
        >
          <EyeIcon className="size-6" aria-hidden />
        </button>
        <span
          className="text-foreground/60 pointer-events-none absolute end-3 top-1/2 -translate-y-1/2"
          aria-hidden="true"
        >
          <LockIcon className="size-6" />
        </span>
      </div>
      <FieldHint tone="error">{error ? t(error) : undefined}</FieldHint>
    </div>
  );
}
