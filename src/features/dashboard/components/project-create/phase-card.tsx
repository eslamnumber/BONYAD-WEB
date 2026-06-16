'use client';

import { type UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { CloseIcon } from '@/components/icons';

import { type CreateProjectFormValues } from '../../schemas/create-project-form';

import { WizardTextField } from './wizard-fields';

const K = 'dashboard.createProject.steps.phases';

type PhaseKey = 'durationWeeks' | 'amount' | 'description' | 'name';

/** Field columns in Figma order: duration → amount → description → name. */
const FIELDS: { key: PhaseKey; id: string; label: string; placeholder: string }[] = [
  {
    key: 'durationWeeks',
    id: 'duration',
    label: 'durationLabel',
    placeholder: 'durationPlaceholder',
  },
  { key: 'amount', id: 'amount', label: 'amountLabel', placeholder: 'amountPlaceholder' },
  {
    key: 'description',
    id: 'description',
    label: 'descriptionLabel',
    placeholder: 'descriptionPlaceholder',
  },
  { key: 'name', id: 'name', label: 'nameLabel', placeholder: 'namePlaceholder' },
];

type Props = {
  form: UseFormReturn<CreateProjectFormValues>;
  index: number;
  /** Provided for every phase past the first so added rows can be removed. */
  onRemove?: () => void;
};

/** One phase row (Figma 1394:7287): duration / amount / description / name on a muted panel. */
export function PhaseCard({ form, index, onRemove }: Props) {
  const { t } = useTranslation();

  return (
    <div className="bg-create-phase-panel flex w-full flex-col items-end gap-4 rounded-xl p-6">
      <div className="flex w-full items-center justify-between">
        {onRemove ? (
          <button
            type="button"
            onClick={onRemove}
            aria-label={t(`${K}.removePhase`)}
            className="text-foreground/50 hover:text-foreground rounded-md p-1"
          >
            <CloseIcon aria-hidden className="size-4" />
          </button>
        ) : (
          <span />
        )}
        <p className="text-foreground text-base font-semibold">
          {t(`${K}.phaseLabel`, { number: index + 1 })}
        </p>
      </div>
      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FIELDS.map((f) => (
          <WizardTextField
            key={f.key}
            id={`cp-phase-${index}-${f.id}`}
            label={t(`${K}.${f.label}`)}
            placeholder={t(`${K}.${f.placeholder}`)}
            field={form.register(`phases.${index}.${f.key}` as const)}
          />
        ))}
      </div>
    </div>
  );
}
