'use client';

import { type UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { FieldHint } from '@/components/ui';
import { type Locale } from '@/types/locale';

import { useServices } from '../../api/get-services';
import { localizedServiceName } from '../../lib/service-format';
import { type CreateProjectFormValues } from '../../schemas/create-project-form';

import { WizardTextArea, WizardTextField } from './wizard-fields';
import { WizardSelectField } from './wizard-select';

const K = 'dashboard.createProject.steps.info';

/** Step 1 — service category + project name + description (Figma 1394:7054). */
export function StepProjectInfo({ form }: { form: UseFormReturn<CreateProjectFormValues> }) {
  const { t, i18n } = useTranslation();
  const services = useServices();
  const { errors } = form.formState;
  const options = (services.data ?? []).map((s) => ({
    value: String(s.id),
    label: localizedServiceName(s, i18n.language as Locale),
  }));

  return (
    <div className="flex w-full flex-col items-end gap-3">
      <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-[34px]">
        <WizardSelectField
          id="cp-category"
          label={t(`${K}.categoryLabel`)}
          placeholder={t(`${K}.categoryPlaceholder`)}
          value={form.watch('serviceCategoryId')}
          onChange={(v) =>
            form.setValue('serviceCategoryId', v, { shouldValidate: true, shouldDirty: true })
          }
          options={options}
          error={errors.serviceCategoryId?.message}
          disabled={services.isPending}
        />
        <WizardTextField
          id="cp-name"
          label={t(`${K}.nameLabel`)}
          placeholder={t(`${K}.namePlaceholder`)}
          field={form.register('projectName')}
          error={errors.projectName?.message}
        />
      </div>
      <WizardTextArea
        id="cp-description"
        label={t(`${K}.descriptionLabel`)}
        placeholder={t(`${K}.descriptionPlaceholder`)}
        field={form.register('description')}
        error={errors.description?.message}
      />
      {services.isError ? <FieldHint tone="error">{t(`${K}.categoryLoadError`)}</FieldHint> : null}
    </div>
  );
}
