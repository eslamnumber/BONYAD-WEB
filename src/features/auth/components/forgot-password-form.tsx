'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { type ChangeEvent, useMemo } from 'react';
import { type UseFormRegister, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { PhoneIcon } from '@/components/icons';
import { FieldHint, Input } from '@/components/ui';
import { Label } from '@/components/ui/label';

import { useForgotPasswordSubmit } from '../hooks/use-forgot-password-submit';
import {
  forgotPasswordFormSchema,
  type ForgotPasswordFormValues,
} from '../schemas/forgot-password.schema';
import { normalizePhoneInput } from '../utils';

export type ForgotPasswordFormLabels = {
  phoneLabel: string;
  phonePlaceholder: string;
  phoneAriaLabel: string;
  phoneHint?: string;
  submitButton: string;
  errors: { genericError: string };
};

type PhoneInputFieldProps = {
  register: UseFormRegister<ForgotPasswordFormValues>;
  errorText?: string;
  hint?: string;
  labels: Pick<ForgotPasswordFormLabels, 'phoneLabel' | 'phonePlaceholder' | 'phoneAriaLabel'>;
};

function SubmitButton({ pending, label }: { pending: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-primary text-primary-foreground focus-visible:outline-ring mt-2 h-[55px] w-full rounded-full text-base font-semibold transition-opacity focus-visible:outline-2 disabled:opacity-60 motion-safe:hover:opacity-90"
    >
      {label}
    </button>
  );
}

function PhoneInputField({ register, errorText, hint, labels }: PhoneInputFieldProps) {
  const reg = useMemo(() => register('phone'), [register]);
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.target.value = normalizePhoneInput(e.target.value);
    reg.onChange(e);
  };
  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor="forgot-phone" className="sr-only">
        {labels.phoneLabel}
      </Label>
      <div className="relative">
        <Input
          id="forgot-phone"
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

export function ForgotPasswordForm({
  labels,
  accountRole,
}: {
  labels: ForgotPasswordFormLabels;
  accountRole: 'USER' | 'TECHNICIAN';
}) {
  const { t } = useTranslation();
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordFormSchema),
    defaultValues: { phone: '' },
  });
  const { onSubmit, isPending } = useForgotPasswordSubmit(
    form,
    accountRole,
    labels.errors.genericError,
  );
  const phoneMsg = form.formState.errors.phone?.message;
  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <PhoneInputField
        register={form.register}
        errorText={phoneMsg ? t(phoneMsg) : undefined}
        hint={labels.phoneHint}
        labels={labels}
      />
      {form.formState.errors.root && (
        <p className="text-destructive text-center text-sm" role="alert">
          {form.formState.errors.root.message}
        </p>
      )}
      <SubmitButton
        pending={isPending || form.formState.isSubmitting}
        label={labels.submitButton}
      />
    </form>
  );
}
