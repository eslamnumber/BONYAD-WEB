'use client';

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { conventionalDirection, type Locale } from '@/types/locale';

import type { Project } from '../../schemas/project';
import { SowComplianceSection } from '../project-create/ai/sow/sections/sow-compliance-section';
import { SowDeliverablesSection } from '../project-create/ai/sow/sections/sow-deliverables-section';
import { SowKpisSection } from '../project-create/ai/sow/sections/sow-kpis-section';
import { SowObjectivesSection } from '../project-create/ai/sow/sections/sow-objectives-section';
import { SowResourcesSection } from '../project-create/ai/sow/sections/sow-resources-section';
import { SowRisksSection } from '../project-create/ai/sow/sections/sow-risks-section';
import { SowScopeSection } from '../project-create/ai/sow/sections/sow-scope-section';
import { SowCardVariantProvider } from '../project-create/ai/sow/sow-primitives';
import { parseProjectSow } from '../project-sow/parse-project-sow';

/**
 * Inline AI Scope-of-Work cards for the bid-phase / job-offer detail screen — the
 * non-collapsible replacement for the old `ProjectSowPanel` dropdown. The SOW wraps the
 * project images in the content column: the `'above'` group (objectives + scope) renders
 * before the images, the `'below'` group (deliverables, resources, compliance, risks,
 * KPIs) after them. The `'kpis'` group renders the success-indicators (مؤشرات النجاح)
 * card on its own — used above the customer's Edit/Delete actions on a pending project.
 * Overview / timeline / costs are omitted (the screen's summary +
 * phases already cover those). Self-hides for manual projects (`parseProjectSow` → null)
 * and when its own group has no data (`empty:hidden`). Rendered in the conventional
 * direction so the AI copy reads correctly, with the `'plain'` card chrome so each card
 * matches the sibling description / phases / images cards.
 */
export function ProjectSowColumn({
  project,
  group,
}: {
  project: Project;
  group: 'above' | 'below' | 'kpis';
}) {
  const { t, i18n } = useTranslation();
  const locale: Locale = i18n.language?.startsWith('ar') ? 'ar' : 'en';
  const sow = useMemo(() => parseProjectSow(project), [project]);
  if (!sow) return null;

  return (
    <SowCardVariantProvider variant="plain">
      <div className="flex flex-col gap-6 empty:hidden" dir={conventionalDirection(locale)}>
        {group === 'kpis' ? (
          <SowKpisSection kpis={sow.kpis} t={t} />
        ) : group === 'above' ? (
          <>
            <SowObjectivesSection objectives={sow.objectives} t={t} />
            <SowScopeSection scope={sow.scope} t={t} />
          </>
        ) : (
          <>
            <SowDeliverablesSection deliverables={sow.deliverables} t={t} />
            <SowResourcesSection resources={sow.resources} locale={locale} t={t} />
            <SowComplianceSection compliance={sow.compliance} t={t} />
            <SowRisksSection risks={sow.risks} t={t} />
            <SowKpisSection kpis={sow.kpis} t={t} />
          </>
        )}
      </div>
    </SowCardVariantProvider>
  );
}
