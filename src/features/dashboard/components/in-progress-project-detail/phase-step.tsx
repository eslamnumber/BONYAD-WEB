'use client';

import { useTranslation } from 'react-i18next';

import { ChevronUpIcon, PhaseCheckIcon, PlusIcon, UploadIcon } from '@/components/icons';

import { type PhaseProgress } from '../../lib/project-finance';
import { type ProjectPhase } from '../../schemas/project-phase';

type Props = {
  phase: ProjectPhase;
  state: PhaseProgress;
  index: number;
  expanded: boolean;
  onToggle: () => void;
};

/**
 * One phase row in the timeline (Figma `Step` component, node 1103:6694). A
 * clickable summary (chevron · phase badge + title · status icon) that toggles an
 * expandable body (attachments + phase actions). `upcoming` phases dim to 75%.
 *
 * Notes vs Figma: the expanded body flows naturally (the Figma's absolute layout +
 * fixed h-310 is replaced so the row grows with content / stays responsive); the
 * attachment thumbnails have no backing field on `ProjectPhase`, so an empty state
 * is shown instead of hardcoded placeholder images; the three action buttons are
 * visual placeholders until their phase mutations are wired.
 */
export function PhaseStep({ phase, state, index, expanded, onToggle }: Props) {
  const { t } = useTranslation();
  const number = phase.phaseNumber ?? index + 1;

  return (
    <div
      className={`border-border border-b last:border-b-0 ${state === 'upcoming' ? 'opacity-75' : ''}`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="focus-visible:outline-ring flex w-full items-center justify-between gap-3 py-4 focus-visible:outline-2"
      >
        <ChevronUpIcon
          className={`text-muted-foreground size-5 shrink-0 ${expanded ? '' : '-scale-y-100'}`}
          aria-hidden
        />
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex min-w-0 flex-col items-end gap-2 text-end">
            <span className="bg-field-surface text-muted-foreground rounded-md px-2.5 py-1 text-[11px] font-semibold">
              {t('dashboard.projectDetail.phases.phaseLabel', { number })}
            </span>
            {phase.description ? (
              <span className="text-foreground line-clamp-2 text-lg font-semibold" dir="auto">
                {phase.description}
              </span>
            ) : null}
          </div>
          <StatusIcon state={state} />
        </div>
      </button>

      {expanded ? <PhaseBody /> : null}
    </div>
  );
}

function StatusIcon({ state }: { state: PhaseProgress }) {
  if (state === 'completed') {
    return (
      <span
        className="bg-paid flex size-5 shrink-0 items-center justify-center rounded-full"
        aria-hidden
      >
        <PhaseCheckIcon className="text-on-media size-2.5" />
      </span>
    );
  }
  if (state === 'active') {
    return (
      <span
        className="border-status-progress size-5 shrink-0 rounded-full border-2 border-dashed"
        aria-hidden
      />
    );
  }
  return <span className="border-upcoming/40 size-5 shrink-0 rounded-full border-2" aria-hidden />;
}

function PhaseBody() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-end gap-4 pb-4 text-end">
      <div className="flex w-full flex-col items-end gap-2">
        <p className="text-foreground text-xs font-medium">
          {t('dashboard.projectDetail.phases.attachments')}
        </p>
        <p className="text-muted-foreground text-xs">
          {t('dashboard.projectDetail.phases.attachmentsEmpty')}
        </p>
      </div>
      <div className="flex flex-wrap justify-end gap-3">
        <PlaceholderAction icon={<PlusIcon className="size-4" aria-hidden />}>
          {t('dashboard.projectDetail.phases.addUpdate')}
        </PlaceholderAction>
        <PlaceholderAction icon={<UploadIcon className="size-4" aria-hidden />}>
          {t('dashboard.projectDetail.phases.uploadImages')}
        </PlaceholderAction>
        <button
          type="button"
          className="bg-brand-dark-navy text-on-media rounded-lg px-4 py-2.5 text-sm font-medium"
        >
          {t('dashboard.projectDetail.phases.requestApproval')}
        </button>
      </div>
    </div>
  );
}

function PlaceholderAction({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className="border-border text-foreground bg-card flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium"
    >
      {icon}
      {children}
    </button>
  );
}
