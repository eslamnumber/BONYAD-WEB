'use client';

import { useMemo } from 'react';
import { type UseFormRegister, type UseFormRegisterReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { FieldPhoneIcon } from '@/components/icons';
import { normalizePhoneInput } from '@/lib/saudi-phone';

import { type ContactFormValues } from '../schemas/contact.schema';

import { ContactField } from './contact-field';

type Props = {
  register: UseFormRegister<ContactFormValues>;
  errorText?: string;
};

export function ContactPhoneField({ register, errorText }: Props) {
  const { t } = useTranslation();
  const reg = useMemo(() => register('phone'), [register]);

  const onChange: UseFormRegisterReturn['onChange'] = (event) => {
    const target = event.target as HTMLInputElement;
    target.value = normalizePhoneInput(target.value);
    return reg.onChange(event);
  };

  return (
    <ContactField
      id="contact-phone"
      type="tel"
      inputMode="tel"
      autoComplete="tel"
      placeholder={t('contact.form.phonePlaceholder')}
      ariaLabel={t('contact.aria.phone')}
      Icon={FieldPhoneIcon}
      register={{ ...reg, onChange }}
      errorText={errorText}
    />
  );
}
