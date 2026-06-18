'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { ApiError } from '@/lib/api-client';
import { type Locale } from '@/types/locale';

import { useCreateSupportRequest } from '../api';
import { supportRequestFormSchema, type SupportRequestFormValues } from '../schemas/support';

const DEFAULTS: SupportRequestFormValues = {
  subject: '',
  description: '',
  category: 'General',
  priority: 'MEDIUM',
};

/**
 * New-request form controller — wires react-hook-form + zod to the create mutation,
 * resets and closes on success, and surfaces the backend's localized message on a
 * failure (mirrors `use-contact-submit`).
 */
export function useNewRequestForm(locale: Locale, onDone: () => void) {
  const { t } = useTranslation();
  const form = useForm<SupportRequestFormValues>({
    resolver: zodResolver(supportRequestFormSchema),
    defaultValues: DEFAULTS,
  });
  const { mutateAsync, isPending } = useCreateSupportRequest();

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await mutateAsync(values);
      form.reset(DEFAULTS);
      onDone();
    } catch (err) {
      const message = err instanceof ApiError ? err.localizedMessage(locale) : null;
      form.setError('root', { message: message ?? t('support.new.errorFallback') });
    }
  });

  return { form, onSubmit, isPending };
}
