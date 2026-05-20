import { Check } from 'lucide-react';
import Link from 'next/link';

import { SaudiRiyalIcon } from '@/components/icons';
import { ROUTES } from '@/config/routes';
import { getTranslations } from '@/lib/get-translations';
import { type Locale, LOCALE_DIRECTION } from '@/types/locale';

import type { SubscriptionPlan } from '../schemas/subscription-plan';

type PlanVariant = 'light' | 'dark-navy' | 'dark-green';
type TechPricingProps = { locale: Locale; plans: SubscriptionPlan[] };
type PlanCardProps = {
  plan: SubscriptionPlan;
  variant: PlanVariant;
  name: string;
  features: string[];
  currency: string;
  perMonth: string;
  cta: string;
};

function getCardClass(variant: PlanVariant): string {
  if (variant === 'dark-green') return 'bg-pricing-plan-business text-white';
  if (variant === 'dark-navy') return 'bg-pricing-plan-growth text-white';
  return 'bg-card text-foreground border border-border';
}

function getVariant(index: number, total: number): PlanVariant {
  if (index === total - 1) return 'dark-green';
  if (index === total - 2 && total > 1) return 'dark-navy';
  return 'light';
}

function getPlanName(plan: SubscriptionPlan, locale: Locale): string {
  return LOCALE_DIRECTION[locale] === 'ltr' ? plan.nameAr : plan.nameEn;
}

function getPlanFeatures(plan: SubscriptionPlan, locale: Locale): string[] {
  if (plan.features?.length) return plan.features;
  const desc = LOCALE_DIRECTION[locale] === 'ltr' ? plan.descriptionAr : plan.descriptionEn;
  return desc ? desc.split(/\r?\n/).filter(Boolean) : [];
}

function PlanFeatureList({ features, isDark }: { features: string[]; isDark: boolean }) {
  return (
    <ul className="flex flex-col gap-3">
      {features.map((f) => (
        <li
          key={f}
          className={`flex items-start gap-2 text-sm ${isDark ? 'text-white/80' : 'text-muted-foreground'}`}
        >
          <Check
            className={`mt-0.5 size-4 shrink-0 ${isDark ? 'text-white' : 'text-brand-navy'}`}
            aria-hidden
          />
          {f}
        </li>
      ))}
    </ul>
  );
}

function PlanCard({ plan, variant, name, features, currency, perMonth, cta }: PlanCardProps) {
  const isDark = variant !== 'light';
  const cardClass = getCardClass(variant);
  const priceColor = isDark ? 'text-white' : 'text-foreground';
  const descColor = isDark ? 'text-white/70' : 'text-muted-foreground';
  const price = Math.round(plan.finalPrice ?? plan.price ?? 0);

  return (
    <div
      className={`flex w-full max-w-[320px] flex-col gap-6 rounded-[12px] p-6 text-end sm:w-[280px] ${cardClass}`}
    >
      <div className="flex flex-col gap-1">
        <p className={`text-lg font-semibold ${priceColor}`}>{name}</p>
        {plan.hasActiveDiscount && plan.discountPercentage && (
          <span className="self-end rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-medium text-green-600">
            -{plan.discountPercentage}%
          </span>
        )}
      </div>
      <div className="flex items-end gap-1.5">
        <SaudiRiyalIcon className={`mb-1 h-6 w-auto shrink-0 ${priceColor}`} aria-hidden />
        <span className="sr-only">{currency}</span>
        <span className={`text-[40px] leading-none font-bold ${priceColor}`}>{price}</span>
        <span className={`mb-1 text-sm ${descColor}`}>{perMonth}</span>
      </div>
      <hr className={`border-t ${isDark ? 'border-white/20' : 'border-border'}`} />
      <PlanFeatureList features={features} isDark={isDark} />
      <Link
        href={ROUTES.REGISTER}
        className={`mt-auto rounded-full px-6 py-2.5 text-center text-sm font-medium transition-opacity hover:opacity-90 ${isDark ? 'bg-card text-foreground' : 'border-brand-navy text-brand-navy hover:bg-brand-navy/5 border'}`}
      >
        {cta}
      </Link>
    </div>
  );
}

function BillingToggle({ labels }: { labels: string[] }) {
  return (
    <div className="mb-10 flex justify-center">
      <div className="border-border bg-card flex items-center gap-1 rounded-full border p-1">
        {labels.map((label, i) => (
          <span
            key={label}
            className={`rounded-full px-4 py-2 text-sm font-medium ${i === 0 ? 'bg-brand-navy text-white' : 'text-muted-foreground'}`}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function TechPricing({ locale, plans }: TechPricingProps) {
  const { t } = getTranslations(locale);
  const sorted = [...plans].sort(
    (a, b) => (a.finalPrice ?? a.price ?? 0) - (b.finalPrice ?? b.price ?? 0),
  );

  return (
    <section className="bg-background relative overflow-hidden py-12 sm:py-16 lg:py-20">
      <div
        aria-hidden
        className="bg-deco-blob-green pointer-events-none absolute end-0 top-0 h-[400px] w-[400px] rounded-full opacity-30 blur-[120px]"
      />
      <div
        aria-hidden
        className="bg-deco-blob-blue-light pointer-events-none absolute start-0 bottom-0 h-[350px] w-[350px] rounded-full opacity-30 blur-[120px]"
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-10 flex flex-col items-center gap-3 text-center sm:mb-12">
          <h2 className="text-foreground text-3xl font-medium tracking-tight sm:text-4xl md:text-5xl">
            {t('tech.pricing.headline')}
          </h2>
          <p className="text-foreground/80 max-w-lg text-base sm:text-lg">
            {t('tech.pricing.subheadline')}
          </p>
        </div>
        <BillingToggle
          labels={[
            t('tech.pricing.billingMonthly'),
            t('tech.pricing.billing6Months'),
            t('tech.pricing.billingYearly'),
          ]}
        />
        {sorted.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-4">
            {sorted.map((plan, i) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                variant={getVariant(i, sorted.length)}
                name={getPlanName(plan, locale)}
                features={getPlanFeatures(plan, locale)}
                currency={t('tech.pricing.currency')}
                perMonth={t('tech.pricing.perMonth')}
                cta={t('tech.pricing.cta')}
              />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center">{t('tech.pricing.noPlans')}</p>
        )}
      </div>
    </section>
  );
}
