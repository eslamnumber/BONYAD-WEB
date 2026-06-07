'use client';

import { useTranslation } from 'react-i18next';

/**
 * Messages screen heading (Figma 1046:7490) — 32px Medium title over a 16px
 * regular subtitle, scaling 24→32 mobile-first. Alignment follows each line's
 * own `dir="auto"` (its content's direction), so the heading sits on the right
 * in ar and the left in en — `text-end` can't be used here because `dir="auto"`
 * would flip it to the wrong side for the RTL Arabic script.
 */
export function SectionTitle() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-2">
      <h1 dir="auto" className="text-foreground w-full text-2xl font-medium md:text-[32px]">
        {t('messages.title')}
      </h1>
      <p dir="auto" className="text-foreground/80 w-full text-base">
        {t('messages.subtitle')}
      </p>
    </div>
  );
}
