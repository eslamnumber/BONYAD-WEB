import { getTranslations } from '@/lib/get-translations';
import { type Locale } from '@/types/locale';

import { AboutTimelineEntry } from './about-timeline-entry';

type Props = { locale: Locale };

const MILESTONES = ['founding', 'research', 'building', 'launch'] as const;

/**
 * Figma 654:4778 — Timeline section.
 * Soft panel (--color-about-panel-soft) with a sticky section title (654:4830) beside a
 * column of 4 milestone entries (654:4781), each on a vivid-blue progress rail.
 * Title-first DOM for reading order; `lg:flex-row-reverse` puts the title on the end side
 * (right in ar, left in en) to match Figma while mirroring with locale direction.
 */
export function AboutTimeline({ locale }: Props) {
  const { t } = getTranslations(locale);

  return (
    <section className="bg-about-panel-soft relative px-6 py-16 sm:py-20 lg:px-16 lg:py-28">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 lg:flex-row-reverse lg:items-start lg:gap-4">
        <div className="flex flex-col items-end gap-6 text-start lg:sticky lg:top-28 lg:h-[214px] lg:w-[576px] lg:shrink-0 lg:justify-center">
          <h2
            dir="auto"
            className="text-foreground w-full text-3xl leading-[1.2] font-medium md:text-4xl xl:text-[45px]"
          >
            {t('about.timeline.sectionTitle')}
          </h2>
          <p dir="auto" className="text-foreground w-full text-base leading-[1.5]">
            {t('about.timeline.sectionBody')}
          </p>
        </div>

        <div className="flex flex-1 flex-col">
          {MILESTONES.map((key) => (
            <AboutTimelineEntry
              key={key}
              year={t(`about.timeline.items.${key}.year`)}
              title={t(`about.timeline.items.${key}.title`)}
              body={t(`about.timeline.items.${key}.body`)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
