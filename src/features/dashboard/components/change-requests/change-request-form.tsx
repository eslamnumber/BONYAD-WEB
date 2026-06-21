'use client';

import { useId } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Input, Label, Modal, ModalFooter, ModalHeader, Textarea } from '@/components/ui';
import { conventionalDirection, LOCALE_DIRECTION } from '@/types/locale';

import type { ProjectPhase } from '../../schemas/project-phase';

import { PhaseChangesEditor } from './phase-changes-editor';
import { type FormViewer, useChangeRequestForm } from './use-change-request-form';

type Props = {
  projectId: number;
  isTechnician: boolean;
  viewer: FormViewer;
  phases: ProjectPhase[];
  seedPhaseId?: number;
  onClose: () => void;
};

/**
 * "Request modification" dialog (create flow). Description is required; a new
 * total budget and per-phase changes are optional. State + submission live in
 * {@link useChangeRequestForm}; this component is layout only.
 */
export function ChangeRequestForm({
  projectId,
  isTechnician,
  viewer,
  phases,
  seedPhaseId,
  onClose,
}: Props) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith('ar') ? 'ar' : 'en';
  const titleId = useId();
  const form = useChangeRequestForm({
    projectId,
    isTechnician,
    viewer,
    phases,
    seedPhaseId,
    onClose,
  });

  return (
    <Modal
      open
      onClose={onClose}
      labelledBy={titleId}
      dir={LOCALE_DIRECTION[locale]}
      className="max-w-[540px]"
    >
      <ModalHeader
        titleId={titleId}
        title={t('dashboard.changeRequests.form.title')}
        closeLabel={t('dashboard.changeRequests.form.cancel')}
        onClose={onClose}
      />
      <FormBody form={form} phases={phases} />
      <FormActions form={form} onClose={onClose} />
    </Modal>
  );
}

function FormBody({
  form,
  phases,
}: {
  form: ReturnType<typeof useChangeRequestForm>;
  phases: ProjectPhase[];
}) {
  return (
    <div className="flex flex-col gap-5 p-6">
      <DetailsFields
        description={form.description}
        budget={form.budget}
        onDescription={form.setDescription}
        onBudget={form.setBudget}
      />
      <PhaseChangesEditor editor={form.editor} phases={phases} />
      {form.error && (
        <p role="alert" dir="auto" className="text-status-rejected text-start text-sm">
          {form.error}
        </p>
      )}
    </div>
  );
}

function FormActions({
  form,
  onClose,
}: {
  form: ReturnType<typeof useChangeRequestForm>;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  return (
    <ModalFooter>
      <Button variant="outline" onClick={onClose} className="flex-1">
        {t('dashboard.changeRequests.form.cancel')}
      </Button>
      <Button onClick={form.submit} disabled={!form.canSubmit} className="flex-1">
        {form.isPending
          ? t('dashboard.changeRequests.form.submitting')
          : t('dashboard.changeRequests.form.submit')}
      </Button>
    </ModalFooter>
  );
}

function DetailsFields({
  description,
  budget,
  onDescription,
  onBudget,
}: {
  description: string;
  budget: string;
  onDescription: (v: string) => void;
  onBudget: (v: string) => void;
}) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith('ar') ? 'ar' : 'en';
  const ids = useId();
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${ids}-desc`} className="text-end">
          {t('dashboard.changeRequests.form.descriptionLabel')}
        </Label>
        <Textarea
          id={`${ids}-desc`}
          dir={conventionalDirection(locale)}
          value={description}
          onChange={(e) => onDescription(e.target.value)}
          placeholder={t('dashboard.changeRequests.form.descriptionPlaceholder')}
          className="min-h-24 text-start"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${ids}-budget`} className="text-end">
          {t('dashboard.changeRequests.form.budgetLabel')}
        </Label>
        <Input
          id={`${ids}-budget`}
          inputMode="numeric"
          value={budget}
          onChange={(e) => onBudget(e.target.value)}
          placeholder={t('dashboard.changeRequests.form.budgetPlaceholder')}
          className="text-end"
        />
      </div>
    </div>
  );
}
