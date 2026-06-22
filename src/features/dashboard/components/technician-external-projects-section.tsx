'use client';

import { useTranslation } from 'react-i18next';

import { useExternalProjects } from '../api';
import type { ExternalProject, ExternalProjectStatus } from '../schemas/external-project';

const STATUS_BADGE: Record<string, { className: string; key: string }> = {
  IN_PROGRESS: { className: 'bg-status-progress-soft text-status-progress', key: 'inProgress' },
  COMPLETED: { className: 'bg-status-approved-soft text-status-approved', key: 'completed' },
  ON_HOLD: { className: 'bg-muted text-card-foreground/60', key: 'onHold' },
};

/**
 * "المشاريع الخارجية" panel — off-platform projects from GET /technicians/external-projects.
 * RTL-first (content anchors to the inline-end). The progress bar is copied verbatim
 * from `project-progress-card` (flex justify-end track + progress-* tokens + rtl gradient).
 * Read-only for now — creating / editing / sharing is a follow-up mutation slice.
 */
export function TechnicianExternalProjectsSection() {
  const { t } = useTranslation();
  const { data, isPending, isError } = useExternalProjects();
  const projects = data ?? [];

  return (
    <section className="bg-card border-border flex w-full flex-col items-end gap-5 rounded-2xl border p-5 shadow-sm">
      <h2 className="text-card-foreground w-full text-end text-lg font-semibold">
        {t('dashboard.home.externalProjects.title')}
      </h2>
      <Body isPending={isPending} isError={isError} projects={projects} />
    </section>
  );
}

function Body({
  isPending,
  isError,
  projects,
}: {
  isPending: boolean;
  isError: boolean;
  projects: ExternalProject[];
}) {
  const { t } = useTranslation();
  if (isPending) return <Skeleton />;
  if (isError) {
    return (
      <p className="text-card-foreground/60 w-full py-8 text-center text-sm">
        {t('dashboard.home.externalProjects.error')}
      </p>
    );
  }
  if (projects.length === 0) return <Empty />;
  return (
    <ul className="flex w-full flex-col gap-4">
      {projects.map((project) => (
        <Row key={project.id} project={project} />
      ))}
    </ul>
  );
}

function Row({ project }: { project: ExternalProject }) {
  const { t } = useTranslation();
  const pct = Math.min(100, Math.max(0, Math.round(project.progress ?? 0)));
  const title = project.title || t('dashboard.home.externalProjects.untitled');

  return (
    <li className="border-border flex w-full flex-col gap-3 rounded-xl border p-4">
      <div className="flex w-full items-start gap-3">
        <p className="text-card-foreground min-w-0 flex-1 truncate text-end text-base font-medium">
          {title}
        </p>
        <StatusBadge status={project.status} />
      </div>
      {(project.location || project.clientName) && (
        <div className="text-card-foreground/60 flex w-full flex-wrap justify-end gap-x-3 gap-y-1 text-sm">
          {project.location ? <span dir="auto">{project.location}</span> : null}
          {project.clientName ? <span dir="auto">{project.clientName}</span> : null}
        </div>
      )}
      <div
        className="bg-progress-track flex h-2.5 w-full items-center justify-end overflow-hidden rounded-full"
        role="progressbar"
        aria-label={title}
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="from-progress-from to-progress-to h-full rounded-full bg-gradient-to-r rtl:bg-gradient-to-l"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="text-card-foreground/60 flex w-full items-center justify-between text-xs">
        <span className="text-card-foreground order-first font-medium">{pct}%</span>
        <span>{t('dashboard.home.externalProjects.completion')}</span>
      </div>
    </li>
  );
}

function StatusBadge({ status }: { status?: ExternalProjectStatus | null }) {
  const { t } = useTranslation();
  const badge = STATUS_BADGE[status ?? ''] ?? {
    className: 'bg-muted text-card-foreground/60',
    key: 'unknown',
  };
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ${badge.className}`}
    >
      {t(`dashboard.home.externalProjects.status.${badge.key}`)}
    </span>
  );
}

function Empty() {
  const { t } = useTranslation();
  return (
    <div className="flex w-full flex-col items-center gap-2 py-10 text-center">
      <p className="text-card-foreground text-base font-medium">
        {t('dashboard.home.externalProjects.empty')}
      </p>
      <p className="text-card-foreground/60 max-w-[360px] text-sm">
        {t('dashboard.home.externalProjects.emptyHint')}
      </p>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="flex w-full flex-col gap-4" aria-hidden>
      {[0, 1].map((i) => (
        <div key={i} className="bg-muted h-28 w-full animate-pulse rounded-xl" />
      ))}
    </div>
  );
}
