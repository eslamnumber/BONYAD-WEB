'use client';

import { useTranslation } from 'react-i18next';

import { SendIcon } from '@/components/icons';

/**
 * First-run nudge shown when the user has no invitations or referrals yet. The invite
 * form stays the primary action above it; this just frames the reward promise. The
 * subtitle is punctuated copy (`dir="auto"`); the heading is a static label (no flag).
 */
export function ReferralEmpty() {
  const { t } = useTranslation();
  return (
    <section className="bg-card border-border flex flex-col items-center gap-3 rounded-2xl border border-dashed p-8 text-center shadow-sm">
      <span className="bg-primary/10 text-primary inline-flex size-12 items-center justify-center rounded-full">
        <SendIcon className="size-5" aria-hidden />
      </span>
      <h2 className="text-foreground text-base font-semibold">{t('referral.empty.title')}</h2>
      <p className="text-muted-foreground max-w-sm text-sm leading-6" dir="auto">
        {t('referral.empty.subtitle')}
      </p>
    </section>
  );
}
