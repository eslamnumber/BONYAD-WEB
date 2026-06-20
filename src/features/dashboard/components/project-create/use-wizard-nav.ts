'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { type UseFormReturn, useWatch } from 'react-hook-form';

import { ROUTES } from '@/config/routes';

import { useSubmitNewProject } from '../../api/submit-new-project';
import { formValuesToSubmitVars } from '../../lib/create-project-mapping';
import { STEP_FIELDS, type CreateProjectFormValues } from '../../schemas/create-project-form';

import { editGroupEnd, isStepComplete, stepConfigAt, TOTAL_STEPS } from './wizard-state';

type EditRange = { start: number; end: number } | null;

/**
 * Step + navigation state for the create-project wizard. Normal flow: Next advances
 * one step; the final (review) step submits create→phases and routes to the projects
 * list. **Edit-from-review:** a review card's Edit link calls {@link onEdit}, recording
 * the card's step range; Next/Skip then walk to the range end and return to the review
 * summary instead of stepping onward — so editing a single card sends you right back.
 */
export function useWizardNav(form: UseFormReturn<CreateProjectFormValues>) {
  const router = useRouter();
  const submit = useSubmitNewProject();
  const [step, setStep] = useState(0);
  const [edit, setEdit] = useState<EditRange>(null);
  const values = useWatch({ control: form.control }) as CreateProjectFormValues;
  const reviewStep = TOTAL_STEPS - 1;

  const toReview = () => {
    setEdit(null);
    setStep(reviewStep);
  };

  const submitProject = () =>
    submit.mutate(formValuesToSubmitVars(form.getValues()), {
      onSuccess: () => router.push(ROUTES.DASHBOARD_PROJECTS),
      onError: () =>
        form.setError('root', { message: 'dashboard.createProject.errors.submitFailed' }),
    });

  const onNext = async () => {
    if (!(await form.trigger(STEP_FIELDS[step]))) return;
    if (step === reviewStep) return submitProject();
    if (edit && step >= edit.end) return toReview();
    setStep(step + 1);
  };

  const onSkip = () => {
    if (edit && step >= edit.end) return toReview();
    setStep(Math.min(step + 1, reviewStep));
  };

  const onBack = () => {
    if (edit && step <= edit.start) return toReview();
    setStep(Math.max(step - 1, 0));
  };

  const onEdit = (target: number) => {
    setEdit({ start: target, end: editGroupEnd(target) });
    setStep(target);
  };

  return {
    step,
    config: stepConfigAt(step),
    isLast: step === reviewStep,
    pending: submit.isPending,
    canProceed: isStepComplete(step, values),
    returnsToReview: edit !== null && step === edit.end,
    rootError: form.formState.errors.root?.message,
    onNext,
    onSkip,
    onBack,
    onEdit,
  };
}
