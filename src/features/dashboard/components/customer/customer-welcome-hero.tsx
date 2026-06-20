'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { ROUTES } from '@/config/routes';
import { useAuthStore } from '@/stores/auth-store';

const PRIMARY_CTA =
  'bg-brand-dark-navy text-on-media focus-visible:outline-ring rounded-full px-4 py-2.5 text-sm font-semibold transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 motion-safe:hover:opacity-90';
const SECONDARY_CTA =
  'text-brand-dark-navy focus-visible:outline-ring rounded-lg px-4 py-2.5 text-sm font-semibold transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 motion-safe:hover:opacity-80';

/**
 * Customer dashboard welcome hero (Figma 1394:6489) — a personalised greeting +
 * intro line, then the primary "start a project" pill and a secondary
 * "how it works" text button. Static marketing copy with the first name from the
 * auth session. Anchored to the content's end edge (right in ar, left in en);
 * both leaves carry dir="auto" + text-start so the trailing "!"/"." stay attached
 * and alignment mirrors with the locale (docs/i18n-and-rtl.md §bidi).
 */
export function CustomerWelcomeHero() {
  const { t } = useTranslation();
  const name = useAuthStore((s) => s.user?.name);
  const firstName = name?.trim().split(/\s+/)[0];

  return (
    <section className="flex w-full max-w-[599px] flex-col items-end gap-[45px] self-end">
      <div className="flex w-full flex-col items-end gap-6">
        <h1
          dir="auto"
          className="text-foreground w-full text-start text-[clamp(2rem,5vw,2.8125rem)] leading-[1.45] font-medium"
        >
          {firstName
            ? t('dashboard.customer.hero.greetingNamed', { name: firstName })
            : t('dashboard.customer.hero.greeting')}
          <br aria-hidden />
          {t('dashboard.customer.hero.headline')}
        </h1>
        <p dir="auto" className="text-foreground/60 w-full text-start text-xl leading-normal">
          {t('dashboard.customer.hero.description')}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1">
        <Link href={ROUTES.DASHBOARD_PROJECTS_CREATE} className={PRIMARY_CTA}>
          {t('dashboard.customer.cta.startProject')}
        </Link>
        <Link href={ROUTES.HOW_IT_WORKS} dir="auto" className={SECONDARY_CTA}>
          {t('dashboard.customer.cta.howItWorks')}
        </Link>
      </div>
    </section>
  );
}
