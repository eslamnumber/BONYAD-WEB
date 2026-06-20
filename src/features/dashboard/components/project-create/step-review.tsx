'use client';

import { type UseFormReturn, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { type Locale } from '@/types/locale';

import { useServices } from '../../api/get-services';
import { buildReviewSections } from '../../lib/review-sections';
import { localizedServiceName } from '../../lib/service-format';
import { type CreateProjectFormValues } from '../../schemas/create-project-form';

import { ReviewCard } from './review-card';

const K = 'dashboard.createProject.review';

type Props = {
  form: UseFormReturn<CreateProjectFormValues>;
  /** Jump the wizard back to a given step (the per-card Edit link). */
  onEdit: (step: number) => void;
};

/** Resolve the picked category's localized name from the cached services query. */
function useCategoryName(serviceCategoryId: string, locale: Locale): string | undefined {
  const services = useServices();
  const match = (services.data ?? []).find((s) => String(s.id) === serviceCategoryId);
  return match ? localizedServiceName(match, locale) : undefined;
}

/** Step 7 — review summary of every captured field before submit (Figma 1550:1548). */
export function StepReview({ form, onEdit }: Props) {
  const { t, i18n } = useTranslation();
  const values = useWatch({ control: form.control }) as CreateProjectFormValues;
  const categoryName = useCategoryName(values.serviceCategoryId, i18n.language as Locale);
  const sections = buildReviewSections({ values, categoryName, t });

  return (
    <div className="flex w-full flex-col items-end gap-4">
      {sections.map((section) => (
        <ReviewCard
          key={section.id}
          title={section.title}
          editLabel={t(`${K}.edit`)}
          currencyLabel={t(`${K}.currency`)}
          onEdit={() => onEdit(section.editStep)}
          rows={section.rows}
        />
      ))}
    </div>
  );
}
