'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useState } from 'react';
import { type UseFormRegister, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { EyeIcon, LockIcon, PhoneIcon } from '@/components/icons';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ROUTES } from '@/config/routes';

import { useLoginSubmit } from '../hooks/use-login-submit';
import { loginFormSchema, type LoginFormValues } from '../schemas/login.schema';

export type FormLabels = {
  phoneLabel: string;
  phonePlaceholder: string;
  phoneAriaLabel: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  passwordAriaLabel: string;
  togglePasswordVisibility: string;
  forgotPassword: string;
  submitButton: string;
  errors: { invalidCredentials: string; genericError: string };
};

type PhoneFieldProps = {
  register: UseFormRegister<LoginFormValues>;
  errorText?: string;
  labels: Pick<FormLabels, 'phoneLabel' | 'phonePlaceholder' | 'phoneAriaLabel'>;
};

function PhoneField({ register, errorText, labels }: PhoneFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor="login-phone" className="sr-only">
        {labels.phoneLabel}
      </Label>
      <div className="relative">
        <Input
          id="login-phone"
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
  ariaLabel,
}: {
  onToggle: () => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={ariaLabel}
      className="text-foreground/60 hover:text-foreground focus-visible:outline-ring absolute start-3 top-1/2 -translate-y-1/2 transition-colors focus-visible:outline-2"
    >
      <EyeIcon className="size-6" aria-hidden />
    </button>
  );
}

type PasswordFieldProps = {
  register: UseFormRegister<LoginFormValues>;
  errorText?: string;
  showPassword: boolean;
  onToggle: () => void;
  forgotPasswordHref: string;
  labels: Pick<
    FormLabels,
    | 'passwordLabel'
    | 'passwordPlaceholder'
    | 'passwordAriaLabel'
    | 'togglePasswordVisibility'
    | 'forgotPassword'
  >;
};

function PasswordField({
  register,
  errorText,
  showPassword,
  onToggle,
  forgotPasswordHref,
  labels,
}: PasswordFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor="login-password" className="sr-only">
        {labels.passwordLabel}
      </Label>
      <div className="relative">
        <Input
          id="login-password"
          type={showPassword ? 'text' : 'password'}
          aria-label={labels.passwordAriaLabel}
          placeholder={labels.passwordPlaceholder}
          autoComplete="current-password"
          {...register('password')}
          className="bg-login-bg focus-visible:ring-primary h-12 rounded-[6px] border-slate-300 ps-12 pe-11 text-end text-base"
        />
        <PasswordToggleButton onToggle={onToggle} ariaLabel={labels.togglePasswordVisibility} />
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
      <div className="flex justify-end">
        <Link
          href={forgotPasswordHref}
          className="text-primary focus-visible:outline-ring text-sm font-medium transition-opacity hover:opacity-80 focus-visible:outline-2"
        >
          <bdi>{labels.forgotPassword}</bdi>
        </Link>
      </div>
    </div>
  );
}

export function LoginForm({
  labels,
  userRole,
}: {
  labels: FormLabels;
  userRole: 'USER' | 'TECHNICIAN';
}) {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { phone: '', password: '' },
  });
  const { onSubmit, isPending } = useLoginSubmit(form, userRole, labels.errors);

  const phoneError = form.formState.errors.phone?.message
    ? t(form.formState.errors.phone.message)
    : undefined;
  const passwordError = form.formState.errors.password?.message
    ? t(form.formState.errors.password.message)
    : undefined;

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <PhoneField register={form.register} errorText={phoneError} labels={labels} />
      <PasswordField
        register={form.register}
        errorText={passwordError}
        showPassword={showPassword}
        onToggle={() => setShowPassword((v) => !v)}
        forgotPasswordHref={`${ROUTES.FORGOT_PASSWORD}?role=${userRole}`}
        labels={labels}
      />
      {form.formState.errors.root && (
        <p className="text-destructive text-center text-sm" role="alert">
          {form.formState.errors.root.message}
        </p>
      )}
      <button
        type="submit"
        disabled={isPending || form.formState.isSubmitting}
        className="bg-primary text-primary-foreground focus-visible:outline-ring mt-2 h-[55px] w-full rounded-full text-base font-semibold transition-opacity focus-visible:outline-2 disabled:opacity-60 motion-safe:hover:opacity-90"
      >
        {labels.submitButton}
      </button>
    </form>
  );
}
