'use client';

import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { type Locale } from '@/types/locale';

import { useSubscriptionPlans } from '../api/get-subscription-plans';
import { localizedName } from '../lib/setup-localized-name';
import type { SetupService } from '../schemas/setup';

const K = 'onboarding.setup.review';

type Props = {
  locale: Locale;
  planId: number | null;
  services: SetupService[];
  onEditPlan: () => void;
  onEditServices: () => void;
};

/** Step 3 — review the chosen plan + services before the finish call fires. */
export function SetupReviewStep({ locale, planId, services, onEditPlan, onEditServices }: Props) {
  const { t } = useTranslation();
  const { data } = useSubscriptionPlans();
  const plan = data?.find((p) => p.id === planId) ?? null;

  return (
    <div className="flex flex-col gap-4">
      <ReviewBlock title={t(`${K}.planLabel`)} action={t(`${K}.edit`)} onAction={onEditPlan}>
        <span dir="auto" className="text-foreground text-base font-semibold">
          {plan ? localizedName(plan.nameAr, plan.nameEn, locale) : '—'}
        </span>
      </ReviewBlock>
      <ReviewBlock
        title={t(`${K}.servicesLabel`)}
        action={t(`${K}.edit`)}
        onAction={onEditServices}
      >
        <div className="flex flex-wrap gap-2">
          {services.map((service) => (
            <span
              key={service.id}
              dir="auto"
              className="bg-field-surface text-foreground rounded-full px-3 py-1 text-sm"
            >
              {localizedName(service.nameAr, service.nameEn, locale)}
            </span>
          ))}
        </div>
      </ReviewBlock>
    </div>
  );
}

function ReviewBlock({
  title,
  action,
  onAction,
  children,
}: {
  title: string;
  action: string;
  onAction: () => void;
  children: ReactNode;
}) {
  return (
    <section className="border-border bg-card rounded-2xl border p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
          {title}
        </h2>
        <button
          type="button"
          onClick={onAction}
          className="text-primary focus-visible:outline-ring rounded-full text-sm font-semibold focus-visible:outline-2"
        >
          {action}
        </button>
      </div>
      {children}
    </section>
  );
}
