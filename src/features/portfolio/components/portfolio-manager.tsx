'use client';

import { useState } from 'react';

import { type Locale } from '@/types/locale';

import { type Portfolio } from '../schemas/portfolio';

import { EditPortfolioModal } from './edit-portfolio-modal';
import { PortfolioHeader } from './portfolio-header';
import { ProjectsSection } from './projects-section';

/**
 * The "portfolio exists" view: the merged identity masthead on top (photo · name · trade
 * tags · stats · edit), then the work gallery full-width below — so the projects, the
 * whole point of a portfolio, get room to breathe across up to three columns instead of
 * being cramped into a 2/3 sidebar split. Stacked top-to-bottom, so it mirrors cleanly
 * between LTR and RTL with no column-order slip. My own web design.
 */
export function PortfolioManager({ portfolio, locale }: { portfolio: Portfolio; locale: Locale }) {
  const [editOpen, setEditOpen] = useState(false);
  const embedded = portfolio.projects ?? [];
  const projectCount = portfolio.projectsCount ?? embedded.length;

  return (
    <>
      <div className="flex flex-col gap-6 lg:gap-8">
        <PortfolioHeader
          portfolio={portfolio}
          projectCount={projectCount}
          onEdit={() => setEditOpen(true)}
        />
        <ProjectsSection locale={locale} fallbackProjects={embedded} />
      </div>
      {editOpen ? (
        <EditPortfolioModal open portfolio={portfolio} onClose={() => setEditOpen(false)} />
      ) : null}
    </>
  );
}
