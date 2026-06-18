'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { ApiError } from '@/lib/api-client';
import { type Locale } from '@/types/locale';

import { useCreateTicket } from '../api';
import { ticketFormSchema, type TicketFormValues } from '../schemas/ticket';

const DEFAULTS: TicketFormValues = {
  subject: '',
  description: '',
  priority: 'MEDIUM',
  categoryId: null,
  subcategoryId: null,
};

/** New-ticket form controller — wires react-hook-form + zod to the create mutation. */
export function useNewTicketForm(locale: Locale, onDone: () => void) {
  const { t } = useTranslation();
  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: DEFAULTS,
  });
  const { mutateAsync, isPending } = useCreateTicket();

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
