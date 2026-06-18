'use client';

import { Controller, type UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { type PortfolioFormValues } from '../schemas/portfolio-form';

import { TextAreaField, TextField, VisibilityToggle } from './portfolio-fields';
import { SpecialtiesInput } from './specialties-input';

type Form = UseFormReturn<PortfolioFormValues>;

/** Business name + tagline + about. */
function IdentityFields({ form }: { form: Form }) {
  const { t } = useTranslation();
  return (
    <>
      <TextField
        id="pf-business"
        label={t('portfolio.fields.businessName')}
        placeholder={t('portfolio.fields.businessNamePlaceholder')}
        register={form.register('businessName')}
        error={form.formState.errors.businessName?.message}
      />
      <TextField
        id="pf-tagline"
        label={t('portfolio.fields.tagline')}
        placeholder={t('portfolio.fields.taglinePlaceholder')}
        register={form.register('tagline')}
      />
      <TextAreaField
        id="pf-bio"
        label={t('portfolio.fields.bio')}
        placeholder={t('portfolio.fields.bioPlaceholder')}
        register={form.register('bio')}
      />
    </>
  );
}

/** City + years + specialties + visibility. */
function DetailFields({ form }: { form: Form }) {
  const { t } = useTranslation();
  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          id="pf-city"
          label={t('portfolio.fields.city')}
          placeholder={t('portfolio.fields.cityPlaceholder')}
          register={form.register('city')}
        />
        <TextField
          id="pf-years"
          label={t('portfolio.fields.yearsActive')}
          type="number"
          inputMode="numeric"
          register={form.register('yearsActive')}
        />
      </div>
      <Controller
        control={form.control}
        name="specialties"
        render={({ field }) => (
          <SpecialtiesInput id="pf-specialties" value={field.value} onChange={field.onChange} />
        )}
      />
      <Controller
        control={form.control}
        name="isPublic"
        render={({ field }) => (
          <VisibilityToggle
            checked={field.value}
            onChange={field.onChange}
            label={t('portfolio.fields.visibility')}
            hint={t('portfolio.fields.visibilityHint')}
          />
        )}
      />
    </>
  );
}

/** Shared basic-info fields for the create panel + the edit modal. */
export function PortfolioBasicFields({ form }: { form: Form }) {
  return (
    <div className="flex flex-col gap-5">
      <IdentityFields form={form} />
      <DetailFields form={form} />
    </div>
  );
}
