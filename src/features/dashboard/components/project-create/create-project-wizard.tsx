'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import {
  createProjectFormSchema,
  defaultCreateProjectValues,
  type CreateProjectFormValues,
} from '../../schemas/create-project-form';

import { useWizardNav } from './use-wizard-nav';
import { WizardForm } from './wizard-form';
import { WizardProgressBar } from './wizard-progress-bar';

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
 * Customer create-project wizard (Figma 1394:7041…). One lifted RHF form, validated a
 * step at a time by {@link useWizardNav}, which also owns "edit from review": a review
 * card's Edit link jumps back to its step, and Next then returns to the summary. The
 * final (review) step submits create→phases and routes back to the projects list.
 */
export function CreateProjectWizard() {
  const form = useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectFormSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: defaultCreateProjectValues(),
  });
  const nav = useWizardNav(form);

  return (
    <section className="ms-auto flex w-full max-w-[696px] flex-col items-end gap-8 py-4">
      <WizardHeader />
      <WizardProgressBar currentStep={nav.step} />
      <WizardForm form={form} {...nav} />
    </section>
  );
}
