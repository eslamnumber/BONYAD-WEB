'use client';

import { useTranslation } from 'react-i18next';

import { type ProjectDetail } from '../../schemas/project';

/**
 * Project description card (Figma node 1046:6990): heading + free-text
 * description (preserves line breaks) + optional category chips. Backend-driven
 * from `PROJECTS.DETAILS`; chips render only when `requirements` is present.
 */
export function ProjectDescriptionCard({ project }: { project: ProjectDetail }) {
  const { t } = useTranslation();
  const chips = project.requirements?.filter(Boolean) ?? [];

  return (
    <section className="bg-card border-border flex w-full flex-col gap-5 rounded-xl border p-6">
      <div className="flex w-full flex-col gap-3">
        <h2 className="text-foreground text-end text-lg font-semibold">
          {t('dashboard.jobOffer.description.heading')}
        </h2>
        <div className="bg-border h-px w-full" />
      </div>
      <p className="text-foreground w-full text-end text-[15px] leading-[1.8] whitespace-pre-wrap">
        <bdi>{project.description || t('dashboard.jobOffer.description.empty')}</bdi>
      </p>
      {chips.length > 0 ? (
        <ul className="flex w-full flex-wrap items-start justify-end gap-2">
          {chips.map((chip, i) => (
            <li
              key={`${chip}-${i}`}
              className="bg-field-surface border-border text-foreground rounded-md border px-3 py-1.5 text-xs"
              dir="auto"
            >
              {chip}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
