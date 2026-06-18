'use client';

import { useTranslation } from 'react-i18next';

import { resolveTicketStatus } from '../lib/ticket-format';

import { StatusPill } from './status-pill';

export function TicketStatusBadge({ status }: { status?: string | null }) {
  const { t } = useTranslation();
  const { labelKey, tone } = resolveTicketStatus(status);
  return <StatusPill tone={tone} label={t(labelKey)} />;
}
