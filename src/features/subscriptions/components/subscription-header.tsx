'use client';

import { useTranslation } from 'react-i18next';

import { TrustBadgeIcon } from '@/components/icons';

/**
 * Hero block for the subscription screen: a membership-badge glyph in a primary
 * chip, the title, and a blurb. Centred — this is the page's identity, echoing the
 * iOS `SubscriptionManagementView`. The blurb is punctuated translated copy, so it
 * carries `dir="auto"`; the title is a static label and intentionally does not.
 */
export function SubscriptionHeader() {
  const { t } = useTranslation();
  return (
    <header className="flex flex-col items-center gap-3 text-center">
      <span className="bg-primary/10 text-primary flex size-16 items-center justify-center rounded-2xl">
        <TrustBadgeIcon className="size-8" aria-hidden />
      </span>
      <h1 className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">
        {t('subscription.title')}
      </h1>
      <p dir="auto" className="text-muted-foreground max-w-md text-sm leading-6">
        {t('subscription.subtitle')}
      </p>
    </header>
  );
}
