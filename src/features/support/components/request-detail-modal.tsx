'use client';

import { useId } from 'react';
import { useTranslation } from 'react-i18next';

import { Modal } from '@/components/ui';
import { type Locale } from '@/types/locale';

import { useSupportRequest } from '../api';
import { conventionalDir } from '../lib/support-format';

import { DetailBody } from './request-detail-body';
import { SupportModalHeader } from './support-modal-header';

type Props = { requestId: number | null; locale: Locale; onClose: () => void };

/** Read-only detail for one request — fetches GET /support/requests/:id while open. */
export function RequestDetailModal({ requestId, locale, onClose }: Props) {
  const { t } = useTranslation();
  const titleId = useId();
  const query = useSupportRequest(requestId);

  return (
    <Modal
      open={requestId !== null}
      onClose={onClose}
      labelledBy={titleId}
      dir={conventionalDir(locale)}
    >
      <SupportModalHeader
        titleId={titleId}
        title={t('support.detail.title')}
        closeLabel={t('support.detail.close')}
        onClose={onClose}
      />
      <DetailBody query={query} locale={locale} />
    </Modal>
  );
}
