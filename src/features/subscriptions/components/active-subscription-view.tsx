'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui';
import type { Locale } from '@/types/locale';

import { useCancelSubscription } from '../api/cancel-subscription';
import { useSubscriptionBids } from '../api/get-subscription-bids';
import { formatSubscriptionDate, planName } from '../lib/subscription-format';
import type { Subscription } from '../schemas/subscription';

import { ActiveSubscriptionCard } from './active-subscription-card';
import { BidUsageCard } from './bid-usage-card';
import { CancelSubscriptionModal } from './cancel-subscription-modal';
import type { SubscriptionFeedback } from './subscription-feedback-banner';

const CANCEL_BTN =
  'border-destructive/30 bg-destructive/5 text-destructive hover:bg-destructive/10 h-12 w-full rounded-xl text-sm font-medium';

/**
 * The "has an active subscription" composition: the plan/detail card, the weekly
 * bid-usage card (fetched here — only when a plan is active), and the cancel action
 * with its confirmation modal. Cancel feedback is lifted to the parent so the
 * success message survives the screen flipping to the empty state.
 */
export function ActiveSubscriptionView({
  subscription,
  locale,
  onFeedback,
}: {
  subscription: Subscription;
  locale: Locale;
  onFeedback: (feedback: SubscriptionFeedback) => void;
}) {
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);
  const bidsQuery = useSubscriptionBids(true);
  const cancel = useCancelSubscription();

  const endLabel = formatSubscriptionDate(subscription.endDate, locale);

  function confirmCancel() {
    cancel.mutate(undefined, {
      onSuccess: () => {
        setModalOpen(false);
        onFeedback({ tone: 'success', message: t('subscription.cancel.success') });
      },
      onError: () => {
        setModalOpen(false);
        onFeedback({ tone: 'error', message: t('subscription.cancel.error') });
      },
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <ActiveSubscriptionCard subscription={subscription} locale={locale} />
      {bidsQuery.data ? <BidUsageCard bids={bidsQuery.data} locale={locale} /> : null}
      <Button
        type="button"
        variant="outline"
        onClick={() => setModalOpen(true)}
        className={CANCEL_BTN}
      >
        {t('subscription.cancel.action')}
      </Button>
      <CancelSubscriptionModal
        open={modalOpen}
        planName={planName(subscription.subscriptionCategory, locale)}
        endDate={endLabel}
        isCancelling={cancel.isPending}
        onClose={() => setModalOpen(false)}
        onConfirm={confirmCancel}
      />
    </div>
  );
}
