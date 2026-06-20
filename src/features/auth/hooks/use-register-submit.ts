'use client';

import { useRouter } from 'next/navigation';
import { type UseFormReturn } from 'react-hook-form';

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
  const mutation = useRegister();

  const handleError = (err: Error) => {
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
