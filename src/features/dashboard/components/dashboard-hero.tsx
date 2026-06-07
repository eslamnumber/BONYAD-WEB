'use client';

import { useTranslation } from 'react-i18next';

/**
 * Dashboard hero — the page's primary heading + intro line, anchored to the
 * content's end edge (right in ar, left in en). Static marketing copy. Both
 * leaves carry dir="auto" + text-start so the description's trailing "." stays
 * attached and alignment mirrors with the locale (docs/i18n-and-rtl.md §bidi).
 */
export function DashboardHero() {
  const { t } = useTranslation();

  return (
    <section className="flex w-full max-w-[566px] flex-col items-end gap-5 self-end">
      <h1
        dir="auto"
        className="text-foreground w-full text-start text-[clamp(2.25rem,6vw,4rem)] leading-[1.2] font-medium"
      >
        {t('dashboard.hero.headline')}
      </h1>
      <p
        dir="auto"
        className="text-foreground/60 w-full text-start text-xl leading-normal font-medium"
      >
        {t('dashboard.hero.description')}
      </p>
    </section>
  );
}
