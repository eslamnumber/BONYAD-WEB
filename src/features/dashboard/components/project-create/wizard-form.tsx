'use client';

import { type UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { type CreateProjectFormValues } from '../../schemas/create-project-form';

import { WizardNav } from './wizard-nav';
import { WizardSectionHeading } from './wizard-section-heading';
import { type WizardStepConfig } from './wizard-state';
import { WizardStepBody } from './wizard-step-body';

type Props = {
  step: number;
  form: UseFormReturn<CreateProjectFormValues>;
  config: WizardStepConfig;
  isLast: boolean;
  pending: boolean;
  canProceed: boolean;
  /** True on the step whose Next click returns to the review summary (edit-from-review). */
  returnsToReview: boolean;
  rootError?: string;
  onEdit: (step: number) => void;
  onBack: () => void;
  onSkip: () => void;
  onNext: () => void;
};

/** The wizard's `<form>`: per-step heading + active step body + the nav row. */
export function WizardForm({ step, form, config, onEdit, ...nav }: Props) {
  const { t } = useTranslation();
  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      noValidate
      className="flex w-full flex-col items-end gap-6"
    >
      <WizardSectionHeading
        title={t(config.headingKey)}
        description={config.descriptionKey ? t(config.descriptionKey) : undefined}
      />
      <WizardStepBody step={step} form={form} onEdit={onEdit} />
      <WizardNav config={config} {...nav} />
    </form>
  );
}
