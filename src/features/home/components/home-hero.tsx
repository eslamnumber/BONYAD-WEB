import Image from 'next/image';

import { getTranslations } from '@/lib/get-translations';
import { type Locale } from '@/types/locale';

import { HeroClientShell } from './hero-client-shell';

type HomeHeroProps = { locale: Locale; activeTab?: 'user' | 'pro' };

function HeroBgShapeEnd() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute -end-[121px] -top-[159px] hidden h-[901px] w-[696px] lg:block"
    >
      <Image src="/images/hero/bg-left.png" alt="" fill priority className="dark:brightness-0" />
      {/* Fades the inner edge and top into the card background — var(--card) adapts to dark mode */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(to left, transparent 38%, var(--card) 78%), linear-gradient(to bottom, var(--card), transparent 18%)',
        }}
      />
    </div>
  );
}

export function HomeHero({ locale, activeTab = 'user' }: HomeHeroProps) {
  const { t } = getTranslations(locale);

  return (
    <section className="bg-background py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="bg-card relative min-h-[520px] overflow-hidden rounded-xl lg:h-[622px]">
          <HeroBgShapeEnd />
          <div className="relative flex flex-col items-center justify-center gap-6 px-4 py-12 sm:px-6 lg:absolute lg:inset-0 lg:py-0">
            <HeroClientShell
              key={activeTab}
              locale={locale}
              initialTab={activeTab}
              i18n={{
                postLabel: t('home.hero.togglePost'),
                proLabel: t('home.hero.togglePro'),
                headline: t('home.hero.headline'),
                proHeadline: t('tech.hero.proHeadline'),
                subheadline: t('home.hero.subheadline'),
                proSubheadline: t('tech.hero.proSubheadline'),
                searchLabel: t('home.hero.searchLabel'),
                placeholder: t('home.hero.searchPlaceholder'),
                searchCta: t('home.hero.searchCta'),
                joinCta: t('tech.hero.proCta'),
                trustBadge: t('home.hero.trustBadge'),
                proStat1: t('tech.hero.proStat1'),
                proStat2: t('tech.hero.proStat2'),
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
