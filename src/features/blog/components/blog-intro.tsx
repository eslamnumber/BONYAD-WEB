import { getTranslations } from '@/lib/get-translations';
import { type Locale } from '@/types/locale';

type BlogIntroProps = { locale: Locale };

export function BlogIntro({ locale }: BlogIntroProps) {
  const { t } = getTranslations(locale);

  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 pt-12 text-center sm:gap-5 sm:pt-16 lg:gap-6 lg:pt-20">
      <h1 className="text-foreground text-3xl font-semibold tracking-[-0.25px] sm:text-4xl lg:text-[50px] lg:leading-[1.1]">
        {t('blog.intro.headline')}
      </h1>
      <p className="text-foreground/80 text-base font-medium tracking-[0.25px]">
        {t('blog.intro.subheadline')}
      </p>
    </section>
  );
}
