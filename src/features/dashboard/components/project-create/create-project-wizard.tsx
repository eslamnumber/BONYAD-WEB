'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { ROUTES } from '@/config/routes';

import { useSubmitNewProject } from '../../api/submit-new-project';
import { formValuesToSubmitVars } from '../../lib/create-project-mapping';
import {
  createProjectFormSchema,
  defaultCreateProjectValues,
  STEP_FIELDS,
  type CreateProjectFormValues,
} from '../../schemas/create-project-form';

import { WizardForm } from './wizard-form';
import { WizardProgressBar } from './wizard-progress-bar';
import { isStepComplete, stepConfigAt, TOTAL_STEPS } from './wizard-state';

function WizardHeader() {
  const { t } = useTranslation();
  return (
    <header className="flex w-full flex-col items-end gap-4 text-end">
      <h1 className="text-foreground text-[2rem] leading-tight font-semibold">
        {t('dashboard.createProject.title')}
      </h1>
      <p className="text-foreground/60 text-xl font-medium">
        {t('dashboard.createProject.subtitle')}
      </p>
    </header>
  );
}

/**
 * Customer create-project wizard (Figma 1394:7041…). One lifted RHF form,
 * validated a step at a time; the final step submits create→phases via
 * `useSubmitNewProject` and routes back to the projects list. Each step body is
 * dispatched by {@link WizardStepBody}; the assignment step (5) opens the
 * technician picker for direct assignment.
 */
export function CreateProjectWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const form = useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectFormSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: defaultCreateProjectValues(),
  });
  const submit = useSubmitNewProject();
  const values = useWatch({ control: form.control }) as CreateProjectFormValues;
  const isLast = step === TOTAL_STEPS - 1;
  const config = stepConfigAt(step);

  const handleNext = async () => {
    if (!(await form.trigger(STEP_FIELDS[step]))) return;
    if (!isLast) return setStep((s) => s + 1);
    submit.mutate(formValuesToSubmitVars(form.getValues()), {
      onSuccess: () => router.push(ROUTES.DASHBOARD_PROJECTS),
      onError: () =>
        form.setError('root', { message: 'dashboard.createProject.errors.submitFailed' }),
    });
  };

  return (
    <section className="ms-auto flex w-full max-w-[696px] flex-col items-end gap-8 py-4">
      <WizardHeader />
      <WizardProgressBar currentStep={step} />
      <WizardForm
        step={step}
        form={form}
        config={config}
        isLast={isLast}
        pending={submit.isPending}
        canProceed={isStepComplete(step, values)}
        rootError={form.formState.errors.root?.message}
        onBack={() => setStep((s) => Math.max(s - 1, 0))}
        onSkip={() => setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1))}
        onNext={handleNext}
      />
    </section>
  );
}
