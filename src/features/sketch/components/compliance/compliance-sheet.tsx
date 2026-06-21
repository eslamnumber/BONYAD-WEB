'use client';

import { useTranslation } from 'react-i18next';

import { CloseIcon } from '@/components/icons';
import { Modal } from '@/components/ui/modal';
import { cn } from '@/lib/utils';

import type { EngineeringReview, SketchParse } from '../../api/sketch-types';
import { readComplianceRows, verdictTone, type VerdictTone } from '../../lib/compliance';
import { pickText } from '../../lib/locale-text';

import { ComplianceList } from './compliance-list';

const SCORE_TONE: Record<VerdictTone, string> = {
  ok: 'text-status-approved',
  needs_fix: 'text-status-progress',
  reject: 'text-status-rejected',
};

const PILL_TONE: Record<VerdictTone, string> = {
  ok: 'bg-status-approved-soft text-status-approved',
  needs_fix: 'bg-status-progress-soft text-status-progress',
  reject: 'bg-status-rejected-soft text-status-rejected',
};

type Props = {
  open: boolean;
  onClose: () => void;
  parse?: SketchParse;
  /** Passed explicitly — the Modal is portalled and won't inherit the flow dir. */
  dir: 'ltr' | 'rtl';
};

/** Title at the inline-start, close at the inline-end — correct in both directions. */
function ComplianceHeader({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="border-border flex items-center justify-between gap-3 border-b px-6 py-5">
      <h2 id="sketch-compliance-title" className="text-foreground text-xl font-medium">
        {t('sketch.compliance.title')}
      </h2>
      <button
        type="button"
        onClick={onClose}
        aria-label={t('sketch.compliance.close')}
        className="text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:outline-ring -me-2 rounded-lg p-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <CloseIcon className="size-4" aria-hidden />
      </button>
    </div>
  );
}

function ScoreBlock({ review, tone }: { review?: EngineeringReview; tone: VerdictTone }) {
  const { t } = useTranslation();
  return (
    <div className="border-border flex items-center justify-between gap-4 rounded-2xl border p-4">
      <div className="flex flex-col gap-0.5">
        <span className="text-muted-foreground text-xs font-medium">
          {t('sketch.compliance.score')}
        </span>
        <span className={cn('text-3xl font-semibold tabular-nums', SCORE_TONE[tone])}>
          {t('sketch.compliance.scoreOutOf', { score: review?.score ?? 0 })}
        </span>
      </div>
      <span className={cn('rounded-full px-3 py-1 text-sm font-medium', PILL_TONE[tone])}>
        {t(`sketch.variants.verdict.${tone}`)}
      </span>
    </div>
  );
}

/** Code-compliance sheet — engineering score, summary, and the per-code checks. */
export function ComplianceSheet({ open, onClose, parse, dir }: Props) {
  const { t, i18n } = useTranslation();
  const review = parse?.engineering_review;
  const tone = verdictTone(review?.verdict);
  const rows = readComplianceRows(parse?.compliance_flags);
  const passed = rows.filter((row) => row.passed).length;
  const summary = pickText(i18n.language, review?.summary_en, review?.summary_ar);

  return (
    <Modal
      open={open}
      onClose={onClose}
      labelledBy="sketch-compliance-title"
      dir={dir}
      className="max-w-lg"
    >
      <ComplianceHeader onClose={onClose} />
      <div className="flex flex-col gap-5 p-6">
        <ScoreBlock review={review} tone={tone} />
        {summary ? (
          <p className="text-muted-foreground text-sm" dir="auto">
            {summary}
          </p>
        ) : null}
        <p className="text-muted-foreground text-sm">
          {t('sketch.compliance.summary', { passed, total: rows.length })}
        </p>
        <ComplianceList parse={parse} />
      </div>
    </Modal>
  );
}
