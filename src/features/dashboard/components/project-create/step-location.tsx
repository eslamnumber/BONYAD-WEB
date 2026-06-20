'use client';

import { type UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { FieldHint } from '@/components/ui';
import { LOCALE_DIRECTION, type Locale } from '@/types/locale';

import { useRegions } from '../../api/get-regions';
import { type CreateProjectFormValues } from '../../schemas/create-project-form';
import { type Region } from '../../schemas/region';

import { PhotoUpload } from './photo-upload';
import { WizardDateField } from './wizard-fields';
import { WizardSelectField } from './wizard-select';

const K = 'dashboard.createProject.steps.location';

/** Localized region name (inverted en→rtl mapping), with fallbacks. */
function regionLabel(r: Region, locale: Locale): string {
  const en = r.nameEn?.trim() || undefined;
  const ar = r.nameAr?.trim() || undefined;
  const primary = LOCALE_DIRECTION[locale] === 'ltr' ? ar : en;
  return primary ?? en ?? ar ?? String(r.id);
}

/** Step 6 — region picker (→ `address`) + optional deadline + photos (Figma 1394:7533). */
export function StepLocation({ form }: { form: UseFormReturn<CreateProjectFormValues> }) {
  const { t, i18n } = useTranslation();
  const regions = useRegions();
  const locale = i18n.language as Locale;
  const options = (regions.data ?? []).map((r) => ({
    value: String(r.id),
    label: regionLabel(r, locale),
  }));

  const onCity = (id: string) => {
    const region = (regions.data ?? []).find((r) => String(r.id) === id);
    form.setValue('regionId', id, { shouldValidate: true, shouldDirty: true });
    form.setValue('regionName', region ? regionLabel(region, locale) : '', {
      shouldValidate: true,
    });
  };

  return (
    <div className="flex w-full flex-col items-end gap-6">
      <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-[24px]">
        <WizardSelectField
          id="cp-city"
          label={t(`${K}.cityLabel`)}
          placeholder={t(`${K}.cityPlaceholder`)}
          value={form.watch('regionId')}
          onChange={onCity}
          options={options}
          disabled={regions.isPending}
        />
        <WizardDateField
          id="cp-deadline"
          label={t(`${K}.deadlineLabel`)}
          field={form.register('bidDeadline')}
        />
      </div>
      {regions.isError ? <FieldHint tone="error">{t(`${K}.cityLoadError`)}</FieldHint> : null}
      <PhotoUpload form={form} />
    </div>
  );
}
