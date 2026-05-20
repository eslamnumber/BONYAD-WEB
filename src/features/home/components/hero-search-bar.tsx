'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { type RefObject, useRef } from 'react';

import { ROUTES } from '@/config/routes';

type HeroSearchBarProps = {
  isPro: boolean;
  searchLabel: string;
  placeholder: string;
  searchCta: string;
  joinCta: string;
};

type SearchFormPanelProps = {
  isPro: boolean;
  formRef: RefObject<HTMLFormElement | null>;
  searchLabel: string;
  placeholder: string;
};

type ActionPanelProps = {
  isPro: boolean;
  btnW: number;
  searchCta: string;
  joinCta: string;
  onSearchClick: () => void;
};

const EASE = [0.4, 0, 0.2, 1] as const;
const FADE = { duration: 0.3, ease: EASE };
const CSS_TRANSITION = 'width 0.45s cubic-bezier(0.4, 0, 0.2, 1)';

function SearchFormPanel({ isPro, formRef, searchLabel, placeholder }: SearchFormPanelProps) {
  return (
    <AnimatePresence initial={false}>
      {!isPro && (
        <motion.form
          key="search-form"
          ref={formRef}
          action={ROUTES.TECHNICIANS}
          method="get"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={FADE}
          className="absolute inset-0 flex items-center ps-6 pe-[140px]"
        >
          <label htmlFor="hero-q" className="sr-only">
            {searchLabel}
          </label>
          <input
            id="hero-q"
            name="q"
            type="search"
            placeholder={placeholder}
            className="text-foreground placeholder:text-muted-foreground focus-visible:ring-brand-navy w-full bg-transparent text-sm focus-visible:ring-2 focus-visible:outline-none"
          />
        </motion.form>
      )}
    </AnimatePresence>
  );
}

function ActionPanel({ isPro, btnW, searchCta, joinCta, onSearchClick }: ActionPanelProps) {
  return (
    <div
      className="bg-brand-navy absolute end-[5px] top-[4px] h-[55px] overflow-hidden rounded-full"
      style={{ width: btnW, transition: CSS_TRANSITION }}
    >
      <AnimatePresence initial={false}>
        {isPro ? (
          <motion.div
            key="pro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={FADE}
            className="size-full"
          >
            <Link
              href={ROUTES.REGISTER}
              className="flex size-full items-center justify-center px-6 text-sm font-medium whitespace-nowrap text-white transition-opacity hover:opacity-90"
            >
              {joinCta}
            </Link>
          </motion.div>
        ) : (
          <motion.div
            key="user"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={FADE}
            className="size-full"
          >
            <button
              type="button"
              onClick={onSearchClick}
              className="flex size-full items-center justify-center px-4 text-sm font-medium whitespace-nowrap text-white transition-opacity hover:opacity-90"
            >
              {searchCta}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function HeroSearchBar({
  isPro,
  searchLabel,
  placeholder,
  searchCta,
  joinCta,
}: HeroSearchBarProps) {
  const formRef = useRef<HTMLFormElement>(null);

  // CSS-driven width transition — applied via style so SSR sets the correct initial size
  const barW = isPro ? 193 : 438;
  const btnW = isPro ? 183 : 130;

  return (
    <div
      className="bg-card relative h-[63px] overflow-hidden rounded-full shadow-[0px_4px_20px_rgba(0,0,0,0.1)]"
      style={{ width: barW, maxWidth: '100%', transition: CSS_TRANSITION }}
    >
      <SearchFormPanel
        isPro={isPro}
        formRef={formRef}
        searchLabel={searchLabel}
        placeholder={placeholder}
      />
      <ActionPanel
        isPro={isPro}
        btnW={btnW}
        searchCta={searchCta}
        joinCta={joinCta}
        onSearchClick={() => formRef.current?.requestSubmit()}
      />
    </div>
  );
}
