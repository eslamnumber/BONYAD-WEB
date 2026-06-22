'use client';

import type { CustomerDashboardData } from '../../lib/customer-dashboard';

import { CustomerActiveProjectsSection } from './customer-active-projects-section';
import { CustomerContractsSection } from './customer-contracts-section';
import { CustomerKpiRow } from './customer-kpi-row';
import { CustomerPaymentsSection } from './customer-payments-section';
import { CustomerRequestsSection } from './customer-requests-section';

/**
 * The populated customer dashboard body — KPI row + the four tracking sections in a
 * responsive two-column grid (draft page 1: payments | requests, then contracts | active).
 * Single column on mobile, two columns from `lg:`. Mirrors with the document direction.
 * Contracts derive from the same `/projects/my` list as the projects screen (CONTRACT_SIGNING),
 * so the rows read identically (title/service + status, no description).
 */
export function CustomerDashboardSections({ data }: { data: CustomerDashboardData }) {
  return (
    <>
      <CustomerKpiRow kpis={data.kpis} />
      {/* items-start so each card sizes to its own content — a short card (e.g. one
          contract) doesn't stretch tall to match a full neighbour. */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <CustomerPaymentsSection items={data.payments} />
        <CustomerRequestsSection requests={data.requests} />
        <CustomerContractsSection projects={data.contracts} />
        <CustomerActiveProjectsSection projects={data.activeProjects} />
      </div>
    </>
  );
}
