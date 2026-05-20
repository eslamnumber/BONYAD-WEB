import Image from 'next/image';
import Link from 'next/link';

import { TrustBadgeIcon } from '@/components/icons';
import { ROUTES } from '@/config/routes';
import { getTranslations } from '@/lib/get-translations';
import { type Locale } from '@/types/locale';

import { HeroContentTransition } from './hero-content-transition';
import { HeroToggle } from './hero-toggle';

type HomeHeroProps = { locale: Locale; activeTab?: 'user' | 'pro' };

function HeroTrustBadge({ label }: { label: string }) {
  return (
    <div className="text-muted-foreground/70 flex items-center gap-2 text-[12px]">
      <TrustBadgeIcon className="size-4 shrink-0" aria-hidden />
      <span>{label}</span>
    </div>
  );
}

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

type HeroSearchProps = { action: string; placeholder: string; label: string; cta: string };

function HeroSearch({ action, placeholder, label, cta }: HeroSearchProps) {
  return (
    <form action={action} method="get" className="relative h-[63px] w-full max-w-[438px]">
      <label htmlFor="hero-search" className="sr-only">
        {label}
      </label>
      <input
        id="hero-search"
        name="q"
        type="search"
        placeholder={placeholder}
        className="bg-card text-foreground focus-visible:ring-brand-navy h-full w-full rounded-full ps-6 pe-[120px] text-sm shadow-md focus-visible:ring-2 focus-visible:outline-none sm:pe-[150px]"
      />
      <button
        type="submit"
        className="bg-brand-navy absolute end-[5px] top-[4px] h-[55px] rounded-full px-4 text-sm font-medium text-white transition-opacity hover:opacity-90 sm:px-6"
      >
        {cta}
      </button>
    </form>
  );
}

type HeroProContentProps = {
  headline: string;
  subheadline: string;
  cta: string;
  stat1: string;
  stat2: string;
};

function HeroProContent({
  headline: _headline,
  subheadline,
  cta,
  stat1,
  stat2,
}: HeroProContentProps) {
  return (
    <>
      <p className="text-hero-subtext max-w-[609px] text-center text-sm sm:text-base">
        {subheadline}
      </p>
      <Link
        href={ROUTES.REGISTER}
        className="bg-brand-navy rounded-full px-8 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        {cta}
      </Link>
      <div className="text-muted-foreground flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm">
        <div className="flex items-center gap-2">
          <TrustBadgeIcon className="size-4 shrink-0" aria-hidden />
          <span>{stat1}</span>
        </div>
        <div className="flex items-center gap-2">
          <TrustBadgeIcon className="size-4 shrink-0" aria-hidden />
          <span>{stat2}</span>
        </div>
      </div>
    </>
  );
}

export function HomeHero({ locale, activeTab = 'user' }: HomeHeroProps) {
  const { t } = getTranslations(locale);
  const headline = activeTab === 'pro' ? t('tech.hero.proHeadline') : t('home.hero.headline');

  return (
    <section className="bg-background py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="bg-card relative min-h-[520px] overflow-hidden rounded-xl lg:h-[622px]">
          <HeroBgShapeEnd />
          <div className="relative flex flex-col items-center justify-center gap-6 px-4 py-12 sm:px-6 lg:absolute lg:inset-0 lg:py-0">
            <HeroToggle
              postLabel={t('home.hero.togglePost')}
              proLabel={t('home.hero.togglePro')}
              headline={t('home.hero.headline')}
              activeTab={activeTab}
              locale={locale}
            />
            <HeroContentTransition>
              <h1 className="text-foreground max-w-[787px] text-center text-3xl leading-tight font-semibold sm:text-4xl md:text-5xl lg:text-[56px]">
                {headline}
              </h1>
              {activeTab === 'user' ? (
                <>
                  <p className="text-hero-subtext max-w-[609px] text-center text-sm sm:text-base">
                    {t('home.hero.subheadline')}
                  </p>
                  <HeroSearch
                    action={ROUTES.TECHNICIANS}
                    placeholder={t('home.hero.searchPlaceholder')}
                    label={t('home.hero.searchLabel')}
                    cta={t('home.hero.searchCta')}
                  />
                  <HeroTrustBadge label={t('home.hero.trustBadge')} />
                </>
              ) : (
                <HeroProContent
                  headline={headline}
                  subheadline={t('tech.hero.proSubheadline')}
                  cta={t('tech.hero.proCta')}
                  stat1={t('tech.hero.proStat1')}
                  stat2={t('tech.hero.proStat2')}
                />
              )}
            </HeroContentTransition>
          </div>
        </div>
      </div>
    </section>
  );
}
