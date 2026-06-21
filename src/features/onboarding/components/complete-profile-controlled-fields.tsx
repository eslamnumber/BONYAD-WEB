'use client';

import { Controller, type UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { type SelectOption } from '@/components/ui';

import { type CompleteProfileValues } from '../schemas/complete-profile.schema';

import { SelectField } from './complete-profile-fields';
import { RegionsMultiselect } from './regions-multiselect';

const K = 'onboarding.completeProfile';
type Form = UseFormReturn<CompleteProfileValues>;

/** Years-of-experience select, bound to RHF via {@link Controller}. */
export function ExperienceField({ form, options }: { form: Form; options: SelectOption[] }) {
  const { t } = useTranslation();
  return (
    <Controller
      control={form.control}
      name="yearsOfExperience"
      render={({ field }) => (
        <SelectField
          id="cp-exp"
          label={t(`${K}.experienceLabel`)}
          placeholder={t(`${K}.experiencePlaceholder`)}
          options={options}
          value={field.value}
          onChange={field.onChange}
          error={form.formState.errors.yearsOfExperience?.message}
        />
      )}
    />
  );
}

/** Service-areas multi-select, bound to RHF via {@link Controller}. */
export function RegionsField({ form }: { form: Form }) {
  return (
    <Controller
      control={form.control}
      name="regionIds"
      render={({ field }) => (
        <RegionsMultiselect
          value={field.value}
          onChange={field.onChange}
          error={form.formState.errors.regionIds?.message}
        />
      )}
    />
  );
}
