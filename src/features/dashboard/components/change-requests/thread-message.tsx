'use client';

import { useTranslation } from 'react-i18next';

import type { Locale } from '@/types/locale';

import { formatBudget, formatProjectDate } from '../../lib/project-format';
import type { ChangeRequest } from '../../schemas/change-request';

import { PhaseChangesList } from './phase-changes-list';

/**
 * One node in a negotiation chain. The root request shows its description, new
 * budget, and phase changes; a counter-offer child shows its `response` text.
 * Author + timestamp are derived from whichever side authored the node.
 */
export function ThreadMessage({ node, locale }: { node: ChangeRequest; locale: Locale }) {
  const { t } = useTranslation();
  const isResponse = Boolean(node.response);
  const author = (isResponse ? node.respondedBy : node.requestedBy) ?? '';
  const text = node.response ?? node.description ?? '';

  return (
    <div className="border-border bg-card flex flex-col gap-2 rounded-xl border p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-muted-foreground text-xs">
          {isResponse
            ? t('dashboard.changeRequests.thread.responded')
            : t('dashboard.changeRequests.thread.requested')}
        </span>
        {author && (
          <span
            dir="auto"
            className="text-foreground min-w-0 truncate text-start text-sm font-medium"
          >
            {author}
          </span>
        )}
      </div>
      {text && (
        <p dir="auto" className="text-foreground text-start text-sm">
          {text}
        </p>
      )}
      <MessageDetails node={node} locale={locale} />
    </div>
  );
}

/** Optional budget / phase-changes / timestamp footer for a thread node. */
function MessageDetails({ node, locale }: { node: ChangeRequest; locale: Locale }) {
  const { t } = useTranslation();
  const when = node.response ? node.respondedAt : node.requestedAt;
  return (
    <>
      {typeof node.newBudget === 'number' && (
        <p className="text-muted-foreground text-end text-xs">
          {t('dashboard.changeRequests.thread.budget')}:{' '}
          <span className="text-foreground">{formatBudget(node.newBudget)}</span>
        </p>
      )}
      <PhaseChangesList changes={node.phaseChanges ?? []} />
      {when && (
        <span className="text-muted-foreground text-end text-[11px]">
          {formatProjectDate(when, locale)}
        </span>
      )}
    </>
  );
}
