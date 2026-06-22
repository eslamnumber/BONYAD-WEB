'use client';

import { useTranslation } from 'react-i18next';

import { ROUTES } from '@/config/routes';

import type { MyProject } from '../../schemas/project';

import { CustomerProjectRow } from './customer-project-row';
import { CustomerSection } from './customer-section';

const MAX_ROWS = 4;

/**
 * "Contracts" (العقود) — the customer's projects in CONTRACT_SIGNING, derived from the same
 * `/projects/my` list as the projects screen so the rows read identically: project title /
 * localized service name + status pill (no description). Each row deep-links to the project
 * detail, where the role-aware contract-signing screen (send / resign) lives. The pill is
 * forced to the `contractSigning` variant (the backend status may still read APPROVED while
 * the contract step is active — mirrors the detail + the projects screen's contract filter).
 */
export function CustomerContractsSection({ projects }: { projects: MyProject[] }) {
  const { t } = useTranslation();
  const rows = projects.slice(0, MAX_ROWS);

  return (
    <CustomerSection
      title={t('dashboard.customer.home.contracts.title')}
      viewAllHref={ROUTES.DASHBOARD_PROJECTS_FILTERED('contract')}
      viewAllLabel={t('dashboard.customer.home.contracts.viewAll')}
      isEmpty={rows.length === 0}
      emptyText={t('dashboard.customer.home.contracts.empty')}
    >
      <ul className="flex w-full flex-col gap-3">
        {rows.map((project) => (
          <CustomerProjectRow
            key={project.id}
            project={project}
            variant="contractSigning"
            ctaLabel={t('dashboard.customer.home.contracts.reviewSign')}
          />
        ))}
      </ul>
    </CustomerSection>
  );
}
