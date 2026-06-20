'use client';

import { type FormEvent, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, FieldHint, Label } from '@/components/ui';
import { normalizePhoneInput } from '@/lib/saudi-phone';

import { InviteError, useSendInvite } from '../api/send-invite';
import { inviteErrorMessageKey } from '../lib/referral-format';

const SAUDI_MOBILE_LENGTH = 9;

/** i18n key for the failure message, or `null` when the mutation hasn't errored. */
function errorMessageKey(error: unknown): string | null {
  if (error instanceof InviteError) return inviteErrorMessageKey(error.code);
  return error ? 'referral.invite.errors.generic' : null;
}

/**
 * Invite-a-friend form (Figma 1691:2642) — a labelled Saudi mobile field with the
 * amber "Send" button nested inside it at the inline-end. The field body is live-
 * filtered to a `5XXXXXXXX` body by the shared phone normaliser, so a non-Saudi
 * number can never be submitted. Surfaces typed {@link InviteError} codes as
 * localized messages, plus a success line with the invited number.
 */
export function ReferralInviteForm() {
  const { t } = useTranslation();
  const inputId = useId();
  const [phone, setPhone] = useState('');
  const mutation = useSendInvite();

  const isValid = phone.length === SAUDI_MOBILE_LENGTH;
  const errorKey = errorMessageKey(mutation.error);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!isValid || mutation.isPending) return;
    mutation.mutate({ phoneNumber: phone }, { onSuccess: () => setPhone('') });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-1.5" noValidate>
      <Label htmlFor={inputId}>{t('referral.invite.label')}</Label>
      <div className="border-input bg-background focus-within:border-ring focus-within:ring-ring/30 flex h-12 items-center gap-2 rounded-md border ps-1.5 pe-3 transition-colors focus-within:ring-2">
        <input
          id={inputId}
          inputMode="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(normalizePhoneInput(e.target.value))}
          placeholder={t('referral.invite.placeholder')}
          className="text-foreground placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent text-start text-sm outline-none"
        />
        <Button
          type="submit"
          disabled={!isValid || mutation.isPending}
          className="bg-referral-send text-referral-send-foreground hover:bg-referral-send/90 h-9 shrink-0 rounded-lg px-4 text-xs font-semibold"
        >
          {mutation.isPending ? t('referral.invite.sending') : t('referral.invite.send')}
        </Button>
      </div>
      {mutation.isSuccess ? (
        <p className="text-success mt-1 text-sm leading-snug" role="status" dir="auto">
          {t('referral.invite.success', { phone: mutation.data.invitedPhone ?? phone })}
        </p>
      ) : null}
      {errorKey ? <FieldHint tone="error">{t(errorKey)}</FieldHint> : null}
    </form>
  );
}
