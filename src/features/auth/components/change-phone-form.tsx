'use client';

import { type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, FieldHint } from '@/components/ui';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { normalizePhoneInput } from '@/lib/saudi-phone';

import { useChangePhoneSubmit } from '../hooks/use-change-phone-submit';

import { OtpBoxes } from './otp-boxes';

const K = 'profile.myInfo.changePhone';
type Flow = ReturnType<typeof useChangePhoneSubmit>;

/** Success / error banner — punctuated copy, so `dir="auto"` + `text-start` (rule 4). */
function Banner({ tone, children }: { tone: 'success' | 'error'; children: string }) {
  return (
    <p
      dir="auto"
      role={tone === 'error' ? 'alert' : 'status'}
      className={`rounded-xl px-4 py-3 text-start text-sm font-medium ${tone === 'success' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}
    >
      {children}
    </p>
  );
}

/** Step 1 — enter the new Saudi mobile (live-filtered to `5XXXXXXXX`). */
function PhoneStep({ flow }: { flow: Flow }) {
  const { t } = useTranslation();
  const { form, sendOtp, pending, error } = flow;
  const phoneError = form.formState.errors.phone?.message;
  const reg = form.register('phone');
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.target.value = normalizePhoneInput(e.target.value);
    reg.onChange(e);
  };
  return (
    <form onSubmit={sendOtp} noValidate className="flex flex-col gap-4">
      {error ? <Banner tone="error">{error}</Banner> : null}
      <div className="flex flex-col gap-2">
        <Label htmlFor="cph-phone" className="text-foreground text-end text-sm font-medium">
          {t(`${K}.phoneLabel`)}
        </Label>
        <Input
          id="cph-phone"
          type="tel"
          inputMode="numeric"
          placeholder="5XXXXXXXX"
          aria-invalid={Boolean(phoneError)}
          className="bg-field-surface h-11 text-end text-[15px]"
          {...reg}
          onChange={onChange}
        />
        <FieldHint>{t(`${K}.phoneHint`)}</FieldHint>
        <FieldHint tone="error">{phoneError ? t(phoneError) : undefined}</FieldHint>
      </div>
      <Button type="submit" disabled={pending} className="h-11 self-end px-6">
        {pending ? t(`${K}.sending`) : t(`${K}.send`)}
      </Button>
    </form>
  );
}

/** Step 2 — enter the 4-digit OTP, with resend + "change number" affordances. */
function OtpStep({ flow }: { flow: Flow }) {
  const { t } = useTranslation();
  const { otp, setOtp, verify, resend, editNumber, pending, error, form } = flow;
  return (
    <div className="flex flex-col gap-4">
      {error ? <Banner tone="error">{error}</Banner> : null}
      <p dir="auto" className="text-muted-foreground text-start text-sm">
        {t(`${K}.otpSentTo`, { phone: `+966 ${form.getValues('phone')}` })}
      </p>
      <div className="flex justify-center" dir="ltr">
        <OtpBoxes
          value={otp}
          onChange={setOtp}
          length={4}
          ariaLabel={t(`${K}.otpAria`)}
          disabled={pending}
        />
      </div>
      <Button type="button" onClick={verify} disabled={pending || otp.length < 4} className="h-11">
        {pending ? t(`${K}.verifying`) : t(`${K}.verify`)}
      </Button>
      <div className="flex items-center justify-between gap-3 text-sm">
        <button
          type="button"
          onClick={editNumber}
          className="text-muted-foreground hover:text-foreground"
        >
          {t(`${K}.changeNumber`)}
        </button>
        <button
          type="button"
          onClick={resend}
          disabled={pending}
          className="text-primary font-medium disabled:opacity-60"
        >
          {t(`${K}.resend`)}
        </button>
      </div>
    </div>
  );
}

/** Change-phone form — rendered inline under the "Change phone number" row. */
export function ChangePhoneForm() {
  const { t } = useTranslation();
  const flow = useChangePhoneSubmit();
  if (flow.step === 'done') return <Banner tone="success">{t(`${K}.success`)}</Banner>;
  if (flow.step === 'otp') return <OtpStep flow={flow} />;
  return <PhoneStep flow={flow} />;
}
