'use client';

import { useTranslation } from 'react-i18next';

import { resolveFeedbackStatus } from '../lib/feedback-format';

import { StatusPill } from './status-pill';

export function FeedbackStatusBadge({ status }: { status?: string | null }) {
  const { t } = useTranslation();
  const { labelKey, tone } = resolveFeedbackStatus(status);
  return <StatusPill tone={tone} label={t(labelKey)} />;
}
