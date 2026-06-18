'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { PlusIcon } from '@/components/icons';
import { SettingsAmbientGlow } from '@/components/layout';
import { Button } from '@/components/ui';
import { conventionalDirection, type Locale } from '@/types/locale';

import { BackLink } from './back-link';
import { FeedbackList } from './feedback-list';
import { SubmitFeedbackModal } from './submit-feedback-modal';

/**
 * Feedback / الملاحظات (`/dashboard/settings/feedback`) — both roles. The signed-in user sends
 * a suggestion / bug / complaint / praise and tracks their own submissions. Full-width flush
 * screen (rule 4a); client island.
 *
 * **Direction override:** this screen renders in the conventional mapping (en→ltr, ar→rtl) via
 * `dir={conventionalDirection(locale)}` on the root + the portalled modal — a deliberate, scoped
 * exception to the project's inverted `LOCALE_DIRECTION`, per product request.
 */
export function FeedbackScreen() {
  const { t, i18n } = useTranslation();
  const locale: Locale = i18n.language?.startsWith('ar') ? 'ar' : 'en';
  const [composing, setComposing] = useState(false);

  return (
    <div
      dir={conventionalDirection(locale)}
      className="relative isolate flex w-full flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:gap-8"
    >
      <SettingsAmbientGlow />
      <BackLink label={t('feedback.back')} locale={locale} />

      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-foreground text-start text-2xl font-semibold tracking-tight sm:text-3xl">
            {t('feedback.title')}
          </h1>
          <p className="text-muted-foreground mt-1.5 text-start text-sm">
            {t('feedback.subtitle')}
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setComposing(true)}
          className="h-11 shrink-0 gap-2 rounded-lg px-5 text-base font-medium"
        >
          <PlusIcon className="size-4" aria-hidden />
          {t('feedback.compose')}
        </Button>
      </header>

      <FeedbackList locale={locale} onCompose={() => setComposing(true)} />

      <SubmitFeedbackModal open={composing} locale={locale} onClose={() => setComposing(false)} />
    </div>
  );
}
