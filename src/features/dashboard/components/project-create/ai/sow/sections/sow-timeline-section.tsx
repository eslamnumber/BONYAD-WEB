import { AboutTimelineDotIcon } from '@/components/icons';

import type { SowMilestone, SowTimeline } from '../../../../../api/ai/sow-types';
import type { T } from '../sow-flow-types';
import { hasText } from '../sow-format';
import { SowCard } from '../sow-primitives';

const K = 'dashboard.createProject.ai.sow';

/** Timeline — total duration plus a vertical milestone track with payment triggers. */
export function SowTimelineSection({ timeline, t }: { timeline?: SowTimeline; t: T }) {
  if (!timeline) return null;
  const milestones = (timeline.milestones ?? []).filter((m) => hasText(m.name));
  const weeks = timeline.duration_weeks;
  if (!milestones.length && typeof weeks !== 'number') return null;

  return (
    <SowCard title={t(`${K}.timeline.title`)} icon={<AboutTimelineDotIcon aria-hidden />}>
      {typeof weeks === 'number' ? (
        <p className="text-muted-foreground text-start text-sm">
          {t(`${K}.timeline.duration`, { count: weeks })}
        </p>
      ) : null}
      {milestones.length ? (
        <ol className="border-border mt-4 flex flex-col gap-5 border-s ps-5">
          {milestones.map((m, i) => (
            <Milestone key={`${m.name}-${i}`} milestone={m} index={i + 1} t={t} />
          ))}
        </ol>
      ) : null}
    </SowCard>
  );
}

function Milestone({ milestone, index, t }: { milestone: SowMilestone; index: number; t: T }) {
  return (
    <li className="relative">
      <span className="bg-job-accent absolute -start-[1.625rem] top-1 flex size-5 items-center justify-center rounded-full text-[10px] font-bold text-white">
        {index}
      </span>
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span dir="auto" className="text-foreground text-start text-sm font-semibold">
            {milestone.name}
          </span>
          {typeof milestone.payment_percent === 'number' ? (
            <span dir="ltr" className="text-job-accent text-xs font-semibold tabular-nums">
              {milestone.payment_percent}%
            </span>
          ) : null}
        </div>
        {typeof milestone.week === 'number' ? (
          <span className="text-muted-foreground text-start text-xs">
            {t(`${K}.timeline.week`, { count: milestone.week })}
          </span>
        ) : null}
        {hasText(milestone.description) ? (
          <p dir="auto" className="text-muted-foreground text-start text-xs leading-relaxed">
            {milestone.description}
          </p>
        ) : null}
      </div>
    </li>
  );
}
