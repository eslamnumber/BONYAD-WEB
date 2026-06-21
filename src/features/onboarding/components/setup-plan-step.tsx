'use client';

import { useTranslation } from 'react-i18next';

import { type Locale } from '@/types/locale';

import { useSubscriptionPlans } from '../api/get-subscription-plans';

import { PlanOptionCard } from './plan-option-card';
import { SetupEmpty, SetupError, SetupListSkeleton } from './setup-states';

const K = 'onboarding.setup.plan';

/** Step 1 — choose a subscription plan. Backend-driven (rule 23): every state rendered. */
export function SetupPlanStep({
  locale,
  selectedId,
  onSelect,
}: {
  locale: Locale;
  selectedId: number | null;
  onSelect: (id: number) => void;
}) {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = useSubscriptionPlans();

  if (isLoading) return <SetupListSkeleton />;
  if (isError) return <SetupError message={t(`${K}.error`)} onRetry={() => void refetch()} />;
  if (!data || data.length === 0) return <SetupEmpty message={t(`${K}.empty`)} />;

  return (
    <div className="flex flex-col gap-3">
      {data.map((plan) => (
        <PlanOptionCard
          key={plan.id}
          plan={plan}
          locale={locale}
          selected={selectedId === plan.id}
          onSelect={() => onSelect(plan.id)}
        />
      ))}
    </div>
  );
}
