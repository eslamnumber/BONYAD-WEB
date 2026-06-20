'use client';

import { useState } from 'react';
import { type UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { AssignmentBiddingIcon, AssignmentDirectIcon } from '@/components/icons';
import { FieldHint } from '@/components/ui';

import { technicianName } from '../../lib/technician-format';
import { type CreateProjectFormValues } from '../../schemas/create-project-form';
import { type Technician } from '../../schemas/technician';

import { AssignmentOptionCard } from './assignment-option-card';
import { TechnicianPickerModal } from './technician-picker-modal';

const K = 'dashboard.createProject.steps.assignment';

/** Step 5 — bidding vs direct assignment; direct opens the technician picker (Figma 1394:7425). */
export function StepAssignment({ form }: { form: UseFormReturn<CreateProjectFormValues> }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [chosen, setChosen] = useState<Technician | null>(null);
  const type = form.watch('assignmentType');
  const error = form.formState.errors.assignedTechnicianId?.message;

  const selectBidding = () => {
    form.setValue('assignmentType', 'ALL', { shouldValidate: true });
    form.setValue('assignedTechnicianId', null, { shouldValidate: true });
    form.setValue('assignedTechnicianName', '');
    setChosen(null);
  };
  const selectDirect = () => {
    form.setValue('assignmentType', 'DIRECT_ASSIGNMENT');
    setOpen(true);
  };
  const onChoose = (technician: Technician) => {
    setChosen(technician);
    form.setValue('assignedTechnicianId', technician.id, { shouldValidate: true });
    form.setValue('assignedTechnicianName', technicianName(technician));
    setOpen(false);
  };

  return (
    <div className="flex w-full flex-col items-end gap-2" role="radiogroup">
      <AssignmentOptionCard
        selected={type === 'ALL'}
        title={t(`${K}.biddingTitle`)}
        description={t(`${K}.biddingDescription`)}
        icon={<AssignmentBiddingIcon aria-hidden />}
        onSelect={selectBidding}
      />
      <AssignmentOptionCard
        selected={type === 'DIRECT_ASSIGNMENT'}
        title={t(`${K}.directTitle`)}
        description={t(`${K}.directDescription`)}
        icon={<AssignmentDirectIcon aria-hidden />}
        onSelect={selectDirect}
      />
      {chosen ? (
        <p className="text-foreground/70 w-full text-end text-sm">
          {t(`${K}.chosenTechnician`, { name: technicianName(chosen) })}
        </p>
      ) : null}
      {error ? <FieldHint tone="error">{t(error)}</FieldHint> : null}
      <TechnicianPickerModal open={open} onClose={() => setOpen(false)} onChoose={onChoose} />
    </div>
  );
}
