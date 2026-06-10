'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { SaudiRiyalIcon } from '@/components/icons';
import { ROUTES } from '@/config/routes';

import {
  daysRemaining,
  durationWeeks,
  formatBudget,
  localizedServiceName,
} from '../lib/project-format';
import type { Project } from '../schemas/project';

/** One job-offer row: deadline + category badge, then title, description, meta. Links to the detail. */
export function JobOfferItem({ project }: { project: Project }) {
  return (
    <Link
      href={ROUTES.DASHBOARD_JOB_OFFER(String(project.id))}
      className="border-job-divider focus-visible:outline-ring motion-safe:hover:bg-nav-hover block w-full border-b transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2"
    >
      <JobOfferItemBody project={project} />
    </Link>
  );
}

function JobOfferItemBody({ project }: { project: Project }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith('ar') ? 'ar' : 'en';
  const days = daysRemaining(project.bidsCloseAt);
  const service = localizedServiceName(project, locale);

  return (
    <article className="flex w-full flex-col items-end gap-2 px-6 py-8">
      <div className="flex items-center gap-1.5">
        {days !== null ? (
          <ul className="text-job-accent text-sm font-semibold">
            {/* dir="auto" puts the disc marker at the text's reading-start (before the
                label) under the inverted en→rtl / ar→ltr mapping. */}
            <li className="ms-5 list-disc" dir="auto">
              {t('dashboard.offer.daysLeft', { count: days })}
            </li>
          </ul>
        ) : null}
        <span
          dir="auto"
          className="bg-job-accent text-on-media rounded-full px-2.5 py-1 text-xs font-semibold"
        >
          {service || t('dashboard.offer.service')}
        </span>
      </div>

      <div className="flex w-full flex-col items-end gap-6">
        <h3 className="text-foreground w-full text-end text-2xl sm:text-[32px]">
          {project.title || t('dashboard.card.untitled')}
        </h3>
        {project.description ? (
          <p className="text-foreground/80 w-full max-w-[503px] text-end text-base">
            {project.description}
          </p>
        ) : null}
        <JobOfferMeta project={project} />
      </div>
    </article>
  );
}

/** Meta row: project duration, location and budget (SAR figure + Riyal glyph). */
function JobOfferMeta({ project }: { project: Project }) {
  const { t } = useTranslation();
  const weeks = durationWeeks(project.timeRequiredDays);
  return (
    <div className="text-foreground/80 flex flex-wrap items-center gap-x-11 gap-y-2 text-base">
      {weeks !== null ? (
        <span dir="auto">
          {t('dashboard.offer.duration', { value: `${weeks} ${t('dashboard.card.weeksUnit')}` })}
        </span>
      ) : null}
      {project.address ? (
        <span dir="auto" className="max-w-[16rem] truncate">
          {t('dashboard.offer.location', { value: project.address })}
        </span>
      ) : null}
      {typeof project.budget === 'number' ? (
        <span dir="auto" className="inline-flex items-center gap-1">
          {t('dashboard.offer.budget', { value: formatBudget(project.budget) })}
          <SaudiRiyalIcon className="h-3.5 w-auto shrink-0" aria-hidden />
          <span className="sr-only">{t('dashboard.jobOffer.summary.currency')}</span>
        </span>
      ) : null}
    </div>
  );
}
