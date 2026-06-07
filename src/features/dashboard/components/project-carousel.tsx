'use client';

import { useTranslation } from 'react-i18next';

import { useAvailableProjects } from '../api';
import type { Project } from '../schemas/project';

import { ProjectCard } from './project-card';

const FEATURED_LIMIT = 8;

// Horizontal scroll-snap rail (designated featured rail, not a card grid). CSS
// grid — not flex+overflow — per docs/responsive-design.md. Edge fade via mask so
// it stays theme-correct in dark mode (no white fader overlay).
// `justify-end-safe` pins the cards to the inline-end edge (right in ar / left in
// en under the inverted dir) so a short rail sits on the same side as the heading;
// `safe` falls back to start-aligned + scrollable once the cards overflow.
const RAIL =
  'grid w-full auto-cols-[85%] grid-flow-col justify-end-safe gap-7 overflow-x-auto overscroll-x-contain pb-2 snap-x snap-mandatory sm:auto-cols-[370px] [mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)]';

/** Featured projects rail — "مشاريع تناسبك". Backend-driven via useAvailableProjects. */
export function ProjectCarousel() {
  const { t } = useTranslation();
  const { data, isPending, isError } = useAvailableProjects();
  const projects = (data ?? []).slice(0, FEATURED_LIMIT);

  return (
    <section className="flex w-full flex-col items-end gap-6">
      <h2 dir="auto" className="text-foreground/40 w-full text-start text-xl font-semibold">
        {t('dashboard.carousel.headline')}
      </h2>
      <CarouselBody isPending={isPending} isError={isError} projects={projects} />
    </section>
  );
}

type CarouselBodyProps = { isPending: boolean; isError: boolean; projects: Project[] };

function CarouselBody({ isPending, isError, projects }: CarouselBodyProps) {
  const { t } = useTranslation();

  if (isPending) return <SkeletonRail />;
  if (isError) return <CarouselMessage text={t('dashboard.carousel.error')} />;
  if (projects.length === 0) return <CarouselMessage text={t('dashboard.carousel.empty')} />;

  return (
    <ul className={RAIL}>
      {projects.map((project) => (
        <li key={project.id} className="snap-start">
          <ProjectCard project={project} />
        </li>
      ))}
    </ul>
  );
}

function SkeletonRail() {
  return (
    <ul className={RAIL} aria-hidden>
      {[0, 1, 2].map((i) => (
        <li key={i} className="snap-start">
          <div className="bg-muted h-[221px] animate-pulse rounded-2xl" />
        </li>
      ))}
    </ul>
  );
}

function CarouselMessage({ text }: { text: string }) {
  return (
    <p dir="auto" className="text-foreground/60 w-full py-8 text-center text-sm">
      {text}
    </p>
  );
}
