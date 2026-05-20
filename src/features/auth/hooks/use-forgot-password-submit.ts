'use client';

import { useRouter } from 'next/navigation';
import { type UseFormReturn } from 'react-hook-form';

import { ROUTES } from '@/config/routes';
import { ApiError } from '@/lib/api-client';

import { useForgotPassword } from '../api/forgot-password';
import { type ForgotPasswordFormValues } from '../schemas/forgot-password.schema';
import { normalizePhoneForApi } from '../utils';

type Role = 'USER' | 'TECHNICIAN';

export function useForgotPasswordSubmit(
  form: UseFormReturn<ForgotPasswordFormValues>,
  accountRole: Role,
  genericError: string,
) {
  const router = useRouter();
  const mutation = useForgotPassword();

  const onSubmit = form.handleSubmit((values) =>
    mutation.mutate(
      { ...values, role: accountRole },
      {
        onSuccess: (_, variables) => {
          const phone = normalizePhoneForApi(variables.phone);
          router.push(
            `${ROUTES.VERIFY_OTP}?phone=${encodeURIComponent(phone)}&role=${variables.role}`,
          );
        },
        onError: (err) =>
          form.setError('root', {
            message: err instanceof ApiError ? err.message : genericError,
          }),
      },
    ),
  );

  return { onSubmit, isPending: mutation.isPending };
}
