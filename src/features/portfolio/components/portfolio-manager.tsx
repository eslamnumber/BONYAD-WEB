'use client';

import { useState } from 'react';

import { type Locale } from '@/types/locale';

import { type Portfolio } from '../schemas/portfolio';

import { EditPortfolioModal } from './edit-portfolio-modal';
import { PortfolioInfoCard } from './portfolio-info-card';
import { ProjectsSection } from './projects-section';

/**
 * The "portfolio exists" view: a dashboard split — the work gallery takes the wide
 * column on the inline-START, the identity card sits in a sticky sidebar on the
 * inline-END (→ right in Arabic, left in English). Column order follows DOM order (no
 * `order` utilities), so the grid mirrors cleanly between LTR and RTL with no slip.
 * Two real columns fill the width instead of stretching a single full-width bar.
 */
export function PortfolioManager({ portfolio, locale }: { portfolio: Portfolio; locale: Locale }) {
  const [editOpen, setEditOpen] = useState(false);
  const embedded = portfolio.projects ?? [];
  const projectCount = portfolio.projectsCount ?? embedded.length;

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-3 lg:items-start lg:gap-8">
        <div className="lg:col-span-2">
          <ProjectsSection locale={locale} fallbackProjects={embedded} />
        </div>
        <div className="lg:sticky lg:top-8 lg:col-span-1">
          <PortfolioInfoCard
            portfolio={portfolio}
            projectCount={projectCount}
            onEdit={() => setEditOpen(true)}
          />
        </div>
      </div>
      {editOpen ? (
        <EditPortfolioModal open portfolio={portfolio} onClose={() => setEditOpen(false)} />
      ) : null}
    </>
  );
}
