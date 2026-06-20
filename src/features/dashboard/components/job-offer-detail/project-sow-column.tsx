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
 * Inline AI Scope-of-Work cards for the bid-phase detail screen — the non-collapsible
 * replacement for the old `ProjectSowPanel` dropdown. The SOW is split across the two
 * columns: the `'primary'` group (objectives + KPIs) sits under the bids / offer
 * column, the `'secondary'` group (scope, deliverables, resources, compliance, risks)
 * under the images column, each card the full width of its column. Self-hides for
 * manual projects (`parseProjectSow` → null) and when its own group has no data
 * (`empty:hidden`). Rendered in the conventional direction so the AI copy reads
 * correctly, with the `'plain'` card chrome so each card matches the sibling
 * description / phases / images cards.
 */
export function ProjectSowColumn({
  project,
  group,
}: {
  project: Project;
  group: 'primary' | 'secondary';
}) {
  const { t, i18n } = useTranslation();
  const locale: Locale = i18n.language?.startsWith('ar') ? 'ar' : 'en';
  const sow = useMemo(() => parseProjectSow(project), [project]);
  if (!sow) return null;

  return (
    <SowCardVariantProvider variant="plain">
      <div className="flex flex-col gap-6 empty:hidden" dir={conventionalDirection(locale)}>
        {group === 'primary' ? (
          <>
            <SowObjectivesSection objectives={sow.objectives} t={t} />
            <SowKpisSection kpis={sow.kpis} t={t} />
          </>
        ) : (
          <>
            <SowScopeSection scope={sow.scope} t={t} />
            <SowDeliverablesSection deliverables={sow.deliverables} t={t} />
            <SowResourcesSection resources={sow.resources} locale={locale} t={t} />
            <SowComplianceSection compliance={sow.compliance} t={t} />
            <SowRisksSection risks={sow.risks} t={t} />
          </>
        )}
      </div>
    </SowCardVariantProvider>
  );
}
