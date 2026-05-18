import { Check } from 'lucide-react';
import Link from 'next/link';

import { ROUTES } from '@/config/routes';
import { getTranslations } from '@/lib/get-translations';
import { type Locale } from '@/types/locale';

type TechPricingProps = { locale: Locale };
type PlanVariant = 'light' | 'dark-navy' | 'dark-green';
type PricingPlan = { name: string; price: string; desc: string; features: string[]; cta: string; variant: PlanVariant };
type PlanCardProps = PricingPlan & { currency: string; perMonth: string };

function PlanCard({ name, price, desc, features, cta, variant, currency, perMonth }: PlanCardProps) {
  const isDark = variant !== 'light';
  const cardClass = isDark
    ? variant === 'dark-green' ? 'bg-pricing-plan-business text-white' : 'bg-pricing-plan-growth text-white'
    : 'bg-white text-foreground border border-border';
  const priceColor = isDark ? 'text-white' : 'text-foreground';
  const descColor = isDark ? 'text-white/70' : 'text-muted-foreground';
  return (
    <div className={`flex w-[280px] shrink-0 flex-col gap-6 rounded-[12px] p-6 ${cardClass}`}>
      <div className="flex flex-col gap-1">
        <p className={`text-lg font-semibold ${priceColor}`}>{name}</p>
        <p className={`text-sm ${descColor}`}>{desc}</p>
      </div>
      <div className="flex items-end gap-1">
        <span className={`text-[40px] font-bold leading-none ${priceColor}`}>{price}</span>
        <span className={`mb-1 text-sm ${descColor}`}>{currency} {perMonth}</span>
      </div>
      <hr className={`border-t ${isDark ? 'border-white/20' : 'border-border'}`} />
      <ul className="flex flex-col gap-3">
        {features.map((f) => (
          <li key={f} className={`flex items-start gap-2 text-sm ${isDark ? 'text-white/80' : 'text-muted-foreground'}`}>
            <Check className={`mt-0.5 size-4 shrink-0 ${isDark ? 'text-white' : 'text-brand-navy'}`} aria-hidden />
            {f}
          </li>
        ))}
      </ul>
      <Link href={ROUTES.REGISTER} className={`mt-auto rounded-full px-6 py-2.5 text-center text-sm font-medium transition-opacity hover:opacity-90 ${isDark ? 'bg-white text-foreground' : 'border border-brand-navy text-brand-navy hover:bg-brand-navy/5'}`}>{cta}</Link>
    </div>
  );
}

type BillingToggleProps = { labels: string[] };

function BillingToggle({ labels }: BillingToggleProps) {
  return (
    <div className="mb-10 flex justify-center">
      <div className="flex items-center gap-1 rounded-full border border-border bg-white p-1">
        {labels.map((label, i) => (
          <span key={label} className={`rounded-full px-4 py-2 text-sm font-medium ${i === 0 ? 'bg-brand-navy text-white' : 'text-muted-foreground'}`}>{label}</span>
        ))}
      </div>
    </div>
  );
}

type BuildPlansArg = ReturnType<typeof getTranslations>['t'];

function buildPlans(t: BuildPlansArg): PricingPlan[] {
  return [1, 2, 3, 4].map((n) => ({
    name: t(`tech.pricing.plan${n}Name`),
    price: t(`tech.pricing.plan${n}Price`),
    desc: t(`tech.pricing.plan${n}Desc`),
    features: [1, 2, 3, 4, 5].map((f) => t(`tech.pricing.plan${n}Feature${f}`)),
    cta: t(`tech.pricing.plan${n}Cta`),
    variant: (['light', 'light', 'dark-navy', 'dark-green'] as PlanVariant[])[n - 1]!,
  }));
}

export function TechPricing({ locale }: TechPricingProps) {
  const { t } = getTranslations(locale);
  const plans = buildPlans(t);

  return (
    <section className="relative overflow-hidden bg-background py-20">
      <div aria-hidden className="pointer-events-none absolute end-0 top-0 h-[400px] w-[400px] rounded-full bg-deco-blob-green opacity-30 blur-[120px]" />
      <div aria-hidden className="pointer-events-none absolute bottom-0 start-0 h-[350px] w-[350px] rounded-full bg-deco-blob-blue-light opacity-30 blur-[120px]" />
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mb-12 flex flex-col items-center gap-3 text-center">
          <h2 className="text-4xl font-medium tracking-tight text-foreground md:text-5xl">{t('tech.pricing.headline')}</h2>
          <p className="max-w-lg text-lg text-foreground/80">{t('tech.pricing.subheadline')}</p>
        </div>
        <BillingToggle labels={[t('tech.pricing.billingMonthly'), t('tech.pricing.billing6Months'), t('tech.pricing.billingYearly')]} />
        <div className="flex flex-wrap justify-center gap-4">
          {plans.map((plan) => (
            <PlanCard key={plan.name} {...plan} currency={t('tech.pricing.currency')} perMonth={t('tech.pricing.perMonth')} />
          ))}
        </div>
      </div>
    </section>
  );
}
