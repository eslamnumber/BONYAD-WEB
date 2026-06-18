'use client';

import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Modal, ModalFooter, ModalHeader, Textarea } from '@/components/ui';
import { ApiError } from '@/lib/api-client';
import { type Locale } from '@/types/locale';

import { useRequestRefund } from '../../api';
import type { PaymentTransaction } from '../../schemas/transaction';
import { MoneyAmount } from '../money-amount';

const MIN_REASON = 10;

type Props = {
  transaction: PaymentTransaction | null;
  locale: Locale;
  onClose: () => void;
};

/**
 * Refund-request dialog (iOS refund sheet): transaction summary + a reason field
 * (≥ 10 chars) + submit. On success the lists refresh (the source card flips to
 * "refund pending") and the dialog closes. Mutation errors surface inline.
 */
export function RequestRefundModal({ transaction, locale, onClose }: Props) {
  const { t } = useTranslation();
  const titleId = useId();
  const [reason, setReason] = useState('');
  const mutation = useRequestRefund();

  const close = () => {
    setReason('');
    mutation.reset();
    onClose();
  };

  const submit = () => {
    if (!transaction || reason.trim().length < MIN_REASON) return;
    mutation.mutate({ transactionId: transaction.id, reason: reason.trim() }, { onSuccess: close });
  };

  if (!transaction) return null;
  const valid = reason.trim().length >= MIN_REASON;

  return (
    <Modal open onClose={close} labelledBy={titleId}>
      <ModalHeader
        titleId={titleId}
        title={t('dashboard.transactions.modal.title')}
        closeLabel={t('dashboard.transactions.modal.close')}
        onClose={close}
      />
      <div className="flex flex-col gap-4 px-6 py-5">
        <RefundSummary transaction={transaction} />
        <RefundReasonField reason={reason} onChange={setReason} />
        {mutation.isError ? (
          <p role="alert" className="text-destructive text-xs">
            {errorMessage(mutation.error, locale, t('dashboard.transactions.modal.error'))}
          </p>
        ) : null}
      </div>
      <ModalFooter>
        <Button type="button" variant="outline" onClick={close} className="flex-1">
          {t('dashboard.transactions.modal.cancel')}
        </Button>
        <Button
          type="button"
          onClick={submit}
          disabled={!valid || mutation.isPending}
          className="flex-1"
        >
          {t('dashboard.transactions.modal.submit')}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

function RefundSummary({ transaction }: { transaction: PaymentTransaction }) {
  const { t } = useTranslation();
  return (
    <div className="bg-field-surface flex flex-col gap-2 rounded-lg p-4">
      <p className="text-foreground/60 text-xs font-medium">
        {t('dashboard.transactions.modal.detailsTitle')}
      </p>
      <div className="flex items-center justify-between gap-3">
        <span className="text-foreground/60 text-sm">
          {t('dashboard.transactions.modal.amountLabel')}
        </span>
        <span className="text-foreground text-sm font-semibold">
          <MoneyAmount value={transaction.amount} />
        </span>
      </div>
      {transaction.projectDescription ? (
        <p dir="auto" className="text-foreground/70 text-start text-sm">
          {transaction.projectDescription}
        </p>
      ) : null}
    </div>
  );
}

function RefundReasonField({
  reason,
  onChange,
}: {
  reason: string;
  onChange: (value: string) => void;
}) {
  const { t } = useTranslation();
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-foreground text-sm font-medium">
        {t('dashboard.transactions.modal.reasonLabel')}
      </label>
      <Textarea
        id={id}
        dir="auto"
        rows={4}
        value={reason}
        onChange={(event) => onChange(event.target.value)}
        placeholder={t('dashboard.transactions.modal.reasonPlaceholder')}
        className="min-h-28 text-start"
      />
      <p className="text-muted-foreground text-xs">
        {t('dashboard.transactions.modal.reasonHint')}
      </p>
    </div>
  );
}

function errorMessage(error: Error | null, locale: Locale, fallback: string): string {
  if (error instanceof ApiError) return error.localizedMessage(locale) ?? fallback;
  return fallback;
}
