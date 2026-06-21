'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';
import { type UseFormReturn, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { type SelectOption } from '@/components/ui';
import { useAuthStore } from '@/stores/auth-store';

import { useCompleteProfileSubmit } from '../hooks/use-complete-profile-submit';
import { useConventionalDir } from '../hooks/use-conventional-dir';
import { buildExperienceOptions } from '../lib/experience-options';
import {
  completeProfileSchema,
  type CompleteProfileValues,
} from '../schemas/complete-profile.schema';

import { CertificatesUpload } from './certificates-upload';
import { ExperienceField, RegionsField } from './complete-profile-controlled-fields';
import { TextField, TextareaField } from './complete-profile-fields';

const K = 'onboarding.completeProfile';
type Form = UseFormReturn<CompleteProfileValues>;

export function CompleteProfileForm() {
  const { t } = useTranslation();
  const emailDefault = useAuthStore((s) => s.user?.email) ?? '';
  const [certificates, setCertificates] = useState<File[]>([]);
  const form = useForm<CompleteProfileValues>({
    resolver: zodResolver(completeProfileSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: {
      email: emailDefault,
      bio: '',
      address: '',
      yearsOfExperience: '',
      regionIds: [],
    },
  });
  const { onSubmit, isPending } = useCompleteProfileSubmit(form, certificates);
  const experienceOptions = useMemo(() => buildExperienceOptions(t), [t]);
  const rootError = form.formState.errors.root?.message;

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <Fields
        form={form}
        options={experienceOptions}
        certificates={certificates}
        onCertificatesChange={setCertificates}
      />
      {rootError ? (
        <p
          role="alert"
          dir="auto"
          className="bg-destructive/10 text-destructive rounded-xl px-4 py-3 text-center text-sm font-medium"
        >
          {rootError}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={isPending}
        className="bg-primary text-primary-foreground focus-visible:outline-ring mt-2 h-[55px] w-full rounded-full text-base font-semibold transition-opacity focus-visible:outline-2 disabled:opacity-60 motion-safe:hover:opacity-90"
      >
        {isPending ? t(`${K}.submitting`) : t(`${K}.submit`)}
      </button>
    </form>
  );
}

type FieldsProps = {
  form: Form;
  options: SelectOption[];
  certificates: File[];
  onCertificatesChange: (files: File[]) => void;
};

function Fields({ form, options, certificates, onCertificatesChange }: FieldsProps) {
  const { t } = useTranslation();
  const { errors } = form.formState;
  // Single-language free-text fields: set the writing direction to the UI locale's
  // natural script so an empty Arabic field anchors right (i18n rule 4) — never 'auto'.
  const fieldDir = useConventionalDir();
  return (
    <>
      <TextField
        id="cp-email"
        label={t(`${K}.emailLabel`)}
        type="email"
        inputMode="email"
        autoComplete="email"
        align="end"
        required
        field={form.register('email')}
        error={errors.email?.message}
      />
      <ExperienceField form={form} options={options} />
      <RegionsField form={form} />
      <TextareaField
        id="cp-bio"
        label={t(`${K}.bioLabel`)}
        placeholder={t(`${K}.bioPlaceholder`)}
        required
        maxLength={1000}
        dir={fieldDir}
        field={form.register('bio')}
        error={errors.bio?.message}
      />
      <TextField
        id="cp-address"
        label={t(`${K}.addressLabel`)}
        dir={fieldDir}
        required
        field={form.register('address')}
        error={errors.address?.message}
      />
      <CertificatesUpload value={certificates} onChange={onCertificatesChange} />
    </>
  );
}
