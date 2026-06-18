'use client';

import { useTranslation } from 'react-i18next';

import { MessageCircleIcon } from '@/components/icons';
import { Button } from '@/components/ui';

/** Empty state — no feedback yet. A quiet icon + copy + the compose CTA. */
export function FeedbackEmpty({ onCompose }: { onCompose: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="border-border bg-card/50 flex flex-col items-center gap-4 rounded-2xl border border-dashed px-6 py-14 text-center">
      <span className="bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-full">
        <MessageCircleIcon className="size-6" aria-hidden />
      </span>
      <div className="flex flex-col gap-1.5">
        <h2 className="text-foreground text-base font-semibold">{t('feedback.empty.title')}</h2>
        <p className="text-muted-foreground mx-auto max-w-sm text-sm">{t('feedback.empty.body')}</p>
      </div>
      <Button
        type="button"
        onClick={onCompose}
        className="h-11 rounded-lg px-5 text-base font-medium"
      >
        {t('feedback.empty.cta')}
      </Button>
    </div>
  );
}
