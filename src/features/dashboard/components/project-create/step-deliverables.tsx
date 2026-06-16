'use client';

import { type UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { type CreateProjectFormValues } from '../../schemas/create-project-form';

import { WizardTextArea } from './wizard-fields';

const K = 'dashboard.createProject.steps.deliverables';

/** Step 3 — optional free-text deliverables. */
export function StepDeliverables({ form }: { form: UseFormReturn<CreateProjectFormValues> }) {
  const { t } = useTranslation();
  return (
    <div className="flex w-full flex-col items-end gap-3">
      <WizardTextArea
        id="cp-deliverables"
        label={t(`${K}.label`)}
        placeholder={t(`${K}.placeholder`)}
        field={form.register('deliverables')}
      />
    </div>
  );
}
