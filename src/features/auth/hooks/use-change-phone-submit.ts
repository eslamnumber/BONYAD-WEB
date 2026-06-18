'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { ApiError } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';
import type { AuthUser } from '@/types/auth';

import { requestPhoneChange, verifyPhoneChange } from '../api/change-phone';
import { changePhoneFormSchema, type ChangePhoneFormValues } from '../schemas/change-phone.schema';

type TFn = ReturnType<typeof useTranslation>['t'];
type Step = 'phone' | 'otp' | 'done';

function localizedError(err: unknown, t: TFn, locale: string): string {
  if (err instanceof ApiError) return err.localizedMessage(locale) ?? t('auth.errors.genericError');
  return t('auth.errors.genericError');
}

/** Pending + localised-error state with a guarded async runner (idle → pending → error). */
function useAsyncAction() {
  const { t, i18n } = useTranslation();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const run = async (action: () => Promise<void>, onError?: () => void) => {
    setError(undefined);
    setPending(true);
    try {
      await action();
    } catch (err) {
      setError(localizedError(err, t, i18n.language));
      onError?.();
    } finally {
      setPending(false);
    }
  };
  return { pending, error, setError, run };
}

type VerifyArgs = {
  userId: number;
  otp: string;
  user: AuthUser | null;
  setSession: (user: AuthUser | null) => void;
  queryClient: QueryClient;
};

/** Verify the OTP, then persist the new phone to the auth store + refresh the profile. */
async function applyVerifiedPhone({ userId, otp, user, setSession, queryClient }: VerifyArgs) {
  const res = await verifyPhoneChange(userId, otp);
  if (user && res.user?.phoneNumber) setSession({ ...user, phoneNumber: res.user.phoneNumber });
  queryClient.invalidateQueries({ queryKey: ['profile'] });
}

/**
 * Drives the two-step change-phone flow: enter phone → request OTP → enter OTP →
 * verify (server-side, which re-mints the session cookie) → done. On success the
 * auth store gets the new phone and the profile query is invalidated.
 */
export function useChangePhoneSubmit() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const setSession = useAuthStore((s) => s.setSession);
  const userId = user?.id ?? 0;
  const { pending, error, setError, run } = useAsyncAction();

  const form = useForm<ChangePhoneFormValues>({
    resolver: zodResolver(changePhoneFormSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: { phone: '' },
  });
  const [step, setStep] = useState<Step>('phone');
  const [otp, setOtp] = useState('');

  const sendOtp = form.handleSubmit((v) =>
    run(async () => {
      await requestPhoneChange(userId, v.phone);
      setOtp('');
      setStep('otp');
    }),
  );

  const verify = () =>
    run(
      async () => {
        await applyVerifiedPhone({ userId, otp, user, setSession, queryClient });
        setStep('done');
      },
      () => setOtp(''),
    );

  const resend = () => run(() => requestPhoneChange(userId, form.getValues('phone')));
  const editNumber = () => {
    setStep('phone');
    setOtp('');
    setError(undefined);
  };

  return { form, step, otp, setOtp, pending, error, sendOtp, verify, resend, editNumber };
}
