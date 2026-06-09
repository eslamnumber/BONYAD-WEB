import { getTranslations } from '@/lib/get-translations';
import { type Locale } from '@/types/locale';

type Props = { locale: Locale };

/**
 * Figma 654:4860 — Stats ("Bonyad's Impact") panel.
 * Inset soft panel (--color-about-panel-soft, rounded) with an eyebrow tagline, heading, and body.
 * max-w-7xl centering reproduces the Figma 80px page gutter at 1440.
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
      </div>
    </section>
  );
}
