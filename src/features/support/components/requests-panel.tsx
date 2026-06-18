'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { type Locale } from '@/types/locale';

import { useSupportRequests } from '../api';
import {
  isConversationOpenable,
  REQUEST_FILTERS,
  requestMatchesFilter,
  type RequestFilter,
} from '../lib/support-format';
import { type SupportRequest } from '../schemas/support';

import { ConversationModal } from './conversation-modal';
import { NewRequestModal } from './new-request-modal';
import { PanelToolbar } from './panel-toolbar';
import { RequestDetailModal } from './request-detail-modal';
import { RequestList } from './request-list';

/** Conversations tab — status filter + new-request CTA + the request list. An assigned
 *  request opens the live conversation; others open the read-only detail. */
export function RequestsPanel({ locale }: { locale: Locale }) {
  const { t } = useTranslation();
  const query = useSupportRequests();
  const [filter, setFilter] = useState<RequestFilter>('ALL');
  const [creating, setCreating] = useState(false);
  const [detail, setDetail] = useState<SupportRequest | null>(null);
  const [convo, setConvo] = useState<SupportRequest | null>(null);

  const all = query.data ?? [];
  const filtered = all.filter((r) => requestMatchesFilter(r.status, filter));
  const options = REQUEST_FILTERS.map((f) => ({
    value: f,
    label: t(`support.requestFilter.${f.toLowerCase()}`),
  }));

  const open = (id: number) => {
    const request = all.find((r) => r.id === id);
    if (!request) return;
    if (isConversationOpenable(request.status, request.chatRoomRoomId)) setConvo(request);
    else setDetail(request);
  };

  return (
    <div className="flex flex-col gap-4">
      <PanelToolbar
        options={options}
        value={filter}
        onChange={setFilter}
        ariaLabel={t('support.requestFilter.aria')}
        ctaLabel={t('support.new.trigger')}
        onCta={() => setCreating(true)}
      />
      <RequestList
        requests={filtered}
        isPending={query.isPending}
        isError={query.isError}
        locale={locale}
        onRetry={() => void query.refetch()}
        onOpen={open}
      />
      <NewRequestModal open={creating} locale={locale} onClose={() => setCreating(false)} />
      <RequestDetailModal
        requestId={detail?.id ?? null}
        locale={locale}
        onClose={() => setDetail(null)}
      />
      <ConversationModal request={convo} locale={locale} onClose={() => setConvo(null)} />
    </div>
  );
}
