import { getTranslations } from '@/lib/get-translations';
import { type Locale } from '@/types/locale';

type Props = { locale: Locale };

const STATS = ['s1', 's2', 's3'] as const;

/**
 * Figma 654:4860 — Stats ("Bonyad's Impact") panel.
 * Inset soft panel (--color-about-panel-soft, rounded) with an eyebrow tagline, heading, body,
 * and a 3-up row of stat items (label + value) in navy at 80% opacity. max-w-7xl centering
 * reproduces the Figma 80px page gutter at 1440.
 */
export function AboutStats({ locale }: Props) {
  const { t } = getTranslations(locale);

  return (
    <section className="bg-background px-6 py-12 lg:py-16">
      <div className="bg-about-panel-soft mx-auto flex max-w-7xl flex-col items-center gap-8 rounded-xl px-6 py-8 text-center sm:px-10 lg:px-12">
        <p dir="auto" className="text-foreground text-base leading-[1.5] font-medium">
          {t('about.stats.tagline')}
        </p>
        <h2
          dir="auto"
          className="text-foreground w-full text-[28px] leading-[1.2] font-medium md:text-4xl xl:text-5xl"
        >
          {t('about.stats.title')}
        </h2>
        <p
          dir="auto"
          className="text-foreground w-full max-w-[587px] text-base leading-[1.5] md:text-lg"
        >
          {t('about.stats.body')}
        </p>
        <dl className="text-brand-dark-navy/80 grid w-full max-w-[595px] grid-cols-3 gap-4">
          {STATS.map((s) => (
            <div key={s} className="flex flex-col items-center gap-2">
              <dt dir="auto" className="text-sm leading-normal sm:text-base xl:text-xl">
                {t(`about.stats.items.${s}.label`)}
              </dt>
              <dd dir="auto" className="text-2xl leading-normal font-medium xl:text-[32px]">
                {t(`about.stats.items.${s}.value`)}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
