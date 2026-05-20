'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { type ReactNode, useState, useTransition } from 'react';

import { TrustBadgeIcon } from '@/components/icons';
import { ROUTES } from '@/config/routes';
import { type Locale } from '@/types/locale';

import { HeroSearchBar } from './hero-search-bar';
import { HeroToggle } from './hero-toggle';

export type HeroI18n = {
  postLabel: string;
  proLabel: string;
  headline: string;
  proHeadline: string;
  subheadline: string;
  proSubheadline: string;
  searchLabel: string;
  placeholder: string;
  searchCta: string;
  joinCta: string;
  trustBadge: string;
  proStat1: string;
  proStat2: string;
};

type HeroClientShellProps = {
  locale: Locale;
  initialTab: 'user' | 'pro';
  i18n: HeroI18n;
};

const FADE = { duration: 0.35, ease: [0.4, 0, 0.2, 1] as const };

type CrossfadeLayerProps = { active: boolean; children: ReactNode; className?: string };

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

type TabBlockProps = { isPro: boolean; i18n: HeroI18n };

const H1_CLASS =
  'text-foreground max-w-[787px] text-center text-3xl leading-tight font-semibold sm:text-4xl md:text-5xl lg:text-[56px]';
const P_CLASS = 'text-hero-subtext max-w-[609px] text-center text-sm sm:text-base';
const STACK_CLASS = 'flex w-full flex-col items-center gap-6';

function HeadlineBlock({ isPro, i18n }: TabBlockProps) {
  return (
    <div className="grid w-full [&>*]:[grid-area:1/1]">
      <CrossfadeLayer active={!isPro} className={STACK_CLASS}>
        <h1 className={H1_CLASS}>{i18n.headline}</h1>
        <p className={P_CLASS}>{i18n.subheadline}</p>
      </CrossfadeLayer>
      <CrossfadeLayer active={isPro} className={STACK_CLASS}>
        <h1 className={H1_CLASS}>{i18n.proHeadline}</h1>
        <p className={P_CLASS}>{i18n.proSubheadline}</p>
      </CrossfadeLayer>
    </div>
  );
}

function BadgeBlock({ isPro, i18n }: TabBlockProps) {
  return (
    <div className="grid [&>*]:[grid-area:1/1]">
      <CrossfadeLayer active={!isPro}>
        <div className="text-muted-foreground/70 flex items-center gap-2 text-[12px]">
          <TrustBadgeIcon className="size-4 shrink-0" aria-hidden />
          <span>{i18n.trustBadge}</span>
        </div>
      </CrossfadeLayer>
      <CrossfadeLayer active={isPro}>
        <div className="text-muted-foreground flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm">
          <div className="flex items-center gap-2">
            <TrustBadgeIcon className="size-4 shrink-0" aria-hidden />
            <span>{i18n.proStat1}</span>
          </div>
          <div className="flex items-center gap-2">
            <TrustBadgeIcon className="size-4 shrink-0" aria-hidden />
            <span>{i18n.proStat2}</span>
          </div>
        </div>
      </CrossfadeLayer>
    </div>
  );
}

export function HeroClientShell({ locale, initialTab, i18n }: HeroClientShellProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [tab, setTab] = useState(initialTab);

  function handleTabChange(next: 'user' | 'pro') {
    setTab(next);
    const href = next === 'pro' ? ROUTES.FOR_PROS : ROUTES.HOME;
    startTransition(() => router.push(href));
  }

  const isPro = tab === 'pro';

  return (
    <>
      <HeroToggle
        postLabel={i18n.postLabel}
        proLabel={i18n.proLabel}
        headline={isPro ? i18n.proHeadline : i18n.headline}
        activeTab={tab}
        locale={locale}
        onTabChange={handleTabChange}
      />
      <HeadlineBlock isPro={isPro} i18n={i18n} />
      <HeroSearchBar
        isPro={isPro}
        searchLabel={i18n.searchLabel}
        placeholder={i18n.placeholder}
        searchCta={i18n.searchCta}
        joinCta={i18n.joinCta}
      />
      <BadgeBlock isPro={isPro} i18n={i18n} />
    </>
  );
}
