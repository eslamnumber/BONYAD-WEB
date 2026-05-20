'use client';

import { type UseFormRegister } from 'react-hook-form';

import { CheckboxIcon, EyeIcon, LockIcon, PhoneIcon } from '@/components/icons';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { type RegisterFormValues } from '../schemas/register.schema';

import { type RegisterFormLabels } from './register-form.types';

export type { RegisterFormLabels };

export function resolveError(err: { message?: string } | undefined, t: (k: string) => string) {
  return err?.message ? t(err.message) : undefined;
}

type NameFieldProps = {
  register: UseFormRegister<RegisterFormValues>;
  errorText?: string;
  labels: Pick<RegisterFormLabels, 'nameLabel' | 'namePlaceholder' | 'nameAriaLabel'>;
};

export function NameField({ register, errorText, labels }: NameFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor="register-name" className="sr-only">
        {labels.nameLabel}
      </Label>
      <Input
        id="register-name"
        type="text"
        aria-label={labels.nameAriaLabel}
        placeholder={labels.namePlaceholder}
        autoComplete="name"
        {...register('name')}
        className="bg-login-bg focus-visible:ring-primary h-12 rounded-[6px] border-slate-300 text-end text-base"
      />
      {errorText && (
        <p className="text-destructive text-sm" role="alert">
          {errorText}
        </p>
      )}
    </div>
  );
}

type PhoneFieldProps = {
  register: UseFormRegister<RegisterFormValues>;
  errorText?: string;
  labels: Pick<RegisterFormLabels, 'phoneLabel' | 'phonePlaceholder' | 'phoneAriaLabel'>;
};

export function PhoneField({ register, errorText, labels }: PhoneFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor="register-phone" className="sr-only">
        {labels.phoneLabel}
      </Label>
      <div className="relative">
        <Input
          id="register-phone"
          type="tel"
          inputMode="numeric"
          aria-label={labels.phoneAriaLabel}
          placeholder={labels.phonePlaceholder}
          autoComplete="tel"
          {...register('phone')}
          className="bg-login-bg focus-visible:ring-primary h-12 rounded-[6px] border-slate-300 pe-11 text-end text-base"
        />
        <span
          className="text-foreground/60 pointer-events-none absolute end-3 top-1/2 -translate-y-1/2"
          aria-hidden="true"
        >
          <PhoneIcon className="size-6" />
        </span>
      </div>
      {errorText && (
        <p className="text-destructive text-sm" role="alert">
          {errorText}
        </p>
      )}
    </div>
  );
}

function PasswordToggleButton({
  onToggle,
  toggleLabel,
}: {
  onToggle: () => void;
  toggleLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={toggleLabel}
      className="text-foreground/60 hover:text-foreground focus-visible:outline-ring absolute start-3 top-1/2 -translate-y-1/2 transition-colors focus-visible:outline-2"
    >
      <EyeIcon className="size-6" aria-hidden />
    </button>
  );
}

export type PasswordInputProps = {
  id: string;
  fieldName: 'password' | 'confirmPassword';
  autoComplete: string;
  ariaLabel: string;
  placeholder: string;
  label: string;
  register: UseFormRegister<RegisterFormValues>;
  errorText?: string;
  showPassword: boolean;
  onToggle: () => void;
  toggleLabel: string;
};

export function PasswordInput({
  id,
  fieldName,
  autoComplete,
  ariaLabel,
  placeholder,
  label,
  register,
  errorText,
  showPassword,
  onToggle,
  toggleLabel,
}: PasswordInputProps) {
  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor={id} className="sr-only">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={showPassword ? 'text' : 'password'}
          aria-label={ariaLabel}
          placeholder={placeholder}
          autoComplete={autoComplete}
          {...register(fieldName)}
          className="bg-login-bg focus-visible:ring-primary h-12 rounded-[6px] border-slate-300 ps-12 pe-11 text-end text-base"
        />
        <PasswordToggleButton onToggle={onToggle} toggleLabel={toggleLabel} />
        <span
          className="text-foreground/60 pointer-events-none absolute end-3 top-1/2 -translate-y-1/2"
          aria-hidden="true"
        >
          <LockIcon className="size-6" />
        </span>
      </div>
      {errorText && (
        <p className="text-destructive text-sm" role="alert">
          {errorText}
        </p>
      )}
    </div>
  );
}

type TermsFieldProps = {
  register: UseFormRegister<RegisterFormValues>;
  errorText?: string;
  labels: Pick<RegisterFormLabels, 'termsText'>;
};

export function TermsField({ register, errorText, labels }: TermsFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-start justify-end gap-2">
        <label
          htmlFor="register-terms"
          className="text-foreground/60 flex-1 cursor-pointer text-end text-sm"
        >
          {labels.termsText}
        </label>
        <div className="relative mt-0.5 shrink-0">
          <input
            id="register-terms"
            type="checkbox"
            {...register('terms')}
            className="peer absolute inset-0 size-full cursor-pointer opacity-0"
          />
          <CheckboxIcon
            className="peer-checked:text-primary peer-focus-visible:outline-ring pointer-events-none size-4 text-slate-300 transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2"
            aria-hidden
          />
        </div>
      </div>
      {errorText && (
        <p className="text-destructive text-sm" role="alert">
          {errorText}
        </p>
      )}
    </div>
  );
}
