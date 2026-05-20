'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { type UseFormRegister, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { PhoneIcon } from '@/components/icons';
import { FieldHint, Input } from '@/components/ui';
import { Label } from '@/components/ui/label';
import { ROUTES } from '@/config/routes';

import { useLoginSubmit } from '../hooks/use-login-submit';
import { loginFormSchema, type LoginFormValues } from '../schemas/login.schema';
import { normalizePhoneInput } from '../utils';

import { type FormLabels } from './login-form-labels';
import { LoginPasswordField } from './login-password-field';

export type { FormLabels };

type PhoneFieldProps = {
  register: UseFormRegister<LoginFormValues>;
  errorText?: string;
  hint?: string;
  labels: Pick<FormLabels, 'phoneLabel' | 'phonePlaceholder' | 'phoneAriaLabel'>;
};

function PhoneField({ register, errorText, hint, labels }: PhoneFieldProps) {
  const reg = register('phone');
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.target.value = normalizePhoneInput(e.target.value);
    reg.onChange(e);
  };
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
          {...reg}
          onChange={onChange}
          className="bg-login-bg focus-visible:ring-primary h-12 rounded-[6px] border-slate-300 pe-11 text-end text-base"
        />
        <span
          className="text-foreground/60 pointer-events-none absolute end-3 top-1/2 -translate-y-1/2"
          aria-hidden="true"
        >
          <PhoneIcon className="size-6" />
        </span>
      </div>
      <FieldHint tone={errorText ? 'error' : 'neutral'}>{errorText ?? hint}</FieldHint>
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
  const phoneMsg = form.formState.errors.phone?.message;
  const passMsg = form.formState.errors.password?.message;
  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <PhoneField
        register={form.register}
        errorText={phoneMsg ? t(phoneMsg) : undefined}
        hint={labels.phoneHint}
        labels={labels}
      />
      <LoginPasswordField
        register={form.register}
        errorText={passMsg ? t(passMsg) : undefined}
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
