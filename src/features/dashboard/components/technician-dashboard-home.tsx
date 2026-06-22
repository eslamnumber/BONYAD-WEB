'use client';

import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui';

import { useTechnicianDashboard } from '../api';
import type { TechnicianDashboard } from '../schemas/technician-dashboard';

import { ContractsSection } from './contracts-section';
import { CustomerLandingBackdrop } from './customer/customer-landing-backdrop';
import { DashboardSearch } from './dashboard-search';
import { TechnicianActiveProjects } from './technician-active-projects';
import { TechnicianAdsSection } from './technician-ads-section';
import { TechnicianEarningsSection } from './technician-earnings-section';
import { TechnicianExternalProjectsSection } from './technician-external-projects-section';
import { TechnicianKpiRow } from './technician-kpi-row';

/**
 * Service-provider dashboard home (`/dashboard` for technicians) — the new tracking
 * dashboard that replaces the discover/job-offers landing (now at
 * `/dashboard/job-offers`). One `/technicians/me/dashboard` fetch feeds the KPI row
 * and the active-projects panel; further sections (ads, earnings, contracts,
 * external projects) land as their endpoint slices ship. A thin `'use client'`
 * island so the route RSC stays server-rendered and just role-branches into it.
 */
export function TechnicianDashboardHome() {
  const { t } = useTranslation();
  const { data, isPending, isError, refetch } = useTechnicianDashboard();
  const name = data?.technician?.name;

  return (
    <div className="relative isolate flex min-h-full w-full flex-col gap-8 px-4 py-8 sm:px-6">
      {/* Same skyline backdrop + search-above-greeting structure as the customer dashboard. */}
      <CustomerLandingBackdrop />
      <DashboardSearch />

      <header className="flex w-full flex-col items-end gap-1">
        {/* RTL-first: content anchors to the inline-end (text-end) like every other
            dashboard section (JobOffersSection, job-offer-item) so it mirrors with the
            inverted en→rtl / ar→ltr map. No dir="auto" — the greeting is a label
            (static prefix + name); dir="auto" would key off "Welcome"/"مرحباً" and flip
            the heading to the conventional side. The name renders inline. */}
        <h1 className="text-foreground w-full text-end text-2xl font-semibold sm:text-3xl">
          {name ? t('dashboard.home.greeting', { name }) : t('dashboard.home.greetingFallback')}
        </h1>
        <p className="text-foreground/60 w-full text-end text-sm">{t('dashboard.home.subtitle')}</p>
      </header>

      <DashboardBody data={data} isPending={isPending} isError={isError} onRetry={refetch} />
    </div>
  );
}

type BodyProps = {
  data: TechnicianDashboard | undefined;
  isPending: boolean;
  isError: boolean;
  onRetry: () => void;
};

function DashboardBody({ data, isPending, isError, onRetry }: BodyProps) {
  if (isPending) return <DashboardSkeleton />;
  if (isError || !data) return <DashboardError onRetry={onRetry} />;
  return (
    <>
      <TechnicianKpiRow summary={data.summary} />
      {/* items-start so each card sizes to its own content (no equal-height stretch). */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <TechnicianEarningsSection />
        <TechnicianActiveProjects projects={data.active_projects} />
        <ContractsSection />
        <TechnicianExternalProjectsSection />
      </div>
      <TechnicianAdsSection />
    </>
  );
}

function DashboardError({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="border-border flex flex-col items-center gap-4 rounded-2xl border border-dashed py-12 text-center">
      <p className="text-foreground/70 max-w-[420px] text-sm">{t('dashboard.home.error')}</p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        {t('dashboard.home.retry')}
      </Button>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-8" aria-hidden>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="bg-muted h-[116px] animate-pulse rounded-2xl" />
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
