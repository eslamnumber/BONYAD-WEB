import Image from 'next/image';

import { getTranslations } from '@/lib/get-translations';
import { type Locale } from '@/types/locale';

type Props = { locale: Locale };

export function MessagesEmptyState({ locale }: Props) {
  const { t } = getTranslations(locale);

  return (
    <div className="flex w-full max-w-[482px] flex-col items-center gap-6 text-center">
      <div className="relative aspect-[296/183] w-full max-w-[296px] shrink-0 overflow-hidden">
        <Image
          src="/images/messages/empty-messages.webp"
          alt=""
          aria-hidden
          fill
          priority
          sizes="296px"
          className="object-cover rtl:-scale-x-100 dark:invert"
        />
      </div>
      <div className="flex w-full flex-col items-center gap-6">
        <h1
          dir="auto"
          className="text-foreground w-full text-3xl font-medium sm:text-4xl md:text-[45px]"
        >
          {t('messages.empty.title')}
        </h1>
        <p dir="auto" className="text-foreground/80 w-full max-w-[440px] text-base">
          {t('messages.empty.description')}
        </p>
      </div>
    </div>
  );
}
