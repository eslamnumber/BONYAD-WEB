'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

import { ROUTES } from '@/config/routes';
import { LOCALE_DIRECTION, type Locale } from '@/types/locale';

type HeroToggleProps = {
  postLabel: string;
  proLabel: string;
  headline: string;
  activeTab: 'user' | 'pro';
  locale: Locale;
  onTabChange: (tab: 'user' | 'pro') => void;
};

// Pill geometry matches Figma 1:4432;271:151 — 248×58 outer, 122×48 highlighter,
// 5px inset on each side. The active pill always sits on the start side so the
// layout mirrors automatically between LTR and RTL.
const PILL_TRAVEL = 121;

type TabLinkProps = {
  href: string;
  label: string;
  isActive: boolean;
  onSelect: () => void;
};

function TabLink({ href, label, isActive, onSelect }: TabLinkProps) {
  return (
    <Link
      href={href}
      onClick={(e) => {
        e.preventDefault();
        onSelect();
      }}
      role="tab"
      aria-selected={isActive}
      aria-current={isActive ? 'page' : undefined}
      className={`relative z-10 flex h-[48px] w-[122px] items-center justify-center text-[12px] font-semibold transition-colors ${isActive ? 'text-foreground' : 'text-toggle-inactive'}`}
    >
      {label}
    </Link>
  );
}

export function HeroToggle({
  postLabel,
  proLabel,
  headline,
  activeTab,
  locale,
  onTabChange,
}: HeroToggleProps) {
  // framer-motion's `x` is a raw CSS pixel transform that ignores writing-mode,
  // so we negate it under RTL. Direction is read from LOCALE_DIRECTION (single
  // source of truth) rather than `locale === 'ar'`.
  const rtl = LOCALE_DIRECTION[locale] === 'rtl';
  const offset = activeTab === 'user' ? 0 : rtl ? -PILL_TRAVEL : PILL_TRAVEL;

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
        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
      />
      <TabLink
        href={ROUTES.HOME}
        label={postLabel}
        isActive={activeTab === 'user'}
        onSelect={() => onTabChange('user')}
      />
      <TabLink
        href={ROUTES.FOR_PROS}
        label={proLabel}
        isActive={activeTab === 'pro'}
        onSelect={() => onTabChange('pro')}
      />
    </div>
  );
}
