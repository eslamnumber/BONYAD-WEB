'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { type UseFormRegister, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { PhoneIcon } from '@/components/icons';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ROUTES } from '@/config/routes';
import { ApiError } from '@/lib/api-client';

import { useForgotPassword } from '../api/forgot-password';
import {
  forgotPasswordFormSchema,
  type ForgotPasswordFormValues,
} from '../schemas/forgot-password.schema';

export type ForgotPasswordFormLabels = {
  phoneLabel: string;
  phonePlaceholder: string;
  phoneAriaLabel: string;
  submitButton: string;
  errors: { genericError: string };
};

type PhoneInputFieldProps = {
  register: UseFormRegister<ForgotPasswordFormValues>;
  errorText?: string;
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

function PhoneInputField({ register, errorText, labels }: PhoneInputFieldProps) {
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

export function ForgotPasswordForm({
  labels,
  accountRole,
}: {
  labels: ForgotPasswordFormLabels;
  accountRole: 'USER' | 'TECHNICIAN';
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const mutation = useForgotPassword();
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordFormSchema),
    defaultValues: { phone: '' },
  });

  const onSubmit = form.handleSubmit((values) =>
    mutation.mutate(
      { ...values, role: accountRole },
      {
        onSuccess: (_, variables) => {
          router.push(
            `${ROUTES.VERIFY_OTP}?phone=${encodeURIComponent(variables.phone)}&role=${variables.role}`,
          );
        },
        onError: (err) => {
          form.setError('root', {
            message: err instanceof ApiError ? err.message : labels.errors.genericError,
          });
        },
      },
    ),
  );

  const phoneError = form.formState.errors.phone?.message
    ? t(form.formState.errors.phone.message)
    : undefined;

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <PhoneInputField register={form.register} errorText={phoneError} labels={labels} />
      {form.formState.errors.root && (
        <p className="text-destructive text-center text-sm" role="alert">
          {form.formState.errors.root.message}
        </p>
      )}
      <SubmitButton
        pending={mutation.isPending || form.formState.isSubmitting}
        label={labels.submitButton}
      />
    </form>
  );
}
