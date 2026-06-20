'use client';

import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AiAssistantIcon, SendIcon } from '@/components/icons';
import { conventionalDirection, type Locale } from '@/types/locale';

const K = 'dashboard.createProject.ai.sow.refine';

/**
 * Glass pill at the foot of the review — ask Omdah to adjust the SOW in natural
 * language. While a refine is in flight the input locks and the orb spins; on
 * success the field clears (the parent re-renders the updated SOW).
 */
export function SowRefineBar({
  onRefine,
  isRefining,
}: {
  onRefine: (message: string) => Promise<boolean>;
  isRefining: boolean;
}) {
  const { t, i18n } = useTranslation();
  const locale: Locale = i18n.language?.startsWith('ar') ? 'ar' : 'en';
  const flip = conventionalDirection(locale) === 'rtl' ? '-scale-x-100' : '';
  const [value, setValue] = useState('');

  const submit = async () => {
    const text = value.trim();
    if (!text || isRefining) return;
    const ok = await onRefine(text);
    if (ok) setValue('');
  };

  return (
    <div className="flex flex-col gap-1.5">
      <RefinePill
        value={value}
        onChange={setValue}
        onSubmit={submit}
        disabled={isRefining}
        flip={flip}
        t={t}
      />
      <p className="text-muted-foreground px-4 text-start text-xs">
        {isRefining ? t(`${K}.working`) : t(`${K}.hint`)}
      </p>
    </div>
  );
}

function RefinePill({
  value,
  onChange,
  onSubmit,
  disabled,
  flip,
  t,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled: boolean;
  flip: string;
  t: (key: string) => string;
}) {
  return (
    <div className="border-border/70 bg-card/80 focus-within:border-job-accent/60 flex items-center gap-2 rounded-full border px-2 py-2 ps-4 shadow-sm backdrop-blur">
      <AiAssistantIcon className="text-job-accent size-4 shrink-0" aria-hidden />
      {/* No dir="auto" — inherit the flow's conventional dir so the placeholder aligns right in ar. */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            onSubmit();
          }
        }}
        disabled={disabled}
        aria-label={t(`${K}.label`)}
        placeholder={t(`${K}.placeholder`)}
        className="text-foreground placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent text-start text-sm outline-none disabled:opacity-60"
      />
      <button
        type="button"
        onClick={onSubmit}
        disabled={disabled || value.trim().length === 0}
        aria-label={t(`${K}.send`)}
        className="bg-job-accent focus-visible:outline-ring flex size-9 shrink-0 items-center justify-center rounded-full text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-40"
      >
        {disabled ? (
          <Loader2 className="size-4 motion-safe:animate-spin" aria-hidden />
        ) : (
          <SendIcon className={`size-4 ${flip}`} aria-hidden />
        )}
      </button>
    </div>
  );
}
