'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { ApiError } from '@/lib/api-client';
import { type Locale } from '@/types/locale';

import { useCreateFeedback } from '../api';
import { feedbackFormSchema, type FeedbackFormValues } from '../schemas/feedback';

const DEFAULTS: FeedbackFormValues = { category: 'SUGGESTION', subject: '', message: '' };

/**
 * Compose-form controller — wires react-hook-form + zod to the create mutation, resets and
 * closes on success, and surfaces the backend's localized message on failure (mirrors
 * `use-new-request-form`).
 */
export function useSubmitFeedback(locale: Locale, onDone: () => void) {
  const { t } = useTranslation();
  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: DEFAULTS,
  });
  const { mutateAsync, isPending } = useCreateFeedback();

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await mutateAsync(values);
      form.reset(DEFAULTS);
      onDone();
    } catch (err) {
      const message = err instanceof ApiError ? err.localizedMessage(locale) : null;
      form.setError('root', { message: message ?? t('feedback.new.errorFallback') });
    }
  });

  return { form, onSubmit, isPending };
}
