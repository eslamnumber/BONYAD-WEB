'use client';

import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui';

import { type OwnerEditFormValues } from '../../schemas/owner-edit';

import { BudgetField } from './budget-field';
import { EditField, EditTextArea } from './field';
import { PhasesEditor } from './phases-editor';
import { useProjectEdit } from './use-project-edit';

const CARD = 'bg-card border-border flex w-full flex-col gap-5 rounded-xl border p-6';
const ACTION = 'h-12 flex-1 rounded-lg text-[15px] font-semibold';

type Props = {
  projectId: number;
  defaultValues: OwnerEditFormValues;
  onSaved: () => void;
  onCancel: () => void;
};

/** Project-edit form body: details card + phases card + save/cancel actions. */
export function ProjectEditForm({ projectId, defaultValues, onSaved, onCancel }: Props) {
  const { t } = useTranslation();
  const { form, onSubmit, isPending } = useProjectEdit(projectId, defaultValues, onSaved);
  const { errors, isSubmitting } = form.formState;

  return (
    <form onSubmit={onSubmit} noValidate className="flex w-full flex-col gap-6">
      <div className={CARD}>
        <EditField
          id="project-name"
          label={t('dashboard.projectEdit.fields.nameLabel')}
          placeholder={t('dashboard.projectEdit.fields.namePlaceholder')}
          field={form.register('name')}
          error={errors.name?.message}
        />
        <EditTextArea
          id="project-description"
          label={t('dashboard.projectEdit.fields.descriptionLabel')}
          placeholder={t('dashboard.projectEdit.fields.descriptionPlaceholder')}
          field={form.register('description')}
          error={errors.description?.message}
        />
        <BudgetField form={form} />
        <EditField
          id="project-address"
          label={t('dashboard.projectEdit.fields.addressLabel')}
          placeholder={t('dashboard.projectEdit.fields.addressPlaceholder')}
          field={form.register('address')}
          error={errors.address?.message}
        />
      </div>
      <div className={CARD}>
        <PhasesEditor form={form} />
      </div>
      <EditFooter
        rootError={errors.root?.message}
        pending={isPending || isSubmitting}
        onCancel={onCancel}
      />
    </form>
  );
}

type FooterProps = { rootError?: string; pending: boolean; onCancel: () => void };

function EditFooter({ rootError, pending, onCancel }: FooterProps) {
  const { t } = useTranslation();
  return (
    <>
      {rootError ? (
        <p role="alert" className="text-destructive text-end text-sm">
          {t(rootError)}
        </p>
      ) : null}
      <div className="flex w-full flex-col gap-3 sm:flex-row-reverse">
        <Button
          type="submit"
          disabled={pending}
          className={`bg-brand-dark-navy text-on-media motion-safe:hover:opacity-90 ${ACTION}`}
        >
          {t('dashboard.projectEdit.actions.save')}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className={`border-border text-foreground ${ACTION}`}
        >
          {t('dashboard.projectEdit.actions.cancel')}
        </Button>
      </div>
    </>
  );
}
