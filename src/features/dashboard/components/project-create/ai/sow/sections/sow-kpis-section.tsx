import { ServiceReviewIcon } from '@/components/icons';

import type { SowKpi } from '../../../../../api/ai/sow-types';
import type { T } from '../sow-flow-types';
import { hasText } from '../sow-format';
import { SowCard } from '../sow-primitives';

const K = 'dashboard.createProject.ai.sow';

/** KPIs — metric, target, tolerance. */
export function SowKpisSection({ kpis, t }: { kpis?: SowKpi[]; t: T }) {
  const items = (kpis ?? []).filter((k) => hasText(k.metric));
  if (!items.length) return null;

  return (
    <SowCard title={t(`${K}.kpis.title`)} icon={<ServiceReviewIcon aria-hidden />}>
      <ul className="grid gap-3 sm:grid-cols-2">
        {items.map((k, i) => (
          <li
            key={`${k.metric}-${i}`}
            className="border-border bg-field-surface flex flex-col gap-1 rounded-xl border p-4"
          >
            <span dir="auto" className="text-foreground text-start text-sm font-medium">
              {k.metric}
            </span>
            {hasText(k.target) ? (
              <span dir="auto" className="text-job-accent text-start text-sm">
                {t(`${K}.kpis.target`)}: {k.target}
              </span>
            ) : null}
            {hasText(k.tolerance) ? (
              <span dir="auto" className="text-muted-foreground text-start text-xs">
                {t(`${K}.kpis.tolerance`)}: {k.tolerance}
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </SowCard>
  );
}
