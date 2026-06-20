'use client';

import { type UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Button, ModalFooter } from '@/components/ui';

import { type OwnerEditFormValues } from '../../schemas/owner-edit';

import { BudgetField } from './budget-field';
import { EditField, EditTextArea } from './field';
import { PhasesEditor } from './phases-editor';
import { useProjectEdit } from './use-project-edit';

const ACTION = 'h-11 rounded-lg text-[15px] font-semibold';

type Props = {
  projectId: number;
  defaultValues: OwnerEditFormValues;
  onSaved: () => void;
  onCancel: () => void;
};

/** Project-edit modal body: scrollable details + phases over a pinned save/cancel footer. */
export function ProjectEditForm({ projectId, defaultValues, onSaved, onCancel }: Props) {
  const { t } = useTranslation();
  const { form, onSubmit, isPending } = useProjectEdit(projectId, defaultValues, onSaved);
  const { errors, isSubmitting } = form.formState;

  return (
    <form onSubmit={onSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-col gap-6 overflow-y-auto p-6">
        <p className="text-foreground/60 text-end text-sm">{t('dashboard.projectEdit.subtitle')}</p>
        <EditFields form={form} />
        <div className="border-border w-full border-t" />
        <PhasesEditor form={form} />
      </div>
      {errors.root?.message ? (
        <p role="alert" className="text-destructive px-6 pt-4 text-end text-sm">
          {t(errors.root.message)}
        </p>
      ) : null}
      <EditFooter pending={isPending || isSubmitting} onCancel={onCancel} />
    </form>
  );
}

/** The four owner-editable project detail fields (name, description, budget, address). */
function EditFields({ form }: { form: UseFormReturn<OwnerEditFormValues> }) {
  const { t } = useTranslation();
  const { errors } = form.formState;
  return (
    <div className="flex w-full flex-col gap-5">
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
  );
}

function EditFooter({ pending, onCancel }: { pending: boolean; onCancel: () => void }) {
  const { t } = useTranslation();
  return (
    <ModalFooter>
      <Button
        type="submit"
        disabled={pending}
        className={`bg-brand-dark-navy text-on-media flex-1 motion-safe:hover:opacity-90 ${ACTION}`}
      >
        {t('dashboard.projectEdit.actions.save')}
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={pending}
        className={`border-border text-foreground ${ACTION}`}
      >
        {t('dashboard.projectEdit.actions.cancel')}
      </Button>
    </ModalFooter>
  );
}
