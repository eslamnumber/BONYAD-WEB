'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui';
import { ROUTES } from '@/config/routes';
import { useAuthStore } from '@/stores/auth-store';

import { useMyProjects } from '../../api';
import { buildCustomerDashboard } from '../../lib/customer-dashboard';
import type { MyProject } from '../../schemas/project';

import { CustomerDashboardSections } from './customer-dashboard-sections';
import { CustomerLandingBackdrop } from './customer-landing-backdrop';
import { CustomerOffersSection } from './customer-offers-section';
import { CustomerSearch } from './customer-search';
import { CustomerWelcomeHero } from './customer-welcome-hero';

/**
 * Customer (USER role) dashboard landing — the tracking dashboard from the draft
 * (لوحة تتبّع العميل): greeting + search, a KPI row styled like the technician dashboard,
 * and the payments / requests / contracts / active-projects sections, all derived from the
 * one `/projects/my` fetch (there is no customer dashboard endpoint). A new customer (no
 * projects) gets the welcome hero as the empty state; the explore-offers feed shows in both.
 * A thin `'use client'` island so the route RSC stays server-rendered and just role-branches.
 */
export function CustomerDashboard() {
  const { data, isPending, isError, refetch } = useMyProjects();
  const name = useAuthStore((s) => s.user?.name);
  const firstName = name?.trim().split(/\s+/)[0];

  return (
    <div className="relative isolate flex min-h-full w-full flex-col gap-8 px-4 py-8 sm:px-6">
      <CustomerLandingBackdrop />
      <CustomerSearch />
      <DashboardHeader firstName={firstName} />
      <DashboardBody data={data} isPending={isPending} isError={isError} onRetry={refetch} />
    </div>
  );
}

function DashboardHeader({ firstName }: { firstName?: string }) {
  const { t } = useTranslation();
  return (
    <header className="mt-12 flex w-full flex-col items-end gap-4 sm:mt-16">
      <div className="flex w-full flex-col items-end gap-1">
        <h1 className="text-foreground w-full text-end text-2xl font-semibold sm:text-3xl">
          {firstName
            ? t('dashboard.customer.home.greetingNamed', { name: firstName })
            : t('dashboard.customer.home.greeting')}
        </h1>
        <p className="text-foreground/60 w-full text-end text-sm">
          {t('dashboard.customer.home.subtitle')}
        </p>
      </div>
      <Link
        href={ROUTES.DASHBOARD_PROJECTS_CREATE}
        className="bg-brand-dark-navy text-on-media focus-visible:outline-ring shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 motion-safe:hover:opacity-90"
      >
        {t('dashboard.customer.home.addProject')}
      </Link>
    </header>
  );
}

type BodyProps = {
  data: MyProject[] | undefined;
  isPending: boolean;
  isError: boolean;
  onRetry: () => void;
};

function DashboardBody({ data, isPending, isError, onRetry }: BodyProps) {
  if (isPending) return <DashboardSkeleton />;
  if (isError || !data) return <DashboardError onRetry={onRetry} />;
  const view = buildCustomerDashboard(data);
  return (
    <>
      {data.length > 0 ? <CustomerDashboardSections data={view} /> : <CustomerWelcomeHero />}
      <CustomerOffersSection />
    </>
  );
}

function DashboardError({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="border-border flex flex-col items-center gap-4 rounded-2xl border border-dashed py-12 text-center">
      <p className="text-foreground/70 max-w-[420px] text-sm">
        {t('dashboard.customer.home.error')}
      </p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        {t('dashboard.customer.home.retry')}
      </Button>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-8" aria-hidden>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="bg-muted h-[124px] animate-pulse rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="bg-muted h-48 animate-pulse rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
