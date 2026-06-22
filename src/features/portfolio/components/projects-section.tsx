'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DashboardProjectsIcon, PlusIcon } from '@/components/icons';
import { Button, Skeleton } from '@/components/ui';
import { type Locale } from '@/types/locale';

import { useDeleteProject } from '../api/delete-project';
import { usePortfolioProjects } from '../api/get-portfolio-projects';
import { localizedPortfolioError } from '../lib/portfolio-error';
import { type PortfolioProject } from '../schemas/portfolio';

import { DeleteProjectModal } from './delete-project-modal';
import { ProjectCard } from './project-card';
import { ProjectFormModal } from './project-form-modal';

// The gallery now spans the full content width (the identity moved into the banner
// above), so the work gets up to three columns — mobile-first 1 → sm:2 → lg:3.
const GRID = 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3';

type BodyProps = {
  projects: PortfolioProject[];
  isPending: boolean;
  isError: boolean;
  locale: Locale;
  onAdd: () => void;
  onEdit: (p: PortfolioProject) => void;
  onDelete: (p: PortfolioProject) => void;
};

/** Empty state — an invitation to act, with its own distinct first-project CTA. */
function ProjectsEmpty({ onAdd }: { onAdd: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="border-border flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-14 text-center">
      <span className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-2xl">
        <DashboardProjectsIcon className="size-6" aria-hidden />
      </span>
      <p className="text-foreground text-base font-semibold">
        {t('portfolio.projects.emptyTitle')}
      </p>
      <p className="text-muted-foreground max-w-xs text-sm leading-6">
        {t('portfolio.projects.emptyBody')}
      </p>
      <Button type="button" onClick={onAdd} className="mt-1 gap-1.5">
        <PlusIcon className="size-4" aria-hidden />
        {t('portfolio.projects.emptyCta')}
      </Button>
    </div>
  );
}

/** Empty / loading / error / grid for the projects region (every branch rendered). */
function ProjectsBody({
  projects,
  isPending,
  isError,
  locale,
  onAdd,
  onEdit,
  onDelete,
}: BodyProps) {
  const { t } = useTranslation();

  if (isPending) {
    return (
      <div className={GRID} aria-hidden>
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-[300px] w-full rounded-2xl" />
        ))}
      </div>
    );
  }
  if (isError) {
    return (
      <p className="text-muted-foreground text-start text-sm">{t('portfolio.projects.error')}</p>
    );
  }
  if (projects.length === 0) {
    return <ProjectsEmpty onAdd={onAdd} />;
  }
  return (
    <ul className={GRID}>
      {projects.map((p) => (
        <ProjectCard
          key={p.id}
          project={p}
          locale={locale}
          onEdit={() => onEdit(p)}
          onDelete={() => onDelete(p)}
        />
      ))}
    </ul>
  );
}

/** Section heading (with count) + the "add work" button. */
function ProjectsHeader({ count, onAdd }: { count: number; onAdd: () => void }) {
  const { t } = useTranslation();
  return (
    <header className="flex items-center justify-between gap-4">
      <h2 className="text-foreground text-start text-lg font-semibold">
        {t('portfolio.projects.title')}
        {count > 0 ? (
          <span className="text-muted-foreground ms-2 text-sm font-normal">{count}</span>
        ) : null}
      </h2>
      <Button type="button" onClick={onAdd} className="gap-1.5">
        <PlusIcon className="size-4" aria-hidden />
        {t('portfolio.projects.add')}
      </Button>
    </header>
  );
}

/**
 * "Your work" — the past-projects gallery + add/edit/delete. Prefers the dedicated
 * `/portfolios/projects/my` fetch, but falls back to the projects embedded in the
 * portfolio payload ({@link fallbackProjects}) when that endpoint is empty or
 * unavailable, so the gallery still renders.
 */
export function ProjectsSection({
  locale,
  fallbackProjects,
}: {
  locale: Locale;
  fallbackProjects: PortfolioProject[];
}) {
  const query = usePortfolioProjects();
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<PortfolioProject | null>(null);
  const [deleting, setDeleting] = useState<PortfolioProject | null>(null);

  const fetched = query.data ?? [];
  const projects = fetched.length > 0 ? fetched : fallbackProjects;
  const isPending = query.isPending && fallbackProjects.length === 0;
  const isError = query.isError && fallbackProjects.length === 0;

  return (
    <section className="flex flex-col gap-4">
      <ProjectsHeader count={projects.length} onAdd={() => setAddOpen(true)} />

      <ProjectsBody
        projects={projects}
        isPending={isPending}
        isError={isError}
        locale={locale}
        onAdd={() => setAddOpen(true)}
        onEdit={setEditing}
        onDelete={setDeleting}
      />

      {addOpen ? <ProjectFormModal open onClose={() => setAddOpen(false)} /> : null}
      {editing ? (
        <ProjectFormModal open project={editing} onClose={() => setEditing(null)} />
      ) : null}
      <DeleteProjectControl deleting={deleting} locale={locale} onClose={() => setDeleting(null)} />
    </section>
  );
}

/** Delete-confirmation dialog + its mutation — open while a project is pending deletion. */
function DeleteProjectControl({
  deleting,
  locale,
  onClose,
}: {
  deleting: PortfolioProject | null;
  locale: Locale;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const del = useDeleteProject();
  return (
    <DeleteProjectModal
      open={deleting !== null}
      title={deleting?.title ?? ''}
      isDeleting={del.isPending}
      errorMessage={
        del.isError
          ? localizedPortfolioError(del.error, locale, t('portfolio.errors.deleteFailed'))
          : undefined
      }
      onClose={onClose}
      onConfirm={() => {
        if (deleting) del.mutate(deleting.id, { onSuccess: onClose });
      }}
    />
  );
}
