'use client';

import { useTranslation } from 'react-i18next';

import { ROUTES } from '@/config/routes';

import { statusVariant } from '../../lib/project-status';
import type { MyProject } from '../../schemas/project';

import { CustomerProjectRow } from './customer-project-row';
import { CustomerSection } from './customer-section';

const MAX_ROWS = 4;

/**
 * "My requests" (طلباتي — طلب تسعير) — the customer's still-open price-quote requests
 * (PENDING / BID_RECEIVED projects). A project that has received an offer shows the
 * "Compare offers" CTA; one still awaiting offers shows "View". Both deep-link to the
 * project detail, where the bid list + accept flow already live.
 */
export function CustomerRequestsSection({ requests }: { requests: MyProject[] }) {
  const { t } = useTranslation();
  const rows = requests.slice(0, MAX_ROWS);

  return (
    <CustomerSection
      title={t('dashboard.customer.home.requests.title')}
      viewAllHref={ROUTES.DASHBOARD_PROJECTS_FILTERED('bidding')}
      viewAllLabel={t('dashboard.customer.home.requests.viewAll')}
      isEmpty={rows.length === 0}
      emptyText={t('dashboard.customer.home.requests.empty')}
    >
      <ul className="flex w-full flex-col gap-3">
        {rows.map((project) => (
          <CustomerProjectRow
            key={project.id}
            project={project}
            ctaLabel={t(
              statusVariant(project.status) === 'bidReceived'
                ? 'dashboard.customer.home.requests.compare'
                : 'dashboard.customer.home.requests.view',
            )}
          />
        ))}
      </ul>
    </CustomerSection>
  );
}
