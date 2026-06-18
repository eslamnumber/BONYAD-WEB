'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SettingsAmbientGlow, SettingsBackLink } from '@/components/layout';
import { ROUTES } from '@/config/routes';
import { useAuthStore } from '@/stores/auth-store';
import { type Locale } from '@/types/locale';

import { useCards } from '../api/get-cards';

import { AddCardButton } from './add-card-button';
import { CardList } from './card-list';
import { CardManagementHeader } from './card-management-header';
import { CardStatusBanner } from './card-status-banner';
import { type CardFeedback, useCardRegistrationReturn } from './use-card-registration-return';

/**
 * Card management (`/dashboard/settings/cards`) — the iOS `CardManagementView`,
 * "unified" for customers and technicians. Lists saved cards (set-default / delete),
 * and adds a card via a 1 SAR HyperPay preauth that redirects to the hosted page and
 * returns here to complete. Role-aware copy (payouts vs payments) reads from the
 * hydrated session. Client island — the `(app)` layout supplies the sidebar.
 */
export function CardManagementScreen() {
  const { t, i18n } = useTranslation();
  const locale: Locale = i18n.language?.startsWith('ar') ? 'ar' : 'en';
  const role = useAuthStore((s) => s.user?.role);
  const isTechnician = (role ?? '').toUpperCase() === 'TECHNICIAN';

  const cardsQuery = useCards();
  const {
    isCompleting,
    feedback: returnFeedback,
    dismiss: dismissReturn,
  } = useCardRegistrationReturn(locale);
  const [actionFeedback, setActionFeedback] = useState<CardFeedback | null>(null);

  const feedback = actionFeedback ?? returnFeedback;
  const dismiss = () => {
    setActionFeedback(null);
    dismissReturn();
  };

  return (
    <div className="relative isolate flex w-full flex-1 flex-col px-4 py-8 sm:px-6">
      <SettingsAmbientGlow />
      {/* Capped + flush to the inline-END (self-end) so the grid hugs the sidebar with
          no gap there and the leftover cap space sits on the window edge — stops the
          cards stretching on wide monitors. Rule 4a + memory `feedback_app_screens_full_width`:
          cap on this inner wrapper, never the screen-root; no mx-auto. */}
      <div className="flex w-full max-w-5xl flex-col gap-6 self-end lg:gap-8">
        <SettingsBackLink href={ROUTES.DASHBOARD_SETTINGS} label={t('cards.back')} />

        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <CardManagementHeader isTechnician={isTechnician} />
          <AddCardButton
            locale={locale}
            disabled={isCompleting}
            onError={(message) => setActionFeedback({ tone: 'error', message })}
          />
        </header>

        {feedback ? <CardStatusBanner feedback={feedback} onDismiss={dismiss} /> : null}

        <CardList
          cards={cardsQuery.data ?? []}
          isPending={cardsQuery.isPending}
          isError={cardsQuery.isError}
          isTechnician={isTechnician}
          locale={locale}
          onRetry={() => cardsQuery.refetch()}
          onFeedback={setActionFeedback}
        />
      </div>
    </div>
  );
}
