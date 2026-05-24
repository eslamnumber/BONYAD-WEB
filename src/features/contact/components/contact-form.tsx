'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { type Locale } from '@/types/locale';

import { useContactSubmit } from '../hooks/use-contact-submit';
import { contactFormSchema, type ContactFormValues } from '../schemas/contact.schema';

import { ContactFormFields } from './contact-form-fields';
import { ContactSuccess } from './contact-success';

const EMPTY: ContactFormValues = { phone: '', email: '', title: '', description: '' };

export function ContactForm({ locale }: { locale: Locale }) {
  const { t } = useTranslation();
  const [ticketNumber, setTicketNumber] = useState<string | null>(null);
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: EMPTY,
  });
  const { onSubmit, isPending, reset } = useContactSubmit(form, locale, setTicketNumber);

  if (ticketNumber) {
    return (
      <ContactSuccess
        ticketNumber={ticketNumber}
        onReset={() => {
          setTicketNumber(null);
          reset();
        }}
      />
    );
  }

  const submitting = isPending || form.formState.isSubmitting;
  const rootError = form.formState.errors.root?.message;

  return (
    <form onSubmit={onSubmit} noValidate className="flex w-full flex-col gap-[23px]">
      <ContactFormFields form={form} />
      {rootError && (
        <p className="text-destructive text-center text-sm" role="alert">
          {rootError}
        </p>
      )}
      <button
        type="submit"
        disabled={submitting}
        className="bg-primary text-primary-foreground mt-[22px] h-[55px] w-full rounded-full text-base font-semibold transition-opacity disabled:opacity-60 motion-safe:hover:opacity-90"
      >
        {submitting ? t('contact.form.submitting') : t('contact.form.submit')}
      </button>
    </form>
  );
}
