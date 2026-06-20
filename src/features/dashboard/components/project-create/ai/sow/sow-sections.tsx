import type { Locale } from '@/types/locale';

import type { SowDocument } from '../../../../api/ai/sow-types';

import { SowCommercialsSection } from './sections/sow-commercials-section';
import { SowComplianceSection } from './sections/sow-compliance-section';
import { SowDeliverablesSection } from './sections/sow-deliverables-section';
import { SowKpisSection } from './sections/sow-kpis-section';
import { SowMetadataSection } from './sections/sow-metadata-section';
import { SowObjectivesSection } from './sections/sow-objectives-section';
import { SowResourcesSection } from './sections/sow-resources-section';
import { SowRisksSection } from './sections/sow-risks-section';
import { SowScopeSection } from './sections/sow-scope-section';
import { SowTimelineSection } from './sections/sow-timeline-section';
import type { T } from './sow-flow-types';

/**
 * Renders the SOW document — each section hides itself when it has no data. With
 * `extrasOnly` (the status-screen panel), the overview (metadata), timeline, and
 * costs & payments (commercials) are dropped because the status screen's summary
 * card + phases + payment flow already cover them; the create-flow review leaves it
 * off to render the full document.
 */
export function SowSections({
  sow,
  locale,
  t,
  extrasOnly = false,
}: {
  sow: SowDocument;
  locale: Locale;
  t: T;
  extrasOnly?: boolean;
}) {
  return (
    <div className="flex flex-col gap-4">
      {extrasOnly ? null : <SowMetadataSection meta={sow.project_metadata} t={t} />}
      <SowObjectivesSection objectives={sow.objectives} t={t} />
      <SowScopeSection scope={sow.scope} t={t} />
      <SowDeliverablesSection deliverables={sow.deliverables} t={t} />
      {extrasOnly ? null : <SowTimelineSection timeline={sow.timeline} t={t} />}
      <SowResourcesSection resources={sow.resources} locale={locale} t={t} />
      {extrasOnly ? null : <SowCommercialsSection commercials={sow.commercials} t={t} />}
      <SowComplianceSection compliance={sow.compliance} t={t} />
      <SowRisksSection risks={sow.risks} t={t} />
      <SowKpisSection kpis={sow.kpis} t={t} />
    </div>
  );
}
