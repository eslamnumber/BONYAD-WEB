'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { ApiError } from '@/lib/api-client';

import { useResendOtp, useVerifyOtp } from '../api/verify-otp';
import { verifyOtpFormSchema, type VerifyOtpFormValues } from '../schemas/verify-otp.schema';

import { OtpBoxes } from './otp-boxes';
import { ResendSection, RoleToggle } from './verify-otp-sections';

const RESEND_SECONDS = 54;

type Role = 'USER' | 'TECHNICIAN';

function resolveOtpError(msg: string | undefined, t: (k: string) => string) {
  return msg ? t(msg) : undefined;
}

export type VerifyOtpFormLabels = {
  otpAriaLabel: string;
  submitButton: string;
  resendCode: string;
  resendAriaLabel: string;
  didNotReceiveCode: string;
  successMessage: string;
  roleCustomer: string;
  roleProfessional: string;
  roleToggleAriaLabel: string;
  errors: { genericError: string };
};

function useResendTimer() {
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);
    return () => clearInterval(id);
  }, [secondsLeft]);
  return { secondsLeft, reset: () => setSecondsLeft(RESEND_SECONDS) };
}

function OtpInputSection({
  value,
  onChange,
  ariaLabel,
  disabled,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  ariaLabel: string;
  disabled: boolean;
  error?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <OtpBoxes value={value} onChange={onChange} ariaLabel={ariaLabel} disabled={disabled} />
      {error && (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function useVerifyOtpFormState(labels: VerifyOtpFormLabels, phone: string, accountRole: Role) {
  const { t } = useTranslation();
  const mutation = useVerifyOtp();
  const resendMutation = useResendOtp();
  const form = useForm<VerifyOtpFormValues>({
    resolver: zodResolver(verifyOtpFormSchema),
    defaultValues: { otp: '' },
  });
  const { secondsLeft, reset } = useResendTimer();
  const [otpValue, setOtpValue] = useState('');
  const [localRole, setLocalRole] = useState<Role>(accountRole);

  const onSubmit = form.handleSubmit((values) =>
    mutation.mutate(
      { ...values, phoneNumber: phone, role: localRole },
      {
        onError: (err) => {
          form.setError('root', {
            message: err instanceof ApiError ? err.message : labels.errors.genericError,
          });
        },
      },
    ),
  );

  function handleResend() {
    resendMutation.mutate({ phoneNumber: phone, role: localRole });
    reset();
  }

  function handleOtpChange(v: string) {
    setOtpValue(v);
    form.setValue('otp', v, { shouldValidate: form.formState.isSubmitted });
  }

  return {
    mutation,
    form,
    localRole,
    setLocalRole,
    secondsLeft,
    otpValue,
    onSubmit,
    handleResend,
    handleOtpChange,
    isPending: mutation.isPending || form.formState.isSubmitting,
    otpError: resolveOtpError(form.formState.errors.otp?.message, t),
    canResend: secondsLeft <= 0 && !resendMutation.isPending,
  };
}

function SuccessMessage({ label }: { label: string }) {
  return (
    <p className="text-success text-center text-base font-medium" role="status">
      {label}
    </p>
  );
}

export function VerifyOtpForm({
  labels,
  phone,
  accountRole,
}: {
  labels: VerifyOtpFormLabels;
  phone: string;
  accountRole: Role;
}) {
  const state = useVerifyOtpFormState(labels, phone, accountRole);
  const { mutation, form, localRole, setLocalRole, secondsLeft, otpValue } = state;
  const { onSubmit, isPending, otpError, canResend, handleResend, handleOtpChange } = state;

  if (mutation.isSuccess) return <SuccessMessage label={labels.successMessage} />;

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <RoleToggle role={localRole} onRoleChange={setLocalRole} labels={labels} />
      <OtpInputSection
        value={otpValue}
        onChange={handleOtpChange}
        ariaLabel={labels.otpAriaLabel}
        disabled={isPending}
        error={otpError}
      />
      {form.formState.errors.root && (
        <p className="text-destructive text-center text-sm" role="alert">
          {form.formState.errors.root.message}
        </p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="bg-primary text-primary-foreground focus-visible:outline-ring h-[55px] w-full rounded-full text-base font-semibold transition-opacity focus-visible:outline-2 disabled:opacity-60 motion-safe:hover:opacity-90"
      >
        {labels.submitButton}
      </button>
      <ResendSection
        labels={labels}
        secondsLeft={secondsLeft}
        canResend={canResend}
        onResend={handleResend}
      />
    </form>
  );
}
