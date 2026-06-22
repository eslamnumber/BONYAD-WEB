'use client';

import { useTranslation } from 'react-i18next';

/** Title block — anchors to the inline-end alongside the back link (inverted map). */
export function ServicesHeader({ count }: { count: number }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-1 text-end">
      <h1 className="text-foreground text-2xl font-semibold sm:text-3xl">{t('services.title')}</h1>
      <p className="text-muted-foreground text-sm">{t('services.subtitle', { count })}</p>
    </div>
  );
}
