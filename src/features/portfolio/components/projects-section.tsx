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

// The gallery sits in the dashboard's wide (2/3) column inside a capped width, so two
// columns keep each card a comfortable size — mobile-first 1 → sm:2 (never wider here).
const GRID = 'grid gap-4 sm:grid-cols-2';

type BodyProps = {
  projects: PortfolioProject[];
  isPending: boolean;
  isError: boolean;
  locale: Locale;
  onEdit: (p: PortfolioProject) => void;
  onDelete: (p: PortfolioProject) => void;
};

/** Empty / loading / error / grid for the projects region (every branch rendered). */
function ProjectsBody({ projects, isPending, isError, locale, onEdit, onDelete }: BodyProps) {
  const { t } = useTranslation();

  if (isPending) {
    return (
      <div className={GRID} aria-hidden>
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-[280px] w-full rounded-2xl" />
        ))}
      </div>
    );
  }
  if (isError) {
    return (
      <p dir="auto" className="text-muted-foreground text-start text-sm">
        {t('portfolio.projects.error')}
      </p>
    );
  }
  if (projects.length === 0) {
    return (
      <div className="border-border flex flex-col items-center gap-2 rounded-2xl border border-dashed py-12 text-center">
        <DashboardProjectsIcon className="text-muted-foreground size-8 opacity-60" aria-hidden />
        <p className="text-foreground text-sm font-medium">{t('portfolio.projects.emptyTitle')}</p>
        <p dir="auto" className="text-muted-foreground max-w-xs text-sm">
          {t('portfolio.projects.emptyBody')}
        </p>
      </div>
    );
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
  const { t } = useTranslation();
  const query = usePortfolioProjects();
  const del = useDeleteProject();
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<PortfolioProject | null>(null);
  const [deleting, setDeleting] = useState<PortfolioProject | null>(null);

  const fetched = query.data ?? [];
  const projects = fetched.length > 0 ? fetched : fallbackProjects;
  const isPending = query.isPending && fallbackProjects.length === 0;
  const isError = query.isError && fallbackProjects.length === 0;

  function confirmDelete() {
    if (!deleting) return;
    del.mutate(deleting.id, { onSuccess: () => setDeleting(null) });
  }

  return (
    <section className="flex flex-col gap-4">
      <ProjectsHeader count={projects.length} onAdd={() => setAddOpen(true)} />

      <ProjectsBody
        projects={projects}
        isPending={isPending}
        isError={isError}
        locale={locale}
        onEdit={setEditing}
        onDelete={setDeleting}
      />

      {addOpen ? <ProjectFormModal open onClose={() => setAddOpen(false)} /> : null}
      {editing ? (
        <ProjectFormModal open project={editing} onClose={() => setEditing(null)} />
      ) : null}
      <DeleteProjectModal
        open={deleting !== null}
        title={deleting?.title ?? ''}
        isDeleting={del.isPending}
        errorMessage={
          del.isError
            ? localizedPortfolioError(del.error, locale, t('portfolio.errors.deleteFailed'))
            : undefined
        }
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
      />
    </section>
  );
}
