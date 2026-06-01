import { getTranslations } from '@/lib/get-translations';
import { type Locale } from '@/types/locale';

import { AboutPillarCardMission } from './about-pillar-card-mission';
import { AboutPillarCardValue } from './about-pillar-card-value';
import { AboutPillarCardVision } from './about-pillar-card-vision';

type Props = { locale: Locale };

/**
 * Figma 654:4735 — Services Section.
 * Header (654:4736) above a row of 3 cards (Value / Mission / Vision).
 * Cards: 414×509 each, gap 20, row at top:196 of section in Figma (1440-wide).
 * Mobile-first responsive — cards stack vertically and shrink the header.
 * All three cards (Value / Mission / Vision) share AboutPillarCardShell.
 */
export function AboutPillars({ locale }: Props) {
  const { t } = getTranslations(locale);
  return (
    <section className="bg-background relative overflow-hidden py-16 sm:py-20 lg:py-28">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-6 text-center">
        <h2
          dir="auto"
          className="text-foreground w-full max-w-[701px] text-[32px] leading-tight font-medium tracking-[-0.25px] md:text-4xl xl:text-[50px]"
        >
          {t('about.pillars.sectionTitle')}
        </h2>
        <p
          dir="auto"
          className="text-foreground/80 w-full max-w-[785px] text-base leading-relaxed md:text-lg xl:text-xl"
        >
          {t('about.pillars.sectionBody')}
        </p>
      </div>

      <div className="mx-auto mt-12 grid w-full max-w-[1282px] grid-cols-1 justify-items-center gap-5 px-6 sm:mt-16 md:grid-cols-2 lg:grid-cols-3 lg:px-0">
        <AboutPillarCardValue locale={locale} />
        <AboutPillarCardMission locale={locale} />
        <AboutPillarCardVision locale={locale} />
      </div>
    </section>
  );
}
