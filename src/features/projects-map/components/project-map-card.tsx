'use client';

import { useTranslation } from 'react-i18next';

import { type Locale } from '@/types/locale';

import type { ProjectMarker } from '../schemas/project-marker';

const K = 'projectsMap';

type ProjectMapCardProps = {
  project: ProjectMarker;
  locale: Locale;
  onDismiss: () => void;
  onViewDetails: () => void;
};

/**
 * Bottom sheet card shown when a marker is tapped: service category, title,
 * budget + location, and a "View & Bid" CTA. The ✕ button dismisses it. Mirrors
 * the iOS `ProjectMapBottomCard` (`ProjectsMapView.swift:593`).
 */
export function ProjectMapCard({ project, locale, onDismiss, onViewDetails }: ProjectMapCardProps) {
  const { t } = useTranslation();
  const serviceName = locale === 'ar' ? project.serviceNameAr : project.serviceNameEn;

  return (
    <div className="animate-in slide-in-from-bottom duration-300">
      <div className="bg-card relative rounded-t-3xl shadow-2xl">
        <div className="flex justify-center pt-2.5 pb-1">
          <div className="bg-border h-1 w-10 rounded-full" />
        </div>
        <div className="flex flex-col gap-3 px-4 pt-2 pb-6">
          <CloseButton label={t('common.close')} onClick={onDismiss} />
          {serviceName && (
            <p className="text-primary text-[11px] font-semibold tracking-wide uppercase">
              {serviceName}
            </p>
          )}
          <p dir="auto" className="text-foreground line-clamp-2 text-start text-base font-bold">
            {project.description || `#${project.id}`}
          </p>
          <CardMeta project={project} locale={locale} />
          <button
            type="button"
            onClick={onViewDetails}
            className="bg-primary text-primary-foreground mt-1 w-full rounded-xl py-3 text-sm font-semibold transition-opacity hover:opacity-90"
          >
            {t(`${K}.viewAndBid`)}
          </button>
        </div>
      </div>
    </div>
  );
}

function CloseButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-muted-foreground/60 hover:text-foreground absolute end-3 top-3"
      aria-label={label}
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden>
        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
      </svg>
    </button>
  );
}

function CardMeta({ project, locale }: { project: ProjectMarker; locale: Locale }) {
  const { t } = useTranslation();
  const regionName = locale === 'ar' ? project.regionNameAr : project.regionNameEn;
  const place = project.address || regionName;
  const hasBudget = project.budgetUnspecified !== true && (project.budget ?? 0) > 0;

  return (
    <div className="text-muted-foreground flex items-center gap-4 text-sm">
      {hasBudget && (
        <span className="text-foreground flex items-center gap-1 font-semibold">
          {Number(project.budget).toLocaleString()} {t(`${K}.sar`)}
        </span>
      )}
      {place && (
        <span className="flex items-center gap-1">
          <svg viewBox="0 0 24 24" fill="currentColor" className="size-3" aria-hidden>
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
          </svg>
          <span dir="auto">{place}</span>
        </span>
      )}
    </div>
  );
}
