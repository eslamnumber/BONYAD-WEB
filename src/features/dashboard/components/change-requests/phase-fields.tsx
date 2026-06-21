'use client';

import { type ReactNode, useId } from 'react';
import { useTranslation } from 'react-i18next';

import { Input, Label, Textarea } from '@/components/ui';
import { conventionalDirection } from '@/types/locale';

import type { EditableField } from './use-phase-changes-editor';

type Values = { description: string; timeSpentDays: string; moneySpent: string };

/**
 * The editable description / days / cost fields shared by an existing phase being
 * UPDATEd and a brand-new CREATE phase draft. The free-text description uses the
 * locale's writing direction (`conventionalDirection` — `dir="auto"` would default
 * the empty field to LTR under the inverted map); days / cost are numeric
 * (`text-end`). Labels are static (no `dir="auto"` — rule 4).
 */
export function PhaseFields({
  values,
  onField,
}: {
  values: Values;
  onField: (field: EditableField, value: string) => void;
}) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith('ar') ? 'ar' : 'en';
  const base = useId();
  return (
    <div className="flex flex-col gap-3">
      <Field id={`${base}-desc`} label={t('dashboard.changeRequests.phase.descriptionLabel')}>
        <Textarea
          id={`${base}-desc`}
          dir={conventionalDirection(locale)}
          value={values.description}
          onChange={(e) => onField('description', e.target.value)}
          className="min-h-16 text-start"
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field id={`${base}-days`} label={t('dashboard.changeRequests.phase.daysLabel')}>
          <Input
            id={`${base}-days`}
            inputMode="numeric"
            value={values.timeSpentDays}
            onChange={(e) => onField('timeSpentDays', e.target.value)}
            className="text-end"
          />
        </Field>
        <Field id={`${base}-cost`} label={t('dashboard.changeRequests.phase.costLabel')}>
          <Input
            id={`${base}-cost`}
            inputMode="numeric"
            value={values.moneySpent}
            onChange={(e) => onField('moneySpent', e.target.value)}
            className="text-end"
          />
        </Field>
      </div>
    </div>
  );
}

function Field({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-muted-foreground text-end text-xs">
        {label}
      </Label>
      {children}
    </div>
  );
}
