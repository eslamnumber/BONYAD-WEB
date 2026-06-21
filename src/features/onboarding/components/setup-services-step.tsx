'use client';

import { useTranslation } from 'react-i18next';

import { type Locale } from '@/types/locale';

import { useServiceCategories } from '../api/get-service-categories';
import type { SetupService } from '../schemas/setup';

import { ServiceCategoryRow } from './service-category-row';
import { SetupEmpty, SetupError, SetupListSkeleton } from './setup-states';

const K = 'onboarding.setup.services';

type Props = {
  locale: Locale;
  isSelected: (id: number) => boolean;
  onToggle: (service: SetupService, categoryId: number) => void;
  selectedCount: number;
  /** Plan-driven cap on distinct categories (`null` = unlimited). */
  maxCategories: number | null;
  selectedCategoryIds: Set<number>;
};

/** Step 2 — choose services: expandable categories with subcategory drill-down (rule 23),
 *  bounded by the plan's distinct-category cap ("as my plan tells me"). */
export function SetupServicesStep({
  locale,
  isSelected,
  onToggle,
  selectedCount,
  maxCategories,
  selectedCategoryIds,
}: Props) {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = useServiceCategories();

  if (isLoading) return <SetupListSkeleton />;
  if (isError) return <SetupError message={t(`${K}.error`)} onRetry={() => void refetch()} />;
  if (!data || data.length === 0) return <SetupEmpty message={t(`${K}.empty`)} />;

  const capReached = maxCategories !== null && selectedCategoryIds.size >= maxCategories;

  return (
    <div className="flex flex-col gap-3">
      <ServicesCounter
        maxCategories={maxCategories}
        usedCategories={selectedCategoryIds.size}
        selectedCount={selectedCount}
        capReached={capReached}
      />
      {data.map((category) => (
        <ServiceCategoryRow
          key={category.id}
          category={category}
          locale={locale}
          isSelected={isSelected}
          onToggle={onToggle}
          engaged={selectedCategoryIds.has(category.id)}
          capReached={capReached}
        />
      ))}
    </div>
  );
}

function ServicesCounter({
  maxCategories,
  usedCategories,
  selectedCount,
  capReached,
}: {
  maxCategories: number | null;
  usedCategories: number;
  selectedCount: number;
  capReached: boolean;
}) {
  const { t } = useTranslation();
  if (maxCategories === null) {
    return (
      <p className="text-muted-foreground text-sm font-medium" aria-live="polite">
        {t(`${K}.selectedCount`, { count: selectedCount })}
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-1" aria-live="polite">
      <p className="text-foreground text-sm font-medium">
        {t(`${K}.categoriesUsed`, { used: usedCategories, max: maxCategories })}
      </p>
      {capReached ? <p className="text-primary text-xs">{t(`${K}.capReached`)}</p> : null}
    </div>
  );
}
