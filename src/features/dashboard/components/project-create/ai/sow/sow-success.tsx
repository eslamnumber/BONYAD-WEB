'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { PaymentSuccessTicksIllustration } from '@/components/illustrations';
import { buttonVariants } from '@/components/ui';
import { ROUTES } from '@/config/routes';
import { cn } from '@/lib/utils';

const K = 'dashboard.createProject.ai.sow.success';

/** Success — the project is live, with a view-project CTA (iOS NavigateToProject). */
export function SowSuccess({ projectId }: { projectId: number }) {
  const { t } = useTranslation();

  return (
    <div className="flex w-full max-w-[440px] flex-col items-center gap-6 text-center">
      <span className="bg-success/10 text-success flex size-20 items-center justify-center rounded-full">
        <PaymentSuccessTicksIllustration className="size-11" aria-hidden />
      </span>
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-foreground text-2xl font-bold">{t(`${K}.title`)}</h1>
        <p className="text-muted-foreground text-sm">{t(`${K}.subtitle`)}</p>
      </div>
      <div className="flex w-full flex-col gap-3">
        <Link
          href={ROUTES.DASHBOARD_PROJECT(String(projectId))}
          className={cn(buttonVariants(), 'h-12 rounded-full text-base font-semibold')}
        >
          {t(`${K}.view`)}
        </Link>
        <Link
          href={ROUTES.DASHBOARD_PROJECTS}
          className={cn(buttonVariants({ variant: 'ghost' }), 'h-12 rounded-full')}
        >
          {t(`${K}.allProjects`)}
        </Link>
      </div>
    </div>
  );
}
