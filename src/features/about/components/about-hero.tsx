import Image from 'next/image';

import { getTranslations } from '@/lib/get-translations';
import { type Locale } from '@/types/locale';

type Props = { locale: Locale };

/**
 * Figma: 654:4729 (Hero section, 1440 × 573).
 * Layers:
 *  - 654:4730 image fill (rounded-rectangle, full-bleed photo) + 3-stop white gradient veil
 *  - 654:4731 → 654:4732 content frame (centered + offset 87px below vertical center)
 *  - 654:4733 heading (56px Inter Tight Medium, black)
 *  - 654:4734 body  (16px slate-gray #677084 → token --color-hero-subtext)
 */
export function AboutHero({ locale }: Props) {
  const { t } = getTranslations(locale);

  return (
    <section className="bg-background relative overflow-hidden">
      <div aria-hidden className="absolute inset-0">
        <Image
          src="/images/bg/about-hero.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-top"
        />
        <div className="from-background/40 via-background/63 to-background absolute inset-0 bg-gradient-to-b from-[11.437%] via-[31.021%] to-[88.374%]" />
      </div>

      <div className="relative mx-auto flex min-h-[440px] max-w-[787px] flex-col items-center justify-end gap-8 px-6 pt-32 pb-16 text-center sm:min-h-[480px] lg:min-h-[560px] lg:pt-40 lg:pb-20 xl:min-h-[573px]">
        <h1
          dir="auto"
          className="text-foreground w-full max-w-[595px] text-[36px] leading-[1.15] font-medium tracking-[-0.25px] md:text-[44px] md:leading-[1.1] xl:text-[56px] xl:leading-[1.08]"
        >
          {t('about.hero.title')}
        </h1>
        <p dir="auto" className="text-hero-subtext w-full max-w-[511px] text-base leading-relaxed">
          {t('about.hero.body')}
        </p>
      </div>
    </section>
  );
}
