'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTransition, type MouseEvent } from 'react';

import { ROUTES } from '@/config/routes';
import { LOCALE_DIRECTION, type Locale } from '@/types/locale';

type HeroToggleProps = {
  postLabel: string;
  proLabel: string;
  headline: string;
  activeTab: 'user' | 'pro';
  locale: Locale;
};

// Pill geometry matches Figma 1:4432;271:151 — 248×58 outer, 122×48 highlighter,
// 5px inset on each side. The active pill always sits on the start side so the
// layout mirrors automatically between LTR and RTL.
const PILL_TRAVEL = 121;

export function HeroToggle({ postLabel, proLabel, headline, activeTab, locale }: HeroToggleProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  // framer-motion's `x` is a raw CSS pixel transform that ignores writing-mode,
  // so we negate it under RTL. Direction is read from LOCALE_DIRECTION (single
  // source of truth) rather than `locale === 'ar'`.
  const rtl = LOCALE_DIRECTION[locale] === 'rtl';
  const offset = activeTab === 'user' ? 0 : rtl ? -PILL_TRAVEL : PILL_TRAVEL;

  function navigate(href: string) {
    return (event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      startTransition(() => router.push(href));
    };
  }

  return (
    <div
      role="tablist"
      aria-label={headline}
      className="bg-toggle-pill relative flex h-[58px] w-[248px] items-center rounded-full p-[5px]"
    >
      <motion.div
        aria-hidden
        className="bg-toggle-highlight absolute start-[5px] top-[5px] h-[48px] w-[122px] rounded-full shadow-sm"
        initial={false}
        animate={{ x: offset }}
        transition={{ type: 'spring', stiffness: 500, damping: 38 }}
      />
      <Link
        href={ROUTES.HOME}
        onClick={navigate(ROUTES.HOME)}
        role="tab"
        aria-selected={activeTab === 'user'}
        aria-current={activeTab === 'user' ? 'page' : undefined}
        className={`relative z-10 flex h-[48px] w-[122px] items-center justify-center text-[12px] font-semibold transition-colors ${activeTab === 'user' ? 'text-foreground' : 'text-toggle-inactive'}`}
      >
        {postLabel}
      </Link>
      <Link
        href={ROUTES.FOR_PROS}
        onClick={navigate(ROUTES.FOR_PROS)}
        role="tab"
        aria-selected={activeTab === 'pro'}
        aria-current={activeTab === 'pro' ? 'page' : undefined}
        className={`relative z-10 flex h-[48px] w-[122px] items-center justify-center text-[12px] font-semibold transition-colors ${activeTab === 'pro' ? 'text-foreground' : 'text-toggle-inactive'}`}
      >
        {proLabel}
      </Link>
    </div>
  );
}
