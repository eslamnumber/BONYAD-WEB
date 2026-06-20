import { EyeIcon } from '@/components/icons';

import type { SowRisk } from '../../../../../api/ai/sow-types';
import type { T } from '../sow-flow-types';
import { hasText } from '../sow-format';
import { SowCard } from '../sow-primitives';

const K = 'dashboard.createProject.ai.sow';

/** Risks — description with probability/impact badges and a mitigation line. */
export function SowRisksSection({ risks, t }: { risks?: SowRisk[]; t: T }) {
  const items = (risks ?? []).filter((r) => hasText(r.description));
  if (!items.length) return null;

  return (
    <SowCard title={t(`${K}.risks.title`)} icon={<EyeIcon aria-hidden />}>
      <ul className="flex flex-col gap-3">
        {items.map((r, i) => (
          <li
            key={`${r.description}-${i}`}
            className="border-border bg-field-surface flex flex-col gap-2 rounded-xl border p-4"
          >
            <p dir="auto" className="text-foreground text-start text-sm font-medium">
              {r.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {hasText(r.probability) ? (
                <Badge label={t(`${K}.risks.probability`)} value={r.probability!} />
              ) : null}
              {hasText(r.impact) ? (
                <Badge label={t(`${K}.risks.impact`)} value={r.impact!} />
              ) : null}
            </div>
            {hasText(r.mitigation) ? (
              <p dir="auto" className="text-muted-foreground text-start text-xs leading-relaxed">
                <span className="font-medium">{t(`${K}.risks.mitigation`)}: </span>
                {r.mitigation}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </SowCard>
  );
}

function Badge({ label, value }: { label: string; value: string }) {
  return (
    <span className="border-border bg-secondary/50 text-secondary-foreground inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs">
      <span className="text-muted-foreground">{label}:</span>
      <span dir="auto" className="font-medium">
        {value}
      </span>
    </span>
  );
}
