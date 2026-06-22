'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { ROUTES } from '@/config/routes';

import { useSupervisingProjects } from '../../api';

import { SupervisionInvitationCard } from './supervision-invitation-card';

/**
 * Pending supervision invitations surfaced on the SP dashboard home (mirrors the iOS
 * home invites section). Renders nothing when there are no invitations, so it never
 * clutters the home for technicians who haven't been invited. Reuses the full
 * invitation card so the technician can accept/decline without leaving the home.
 */
export function SupervisionInvitesHomeSection() {
  const { t } = useTranslation();
  const { data } = useSupervisingProjects('invited');
  const invites = data ?? [];

  if (invites.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <Link
          href={ROUTES.DASHBOARD_SUPERVISION}
          className="text-job-accent focus-visible:outline-ring rounded text-sm font-semibold transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 motion-safe:hover:opacity-80"
        >
          {t('dashboard.supervision.home.viewAll')}
        </Link>
        <h2 className="text-foreground text-end text-lg font-semibold tracking-tight">
          {t('dashboard.supervision.home.title')}
        </h2>
      </div>
      {/* justify-end anchors the card(s) to the inline-end — right in ar, left in en —
          so a single invite sits under the heading, not stranded in the first grid column. */}
      <div className="flex flex-wrap justify-end gap-5">
        {invites.map((project) => (
          <div key={project.id} className="w-full lg:w-[calc(50%-0.625rem)]">
            <SupervisionInvitationCard project={project} />
          </div>
        ))}
      </div>
    </section>
  );
}
