'use client';

import { useTranslation } from 'react-i18next';

import { type Locale } from '@/types/locale';

import { formatFeedbackDate, resolveFeedbackCategoryKey } from '../lib/feedback-format';
import { type AppFeedback } from '../schemas/feedback';

import { FeedbackStatusBadge } from './feedback-status-badge';

/** Neutral category capsule (no per-category icon — the iOS SF Symbols can't be reused). */
function CategoryChip({ label }: { label: string }) {
  return (
    <span className="bg-muted text-muted-foreground inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium">
      {label}
    </span>
  );
}

/** Admin reply, shown once the team reviews/resolves the item. */
function AdminNote({ note }: { note: string }) {
  const { t } = useTranslation();
  return (
    <div className="bg-muted/50 rounded-xl p-3">
      <p className="text-muted-foreground text-start text-xs font-medium">
        {t('feedback.card.teamNote')}
      </p>
      <p className="text-foreground mt-1 text-start text-sm">
        <bdi>{note}</bdi>
      </p>
    </div>
  );
}

/**
 * One submitted feedback as a display card (not interactive — there is no detail screen).
 * **Conventional direction** (this screen overrides the inverted map): category + status lead
 * at the reading-start, the date trails at the reading-end (`ms-auto`). `<bdi>` isolates the
 * user's subject/message script so a mixed-language column stays clean.
 */
export function FeedbackCard({ feedback, locale }: { feedback: AppFeedback; locale: Locale }) {
  const { t } = useTranslation();
  const date = formatFeedbackDate(feedback.createdAt, locale);
  const categoryLabel = t(resolveFeedbackCategoryKey(feedback.category));
  const title = feedback.subject?.trim() || feedback.message?.trim() || t('feedback.card.untitled');

  return (
    <article className="bg-card border-border flex flex-col gap-3 rounded-2xl border p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <CategoryChip label={categoryLabel} />
        <FeedbackStatusBadge status={feedback.status} />
        {date ? <span className="text-muted-foreground ms-auto text-xs">{date}</span> : null}
      </div>

      <div className="flex flex-col gap-1">
        <h2 className="text-foreground text-start text-sm font-medium">
          <bdi>{title}</bdi>
        </h2>
        {feedback.message ? (
          <p className="text-muted-foreground line-clamp-2 text-start text-sm">
            <bdi>{feedback.message}</bdi>
          </p>
        ) : null}
      </div>

      {feedback.adminNote ? <AdminNote note={feedback.adminNote} /> : null}
    </article>
  );
}
