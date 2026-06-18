'use client';

import { Controller, type UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui';

import { useRegions } from '../api/get-regions';
import { type EditProfileFormValues } from '../schemas/edit-profile.schema';

import { SelectField, type SelectOption, TextareaField, TextField } from './edit-profile-fields';
import { useEditProfileSubmit } from './use-edit-profile-submit';

const K = 'profile.myInfo.editProfile';
const digits = (max: number) => (v: string) => v.replace(/\D/g, '').slice(0, max);

type Form = UseFormReturn<EditProfileFormValues>;

/** Success / error banner — punctuated copy, so `dir="auto"` + `text-start` (rule 4). */
function Banner({ tone, children }: { tone: 'success' | 'error'; children: string }) {
  return (
    <p
      dir="auto"
      role={tone === 'error' ? 'alert' : 'status'}
      className={`rounded-xl px-4 py-3 text-start text-sm font-medium ${tone === 'success' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}
    >
      {children}
    </p>
  );
}

/** Universal fields — name (free text), email, National ID (10 digits). */
function BaseFields({ form }: { form: Form }) {
  const { t } = useTranslation();
  const { errors } = form.formState;
  return (
    <>
      <TextField
        id="ep-name"
        label={t(`${K}.nameLabel`)}
        dir="auto"
        field={form.register('name')}
        error={errors.name?.message}
      />
      <TextField
        id="ep-email"
        label={t(`${K}.emailLabel`)}
        type="email"
        align="end"
        field={form.register('email')}
        error={errors.email?.message}
      />
      <TextField
        id="ep-nid"
        label={t(`${K}.nationalIdLabel`)}
        inputMode="numeric"
        align="end"
        filter={digits(10)}
        field={form.register('nationalId')}
        error={errors.nationalId?.message}
      />
    </>
  );
}

/** Technician-only fields — bio, address, service zone, years of experience. */
function TechFields({ form, regionOptions }: { form: Form; regionOptions: SelectOption[] }) {
  const { t } = useTranslation();
  return (
    <>
      <TextareaField id="ep-bio" label={t(`${K}.bioLabel`)} field={form.register('bio')} />
      <TextField
        id="ep-address"
        label={t(`${K}.addressLabel`)}
        dir="auto"
        field={form.register('address')}
      />
      <Controller
        control={form.control}
        name="regionId"
        render={({ field }) => (
          <SelectField
            id="ep-zone"
            label={t(`${K}.zoneLabel`)}
            placeholder={t(`${K}.zonePlaceholder`)}
            options={regionOptions}
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />
      <TextField
        id="ep-years"
        label={t(`${K}.yearsLabel`)}
        inputMode="numeric"
        align="end"
        filter={digits(2)}
        field={form.register('yearsOfExperience')}
      />
    </>
  );
}

/** Edit-profile form — rendered inline under the "Edit profile information" row. */
export function EditProfileForm() {
  const { t, i18n } = useTranslation();
  const { form, onSubmit, isPending, success, isTechnician } = useEditProfileSubmit();
  const { data: regions = [] } = useRegions();
  const isAr = i18n.language.startsWith('ar');
  const regionOptions: SelectOption[] = regions.map((r) => ({
    value: String(r.id),
    label: (isAr ? r.nameAr : r.nameEn) ?? String(r.id),
  }));
  const rootError = form.formState.errors.root?.message;

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      {success ? <Banner tone="success">{t(`${K}.success`)}</Banner> : null}
      {rootError ? <Banner tone="error">{rootError}</Banner> : null}
      <BaseFields form={form} />
      {isTechnician ? <TechFields form={form} regionOptions={regionOptions} /> : null}
      <Button type="submit" disabled={isPending} className="h-11 self-end px-6">
        {isPending ? t(`${K}.saving`) : t(`${K}.submit`)}
      </Button>
    </form>
  );
}
