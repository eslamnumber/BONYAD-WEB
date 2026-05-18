import Image from 'next/image';
import Link from 'next/link';

import { TrustBadgeIcon } from '@/components/icons';
import { ROUTES } from '@/config/routes';
import { getTranslations } from '@/lib/get-translations';
import { type Locale } from '@/types/locale';

import { HeroToggle } from './hero-toggle';

type HomeHeroProps = { locale: Locale; activeTab?: 'user' | 'pro' };

function HeroBgShape({ className }: { className: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute ${className}`}>
      <Image src="/images/hero/bg-shapes.webp" alt="" fill priority />
    </div>
  );
}

type HeroSearchProps = { action: string; placeholder: string; label: string; cta: string };

function HeroSearch({ action, placeholder, label, cta }: HeroSearchProps) {
  return (
    <form action={action} method="get" className="relative h-[63px] w-[438px]">
      <label htmlFor="hero-search" className="sr-only">{label}</label>
      <input
        id="hero-search"
        name="q"
        type="search"
        placeholder={placeholder}
        className="h-full w-full rounded-full bg-white ps-6 pe-[150px] text-sm shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy"
      />
      <button
        type="submit"
        className="absolute end-[5px] top-[4px] h-[55px] rounded-full bg-brand-navy px-6 text-sm font-medium text-white transition-opacity hover:opacity-90"
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

function HeroProContent({ headline: _headline, subheadline, cta, stat1, stat2 }: HeroProContentProps) {
  return (
    <>
      <p className="max-w-[609px] text-center text-base text-hero-subtext">{subheadline}</p>
      <Link
        href={ROUTES.REGISTER}
        className="rounded-full bg-brand-navy px-8 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        {cta}
      </Link>
      <div className="flex items-center gap-8 text-sm text-muted-foreground">
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
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative h-[622px] overflow-hidden rounded-xl bg-white">
          <HeroBgShape className="-start-[121px] -top-[159px] h-[781px] w-[603px] -scale-y-100 rotate-180" />
          <HeroBgShape className="-end-[44px] -top-[159px] h-[901px] w-[696px]" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-6">
            <HeroToggle
              postLabel={t('home.hero.togglePost')}
              proLabel={t('home.hero.togglePro')}
              headline={t('home.hero.headline')}
              activeTab={activeTab}
              locale={locale}
            />
            <h1 className="max-w-[787px] text-center text-[56px] font-semibold leading-tight text-foreground">
              {headline}
            </h1>
            {activeTab === 'user' ? (
              <>
                <p className="max-w-[609px] text-center text-base text-hero-subtext">
                  {t('home.hero.subheadline')}
                </p>
                <HeroSearch
                  action={ROUTES.TECHNICIANS}
                  placeholder={t('home.hero.searchPlaceholder')}
                  label={t('home.hero.searchLabel')}
                  cta={t('home.hero.searchCta')}
                />
                <div className="flex items-center gap-2 text-[12px] text-muted-foreground/70">
                  <TrustBadgeIcon className="size-4 shrink-0" aria-hidden />
                  <span>{t('home.hero.trustBadge')}</span>
                </div>
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
          </div>
        </div>
      </div>
    </section>
  );
}
