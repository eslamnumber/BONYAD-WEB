'use client';

import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { ProjectArrowIcon } from '@/components/icons';
import { buildAssetUrl } from '@/lib/backend';

import { durationWeeks, localizedServiceName } from '../lib/project-format';
import type { Project } from '../schemas/project';

import { MoneyAmount } from './money-amount';

const CARD =
  'bg-card-media-fallback border-border relative flex flex-col overflow-hidden rounded-2xl border shadow-[0px_1px_3px_0px_rgba(161,161,161,0.1),0px_5px_5px_0px_rgba(161,161,161,0.09),0px_11px_7px_0px_rgba(161,161,161,0.05)]';

/**
 * Decorative project cover, painted as a CSS background rather than `next/image`
 * so an arbitrary backend host needs no `remotePatterns` entry and a junk/unknown
 * host can never crash the card (CSP `img-src https:` covers it). Same robustness
 * rationale as the shared `Avatar`.
 */
function ProjectCover({ src }: { src: string }) {
  return (
    <div
      style={{ backgroundImage: `url("${encodeURI(src)}")` }}
      className="absolute inset-0 bg-cover bg-center rtl:-scale-x-100"
    />
  );
}

/** One featured project. Cover image + dark scrim with white content on top. */
export function ProjectCard({ project }: { project: Project }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith('ar') ? 'ar' : 'en';
  const cover = buildAssetUrl(project.files?.[0]);
  const weeks = durationWeeks(project.timeRequiredDays);
  const service = localizedServiceName(project, locale);

  return (
    <article className={CARD}>
      <div aria-hidden className="absolute inset-0">
        {cover ? <ProjectCover src={cover} /> : null}
        <div className="bg-card-scrim absolute inset-0" />
      </div>

      <div className="relative flex flex-col items-end gap-11 p-6">
        <div className="flex w-full flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            {/* Base SVG points left; flip in en (rtl) → right in en, left in ar. */}
            <ProjectArrowIcon
              className="text-on-media size-9 shrink-0 rtl:-scale-x-100"
              aria-hidden
            />
            <p dir="auto" className="text-on-media truncate text-2xl font-semibold">
              {project.title || service || t('dashboard.card.untitled')}
            </p>
          </div>
          <p className="text-on-media/60 line-clamp-2 min-h-12 w-full text-end text-sm leading-6">
            {project.description}
          </p>
        </div>

        <div className="flex items-center gap-6">
          <ProjectStat
            value={weeks !== null ? `${weeks} ${t('dashboard.card.weeksUnit')}` : '—'}
            label={t('dashboard.card.durationLabel')}
          />
          <ProjectStat value={project.address || '—'} label={t('dashboard.card.locationLabel')} />
          <ProjectStat
            value={
              typeof project.budget === 'number' ? <MoneyAmount value={project.budget} /> : '—'
            }
            label={t('dashboard.card.budgetLabel')}
          />
        </div>
      </div>
    </article>
  );
}

function ProjectStat({ value, label }: { value: ReactNode; label: string }) {
  return (
    <div className="flex min-w-0 flex-col items-end gap-1">
      <p dir="auto" className="text-on-media max-w-28 truncate text-sm font-semibold">
        {value}
      </p>
      <p className="text-on-media/40 text-xs font-medium whitespace-nowrap">{label}</p>
    </div>
  );
}
