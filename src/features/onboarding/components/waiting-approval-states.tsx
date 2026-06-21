'use client';

import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { Skeleton } from '@/components/ui';
import { ROUTES } from '@/config/routes';

const K = 'onboarding.waitingApproval';
const CTA =
  'bg-primary text-primary-foreground focus-visible:outline-ring flex h-[52px] items-center justify-center rounded-full text-base font-semibold transition-opacity focus-visible:outline-2 motion-safe:hover:opacity-90';

/** Terminal success — shown briefly while the screen redirects an approved tech on. */
export function ApprovedCard() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <span className="bg-success/10 text-success flex size-20 items-center justify-center rounded-full">
        <CheckCircle2 className="size-9" aria-hidden />
      </span>
      <h1 className="text-foreground text-[28px] leading-tight font-medium">
        {t(`${K}.approvedHeading`)}
      </h1>
      <p dir="auto" className="text-muted-foreground text-base">
        {t(`${K}.approvedMessage`)}
      </p>
    </div>
  );
}

/** Account suspended — a dead-end state; the only action is to contact support. */
export function SuspendedCard() {
  const { t } = useTranslation();
  return (
    <div className="flex w-full flex-col items-center gap-5 text-center">
      <span className="bg-destructive/10 text-destructive flex size-20 items-center justify-center rounded-full">
        <AlertTriangle className="size-9" aria-hidden />
      </span>
      <div className="flex flex-col gap-2">
        <h1 className="text-foreground text-[28px] leading-tight font-medium">
          {t(`${K}.suspendedHeading`)}
        </h1>
        <p dir="auto" className="text-muted-foreground text-base">
          {t(`${K}.suspendedMessage`)}
        </p>
      </div>
      <Link href={ROUTES.CONTACT} className={`${CTA} w-full`}>
        {t(`${K}.contactSupport`)}
      </Link>
    </div>
  );
}

export function StatusError({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <p role="alert" className="text-destructive text-base">
        {t(`${K}.statusError`)}
      </p>
      <button type="button" onClick={onRetry} className={`${CTA} px-8`}>
        {t('common.tryAgain')}
      </button>
    </div>
  );
}

export function WaitingSkeleton() {
  return (
    <div className="flex flex-col items-center gap-6" aria-hidden>
      <Skeleton className="size-20 rounded-full" />
      <Skeleton className="h-7 w-56" />
      <Skeleton className="h-4 w-64" />
      <Skeleton className="h-40 w-full rounded-2xl" />
    </div>
  );
}
