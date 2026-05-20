import { ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { ContactChatIcon, ContactEmailIcon } from '@/components/icons';
import { ROUTES } from '@/config/routes';
import { getTranslations } from '@/lib/get-translations';
import { type Locale } from '@/types/locale';

type TFn = ReturnType<typeof getTranslations>['t'];
type Props = { locale: Locale };

function SectionHeader({ t }: { t: TFn }) {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <p className="text-primary text-base font-semibold tracking-[0.5px] uppercase">
        {t('howItWorks.contact.subtitle')}
      </p>
      <h2 className="text-foreground w-full text-4xl font-medium tracking-[-0.96px] sm:text-5xl xl:text-[48px]">
        {t('howItWorks.contact.headline')}
      </h2>
      <p className="text-foreground/60 w-full max-w-[536px] text-base tracking-[-0.32px]">
        {t('howItWorks.contact.body')}
      </p>
    </div>
  );
}

function EmailCard({ t }: { t: TFn }) {
  return (
    <div className="border-border flex flex-1 flex-col items-end justify-center gap-6 rounded-2xl border p-8">
      <div aria-hidden>
        <ContactEmailIcon width={36} height={36} />
      </div>
      <div className="flex w-full flex-col items-end gap-4">
        <p className="text-foreground w-full text-end text-3xl font-medium tracking-[-0.64px]">
          {t('howItWorks.contact.email.title')}
        </p>
        <p className="text-foreground/60 w-full text-end text-base tracking-[-0.32px]">
          {t('howItWorks.contact.email.body')}
        </p>
        <a
          href="mailto:support@bonyad.com"
          className="text-foreground flex items-center gap-2 py-1 text-base font-medium tracking-[-0.32px]"
        >
          <ChevronRight className="size-3 ltr:-scale-x-100" aria-hidden />
          {t('howItWorks.contact.email.address')}
        </a>
      </div>
    </div>
  );
}

function ChatCard({ t }: { t: TFn }) {
  return (
    <div className="border-border flex flex-1 flex-col items-end justify-center gap-6 rounded-2xl border p-8">
      <div aria-hidden>
        <ContactChatIcon width={36} height={36} />
      </div>
      <div className="flex w-full flex-col items-end gap-4">
        <p className="text-foreground w-full text-end text-3xl font-medium tracking-[-0.64px]">
          {t('howItWorks.contact.chat.title')}
        </p>
        <p className="text-foreground/60 w-full text-end text-base tracking-[-0.32px]">
          {t('howItWorks.contact.chat.body')}
        </p>
        <Link
          href={ROUTES.CONTACT}
          className="bg-primary flex items-center justify-center rounded-full px-4 py-2.5 text-xs font-semibold tracking-[0.1px] text-white"
        >
          {t('howItWorks.contact.chat.cta')}
        </Link>
      </div>
    </div>
  );
}

function LocationCard({ t }: { t: TFn }) {
  return (
    <div className="border-border flex min-h-[400px] flex-1 overflow-hidden rounded-2xl border lg:min-h-[612px]">
      <div className="relative hidden flex-1 sm:block">
        <Image src="/images/contact/sa-landscape.jpg" alt="" fill className="object-cover" />
      </div>
      <div className="flex flex-1 flex-col justify-center gap-12 p-6">
        <div className="flex flex-col items-end gap-6">
          <p className="text-primary text-base font-semibold uppercase">
            {t('howItWorks.contact.location.subtitle')}
          </p>
          <p className="text-foreground w-full text-end text-4xl font-medium tracking-[-0.9px] xl:text-[45px]">
            {t('howItWorks.contact.location.title')}
          </p>
          <p className="text-foreground/60 w-full text-end text-base tracking-[-0.32px]">
            {t('howItWorks.contact.location.body')}
          </p>
        </div>
        <p className="text-foreground text-end text-base font-semibold tracking-[-0.32px]">
          {t('howItWorks.contact.location.phone')}
        </p>
      </div>
    </div>
  );
}

export function ContactUsSection({ locale }: Props) {
  const { t } = getTranslations(locale);

  return (
    <section className="bg-background py-16 sm:py-20">
      <div className="mx-auto flex max-w-7xl flex-col gap-16 px-4 sm:px-6">
        <SectionHeader t={t} />
        <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch">
          <div className="flex flex-col gap-6 lg:w-[392px]">
            <EmailCard t={t} />
            <ChatCard t={t} />
          </div>
          <LocationCard t={t} />
        </div>
      </div>
    </section>
  );
}
