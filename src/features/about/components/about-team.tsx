import { getTranslations } from '@/lib/get-translations';
import { type Locale } from '@/types/locale';

import { AboutTeamCard } from './about-team-card';

type Props = { locale: Locale };

const MEMBERS = ['m1', 'm2', 'm3', 'm4', 'm5', 'm6'] as const;

/**
 * Figma 654:4743 — Our Team section.
 * Centered headline above 6 team-member cards. The Figma authors the cards as a single
 * fixed-width overflow row (justify-end, off-canvas); per the responsive rules that becomes a
 * mobile-first grid (1 → 2 → 3 cols) so every card is visible without horizontal scroll.
 */
export function AboutTeam({ locale }: Props) {
  const { t } = getTranslations(locale);

  return (
    <section className="bg-background py-16 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center gap-6 text-center">
          <h2
            dir="auto"
            className="text-foreground w-full max-w-[701px] text-[32px] leading-tight font-medium tracking-[-0.25px] md:text-4xl xl:text-[50px]"
          >
            {t('about.team.title')}
          </h2>
          <p
            dir="auto"
            className="text-foreground/80 w-full max-w-[600px] text-base leading-relaxed md:text-lg xl:text-xl"
          >
            {t('about.team.body')}
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 justify-items-center gap-5 sm:mt-16 sm:grid-cols-2 lg:grid-cols-3">
          {MEMBERS.map((m) => (
            <AboutTeamCard
              key={m}
              name={t(`about.team.members.${m}.name`)}
              role={t(`about.team.members.${m}.role`)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
