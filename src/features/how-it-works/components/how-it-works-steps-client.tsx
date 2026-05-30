'use client';

import { motion } from 'framer-motion';
import { useState, type ReactNode } from 'react';

import { LOCALE_DIRECTION, type Locale } from '@/types/locale';

import { StepCard, type StepCardData } from './how-it-works-step-card';

export type StepItem = StepCardData;

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

type ToggleProps = {
  locale: Locale;
  tabPro: string;
  tabCustomer: string;
  isPro: boolean;
  onPro: () => void;
  onCustomer: () => void;
};

// Pill geometry: 177×46 outer, 84×36 highlighter, 4.5px inset each side.
// framer-motion x is a raw pixel transform so we negate under RTL — same
// pattern as HeroToggle (LOCALE_DIRECTION is the single source of truth).
const PILL_TRAVEL = 84;
const FADE = { duration: 0.35, ease: [0.4, 0, 0.2, 1] as const };
const H2_CLASS =
  'text-foreground max-w-[537px] text-4xl leading-[1.15] font-medium tracking-[-0.96px] xl:text-[48px]';
const P_CLASS = 'text-foreground/80 max-w-[550px] text-base leading-[1.5] tracking-[-0.32px]';
const STACK_CLASS = 'flex w-full flex-col items-center gap-6';

function StepsTabToggle({ locale, tabPro, tabCustomer, isPro, onPro, onCustomer }: ToggleProps) {
  const isRtl = LOCALE_DIRECTION[locale] === 'rtl';
  const offset = isPro ? 0 : isRtl ? -PILL_TRAVEL : PILL_TRAVEL;

  return (
    <div
      role="tablist"
      aria-label={`${tabPro} / ${tabCustomer}`}
      className="bg-toggle-pill relative flex h-[46px] w-[177px] items-center rounded-full p-[4.5px]"
    >
      <motion.div
        aria-hidden
        className="bg-toggle-highlight absolute start-[4.5px] top-[5px] h-9 w-[84px] rounded-full"
        initial={false}
        animate={{ x: offset }}
        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
      />
      <button
        type="button"
        role="tab"
        onClick={onPro}
        aria-selected={isPro}
        className={`relative z-10 flex h-9 w-[84px] items-center justify-center rounded-full text-xs font-semibold tracking-[0.1px] transition-colors ${isPro ? 'text-foreground' : 'text-toggle-inactive'}`}
      >
        {tabPro}
      </button>
      <button
        type="button"
        role="tab"
        onClick={onCustomer}
        aria-selected={!isPro}
        className={`relative z-10 flex h-9 w-[84px] items-center justify-center rounded-full text-xs font-semibold tracking-[0.1px] transition-colors ${!isPro ? 'text-foreground' : 'text-toggle-inactive'}`}
      >
        {tabCustomer}
      </button>
    </div>
  );
}

type CrossfadeLayerProps = { active: boolean; children: ReactNode; className?: string };

// Mirrors hero-client-shell.tsx: both layers stay mounted so the grid cell
// holds the max height of pro/customer copy and the swap is a pure opacity
// crossfade. pointer-events gate keeps the inactive layer from intercepting.
function CrossfadeLayer({ active, children, className }: CrossfadeLayerProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: active ? 1 : 0 }}
      animate={{ opacity: active ? 1 : 0 }}
      transition={FADE}
      aria-hidden={!active}
      style={{ pointerEvents: active ? 'auto' : 'none' }}
    >
      {children}
    </motion.div>
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

  return (
    <div className="relative flex flex-col gap-8">
      <div className="flex flex-col items-center gap-4 px-4 text-center sm:px-6 xl:px-24">
        <StepsTabToggle
          locale={locale}
          tabPro={tabPro}
          tabCustomer={tabCustomer}
          isPro={isPro}
          onPro={() => setActiveTab('pro')}
          onCustomer={() => setActiveTab('customer')}
        />
        <div className="grid w-full [&>*]:[grid-area:1/1]">
          <CrossfadeLayer active={isPro} className={STACK_CLASS}>
            <h2 className={H2_CLASS}>{proHeadline}</h2>
            <p className={P_CLASS}>{proBody}</p>
          </CrossfadeLayer>
          <CrossfadeLayer active={!isPro} className={STACK_CLASS}>
            <h2 className={H2_CLASS}>{customerHeadline}</h2>
            <p className={P_CLASS}>{customerBody}</p>
          </CrossfadeLayer>
        </div>
      </div>
      <div className="flex [scrollbar-width:none] gap-4 overflow-x-auto px-4 pb-2 sm:px-6 xl:grid xl:grid-cols-4 xl:overflow-visible xl:px-24 [&::-webkit-scrollbar]:hidden">
        {steps.map((step) => (
          <div key={`${activeTab}-${step.number}`} className="w-[306px] shrink-0 xl:w-auto">
            <StepCard {...step} />
          </div>
        ))}
      </div>
    </div>
  );
}
