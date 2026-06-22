import { Info } from 'lucide-react';

import { AiAssistantIcon } from '@/components/icons';

import type { SowDocument } from '../../../../api/ai/sow-types';

import type { T } from './sow-flow-types';
import { hasText } from './sow-format';

const K = 'dashboard.createProject.ai.sow';

/** The SOW document header — Omdah mark, project title, quality tier, degraded notice. */
export function SowReviewHeader({
  sow,
  degraded,
  t,
}: {
  sow: SowDocument;
  degraded: boolean;
  t: T;
}) {
  const meta = sow.project_metadata ?? {};
  const title = hasText(meta.project_name) ? meta.project_name! : t(`${K}.review.untitled`);

  return (
    <header className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <span className="bg-job-accent/10 text-job-accent inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium">
          <AiAssistantIcon className="size-3.5" aria-hidden />
          {t(`${K}.review.byOmdah`)}
        </span>
        <h1
          dir="auto"
          className="text-foreground text-start text-2xl font-bold tracking-tight sm:text-3xl"
        >
          {title}
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          {hasText(meta.quality_tier) ? (
            <span className="border-job-accent/30 text-job-accent inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold">
              {t(`${K}.review.tier`, { tier: meta.quality_tier })}
            </span>
          ) : null}
          {hasText(meta.project_type) ? (
            <span dir="auto" className="text-muted-foreground text-sm">
              {meta.project_type}
            </span>
          ) : null}
        </div>
      </div>

      {degraded ? <DegradedNotice t={t} /> : null}
    </header>
  );
}

function DegradedNotice({ t }: { t: T }) {
  return (
    <div
      role="status"
      className="border-warning/40 bg-warning/10 flex items-start gap-2.5 rounded-xl border p-3"
    >
      <Info className="text-warning mt-0.5 size-4 shrink-0" aria-hidden />
      <p className="text-foreground/80 text-start text-xs leading-relaxed">
        {t(`${K}.review.degraded`)}
      </p>
    </div>
  );
}
