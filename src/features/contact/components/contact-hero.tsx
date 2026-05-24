import Image from 'next/image';

import { getTranslations } from '@/lib/get-translations';
import { type Locale } from '@/types/locale';

import { ContactForm } from './contact-form';

export function ContactHero({ locale }: { locale: Locale }) {
  const { t } = getTranslations(locale);

  return (
    <section
      aria-labelledby="contact-hero-title"
      className="bg-background relative isolate overflow-clip px-4 pt-12 pb-20 sm:px-6 md:pt-16 md:pb-28 lg:pt-20"
    >
      <Image
        src="/images/bg/contact-blob.svg"
        alt=""
        aria-hidden="true"
        width={1639}
        height={1226}
        priority={false}
        className="pointer-events-none absolute -start-[15%] top-[12%] -z-10 hidden h-auto w-[58%] select-none xl:block"
      />
      <Image
        src="/images/bg/contact-blob.svg"
        alt=""
        aria-hidden="true"
        width={1639}
        height={1226}
        priority={false}
        className="pointer-events-none absolute -end-[15%] top-[3%] -z-10 hidden h-auto w-[58%] select-none xl:block"
      />

      <div className="mx-auto flex max-w-[787px] flex-col items-center gap-8 md:gap-12">
        <header className="flex w-full flex-col items-center gap-4 text-center sm:gap-6">
          <p className="text-primary text-base font-semibold tracking-[0.5px]">
            {t('contact.hero.eyebrow')}
          </p>
          <h1
            id="contact-hero-title"
            dir="auto"
            className="text-foreground text-4xl font-semibold tracking-[-0.25px] sm:text-5xl md:text-[56px]"
          >
            {t('contact.hero.title')}
          </h1>
          <p dir="auto" className="text-hero-subtext text-base tracking-[0.5px]">
            {t('contact.hero.subtitle')}
          </p>
        </header>

        <div className="border-contact-card-border bg-background relative w-full rounded-[12px] border p-6 shadow-[0_10px_21px_rgba(117,117,117,0.04),0_39px_39px_rgba(117,117,117,0.02)] backdrop-blur-[5px] sm:p-10 md:p-[45px]">
          <ContactForm locale={locale} />
        </div>
      </div>
    </section>
  );
}
