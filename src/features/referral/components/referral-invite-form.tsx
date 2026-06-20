'use client';

import { type FormEvent, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SendIcon } from '@/components/icons';
import { Button, FieldHint, Input, Label } from '@/components/ui';
import { normalizePhoneInput } from '@/lib/saudi-phone';

import { InviteError, useSendInvite } from '../api/send-invite';
import { inviteErrorMessageKey } from '../lib/referral-format';

const SAUDI_MOBILE_LENGTH = 9;

/** i18n key for the failure message, or `null` when the mutation hasn't errored. */
function errorMessageKey(error: unknown): string | null {
  if (error instanceof InviteError) return inviteErrorMessageKey(error.code);
  return error ? 'referral.invite.errors.generic' : null;
}

/** Title + punctuated subtitle (`dir="auto"`) for the invite card. */
function InviteHeader() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-1">
      <h2 className="text-foreground text-base font-semibold">{t('referral.invite.title')}</h2>
      <p className="text-muted-foreground text-sm leading-6" dir="auto">
        {t('referral.invite.subtitle')}
      </p>
    </div>
  );
}

/**
 * Invite-a-friend form — a single Saudi mobile field (live-filtered to a `5XXXXXXXX`
 * body by the shared phone normaliser, so a non-Saudi number can never be submitted)
 * plus a send button. Surfaces the typed {@link InviteError} codes as localized
 * messages, and a success line with the invited number. The field is `ltr` (digits),
 * the subtitle is punctuated copy (`dir="auto"`).
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
    <section className="bg-card border-border flex flex-col gap-4 rounded-2xl border p-5 shadow-sm">
      <InviteHeader />
      <form onSubmit={onSubmit} className="flex flex-col gap-3" noValidate>
        <Label htmlFor={inputId}>{t('referral.invite.label')}</Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            id={inputId}
            inputMode="tel"
            autoComplete="tel"
            dir="ltr"
            className="text-start"
            value={phone}
            onChange={(e) => setPhone(normalizePhoneInput(e.target.value))}
            placeholder={t('referral.invite.placeholder')}
          />
          <Button
            type="submit"
            disabled={!isValid || mutation.isPending}
            className="gap-2 sm:w-auto"
          >
            <SendIcon className="size-4 shrink-0" aria-hidden />
            {mutation.isPending ? t('referral.invite.sending') : t('referral.invite.send')}
          </Button>
        </div>
        {mutation.isSuccess ? (
          <p className="text-success text-sm leading-snug" role="status" dir="auto">
            {t('referral.invite.success', { phone: mutation.data.invitedPhone ?? phone })}
          </p>
        ) : null}
        {errorKey ? <FieldHint tone="error">{t(errorKey)}</FieldHint> : null}
      </form>
    </section>
  );
}
