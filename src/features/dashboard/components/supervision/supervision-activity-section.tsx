'use client';

import { useTranslation } from 'react-i18next';

import { EmptyState, ErrorState, LoadingState } from '@/components/feedback';

import { useSupervisorActivity } from '../../api';
import { formatProjectDate } from '../../lib/project-format';
import type { SupervisorActivity } from '../../schemas/supervisor';

/**
 * The supervisor audit log (GET …/supervisor/activity). Only fetched once the
 * supervisor is ACTIVE (`enabled`) — the endpoint 403s otherwise. Renders a simple
 * timeline; the action string is backend-formatted, so it's wrapped in `<bdi>` with a
 * document-anchored `text-end` (the app card convention — never `dir="auto"`, which would
 * flip Arabic actions to the opposite side under the inverted map).
 */
export function SupervisionActivitySection({
  projectId,
  active,
}: {
  projectId: number;
  active: boolean;
}) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith('ar') ? 'ar' : 'en';
  const { data, isPending, isError } = useSupervisorActivity(projectId, active);

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-foreground text-end text-lg font-semibold tracking-tight">
        {t('dashboard.supervision.activity.title')}
      </h2>
      {renderBody()}
    </section>
  );

  function renderBody() {
    if (isPending) return <LoadingState label={t('common.loading')} />;
    if (isError) {
      return (
        <ErrorState
          title={t('dashboard.supervision.activity.error.title')}
          description={t('dashboard.supervision.activity.error.body')}
        />
      );
    }
    const rows = data ?? [];
    if (rows.length === 0) {
      return (
        <EmptyState
          title={t('dashboard.supervision.activity.empty.title')}
          description={t('dashboard.supervision.activity.empty.body')}
        />
      );
    }
    return (
      <ol className="border-border bg-card flex flex-col gap-4 rounded-xl border p-5">
        {rows.map((row, i) => (
          <ActivityRow
            key={row.id ?? i}
            row={row}
            dateLabel={formatProjectDate(row.timestamp, locale)}
          />
        ))}
      </ol>
    );
  }
}

function ActivityRow({ row, dateLabel }: { row: SupervisorActivity; dateLabel: string }) {
  return (
    <li className="flex flex-col items-end gap-1 text-end">
      <p className="text-foreground w-full text-end text-sm leading-6">
        <bdi>{row.action || '—'}</bdi>
      </p>
      <time className="text-muted-foreground text-xs font-medium">{dateLabel}</time>
    </li>
  );
}
