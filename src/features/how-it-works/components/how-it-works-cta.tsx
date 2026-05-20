import Image from 'next/image';
import Link from 'next/link';

import { ROUTES } from '@/config/routes';
import { getTranslations } from '@/lib/get-translations';
import { type Locale } from '@/types/locale';

type Props = { locale: Locale };

export function HowItWorksCta({ locale }: Props) {
  const { t } = getTranslations(locale);

  return (
    <section className="bg-background py-12 sm:py-16">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
        <div className="border-border bg-primary/10 relative min-h-[366px] overflow-hidden rounded-2xl border backdrop-blur-[140px]">
          <div
            aria-hidden
            className="pointer-events-none absolute start-[-78px] -top-8 hidden lg:block lg:h-[467px] lg:w-[600px] xl:h-[597px] xl:w-[767px]"
          >
            <Image src="/images/how-it-works/cta-city.png" alt="" fill className="object-cover" />
          </div>
          <div className="relative flex flex-col items-end gap-6 px-6 py-12 sm:px-12 lg:py-16 lg:ps-[440px] lg:pe-10 xl:py-16 xl:ps-[562px] xl:pe-16">
            <p className="text-foreground w-full max-w-[516px] text-end text-4xl font-medium xl:text-[45px]">
              {t('howItWorks.cta.headline')}
            </p>
            <p className="text-foreground/60 w-full max-w-[625px] text-end text-xl xl:text-2xl">
              {t('howItWorks.cta.body')}
            </p>
            <Link
              href={ROUTES.FOR_PROS}
              className="bg-primary flex items-center justify-center rounded-full px-4 py-2.5 text-base font-bold tracking-[0.1px] text-white"
            >
              {t('howItWorks.cta.button')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
