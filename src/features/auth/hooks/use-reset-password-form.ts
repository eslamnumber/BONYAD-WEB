'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { ApiError } from '@/lib/api-client';

import { useResendForgotPasswordOtp, useResetPassword } from '../api/reset-password';
import {
  resetPasswordFormSchema,
  type ResetPasswordFormValues,
} from '../schemas/reset-password.schema';

import { useResendTimer } from './use-resend-timer';

type Role = 'USER' | 'TECHNICIAN';

/** State + submit/resend orchestration for the reset-password screen. */
export function useResetPasswordForm(phone: string, role: Role, genericError: string) {
  const mutation = useResetPassword();
  const resend = useResendForgotPasswordOtp();
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: { otp: '', newPassword: '', confirmPassword: '' },
  });
  const { secondsLeft, reset } = useResendTimer();
  const [otpValue, setOtpValue] = useState('');

  const onSubmit = form.handleSubmit((values) =>
    mutation.mutate(
      { ...values, phoneNumber: phone, role },
      {
        onError: (err) =>
          form.setError('root', {
            message: err instanceof ApiError ? err.message : genericError,
          }),
      },
    ),
  );

  function handleResend() {
    resend.mutate({ phoneNumber: phone, role });
    reset();
  }

  function handleOtpChange(v: string) {
    setOtpValue(v);
    form.setValue('otp', v, { shouldValidate: form.formState.isSubmitted });
  }

  return {
    form,
    mutation,
    otpValue,
    secondsLeft,
    onSubmit,
    handleResend,
    handleOtpChange,
    isPending: mutation.isPending || form.formState.isSubmitting,
    canResend: secondsLeft <= 0 && !resend.isPending,
  };
}
