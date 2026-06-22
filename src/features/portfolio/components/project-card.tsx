'use client';

import { useTranslation } from 'react-i18next';

import { DashboardProjectsIcon, DetailLocationIcon } from '@/components/icons';
import { Button } from '@/components/ui';
import { buildAssetUrl } from '@/lib/backend';
import { type Locale } from '@/types/locale';

import { projectCover, projectDateRange } from '../lib/project-display';
import { type PortfolioProject } from '../schemas/portfolio';

/** Cover image (first photo) or a branded placeholder, with a photo-count badge. */
function Cover({ project, alt }: { project: PortfolioProject; alt: string }) {
  const { t } = useTranslation();
  const cover = projectCover(project);
  const count = project.photos.length;

  return (
    <div className="relative overflow-hidden">
      {cover ? (
        <span
          role="img"
          aria-label={alt}
          style={{ backgroundImage: `url("${encodeURI(buildAssetUrl(cover))}")` }}
          className="bg-field-surface ease-out-quint duration-base block aspect-[3/2] bg-cover bg-center transition-transform motion-safe:group-hover:scale-105"
        />
      ) : (
        <div className="bg-muted text-muted-foreground flex aspect-[3/2] items-center justify-center">
          <DashboardProjectsIcon className="size-8 opacity-60" aria-hidden />
        </div>
      )}
      {count > 1 ? (
        <span className="bg-card/85 text-foreground absolute end-2 top-2 rounded-full px-2 py-0.5 text-xs font-medium shadow-sm backdrop-blur-sm">
          {t('portfolio.project.photoCount', { count })}
        </span>
      ) : null}
    </div>
  );
}

/** Edit / delete footer — delete is destructive-toned; its label names the project. */
function ProjectActions({
  title,
  onEdit,
  onDelete,
}: {
  title: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="border-border mt-auto flex gap-2 border-t pt-3">
      <Button type="button" variant="secondary" size="sm" onClick={onEdit} className="flex-1">
        {t('portfolio.project.edit')}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onDelete}
        aria-label={t('portfolio.project.deleteNamed', { title })}
        className="text-destructive border-destructive/40 hover:bg-destructive/5"
      >
        {t('portfolio.project.delete')}
      </Button>
    </div>
  );
}

/**
 * One past-project card: cover (with photo count) + title + date range + description +
 * location + edit/delete. Lifts subtly on hover. My own web design (responsive grid
 * item). Title / description / location are dynamic content → `dir="auto"` + `text-start`.
 */
export function ProjectCard({
  project,
  locale,
  onEdit,
  onDelete,
}: {
  project: PortfolioProject;
  locale: Locale;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { t } = useTranslation();
  const range = projectDateRange(project, locale);

  return (
    <li className="group bg-card border-border ease-out-quint duration-base flex flex-col overflow-hidden rounded-2xl border shadow-sm transition-[transform,box-shadow] motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-md">
      <Cover project={project} alt={t('portfolio.project.coverAlt', { title: project.title })} />
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 dir="auto" className="text-foreground text-start text-base font-semibold break-words">
          {project.title}
        </h3>
        {range ? <p className="text-muted-foreground text-start text-xs">{range}</p> : null}
        {project.description ? (
          <p dir="auto" className="text-muted-foreground line-clamp-2 text-start text-sm leading-6">
            {project.description}
          </p>
        ) : null}
        {project.location ? (
          <p
            dir="auto"
            className="text-muted-foreground/80 mt-0.5 inline-flex items-center gap-1 text-start text-xs break-words"
          >
            <DetailLocationIcon className="size-3.5 shrink-0" aria-hidden />
            {project.location}
          </p>
        ) : null}
        <ProjectActions title={project.title} onEdit={onEdit} onDelete={onDelete} />
      </div>
    </li>
  );
}
