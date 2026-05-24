'use client';

import { type UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { FieldMailIcon, FieldMessageIcon, FieldSubjectIcon } from '@/components/icons';

import { type ContactFormValues } from '../schemas/contact.schema';

import { ContactField } from './contact-field';
import { ContactPhoneField } from './contact-phone-field';
import { ContactTextareaField } from './contact-textarea-field';

type Props = { form: UseFormReturn<ContactFormValues> };

export function ContactFormFields({ form }: Props) {
  const { t } = useTranslation();
  const errors = form.formState.errors;
  const tr = (msg?: string) => (msg ? t(msg) : undefined);

  return (
    <>
      <ContactPhoneField register={form.register} errorText={tr(errors.phone?.message)} />
      <ContactField
        id="contact-email"
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder={t('contact.form.emailPlaceholder')}
        ariaLabel={t('contact.aria.email')}
        Icon={FieldMailIcon}
        register={form.register('email')}
        errorText={tr(errors.email?.message)}
      />
      <ContactField
        id="contact-title"
        type="text"
        placeholder={t('contact.form.titlePlaceholder')}
        ariaLabel={t('contact.aria.title')}
        Icon={FieldSubjectIcon}
        register={form.register('title')}
        errorText={tr(errors.title?.message)}
      />
      <ContactTextareaField
        id="contact-description"
        placeholder={t('contact.form.descriptionPlaceholder')}
        ariaLabel={t('contact.aria.description')}
        Icon={FieldMessageIcon}
        register={form.register('description')}
        errorText={tr(errors.description?.message)}
      />
    </>
  );
}
