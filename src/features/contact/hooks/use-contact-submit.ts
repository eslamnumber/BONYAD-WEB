'use client';

import { type UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { ApiError } from '@/lib/api-client';
import { type Locale } from '@/types/locale';

import { useSubmitContact } from '../api/submit-contact';
import { type ContactFormValues } from '../schemas/contact.schema';

function localizedError(err: unknown, locale: Locale, fallback: string): string {
  if (err instanceof ApiError) return err.localizedMessage(locale) ?? fallback;
  return fallback;
}

type Result = {
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  isPending: boolean;
  ticketNumber: string | null;
  reset: () => void;
};

export function useContactSubmit(
  form: UseFormReturn<ContactFormValues>,
  locale: Locale,
  onSuccess: (ticketNumber: string) => void,
): Result {
  const { t } = useTranslation();
  const mutation = useSubmitContact();

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const res = await mutation.mutateAsync(values);
      onSuccess(res.ticketNumber ?? '—');
      form.reset({ phone: '', email: '', title: '', description: '' });
    } catch (err) {
      form.setError('root', {
        message: localizedError(err, locale, t('contact.errors.submitFailed')),
      });
    }
  });

  return {
    onSubmit,
    isPending: mutation.isPending,
    ticketNumber: null,
    reset: mutation.reset,
  };
}
