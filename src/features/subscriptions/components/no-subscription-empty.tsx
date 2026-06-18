'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { TrustBadgeIcon } from '@/components/icons';
import { Button } from '@/components/ui';
import { ROUTES } from '@/config/routes';

/**
 * Empty state (iOS `noSubscriptionView`) — shown when the technician has no active
 * plan (a 404 from GET /users/subscription). Invites them to browse plans, routing
 * to the public pricing section on the for-pros page (`/for-pros#packages`), which
 * is the canonical plan list in this build.
 */
export function NoSubscriptionEmpty() {
  const { t } = useTranslation();
  return (
    <section className="bg-card border-border flex flex-col items-center gap-4 rounded-2xl border p-8 text-center shadow-sm">
      <span className="bg-muted text-muted-foreground flex size-16 items-center justify-center rounded-2xl">
        <TrustBadgeIcon className="size-8" aria-hidden />
      </span>
      <div className="flex flex-col gap-1.5">
        <h2 className="text-foreground text-lg font-semibold">{t('subscription.empty.title')}</h2>
        <p dir="auto" className="text-muted-foreground max-w-sm text-sm leading-6">
          {t('subscription.empty.subtitle')}
        </p>
      </div>
      <Button asChild size="lg" className="mt-1">
        <Link href={`${ROUTES.FOR_PROS}#packages`}>{t('subscription.empty.browse')}</Link>
      </Button>
    </section>
  );
}
