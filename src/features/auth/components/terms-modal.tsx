'use client';

import type { UseQueryResult } from '@tanstack/react-query';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Modal, ModalFooter, ModalHeader } from '@/components/ui';
import { LOCALE_DIRECTION, type Locale } from '@/types/locale';

import { type TermsAndConditions } from '../schemas/terms.schema';

import { TermsDocument } from './terms-document';

type Props = {
  open: boolean;
  onClose: () => void;
  locale: Locale;
  query: UseQueryResult<TermsAndConditions | null>;
};

/**
 * Read-only Terms & Conditions viewer. Built on the shared `Modal` (Bonyad-web's own
 * dialog chrome — focus trap, ESC, scrim), wider than the default so the legal
 * document has room to read. The document body itself renders in a sandboxed iframe
 * (see `TermsDocument`). Chrome follows the app's default direction; the document's
 * own direction follows its content language.
 */
export function TermsModal({ open, onClose, locale, query }: Props) {
  const { t } = useTranslation();
  const titleId = useId();

  return (
    <Modal
      open={open}
      onClose={onClose}
      labelledBy={titleId}
      dir={LOCALE_DIRECTION[locale]}
      className="sm:max-w-[620px]"
    >
      <ModalHeader
        titleId={titleId}
        title={t('auth.terms.title')}
        closeLabel={t('auth.terms.close')}
        onClose={onClose}
      />
      <div className="p-5 sm:p-6">
        <TermsDocument query={query} locale={locale} />
      </div>
      <ModalFooter>
        <Button
          type="button"
          onClick={onClose}
          className="h-11 w-full rounded-lg text-base font-medium"
        >
          {t('auth.terms.gotIt')}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
