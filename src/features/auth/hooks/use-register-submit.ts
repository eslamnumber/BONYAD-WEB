'use client';

import { useRouter } from 'next/navigation';
import { type UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { ROUTES } from '@/config/routes';
import { ApiError } from '@/lib/api-client';

import { useRegister } from '../api/register';
import { type RegisterFormValues } from '../schemas/register.schema';
import { normalizePhoneForApi } from '../utils';

type Role = 'USER' | 'TECHNICIAN';
type ErrorLabels = { phoneAlreadyRegistered: string; genericError: string };

export function useRegisterSubmit(
  form: UseFormReturn<RegisterFormValues>,
  userRole: Role,
  errorLabels: ErrorLabels,
  termsId?: number,
) {
  const router = useRouter();
  const { i18n } = useTranslation();
  const mutation = useRegister();

  const handleError = (err: Error) => {
    // Prefer the backend's localized message (messageEn/messageAr on ApiError) —
    // it carries specific context like "Account already exists. Please sign in
    // instead." rather than the generic "try again later" fallback. Falls through
    // to the static labels only when the backend didn't send a localized message.
    if (err instanceof ApiError) {
      const locale = i18n.language?.startsWith('ar') ? 'ar' : 'en';
      const backendMsg = err.localizedMessage(locale);
      if (backendMsg) {
        form.setError('root', { message: backendMsg });
        return;
      }
    }
    const msg =
      err instanceof ApiError && err.status === 409
        ? errorLabels.phoneAlreadyRegistered
        : errorLabels.genericError;
    form.setError('root', { message: msg });
  };

  const onSubmit = form.handleSubmit((values) =>
    mutation.mutate(
      { ...values, role: userRole },
      {
        onSuccess: () => {
          const phone = normalizePhoneForApi(values.phone);
          const params = new URLSearchParams({ phone, role: userRole });
          // Thread the agreed terms version to the OTP step, where it's recorded
          // server-side with the issued token (mirrors the iOS termsId hand-off).
          if (termsId) params.set('termsId', String(termsId));
          router.push(`${ROUTES.VERIFY_OTP}?${params.toString()}`);
        },
        onError: handleError,
      },
    ),
  );

  return { onSubmit, isPending: mutation.isPending };
}
