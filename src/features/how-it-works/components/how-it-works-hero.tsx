import Image from 'next/image';
import Link from 'next/link';

import { ROUTES } from '@/config/routes';
import { getTranslations } from '@/lib/get-translations';
import { type Locale } from '@/types/locale';

type Props = { locale: Locale };

function HeroBgBlob() {
  return (
    <div
      dir="ltr"
      aria-hidden
      className="pointer-events-none absolute end-0 -top-[42px] hidden lg:block lg:h-[600px] lg:w-[425px] xl:h-[800px] xl:w-[566px]"
    >
      <div className="relative h-full w-full -scale-y-100 rotate-180 dark:[filter:invert(1)_hue-rotate(180deg)]">
        <Image src="/images/bg/how-it-works-hero.png" alt="" fill className="object-cover" />
      </div>
    </div>
  );
}

export function HowItWorksHero({ locale }: Props) {
  const { t } = getTranslations(locale);

  return (
    <section className="bg-background relative overflow-hidden">
      <HeroBgBlob />
      <div className="relative mx-auto flex min-h-[480px] max-w-7xl flex-col items-center justify-center gap-6 px-4 py-12 text-center sm:px-6 lg:min-h-[622px] lg:py-20">
        <p className="text-primary text-base font-semibold tracking-[0.5px]">
          {t('howItWorks.hero.tag')}
        </p>
        <h1 className="text-foreground w-full max-w-[463px] text-4xl font-semibold tracking-[-0.25px] sm:text-5xl xl:text-[80px]">
          {t('howItWorks.hero.headline')}
        </h1>
        <p className="text-hero-subtext w-full max-w-[545px] text-base tracking-[0.5px]">
          {t('howItWorks.hero.body')}
        </p>
        <Link
          href={ROUTES.REGISTER}
          className="bg-primary flex h-9 items-center rounded-full px-6 text-base font-bold tracking-[0.15px] text-white"
        >
          {t('howItWorks.hero.cta')}
        </Link>
      </div>
    </section>
  );
}
