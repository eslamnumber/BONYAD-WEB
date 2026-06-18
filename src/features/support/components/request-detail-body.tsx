'use client';

import { useTranslation } from 'react-i18next';

import { Skeleton } from '@/components/ui';
import { type Locale } from '@/types/locale';

import { formatSupportDate, resolveSupportPriority } from '../lib/support-format';
import { type SupportRequestDetail } from '../schemas/support';

import { RequestStatusBadge } from './request-status-badge';

type Query = { data?: SupportRequestDetail; isPending: boolean; isError: boolean };

/** Detail-modal body — switches between loading / error / the resolved request. */
export function DetailBody({ query, locale }: { query: Query; locale: Locale }) {
  const { t } = useTranslation();
  if (query.isPending) return <DetailSkeleton />;
  if (query.isError || !query.data) {
    return (
      <p className="text-muted-foreground p-6 text-start text-sm">{t('support.detail.error')}</p>
    );
  }
  return <DetailContent request={query.data} locale={locale} />;
}

/** Key/value row — the value uses document-relative `text-end` (consistent edge for every
 *  row) with `<bdi>` to isolate a value's own script (e.g. an Arabic admin name); never
 *  `dir="auto"` + `text-end`, which would split values by language (RTL doc §columnar). */
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="text-foreground text-end text-sm font-medium">
        <bdi>{value}</bdi>
      </dd>
    </div>
  );
}

function DetailContent({ request, locale }: { request: SupportRequestDetail; locale: Locale }) {
  const { t } = useTranslation();
  const priority = resolveSupportPriority(request.priority);
  const submitted = formatSupportDate(request.requestedAt, locale);
  const resolved = formatSupportDate(request.resolvedAt, locale);

  return (
    <div className="flex flex-col gap-5 p-6">
      <div className="flex items-center justify-between gap-3">
        <RequestStatusBadge status={request.status} />
        <h3 dir="auto" className="text-foreground text-start text-base font-semibold">
          {request.subject}
        </h3>
      </div>
      {request.description ? (
        <p dir="auto" className="text-muted-foreground text-start text-sm leading-6">
          {request.description}
        </p>
      ) : null}
      <dl className="border-border divide-border flex flex-col divide-y rounded-xl border">
        <InfoRow label={t('support.detail.reference')} value={`#${request.id}`} />
        <InfoRow label={t('support.detail.category')} value={request.category ?? '—'} />
        <InfoRow label={t('support.detail.priority')} value={t(priority.labelKey)} />
        <InfoRow
          label={t('support.detail.agent')}
          value={request.assignedAdminName ?? t('support.detail.unassigned')}
        />
        <InfoRow label={t('support.detail.submittedAt')} value={submitted ?? '—'} />
        {resolved ? <InfoRow label={t('support.detail.resolvedAt')} value={resolved} /> : null}
      </dl>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-3 p-6" aria-hidden>
      <Skeleton className="h-6 w-40 self-end rounded-full" />
      <Skeleton className="h-16 w-full rounded-xl" />
      <Skeleton className="h-40 w-full rounded-xl" />
    </div>
  );
}
