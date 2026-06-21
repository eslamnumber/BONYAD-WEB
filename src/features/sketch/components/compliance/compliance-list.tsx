'use client';

import { useTranslation } from 'react-i18next';

import { PhaseCheckIcon } from '@/components/icons';
import { cn } from '@/lib/utils';

import type { EngineeringIssue, SketchParse } from '../../api/sketch-types';
import { readComplianceRows, type ComplianceRow } from '../../lib/compliance';
import { pickText } from '../../lib/locale-text';

const severityDot = (severity?: string): string =>
  severity === 'critical'
    ? 'bg-status-rejected'
    : severity === 'warning'
      ? 'bg-status-progress'
      : 'bg-muted-foreground';

/** One code check: pass badge, or the list of issues with a severity dot. */
function CodeRow({ row }: { row: ComplianceRow }) {
  const { t, i18n } = useTranslation();
  return (
    <div className="border-border rounded-xl border p-3 transition-shadow hover:shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="text-foreground text-sm font-medium">
          {t(`sketch.compliance.codes.${row.code}`)}
        </span>
        {row.passed ? (
          <span className="text-status-approved inline-flex items-center gap-1 text-xs font-medium">
            <PhaseCheckIcon className="size-4" aria-hidden />
            {t('sketch.compliance.passed')}
          </span>
        ) : (
          <span className="text-status-rejected text-xs font-medium">
            {t('sketch.compliance.issuesCount', { count: row.issues.length })}
          </span>
        )}
      </div>
      {row.issues.length > 0 ? (
        <ul className="mt-2 flex flex-col gap-2">
          {row.issues.map((issue, i) => (
            <li key={`${row.code}-${i}`} className="flex items-start gap-2">
              <span
                aria-hidden
                className={cn('mt-1.5 size-1.5 shrink-0 rounded-full', severityDot(issue.severity))}
              />
              <span className="text-muted-foreground text-sm" dir="auto">
                {pickText(i18n.language, issue.msg_en, issue.msg_ar)}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/** The engineering review's problems + suggested fixes. */
function ReviewNotes({ notes }: { notes: EngineeringIssue[] }) {
  const { t, i18n } = useTranslation();
  if (notes.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-foreground text-sm font-semibold">
        {t('sketch.compliance.suggestedFix')}
      </h3>
      {notes.map((note, i) => (
        <div
          key={`note-${i}`}
          className="border-border rounded-xl border p-3 transition-shadow hover:shadow-sm"
        >
          <p className="text-foreground text-sm" dir="auto">
            {pickText(i18n.language, note.problem_en, note.problem_ar)}
          </p>
          {note.suggested_fix ? (
            <p className="text-muted-foreground mt-1 text-sm" dir="auto">
              {note.suggested_fix}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

/** The six code checks plus the engineering review's suggested fixes. */
export function ComplianceList({ parse }: { parse?: SketchParse }) {
  const rows = readComplianceRows(parse?.compliance_flags);
  return (
    <div className="flex flex-col gap-3">
      {rows.map((row) => (
        <CodeRow key={row.code} row={row} />
      ))}
      <ReviewNotes notes={parse?.engineering_review?.issues ?? []} />
    </div>
  );
}
