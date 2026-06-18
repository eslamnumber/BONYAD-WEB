'use client';

import { useTranslation } from 'react-i18next';

import { SaudiRiyalIcon } from '@/components/icons';

/**
 * Hero block for the transactions screen: the Saudi-Riyal glyph in a primary chip,
 * the title, and a punctuated sub-blurb (so it carries `dir="auto"`). Centred,
 * mirroring the sibling cards screen header.
 */
export function TransactionsHeader() {
  const { t } = useTranslation();
  return (
    <header className="flex flex-col items-center gap-3 text-center">
      <span className="bg-primary/10 text-primary flex size-16 items-center justify-center rounded-2xl">
        <SaudiRiyalIcon className="h-8 w-auto" aria-hidden />
      </span>
      <h1 className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">
        {t('dashboard.transactions.title')}
      </h1>
      <p dir="auto" className="text-muted-foreground max-w-md text-sm leading-6">
        {t('dashboard.transactions.subtitle')}
      </p>
    </header>
  );
}
