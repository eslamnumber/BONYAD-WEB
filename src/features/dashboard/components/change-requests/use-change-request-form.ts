'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ApiError } from '@/lib/api-client';

import { useCreateChangeRequest } from '../../api/create-change-request';
import type { CreateChangeRequestInput } from '../../schemas/change-request-form';
import type { ProjectPhase } from '../../schemas/project-phase';

import { usePhaseChangesEditor } from './use-phase-changes-editor';

export type FormViewer = { email?: string; phone?: string };

type Options = {
  projectId: number;
  isTechnician: boolean;
  viewer: FormViewer;
  phases: ProjectPhase[];
  seedPhaseId?: number;
  onClose: () => void;
};

/** Attach the viewer's own contact details to the correct side so the backend can
 *  notify both parties (best-effort — the other side it resolves itself). */
function contactFields(
  isTechnician: boolean,
  viewer: FormViewer,
): Partial<CreateChangeRequestInput> {
  return isTechnician
    ? { technicianEmail: viewer.email, technicianPhone: viewer.phone }
    : { userEmail: viewer.email, userPhone: viewer.phone };
}

/**
 * All state + submission logic for the "Request modification" form: description,
 * new total budget, the phase-changes editor, and the create mutation. Keeps the
 * {@link ChangeRequestForm} component down to layout.
 */
export function useChangeRequestForm({
  projectId,
  isTechnician,
  viewer,
  phases,
  seedPhaseId,
  onClose,
}: Options) {
  const { t, i18n } = useTranslation();
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const editor = usePhaseChangesEditor(phases, seedPhaseId);
  const create = useCreateChangeRequest();

  const budgetNum = Number(budget.trim());
  const canSubmit =
    description.trim().length > 0 && !editor.hasInvalidNewPhase && !create.isPending;

  const submit = () => {
    if (!canSubmit) return;
    const phaseChanges = editor.toPhaseChanges();
    create.mutate(
      {
        projectId,
        input: {
          description: description.trim(),
          newBudget: budget.trim() && budgetNum > 0 ? budgetNum : undefined,
          phaseChanges: phaseChanges.length ? phaseChanges : undefined,
          ...contactFields(isTechnician, viewer),
        },
      },
      { onSuccess: onClose },
    );
  };

  const error = create.isError
    ? ((create.error instanceof ApiError ? create.error.localizedMessage(i18n.language) : null) ??
      t('dashboard.changeRequests.form.error'))
    : null;

  return {
    description,
    setDescription,
    budget,
    setBudget,
    editor,
    canSubmit,
    submit,
    isPending: create.isPending,
    error,
  };
}
