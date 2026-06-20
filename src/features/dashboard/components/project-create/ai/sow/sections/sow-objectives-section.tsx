import { StarIcon } from '@/components/icons';

import type { SowObjectives } from '../../../../../api/ai/sow-types';
import type { T } from '../sow-flow-types';
import { hasText } from '../sow-format';
import { KeyValueRow, SowCard } from '../sow-primitives';

const K = 'dashboard.createProject.ai.sow';

/** Objectives — business + functional goals and the success metrics. */
export function SowObjectivesSection({ objectives, t }: { objectives?: SowObjectives; t: T }) {
  if (!objectives) return null;
  const metrics = objectives.success_metrics ?? {};
  const hasAny =
    hasText(objectives.business_objective) ||
    hasText(objectives.functional_objective) ||
    hasText(metrics.time) ||
    hasText(metrics.cost) ||
    hasText(metrics.quality);
  if (!hasAny) return null;

  return (
    <SowCard title={t(`${K}.objectives.title`)} icon={<StarIcon aria-hidden />}>
      <div className="flex flex-col gap-4">
        {hasText(objectives.business_objective) ? (
          <Objective label={t(`${K}.objectives.business`)} value={objectives.business_objective!} />
        ) : null}
        {hasText(objectives.functional_objective) ? (
          <Objective
            label={t(`${K}.objectives.functional`)}
            value={objectives.functional_objective!}
          />
        ) : null}
        <dl className="flex flex-col">
          <KeyValueRow label={t(`${K}.objectives.time`)} value={metrics.time} />
          <KeyValueRow label={t(`${K}.objectives.cost`)} value={metrics.cost} />
          <KeyValueRow label={t(`${K}.objectives.quality`)} value={metrics.quality} />
        </dl>
      </div>
    </SowCard>
  );
}

function Objective({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-muted-foreground text-start text-xs font-medium tracking-wide uppercase">
        {label}
      </span>
      <p dir="auto" className="text-foreground/90 text-start text-sm leading-relaxed">
        {value}
      </p>
    </div>
  );
}
