import { ServiceDoneIcon } from '@/components/icons';

import type { SowDeliverable } from '../../../../../api/ai/sow-types';
import type { T } from '../sow-flow-types';
import { hasText } from '../sow-format';
import { Chip, SowCard } from '../sow-primitives';

const K = 'dashboard.createProject.ai.sow';

/** Deliverables — each with quantity, category, and acceptance criteria. */
export function SowDeliverablesSection({
  deliverables,
  t,
}: {
  deliverables?: SowDeliverable[];
  t: T;
}) {
  const items = (deliverables ?? []).filter((d) => hasText(d.name) || hasText(d.description));
  if (!items.length) return null;

  return (
    <SowCard title={t(`${K}.deliverables.title`)} icon={<ServiceDoneIcon aria-hidden />}>
      <ul className="flex flex-col gap-3">
        {items.map((d, i) => (
          <li
            key={d.id ?? `${d.name}-${i}`}
            className="border-border bg-field-surface flex flex-col gap-2 rounded-xl border p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span dir="auto" className="text-foreground text-start text-sm font-semibold">
                {d.name}
              </span>
              {typeof d.quantity === 'number' ? (
                <Chip>
                  <span dir="ltr">{d.quantity}</span>
                  {hasText(d.unit) ? <span className="ms-1">{d.unit}</span> : null}
                </Chip>
              ) : null}
            </div>
            {hasText(d.description) ? (
              <p dir="auto" className="text-muted-foreground text-start text-sm leading-relaxed">
                {d.description}
              </p>
            ) : null}
            {hasText(d.acceptance_criteria) ? (
              <p dir="auto" className="text-foreground/70 text-start text-xs">
                <span className="font-medium">{t(`${K}.deliverables.acceptance`)}: </span>
                {d.acceptance_criteria}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </SowCard>
  );
}
