'use client';

import { useState } from 'react';

import { LOCALE_DIRECTION, type Locale } from '@/types/locale';

export type StepItem = {
  number: string;
  title: string;
  body: string;
};

type Props = {
  locale: Locale;
  tabPro: string;
  tabCustomer: string;
  proHeadline: string;
  proBody: string;
  customerHeadline: string;
  customerBody: string;
  proSteps: StepItem[];
  customerSteps: StepItem[];
};

function StepCard({ number, title, body }: StepItem) {
  return (
    <div className="border-border bg-card flex flex-col gap-6 rounded-2xl border p-6 text-end">
      <p className="text-primary text-[64px] leading-none font-semibold">{number}</p>
      <div className="flex flex-col gap-4">
        <p className="text-primary text-2xl leading-[1.15] font-semibold">{title}</p>
        <p className="text-foreground/80 text-base leading-[1.5]">{body}</p>
      </div>
    </div>
  );
}

type ToggleProps = {
  locale: Locale;
  tabPro: string;
  tabCustomer: string;
  isPro: boolean;
  onPro: () => void;
  onCustomer: () => void;
};

// Tailwind ltr:/rtl: variants use :lang() selectors, which conflict with this
// project's inverted direction mapping (ar→ltr, en→rtl). Use LOCALE_DIRECTION
// to compute physical translate offset instead, matching the HeroToggle pattern.
function StepsTabToggle({ locale, tabPro, tabCustomer, isPro, onPro, onCustomer }: ToggleProps) {
  const isRtl = LOCALE_DIRECTION[locale] === 'rtl';
  const translateClass = !isPro ? (isRtl ? '-translate-x-[84px]' : 'translate-x-[84px]') : '';

  return (
    <div
      role="tablist"
      aria-label={`${tabPro} / ${tabCustomer}`}
      className="bg-toggle-pill relative flex h-[46px] w-[177px] items-center rounded-full p-[4.5px]"
    >
      <div
        aria-hidden
        className={`bg-toggle-highlight absolute start-[4.5px] top-[5px] h-9 w-[84px] rounded-full transition-transform duration-200 ${translateClass}`}
      />
      <button
        type="button"
        role="tab"
        onClick={onPro}
        aria-selected={isPro}
        className={`relative z-10 flex h-9 w-[84px] items-center justify-center rounded-full text-xs font-semibold tracking-[0.1px] transition-colors ${
          isPro ? 'text-foreground' : 'text-toggle-inactive'
        }`}
      >
        {tabPro}
      </button>
      <button
        type="button"
        role="tab"
        onClick={onCustomer}
        aria-selected={!isPro}
        className={`relative z-10 flex h-9 w-[84px] items-center justify-center rounded-full text-xs font-bold tracking-[0.1px] transition-colors ${
          !isPro ? 'text-foreground' : 'text-toggle-inactive'
        }`}
      >
        {tabCustomer}
      </button>
    </div>
  );
}

export function HowItWorksStepsClient({
  locale,
  tabPro,
  tabCustomer,
  proHeadline,
  proBody,
  customerHeadline,
  customerBody,
  proSteps,
  customerSteps,
}: Props) {
  const [activeTab, setActiveTab] = useState<'pro' | 'customer'>('pro');
  const isPro = activeTab === 'pro';
  const steps = isPro ? proSteps : customerSteps;
  const headline = isPro ? proHeadline : customerHeadline;
  const body = isPro ? proBody : customerBody;

  return (
    <div className="relative flex flex-col gap-8">
      <div className="flex flex-col items-center gap-6 px-4 text-center sm:px-6 xl:px-24">
        <div className="flex flex-col items-center gap-4">
          <StepsTabToggle
            locale={locale}
            tabPro={tabPro}
            tabCustomer={tabCustomer}
            isPro={isPro}
            onPro={() => setActiveTab('pro')}
            onCustomer={() => setActiveTab('customer')}
          />
          <h2 className="text-foreground max-w-[537px] text-4xl leading-[1.15] font-medium tracking-[-0.96px] xl:text-[48px]">
            {headline}
          </h2>
        </div>
        <p className="text-foreground/80 max-w-[550px] text-base leading-[1.5] tracking-[-0.32px]">
          {body}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 sm:px-6 xl:grid-cols-4 xl:px-24">
        {steps.map((step) => (
          <StepCard key={`${activeTab}-${step.number}`} {...step} />
        ))}
      </div>
    </div>
  );
}
