'use client';

import { useRouter } from 'next/navigation';
import { type UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { ROUTES } from '@/config/routes';
import { ApiError } from '@/lib/api-client';

import { useLogin } from '../api/login';
import { type LoginFormValues, type LoginResult } from '../schemas/login.schema';

type Role = 'USER' | 'TECHNICIAN';

type Labels = { invalidCredentials: string; genericError: string };

function pendingHref(result: Extract<LoginResult, { kind: 'pending' }>): string {
  const qs = new URLSearchParams({
    phone: result.phoneNumber,
    role: result.role,
    source: 'login',
  });
  return `${ROUTES.VERIFY_OTP}?${qs.toString()}`;
}

export function useLoginSubmit(
  form: UseFormReturn<LoginFormValues>,
  userRole: Role,
  errorLabels: Labels,
) {
  const { i18n } = useTranslation();
  const router = useRouter();
  const mutation = useLogin();

  const handleError = (err: Error) => {
    if (err instanceof ApiError) {
      if (err.status === 401) {
        form.setError('root', { message: errorLabels.invalidCredentials });
        return;
      }
      const backendMsg = err.localizedMessage(i18n.language);
      form.setError('root', { message: backendMsg ?? errorLabels.genericError });
      return;
    }
    form.setError('root', { message: errorLabels.genericError });
  };

  const onSubmit = form.handleSubmit((values) =>
    mutation.mutate(
      { ...values, role: userRole },
      {
        onSuccess: (result) => {
          if (result.kind === 'pending') router.push(pendingHref(result));
          else router.push(ROUTES.DASHBOARD);
        },
        onError: handleError,
      },
    ),
  );

  return { onSubmit, isPending: mutation.isPending };
}
