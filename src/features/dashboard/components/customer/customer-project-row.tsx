'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { ROUTES } from '@/config/routes';

import { localizedServiceName } from '../../lib/project-format';
import type { ProjectStatusVariant } from '../../lib/project-status';
import type { MyProject } from '../../schemas/project';
import { ProjectStatusBadge } from '../project-status-badge';

/**
 * One project row shared by the requests + contracts sections: the project name
 * (dynamic backend value → `text-end` + `<bdi>`, never `dir="auto"`, so it anchors to
 * the document edge like every dashboard card), its status pill, and a CTA pulled to
 * the inline-start (`order-first`) that deep-links to the shared project-detail route —
 * where the actual compare-offers / sign-contract flows already live.
 */
export function CustomerProjectRow({
  project,
  ctaLabel,
  variant,
}: {
  project: MyProject;
  ctaLabel: string;
  variant?: ProjectStatusVariant;
}) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith('ar') ? 'ar' : 'en';
  const name =
    project.title || localizedServiceName(project, locale) || t('dashboard.card.untitled');

  return (
    <li className="border-border flex w-full items-center justify-between gap-3 border-b pb-3 last:border-b-0 last:pb-0">
      <div className="flex min-w-0 flex-col items-end gap-1.5">
        <p className="text-card-foreground w-full truncate text-end text-sm font-medium">
          <bdi>{name}</bdi>
        </p>
        <ProjectStatusBadge status={project.status} variant={variant} />
      </div>
      <Link
        href={ROUTES.DASHBOARD_PROJECT(String(project.id))}
        className="bg-field-surface text-job-accent focus-visible:outline-ring order-first inline-flex shrink-0 items-center rounded-full px-4 py-1.5 text-xs font-semibold whitespace-nowrap focus-visible:outline-2"
      >
        {ctaLabel}
      </Link>
    </li>
  );
}
