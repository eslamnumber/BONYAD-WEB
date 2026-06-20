import { DashboardProjectsIcon } from '@/components/icons';

import type { SowMetadata } from '../../../../../api/ai/sow-types';
import type { T } from '../sow-flow-types';
import { hasText } from '../sow-format';
import { SowCard } from '../sow-primitives';

const K = 'dashboard.createProject.ai.sow';

/** Project metadata — type, sector, property, complexity, quality, location — as a stat grid. */
export function SowMetadataSection({ meta, t }: { meta?: SowMetadata; t: T }) {
  if (!meta) return null;
  const loc = meta.location ?? {};
  const place = [loc.district, loc.city].filter(Boolean).join('، ');
  const fields = [
    { label: t(`${K}.metadata.type`), value: meta.project_type },
    { label: t(`${K}.metadata.sector`), value: meta.sector },
    { label: t(`${K}.metadata.property`), value: meta.property_type },
    { label: t(`${K}.metadata.complexity`), value: meta.complexity_level },
    { label: t(`${K}.metadata.location`), value: place || undefined },
    { label: t(`${K}.metadata.floor`), value: loc.floor },
    { label: t(`${K}.metadata.conditions`), value: loc.site_conditions },
  ].filter((f) => hasText(f.value));
  if (fields.length === 0) return null;

  return (
    <SowCard title={t(`${K}.metadata.title`)} icon={<DashboardProjectsIcon aria-hidden />}>
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {fields.map((f) => (
          <div
            key={f.label}
            className="border-border bg-field-surface flex flex-col gap-1 rounded-xl border p-3.5"
          >
            <dt className="text-muted-foreground text-start text-xs">{f.label}</dt>
            <dd dir="auto" className="text-foreground text-start text-sm font-medium">
              {f.value}
            </dd>
          </div>
        ))}
      </dl>
    </SowCard>
  );
}
