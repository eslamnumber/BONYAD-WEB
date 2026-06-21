import Image from 'next/image';

import { getTranslations } from '@/lib/get-translations';
import { type Locale } from '@/types/locale';

import { HeroClientShell } from './hero-client-shell';

type HomeHeroProps = { locale: Locale; activeTab?: 'user' | 'pro' };

const BUILDING_SRC = '/images/hero/hero-building.png';

/**
 * Decorative hero backdrop (Figma "Herosection" 1811:3048): the glass-tower photo
 * (1811:3049 / :3050) frames both inline edges — normal on the start, mirrored on
 * the end — at 60% opacity, with a soft card-coloured radial glow ("Ellipse 27"
 * 1811:3051) whitening the centre so the search content reads on a clean surface.
 * Desktop-only (hardcoded size), symmetric so it mirrors with the locale for free,
 * and inverts in dark mode so the white sky blends into the dark card.
 */
function HeroBuildingsBackdrop() {
  const building =
    'absolute -top-[89px] hidden h-[711px] w-[573px] max-w-none object-cover opacity-60 select-none lg:block dark:opacity-70 dark:invert';
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <Image
        src={BUILDING_SRC}
        alt=""
        width={1146}
        height={2292}
        sizes="573px"
        priority
        className={`${building} -start-[44px]`}
      />
      <Image
        src={BUILDING_SRC}
        alt=""
        width={1146}
        height={2292}
        sizes="573px"
        className={`${building} -end-[44px] -scale-x-100`}
      />
      {/* Card-coloured radial glow whitens the centre and softens the buildings'
          inner edges — var(--card) adapts to dark mode. */}
      <div className="absolute inset-0 [background:radial-gradient(58%_78%_at_50%_48%,var(--card),transparent_72%)]" />
    </div>
  );
}

export function HomeHero({ locale, activeTab = 'user' }: HomeHeroProps) {
  const { t } = getTranslations(locale);

  return (
    <section className="bg-background py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="bg-card relative min-h-[520px] overflow-hidden rounded-xl lg:h-[622px]">
          <HeroBuildingsBackdrop />
          <div className="relative flex flex-col items-center justify-center gap-6 px-4 py-12 sm:px-6 lg:absolute lg:inset-0 lg:py-0">
            <HeroClientShell
              key={activeTab}
              locale={locale}
              initialTab={activeTab}
              i18n={{
                postLabel: t('home.hero.togglePost'),
                proLabel: t('home.hero.togglePro'),
                eyebrow: t('home.hero.eyebrow'),
                headline: t('home.hero.headline'),
                proHeadline: t('tech.hero.proHeadline'),
                subheadline: t('home.hero.subheadline'),
                proSubheadline: t('tech.hero.proSubheadline'),
                searchLabel: t('home.hero.searchLabel'),
                placeholder: t('home.hero.searchPlaceholder'),
                searchCta: t('home.hero.searchCta'),
                joinCta: t('tech.hero.proCta'),
                trustBadgePrefix: t('home.hero.trustBadgePrefix'),
                trustBadgeAnd: t('home.hero.trustBadgeAnd'),
                trustBadgeAbsher: t('home.hero.trustBadgeAbsher'),
                trustBadgeNafath: t('home.hero.trustBadgeNafath'),
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
