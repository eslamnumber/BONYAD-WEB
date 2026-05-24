'use client';

import type { ComponentType, SVGProps } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

import { FieldHint } from '@/components/ui';

type Props = {
  id: string;
  type: 'tel' | 'email' | 'text';
  placeholder: string;
  ariaLabel: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  register: UseFormRegisterReturn;
  errorText?: string;
  inputMode?: 'tel' | 'email' | 'text';
  autoComplete?: string;
};

export function ContactField({
  id,
  type,
  placeholder,
  ariaLabel,
  Icon,
  register,
  errorText,
  inputMode,
  autoComplete,
}: Props) {
  return (
    <div className="flex w-full flex-col gap-1">
      <label htmlFor={id} className="sr-only">
        {ariaLabel}
      </label>
      <div className="relative w-full">
        <input
          id={id}
          type={type}
          inputMode={inputMode}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-label={ariaLabel}
          aria-invalid={errorText ? true : undefined}
          {...register}
          className="border-contact-card-border bg-background text-foreground placeholder:text-input-placeholder focus-visible:border-primary focus-visible:ring-primary/30 aria-invalid:border-destructive h-12 w-full rounded-[6px] border ps-11 pe-4 text-end text-base outline-none [direction:inherit] focus-visible:ring-2"
        />
        <span
          className="text-foreground/60 pointer-events-none absolute start-3 top-1/2 -translate-y-1/2"
          aria-hidden="true"
        >
          <Icon className="size-6" />
        </span>
      </div>
      {errorText && (
        <div className="text-end">
          <FieldHint tone="error">{errorText}</FieldHint>
        </div>
      )}
    </div>
  );
}
