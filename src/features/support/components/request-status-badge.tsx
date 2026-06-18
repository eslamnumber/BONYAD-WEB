'use client';

import { useTranslation } from 'react-i18next';

import { resolveSupportStatus } from '../lib/support-format';

import { StatusPill } from './status-pill';

export function RequestStatusBadge({ status }: { status?: string | null }) {
  const { t } = useTranslation();
  const { labelKey, tone } = resolveSupportStatus(status);
  return <StatusPill tone={tone} label={t(labelKey)} />;
}
