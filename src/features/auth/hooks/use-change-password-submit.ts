'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { ApiError } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';

import { useChangePassword } from '../api/change-password';
import {
  changePasswordFormSchema,
  type ChangePasswordFormValues,
} from '../schemas/change-password.schema';

/**
 * Drives the change-password form: RHF + the policy schema, the mutation, and the
 * idle → pending → success/error lifecycle (forms-validation rules 6, 15, 17). A
 * backend rejection (wrong old password, reused password) surfaces as the
 * already-localised `root` error; the new-password policy is caught client-side.
 */
export function useChangePasswordSubmit() {
  const { t, i18n } = useTranslation();
  const userId = useAuthStore((s) => s.user?.id ?? 0);
  const mutation = useChangePassword(userId);
  const [success, setSuccess] = useState(false);

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordFormSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: { oldPassword: '', newPassword: '', confirmPassword: '' },
  });

  const onSubmit = form.handleSubmit((values) => {
    setSuccess(false);
    mutation.mutate(
      { oldPassword: values.oldPassword, newPassword: values.newPassword },
      {
        onSuccess: () => {
          form.reset();
          setSuccess(true);
        },
        onError: (err) => {
          const msg =
            err instanceof ApiError
              ? (err.localizedMessage(i18n.language) ?? t('auth.errors.genericError'))
              : t('auth.errors.genericError');
          form.setError('root', { message: msg });
        },
      },
    );
  });

  return { form, onSubmit, isPending: mutation.isPending, success };
}
