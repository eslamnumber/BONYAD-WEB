'use client';

import { type ReactNode, useId } from 'react';
import { useTranslation } from 'react-i18next';

import { FileIcon } from '@/components/icons';
import { Modal, ModalHeader } from '@/components/ui';
import { type Locale, LOCALE_DIRECTION } from '@/types/locale';

import { useChangeRequestThread } from '../../api/get-change-request-thread';
import { isActiveChangeRequestStatus } from '../../lib/change-request-status';
import type { ChangeRequest } from '../../schemas/change-request';

import { AgreementProgress } from './agreement-progress';
import { ChangeRequestActions } from './change-request-actions';
import { ChangeRequestStatusBadge } from './change-request-status-badge';
import { ThreadMessage } from './thread-message';

type Props = { projectId: number; cr: ChangeRequest; isTechnician: boolean; onClose: () => void };

/**
 * Negotiation detail dialog: the full message chain (parent + counter-offers), the
 * two-party agreement state, the signed document once both have agreed, and the
 * action bar while the request is still active. The `cr` summary (from the list)
 * drives the header instantly; the chain is fetched lazily.
 */
export function ChangeRequestThread({ projectId, cr, isTechnician, onClose }: Props) {
  const { t, i18n } = useTranslation();
  const locale: Locale = i18n.language.startsWith('ar') ? 'ar' : 'en';
  const titleId = useId();
  const thread = useChangeRequestThread(cr.id);
  // The list summary's agreement flags can lag; prefer the fresher thread record
  // so the action bar hides correctly once the viewer has agreed.
  const current = thread.data?.find((node) => node.id === cr.id) ?? cr;

  return (
    <Modal
      open
      onClose={onClose}
      labelledBy={titleId}
      dir={LOCALE_DIRECTION[locale]}
      className="max-w-[560px]"
    >
      <ModalHeader
        titleId={titleId}
        title={t('dashboard.changeRequests.thread.title')}
        closeLabel={t('dashboard.changeRequests.form.cancel')}
        onClose={onClose}
      />
      <div className="flex flex-col gap-5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <ChangeRequestStatusBadge status={current.status} />
          <AgreementProgress cr={current} isTechnician={isTechnician} />
        </div>
        {current.bothAgreed && current.documentUrl && <DocumentLink url={current.documentUrl} />}
        <ThreadBody query={thread} cr={cr} locale={locale} />
        {isActiveChangeRequestStatus(current.status) && (
          <ChangeRequestActions
            projectId={projectId}
            cr={current}
            isTechnician={isTechnician}
            onDone={onClose}
          />
        )}
      </div>
    </Modal>
  );
}

function ThreadBody({
  query,
  cr,
  locale,
}: {
  query: ReturnType<typeof useChangeRequestThread>;
  cr: ChangeRequest;
  locale: Locale;
}) {
  const { t } = useTranslation();
  if (query.isPending) return <Note>{t('dashboard.changeRequests.thread.loading')}</Note>;
  if (query.isError) return <Note>{t('dashboard.changeRequests.thread.error')}</Note>;
  const nodes = query.data && query.data.length > 0 ? query.data : [cr];
  return (
    <div className="flex flex-col gap-3">
      {nodes.map((node) => (
        <ThreadMessage key={node.id} node={node} locale={locale} />
      ))}
    </div>
  );
}

function DocumentLink({ url }: { url: string }) {
  const { t } = useTranslation();
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="border-status-approved/40 bg-status-approved-soft/40 text-status-approved focus-visible:outline-ring inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      <FileIcon className="size-4 shrink-0" aria-hidden />
      {t('dashboard.changeRequests.agreement.viewDocument')}
    </a>
  );
}

function Note({ children }: { children: ReactNode }) {
  return (
    <p dir="auto" className="text-muted-foreground text-start text-sm">
      {children}
    </p>
  );
}
