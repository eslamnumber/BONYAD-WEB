'use client';

import { useRouter } from 'next/navigation';
import { type UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { ROUTES } from '@/config/routes';

import { useCompleteProfile } from '../api/complete-profile';
import { applyCompleteProfileError } from '../lib/complete-profile-errors';
import { type CompleteProfileValues } from '../schemas/complete-profile.schema';

type Form = UseFormReturn<CompleteProfileValues>;

/**
 * Wire the complete-profile form to its mutation: on success advance to the waiting
 * screen (replace, so Back never returns to the submitted form); on error map the
 * failure onto the form; on invalid focus the first errored field.
 */
export function useCompleteProfileSubmit(form: Form, certificates: File[]) {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const mutation = useCompleteProfile();

  const onSubmit = form.handleSubmit(
    (values) =>
      mutation.mutate(
        { values, certificates },
        {
          onSuccess: () => router.replace(ROUTES.ONBOARDING_WAITING_APPROVAL),
          onError: (error) => applyCompleteProfileError(error, form, t, i18n.language),
        },
      ),
    () => {
      const first = Object.keys(form.formState.errors)[0] as
        | keyof CompleteProfileValues
        | undefined;
      if (first) form.setFocus(first);
    },
  );

  return { onSubmit, isPending: mutation.isPending };
}
