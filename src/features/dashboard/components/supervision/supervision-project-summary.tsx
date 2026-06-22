'use client';

import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { durationWeeks, localizedServiceName, shortLocation } from '../../lib/project-format';
import type { Project } from '../../schemas/project';
import { MoneyAmount } from '../money-amount';

/**
 * Shared project header for the supervision cards + control panel — the localized
 * service name, the description, and a 2/4-col stat grid. Follows the app card
 * convention (project-summary-card): content is document-anchored to the inline end
 * (`text-end`) and every dynamic backend value is wrapped in `<bdi>` to isolate its
 * own script — NOT `dir="auto"`, which would align Arabic data to the opposite side
 * from sibling screens under the inverted en→rtl map (see docs/i18n-and-rtl.md
 * §Tabular/columnar data).
 */
export function SupervisionProjectSummary({ project }: { project: Project }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith('ar') ? 'ar' : 'en';
  const service = localizedServiceName(project, locale);
  const weeks = durationWeeks(project.timeRequiredDays);

  return (
    <div className="flex flex-col gap-4 text-end">
      <div className="flex flex-col gap-1.5">
        <h3 className="text-foreground line-clamp-1 text-end text-lg font-semibold">
          <bdi>{service || project.description || t('dashboard.card.untitled')}</bdi>
        </h3>
        {project.description && service ? (
          <p className="text-muted-foreground line-clamp-2 text-end text-sm leading-6">
            <bdi>{project.description}</bdi>
          </p>
        ) : null}
      </div>

      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat
          label={t('dashboard.card.budgetLabel')}
          value={typeof project.budget === 'number' ? <MoneyAmount value={project.budget} /> : '—'}
        />
        <Stat
          label={t('dashboard.card.durationLabel')}
          value={weeks !== null ? `${weeks} ${t('dashboard.card.weeksUnit')}` : '—'}
        />
        <Stat
          label={t('dashboard.card.locationLabel')}
          value={shortLocation(project.address) ?? '—'}
        />
        <Stat label={t('dashboard.supervision.card.owner')} value={project.userName || '—'} />
      </dl>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1 text-end">
      <span className="text-muted-foreground text-xs font-medium">{label}</span>
      <span className="text-foreground text-sm font-semibold">
        <bdi>{value}</bdi>
      </span>
    </div>
  );
}
